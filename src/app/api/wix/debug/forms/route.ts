import { NextResponse } from "next/server"
import { wixClient } from "@/lib/wix/client"

// ---------------------------------------------------------------------------
// GET /api/wix/debug/forms — List all Wix Forms (discover form IDs)
// ---------------------------------------------------------------------------

async function listAllForms(client: NonNullable<ReturnType<typeof wixClient>>) {
  const NAMESPACES = ["wix.form_app.form", "wix.forms.v2"]
  const allForms: unknown[] = []

  for (const ns of NAMESPACES) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = await (client.forms.listForms as any)({ namespace: ns })
      const items = (result as unknown as { forms?: unknown[] })?.forms ?? []
      allForms.push(...items)
    } catch {
      // namespace not available
    }
  }
  return allForms
}

export async function GET() {
  try {
    const client = wixClient()
    if (!client) {
      return NextResponse.json({ error: "Wix client not initialized" }, { status: 500 })
    }

    const formsList = await listAllForms(client)

    return NextResponse.json({
      count: formsList.length,
      forms: formsList.map((f: unknown) => {
        const form = f as Record<string, unknown>
        return {
          _id: form._id,
          name: form.name,
          namespace: form.namespace,
          createdDate: form._createdDate,
          fields: ((form.fields ?? form.formFields ?? []) as Record<string, unknown>[]).map(
            (field) => ({
              _id: field._id,
              fieldType: field.fieldType,
              label: (field.validation as Record<string, unknown>)?.label ??
                (field as Record<string, unknown>).label,
            }),
          ),
        }
      }),
      envFormId: process.env.WIX_CONTACT_FORM_ID ?? null,
      setup: {
        step1: "Go to Wix Dashboard → Inbox → Set Up Inbox",
        step2: "Add a Contact Form via the Wix Editor (or create a form under Dashboard → Forms & Submissions)",
        step3: "Copy the form ID from this endpoint once the form exists",
        step4: "Set WIX_CONTACT_FORM_ID=<form_id> in .env.local and restart the dev server",
        note: "Submissions are ALWAYS saved to Firestore (contactSubmissions collection). Wix Inbox integration is additive.",
      },
    })
  } catch (err) {
    console.error("[Wix Forms Debug]", err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to list forms" },
      { status: 500 },
    )
  }
}
