"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import { useTranslations } from "@/lib/i18n/context";

const EASE = [0.16, 1, 0.3, 1] as [number, number, number, number];

export default function Contact({ index = "06" }: { index?: string }) {
  const t = useTranslations();
  const c = t.contact;
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.15 });
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setStatus("loading");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setStatus(res.ok ? "success" : "error");
      if (res.ok) setEmail("");
    } catch {
      setStatus("error");
    }
  }

  const anim = (delay: number) => ({
    initial: { opacity: 0, y: 16 },
    animate: inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 },
    transition: { duration: 0.5, ease: EASE, delay },
  });

  return (
    <section
      id="contact"
      ref={ref}
      style={{
        background: "var(--paper)",
        borderTop: "1px solid var(--warm-black)",
        scrollMarginTop: 110,
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "55fr 45fr",
          minHeight: 600,
        }}
      >
        {/* LEFT */}
        <div style={{ padding: "var(--section-y) var(--gutter)" }}>
          <motion.div {...anim(0)} style={{ display: "flex", gap: 16, marginBottom: 40 }}>
            <span style={labelStyle}>{index}</span>
          </motion.div>

          <motion.h2 {...anim(0.08)} style={headlineStyle}>
            {c.headlineRoman}
            <br />
            <em style={{ fontStyle: "normal" }}>{c.headlineItalic}</em>
          </motion.h2>

          <motion.p {...anim(0.14)} style={subStyle}>
            {c.sub.split("\n").map((line, i, arr) => (
              <span key={i}>{line}{i < arr.length - 1 && <br />}</span>
            ))}
          </motion.p>

          {/* Form */}
          <motion.div {...anim(0.2)} style={{ marginTop: 40 }}>
            {status === "success" ? (
              <p
                style={{
                  fontFamily: "var(--font-body), 'Helvetica Neue', sans-serif",
                  fontSize: 15,
                  color: "var(--text-primary)",
                  lineHeight: 1.65,
                }}
              >
                {c.successMessage}
              </p>
            ) : (
              <form onSubmit={handleSubmit}>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder={c.placeholder}
                  style={{
                    display: "block",
                    width: "100%",
                    border: "1px solid var(--line-strong)",
                    background: "transparent",
                    fontFamily: "var(--font-body), 'Helvetica Neue', sans-serif",
                    fontSize: 15,
                    color: "var(--text-primary)",
                    padding: "14px 16px",
                    outline: "none",
                    marginBottom: 0,
                    transition: "border-color 0.15s",
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "var(--olive)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "var(--warm-black)";
                  }}
                />
                <button
                  type="submit"
                  disabled={status === "loading"}
                  style={{
                    display: "block",
                    width: "100%",
                    background: "var(--warm-black)",
                    color: "var(--paper)",
                    border: "none",
                    fontFamily: "var(--font-body), 'Helvetica Neue', sans-serif",
                    fontSize: 12,
                    fontWeight: 600,
                    letterSpacing: "0.09em",
                    textTransform: "uppercase",
                    padding: 14,
                    marginTop: 0,
                    cursor: "pointer",
                    transition: "opacity 0.2s",
                    opacity: status === "loading" ? 0.6 : 1,
                  }}
                >
                  {status === "loading" ? c.buttonLoading : (
                    <>{c.buttonIdle} <span style={{ color: "var(--olive)" }}>→</span></>
                  )}
                </button>

                {status === "error" && (
                  <p
                    style={{
                      fontFamily: "var(--font-body), 'Helvetica Neue', sans-serif",
                      fontSize: 13,
                      color: "var(--clay)",
                      marginTop: 12,
                    }}
                  >
                    {c.errorMessage}
                  </p>
                )}
              </form>
            )}
          </motion.div>
        </div>

        {/* RIGHT — image */}
        <div style={{ position: "relative", minHeight: 400, overflow: "hidden" }}>
          <img
            src="/seeszn-home-main-04.png"
            alt="SEESZN"
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
            }}
          />
        </div>
      </div>
    </section>
  );
}

const labelStyle: React.CSSProperties = {
  fontFamily: "var(--font-body), 'Helvetica Neue', sans-serif",
  fontSize: 11,
  fontWeight: 500,
  letterSpacing: "0.1em",
  textTransform: "uppercase",
  color: "var(--text-muted)",
};

const headlineStyle: React.CSSProperties = {
  fontFamily: "var(--font-editorial), serif",
  fontWeight: 400,
  fontSize: "clamp(36px, 5vw, 64px)",
  lineHeight: 1.1,
  color: "var(--warm-black)",
  marginBottom: 24,
};

const subStyle: React.CSSProperties = {
  fontFamily: "var(--font-body), 'Helvetica Neue', sans-serif",
  fontSize: 15,
  fontWeight: 400,
  color: "var(--text-body)",
  lineHeight: 1.65,
  maxWidth: 400,
};
