"use client";

// ---------------------------------------------------------------------------
// ContactWidgetPanel — code-split panel (loaded only on first FAB open).
// ---------------------------------------------------------------------------
// Displays tenant-specific contact channels: phone, WhatsApp, email, live
// chat, and social media links. All data is derived from useTenant() context —
// no additional network request required.
// ---------------------------------------------------------------------------

import Link from "next/link";
import {
  Phone,
  MessageCircle,
  Mail,
  X,
  ExternalLink,
  Sparkles,
} from "lucide-react";
import { motion } from "framer-motion";
import { useContactInfo } from "@/hooks/useContactInfo";
import { SocialIcon } from "./SocialIcon";

interface Channel {
  key: string;
  href: string;
  icon: React.ElementType;
  label: string;
  detail: string;
  external: boolean;
}

interface ContactWidgetPanelProps {
  onClose: () => void;
}

export default function ContactWidgetPanel({ onClose }: ContactWidgetPanelProps) {
  const info = useContactInfo();

  const channels: Channel[] = [
    info.phone && {
      key: "call",
      href: `tel:${info.phone}`,
      icon: Phone,
      label: "Call Us",
      detail: info.phone,
      external: false,
    },
    info.whatsappNumber && {
      key: "whatsapp",
      href: `https://wa.me/${info.whatsappNumber}?text=Hi%2C%20I%27d%20like%20to%20enquire%20about%20a%20trip`,
      icon: MessageCircle,
      label: "WhatsApp",
      detail: "Chat or call",
      external: true,
    },
    info.email && {
      key: "email",
      href: `mailto:${info.email}`,
      icon: Mail,
      label: "Email",
      detail: info.email,
      external: false,
    },
    {
      key: "chat",
      href: "/dashboard/chat",
      icon: MessageCircle,
      label: "Live Chat",
      detail: "Concierge online",
      external: false,
    },
  ].filter(Boolean) as Channel[];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 16, scale: 0.95 }}
      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
      className="w-72 overflow-hidden rounded-2xl border border-white/10 bg-ocean-deep/97 shadow-[0_16px_56px_rgba(0,0,0,0.6)] backdrop-blur-2xl"
      role="dialog"
      aria-label="Contact options"
    >
      {/* ── Header ────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-2 border-b border-white/10 px-4 pb-3 pt-4">
        <div>
          <div className="flex items-center gap-1.5 mb-0.5">
            <Sparkles size={9} className="text-blue-chill-300 shrink-0" aria-hidden="true" />
            <span className="font-sans text-[9px] uppercase tracking-[0.14em] text-blue-chill-300">
              Bespoke Concierge
            </span>
          </div>
          <h2 className="font-sans text-[14px] font-semibold leading-snug text-white">
            {info.tenantName}
          </h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="mt-0.5 shrink-0 rounded-full p-1 text-white/35 transition-colors duration-150 hover:text-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-chill"
          aria-label="Close contact menu"
        >
          <X size={14} aria-hidden="true" />
        </button>
      </div>

      {/* ── Concierge status ──────────────────────────────────────────── */}
      <div className="flex items-center gap-2 border-b border-white/10 px-4 py-2">
        <span className="relative flex h-1.5 w-1.5 shrink-0">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
        </span>
        <span className="font-sans text-[9px] uppercase tracking-widest text-white/45">
          Available now · Ready to help
        </span>
      </div>

      {/* ── Contact channels ──────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-2 p-3">
        {channels.map(({ key, href, icon: Icon, label, detail, external }) => {
          const inner = (
            <div className="flex flex-col gap-1.5 rounded-xl border border-white/8 bg-white/4 p-2.5 transition-[border-color,background-color] duration-150 hover:border-blue-chill/25 hover:bg-blue-chill/5">
              <Icon size={14} className="text-blue-chill-300" aria-hidden="true" />
              <span className="font-sans text-[10px] font-semibold text-white/80 leading-none">
                {label}
              </span>
              <span className="font-sans text-[9px] text-white/35 truncate leading-none">
                {detail}
              </span>
            </div>
          );
          return external ? (
            <a key={key} href={href} target="_blank" rel="noopener noreferrer">
              {inner}
            </a>
          ) : (
            <Link key={key} href={href}>
              {inner}
            </Link>
          );
        })}
      </div>

      {/* ── Social links ──────────────────────────────────────────────── */}
      {info.social.length > 0 && (
        <div className="border-t border-white/10 px-4 pb-3 pt-3">
          <p className="mb-2 font-sans text-[9px] uppercase tracking-[0.14em] text-white/30">
            Follow Us
          </p>
          <div className="flex flex-wrap gap-2">
            {info.social.map(({ platform, url }) => (
              <a
                key={platform}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={platform}
                className="flex h-7 w-7 items-center justify-center rounded-full border border-white/10 bg-white/4 text-white/45 transition-[border-color,color,background-color] duration-150 hover:border-blue-chill/35 hover:bg-blue-chill/8 hover:text-blue-chill-300 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-chill"
              >
                <SocialIcon platform={platform} size={13} />
              </a>
            ))}
          </div>
        </div>
      )}

      {/* ── Contact page link ─────────────────────────────────────────── */}
      <div className="border-t border-white/10 px-3 pb-3 pt-3">
        <Link
          href="/contact"
          className="flex w-full items-center justify-between rounded-xl border border-white/10 px-3 py-2.5 text-white/40 transition-[border-color,color] duration-150 hover:border-blue-chill/30 hover:text-blue-chill-300 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-chill"
        >
          <span className="font-sans text-[10px] font-semibold uppercase tracking-[0.08em]">
            Send us a message
          </span>
          <ExternalLink size={10} aria-hidden="true" />
        </Link>
      </div>
    </motion.div>
  );
}
