"use client"

import { useState, useEffect, type FormEvent } from "react"
import Link from "next/link"
import Image from "next/image"
import { useAuth } from "@/hooks/useAuth"
import { submitContactForm } from "@/lib/api/contact"
import { FadeSlide, FadeSlideChild } from "@/components/ui/FadeSlide"

type FormStatus = "idle" | "submitting" | "success" | "error"

interface FormState {
  name: string
  email: string
  phone: string
  subject: string
  message: string
}

const INITIAL: FormState = {
  name: "",
  email: "",
  phone: "",
  subject: "",
  message: "",
}

export function ContactForm() {
  const { user, loading: authLoading } = useAuth()
  const [form, setForm] = useState<FormState>(INITIAL)
  const [status, setStatus] = useState<FormStatus>("idle")
  const [errorMsg, setErrorMsg] = useState("")
  const [isExistingUser, setIsExistingUser] = useState(false)

  // Pre-fill form fields from the signed-in user
  useEffect(() => {
    if (user) {
      setForm((prev) => ({
        ...prev,
        name: user.displayName ?? prev.name,
        email: user.email ?? prev.email,
        phone: user.phoneNumber ?? prev.phone,
      }))
    }
  }, [user])

  function update(field: keyof FormState) {
    return (
      e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
    ) => setForm((prev) => ({ ...prev, [field]: e.target.value }))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setStatus("submitting")
    setErrorMsg("")

    try {
      const result = await submitContactForm(form)
      setIsExistingUser(result.isExistingUser ?? false)
      setStatus("success")
      setForm(INITIAL)
    } catch (err) {
      setStatus("error")
      setErrorMsg(err instanceof Error ? err.message : "Failed to send message.")
    }
  }

  if (status === "success") {
    return (
      <FadeSlide className="mx-auto max-w-xl text-center">
        <FadeSlideChild>
          <div className="rounded-lg border border-luxborder-gold bg-luxury-card p-10">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-luxgold-dim">
              <svg className="h-7 w-7 text-luxgold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="font-serif text-2xl font-bold text-luxtext">
              Message Sent
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-luxtext-muted">
              Thank you for reaching out. Our concierge team will respond within
              24 hours.
            </p>

            {!isExistingUser && (
              <div className="mt-6 rounded-md border border-ocean/10 bg-ocean/5 p-5">
                <p className="text-sm font-medium text-luxtext">
                  Want to track your inquiry and explore exclusive tours?
                </p>
                <Link
                  href="/auth/sign-up"
                  className="mt-3 inline-flex items-center rounded-sm bg-ocean px-6 py-2.5 text-xs font-semibold uppercase tracking-wider text-white transition-colors hover:bg-ocean/90"
                >
                  Create an Account
                </Link>
              </div>
            )}

            <button
              type="button"
              onClick={() => setStatus("idle")}
              className="mt-6 inline-flex items-center rounded-sm bg-luxgold px-6 py-2.5 text-xs font-semibold uppercase tracking-wider text-luxury-base transition-colors hover:bg-luxgold-light"
            >
              Send Another Message
            </button>
          </div>
        </FadeSlideChild>
      </FadeSlide>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-xl space-y-6">
      {/* Signed-in user card OR manual input fields */}
      {user && !authLoading ? (
        <div className="flex items-center gap-4 rounded-lg border border-luxborder-gold bg-luxury-card p-4">
          {user.photoURL ? (
            <Image
              src={user.photoURL}
              alt={user.displayName ?? "User avatar"}
              width={48}
              height={48}
              className="h-12 w-12 rounded-full object-cover ring-2 ring-luxgold/30"
            />
          ) : (
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-luxgold-dim text-lg font-bold text-luxgold ring-2 ring-luxgold/30">
              {(user.displayName?.[0] ?? user.email?.[0] ?? "?").toUpperCase()}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate font-serif text-base font-semibold text-luxtext">
              {user.displayName ?? "Guest"}
            </p>
            <p className="truncate text-xs text-luxtext-muted">
              {user.email}
            </p>
            {user.phoneNumber && (
              <p className="truncate text-xs text-luxtext-subtle">
                {user.phoneNumber}
              </p>
            )}
          </div>
          <span className="shrink-0 rounded-full bg-luxgold-dim px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-luxgold">
            Signed in
          </span>
        </div>
      ) : (
        <>
          {/* Name */}
          <div>
            <label htmlFor="contact-name" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-luxtext-muted">
              Full Name <span className="text-error">*</span>
            </label>
            <input
              id="contact-name"
              type="text"
              required
              maxLength={500}
              value={form.name}
              onChange={update("name")}
              placeholder="Your full name"
              className="w-full rounded-sm border border-luxborder bg-luxury-card px-4 py-3 text-sm text-luxtext placeholder:text-luxtext-subtle focus:border-luxgold focus:outline-none focus:ring-1 focus:ring-luxgold"
            />
          </div>

          {/* Email */}
          <div>
            <label htmlFor="contact-email" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-luxtext-muted">
              Email Address <span className="text-error">*</span>
            </label>
            <input
              id="contact-email"
              type="email"
              required
              maxLength={500}
              value={form.email}
              onChange={update("email")}
              placeholder="you@example.com"
              className="w-full rounded-sm border border-luxborder bg-luxury-card px-4 py-3 text-sm text-luxtext placeholder:text-luxtext-subtle focus:border-luxgold focus:outline-none focus:ring-1 focus:ring-luxgold"
            />
          </div>

          {/* Phone (optional) */}
          <div>
            <label htmlFor="contact-phone" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-luxtext-muted">
              Phone Number <span className="text-luxtext-subtle">(optional)</span>
            </label>
            <input
              id="contact-phone"
              type="tel"
              maxLength={30}
              value={form.phone}
              onChange={update("phone")}
              placeholder="+1 (555) 000-0000"
              className="w-full rounded-sm border border-luxborder bg-luxury-card px-4 py-3 text-sm text-luxtext placeholder:text-luxtext-subtle focus:border-luxgold focus:outline-none focus:ring-1 focus:ring-luxgold"
            />
          </div>
        </>
      )}

      {/* Subject */}
      <div>
        <label htmlFor="contact-subject" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-luxtext-muted">
          Subject <span className="text-error">*</span>
        </label>
        <select
          id="contact-subject"
          required
          value={form.subject}
          onChange={update("subject")}
          className="w-full rounded-sm border border-luxborder bg-luxury-card px-4 py-3 text-sm text-luxtext focus:border-luxgold focus:outline-none focus:ring-1 focus:ring-luxgold"
        >
          <option value="">Select a topic…</option>
          <option value="General Inquiry">General Inquiry</option>
          <option value="Tour Information">Tour Information</option>
          <option value="Booking Assistance">Booking Assistance</option>
          <option value="Custom Itinerary">Custom Itinerary Request</option>
          <option value="Group Travel">Group Travel</option>
          <option value="Corporate Events">Corporate Events</option>
          <option value="Feedback">Feedback</option>
          <option value="Other">Other</option>
        </select>
      </div>

      {/* Message */}
      <div>
        <label htmlFor="contact-message" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-luxtext-muted">
          Message <span className="text-error">*</span>
        </label>
        <textarea
          id="contact-message"
          required
          maxLength={5000}
          rows={6}
          value={form.message}
          onChange={update("message")}
          placeholder="Tell us about your dream trip…"
          className="w-full resize-y rounded-sm border border-luxborder bg-luxury-card px-4 py-3 text-sm text-luxtext placeholder:text-luxtext-subtle focus:border-luxgold focus:outline-none focus:ring-1 focus:ring-luxgold"
        />
      </div>

      {/* Error */}
      {status === "error" && errorMsg && (
        <p className="rounded-sm border border-error/20 bg-error/5 px-4 py-2.5 text-sm text-error">
          {errorMsg}
        </p>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={status === "submitting"}
        className="inline-flex w-full items-center justify-center rounded-sm bg-luxgold px-8 py-3.5 text-sm font-semibold uppercase tracking-wider text-luxury-base transition-colors hover:bg-luxgold-light disabled:cursor-not-allowed disabled:opacity-60"
      >
        {status === "submitting" ? (
          <>
            <svg className="mr-2 h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
            </svg>
            Sending…
          </>
        ) : (
          "Send Message"
        )}
      </button>
    </form>
  )
}
