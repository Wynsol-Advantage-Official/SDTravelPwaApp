"use client";

// ---------------------------------------------------------------------------
// ContactWidget — thin FAB trigger.
// ---------------------------------------------------------------------------
// Always bundled (no dynamic import here). The panel is code-split via
// next/dynamic, so the panel JS chunk is only fetched on first open.
// Position: fixed bottom-right, above MobileBottomNav on mobile.
// ---------------------------------------------------------------------------

import { useState } from "react";
import dynamic from "next/dynamic";
import { MessageCircle, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

// Panel is its own JS chunk — loaded only when the user first opens the widget
const ContactWidgetPanel = dynamic(() => import("./ContactWidgetPanel"), {
  ssr: false,
  loading: () => null,
});

export function ContactWidget() {
  const [isOpen, setIsOpen] = useState(false);

  function close() {
    setIsOpen(false);
  }

  return (
    // bottom-20 = clear MobileBottomNav (h-16) + safe area on mobile
    // lg:bottom-8 = standard desktop offset
    <div className="fixed bottom-20 right-4 z-50 flex flex-col items-end gap-3 lg:bottom-8 lg:right-6">
      {/* Panel — renders above the FAB in flex-col */}
      <AnimatePresence>
        {isOpen && <ContactWidgetPanel key="panel" onClose={close} />}
      </AnimatePresence>

      {/* FAB ──────────────────────────────────────────────────────────── */}
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        aria-label={isOpen ? "Close contact menu" : "Open contact menu"}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        className="relative flex h-12 w-12 items-center justify-center rounded-full bg-ocean shadow-lg ring-2 ring-ocean/20 transition-[transform,box-shadow] duration-220 ease-out hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.4)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-chill"
      >
        {/* Idle pulse ring — draws attention when closed */}
        {!isOpen && (
          <span
            className="pointer-events-none absolute inset-0 animate-ping rounded-full bg-ocean/30"
            aria-hidden="true"
          />
        )}

        {/* Icon — rotates between MessageCircle and X */}
        <AnimatePresence mode="wait" initial={false}>
          {isOpen ? (
            <motion.span
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="flex items-center justify-center"
            >
              <X size={18} className="text-white" aria-hidden="true" />
            </motion.span>
          ) : (
            <motion.span
              key="open"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="flex items-center justify-center"
            >
              <MessageCircle size={18} className="text-white" aria-hidden="true" />
            </motion.span>
          )}
        </AnimatePresence>
      </button>
    </div>
  );
}
