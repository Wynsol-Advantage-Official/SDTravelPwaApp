"use client"

import { useState } from "react"
import { BRAND } from "@/lib/config/brand"
import { Button } from "@/components/ui/Button"
import { Card } from "@/components/ui/Card"

interface FormData {
  businessName: string
  subdomain: string
  contactName: string
  email: string
  phone: string
  wixSiteId: string
}

export default function AffiliateRegisterPage() {
  const [form, setForm] = useState<FormData>({
    businessName: "",
    subdomain: "",
    contactName: "",
    email: "",
    phone: "",
    wixSiteId: "",
  })
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle")
  const [errorMsg, setErrorMsg] = useState("")

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setForm((prev) => ({
      ...prev,
      [name]: name === "subdomain" ? value.toLowerCase().replace(/[^a-z0-9-]/g, "") : value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus("submitting")
    setErrorMsg("")

    try {
      const res = await fetch("/api/affiliates/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || `Request failed (${res.status})`)
      }

      setStatus("success")
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong")
      setStatus("error")
    }
  }

  if (status === "success") {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <Card className="max-w-lg w-full p-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Application Received</h1>
          <p className="text-base-content/70">
            Thank you for your interest in partnering with {BRAND.name}. Our
            team will review your application and contact you within 24-48
            hours.
          </p>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <Card className="max-w-2xl w-full p-8">
        <h1 className="text-2xl font-bold mb-2">Become an Affiliate Partner</h1>
        <p className="text-base-content/70 mb-6">
          Join {BRAND.name}&apos;s network and get your own branded travel
          portal. Fill out the form below to apply.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Business Name */}
          <label className="form-control w-full">
            <span className="label-text mb-1 block font-medium">Business Name</span>
            <input
              type="text"
              name="businessName"
              value={form.businessName}
              onChange={handleChange}
              required
              className="input input-bordered w-full"
              placeholder="Acme Travel Co."
            />
          </label>

          {/* Desired Subdomain */}
          <label className="form-control w-full">
            <span className="label-text mb-1 block font-medium">Desired Subdomain</span>
            <div className="flex items-center gap-2">
              <input
                type="text"
                name="subdomain"
                value={form.subdomain}
                onChange={handleChange}
                required
                pattern="[a-z0-9][a-z0-9-]{0,61}[a-z0-9]?"
                className="input input-bordered flex-1"
                placeholder="acme"
              />
              <span className="text-base-content/60 text-sm">.sanddiamondstravel.com</span>
            </div>
          </label>

          {/* Contact Name */}
          <label className="form-control w-full">
            <span className="label-text mb-1 block font-medium">Contact Name</span>
            <input
              type="text"
              name="contactName"
              value={form.contactName}
              onChange={handleChange}
              required
              className="input input-bordered w-full"
              placeholder="Jane Doe"
            />
          </label>

          {/* Email */}
          <label className="form-control w-full">
            <span className="label-text mb-1 block font-medium">Email Address</span>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              className="input input-bordered w-full"
              placeholder="jane@acmetravel.com"
            />
          </label>

          {/* Phone */}
          <label className="form-control w-full">
            <span className="label-text mb-1 block font-medium">Phone Number</span>
            <input
              type="tel"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              className="input input-bordered w-full"
              placeholder="+1 (555) 000-0000"
            />
          </label>

          {/* Wix Site ID */}
          <label className="form-control w-full">
            <span className="label-text mb-1 block font-medium">
              Wix Headless Site ID
            </span>
            <input
              type="text"
              name="wixSiteId"
              value={form.wixSiteId}
              onChange={handleChange}
              required
              className="input input-bordered w-full"
              placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
            />
            <span className="label-text-alt text-base-content/50 mt-1 block">
              Found in your Wix Dashboard → Headless Settings → Site ID
            </span>
          </label>

          {/* Error */}
          {errorMsg && (
            <div className="alert alert-error text-sm">{errorMsg}</div>
          )}

          {/* Submit */}
          <Button
            type="submit"
            className="w-full"
            disabled={status === "submitting"}
          >
            {status === "submitting" ? "Submitting…" : "Submit Application"}
          </Button>
        </form>
      </Card>
    </div>
  )
}
