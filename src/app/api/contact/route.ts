import { NextResponse } from "next/server"
import { adminDb, adminAuth } from "@/lib/firebase/admin"
import { wixAdminClient } from "@/lib/wix/client"

// ---------------------------------------------------------------------------
// POST /api/contact — Contact form → Firestore + Wix CRM Contact + Wix Inbox
// ---------------------------------------------------------------------------

interface ContactBody {
  name: string
  email: string
  phone?: string
  subject: string
  message: string
}

const FIELD_MAX = 500
const MESSAGE_MAX = 5000

function sanitize(value: string, max: number): string {
  return value.trim().slice(0, max)
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ContactBody

    // --- Validation ---
    const name = sanitize(body.name ?? "", FIELD_MAX)
    const email = sanitize(body.email ?? "", FIELD_MAX)
    const phone = body.phone ? sanitize(body.phone, FIELD_MAX) : undefined
    const subject = sanitize(body.subject ?? "", FIELD_MAX)
    const message = sanitize(body.message ?? "", MESSAGE_MAX)

    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: "Name, email, subject, and message are required." },
        { status: 400 },
      )
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Please provide a valid email address." },
        { status: 400 },
      )
    }

    // --- 1. Check if email belongs to an existing Firebase user ---
    let isExistingUser = false
    try {
      await adminAuth.getUserByEmail(email)
      isExistingUser = true
    } catch {
      // User does not exist — that's fine
    }

    // --- 2. Always write to Firestore ---
    const firestoreDoc = {
      name,
      email,
      ...(phone ? { phone } : {}),
      subject,
      message,
      status: "new",
      isExistingUser,
      wixContactId: null as string | null,
      wixConversationId: null as string | null,
      messageSentToWix: false,
      createdAt: new Date().toISOString(),
    }

    const ref = await adminDb.collection("contactSubmissions").add(firestoreDoc)
    console.info(`[Contact] Saved to Firestore: ${ref.id}`)

    // --- 3. Send to Wix Inbox (Contacts + Inbox API) ---
    let wixContactId: string | null = null
    let wixConversationId: string | null = null

    try {
      const client = wixAdminClient()
      if (!client) throw new Error("Wix admin client not initialized — set WIX_API_KEY and WIX_SITE_ID")

      // 2a. Find or create the contact in Wix CRM using Manage Contacts permission
      const [firstName, ...lastParts] = name.split(" ")
      const lastName = lastParts.join(" ") || undefined

      // Search for existing contact by email first
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const queryResult = await (client.contacts.queryContacts as any)({
        filter: { "primaryInfo.email": email },
        paging: { limit: 1 },
      })
      const existingContacts = (queryResult?.contacts ?? queryResult?.items ?? []) as Array<Record<string, unknown>>
      let contactId: string | null = existingContacts[0]?._id as string ?? null

      if (!contactId) {
        // Create new contact — SDK signature: createContact(info, options?)
        const created = await client.contacts.createContact(
          {
            name: { first: firstName, last: lastName ?? undefined },
            emails: { items: [{ email, primary: true }] },
            ...(phone ? { phones: { items: [{ phone, primary: true }] } } : {}),
          } as Parameters<typeof client.contacts.createContact>[0],
          { allowDuplicates: false },
        )
        contactId = created?.contact?._id ?? null
      }

      wixContactId = contactId
      if (!wixContactId) throw new Error("No contactId returned from Wix CRM")

      console.info(`[Contact] Wix contact: ${wixContactId}`)

      // 2b. Get or create a conversation for this contact
      const convResult = await client.conversations.getOrCreateConversation({
        contactId: wixContactId,
      })

      const conversationId = convResult.conversation?._id
      if (!conversationId) throw new Error("No conversationId returned")

      wixConversationId = conversationId
      console.info(`[Contact] Wix conversation: ${wixConversationId}`)

      // 2c. Send the message as a form submission (appears as incoming in Inbox)
      // sendAs: "PARTICIPANT" is required so the message is attributed to the
      // contact (not the API caller), making it appear as an inbound message.
      await client.messages.sendMessage(
        conversationId,
        {
          direction: "PARTICIPANT_TO_BUSINESS",
          visibility: "BUSINESS",
          content: {
            form: {
              title: `Contact Form: ${subject}`,
              fields: [
                { name: "Name", value: name },
                { name: "Email", value: email },
                ...(phone ? [{ name: "Phone", value: phone }] : []),
                { name: "Subject", value: subject },
                { name: "Message", value: message },
              ],
            },
          },
        },
        { sendNotifications: true, sendAs: "PARTICIPANT" },
      )

      console.info(`[Contact] Message sent to Wix Inbox for conversation ${wixConversationId}`)

      // Update Firestore with Wix IDs and delivery status
      await ref.update({ wixContactId, wixConversationId, messageSentToWix: true })
    } catch (wixErr) {
      // Wix failed — Firestore still has the record
      console.warn("[Contact] Wix Inbox delivery failed (Firestore record saved):", wixErr)
    }

    return NextResponse.json({
      success: true,
      id: ref.id,
      wixContactId,
      wixConversationId,
      isExistingUser,
    })
  } catch (err: unknown) {
    console.error("[Contact] Submission failed:", err)
    const msg =
      err instanceof Error ? err.message : "Failed to send your message."
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
