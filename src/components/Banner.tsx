"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

const slides = [
  { gradient: "linear-gradient(135deg, #0c4a6e 0%, #0891b2 100%)", label: "Featured Space", title: "The Bloom Pavilion", sub: "A creative sanctuary in the heart of Sukhumvit — where ideas bloom.", emoji: "🌸" },
  { gradient: "linear-gradient(135deg, #134e4a 0%, #0f9b8e 100%)", label: "Hot Desk Pick", title: "Spark Space", sub: "High energy, high speed — the startup community's favourite.", emoji: "⚡" },
  { gradient: "linear-gradient(135deg, #1e1b4b 0%, #4f46e5 100%)", label: "Premium Meeting", title: "The Grand Table", sub: "Premium boardroom for client presentations and team offsites.", emoji: "🪑" },
];

export default function Banner() {
  const [index, setIndex] = useState(0);
  const router = useRouter();
  const { data: session } = useSession();

  useEffect(() => {
    const t = setInterval(() => setIndex((i) => (i + 1) % slides.length), 5000);
    return () => clearInterval(t);
  }, []);

  const slide = slides[index];

  return (
    <div
      style={{ position: "relative", width: "100%", height: "400px", background: slide.gradient, transition: "background 0.8s ease", cursor: "pointer", overflow: "hidden", userSelect: "none" }}
      onClick={() => setIndex((index + 1) % slides.length)}
    >
      {/* Decorative emoji */}
      <div style={{ position: "absolute", right: "80px", top: "50%", transform: "translateY(-50%)", fontSize: "160px", opacity: 0.08, pointerEvents: "none", lineHeight: 1 }}>
        {slide.emoji}
      </div>

      {/* Welcome badge */}
      {session && (
        <div style={{ position: "absolute", top: "16px", right: "20px", zIndex: 20, background: "rgba(255,255,255,0.18)", backdropFilter: "blur(8px)", color: "#fff", fontSize: "12px", fontWeight: 700, padding: "6px 14px", borderRadius: "20px", border: "1px solid rgba(255,255,255,0.3)" }}>
          Welcome, {session.user?.name}
        </div>
      )}

      {/* Main content */}
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#fff", textAlign: "center", padding: "24px", zIndex: 10 }}>
        <p style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "3px", textTransform: "uppercase", opacity: 0.75, marginBottom: "12px" }}>
          {slide.label}
        </p>
        <h1 style={{ fontSize: "42px", fontWeight: 800, marginBottom: "12px", fontFamily: "'Playfair Display', serif", lineHeight: 1.15, textShadow: "0 2px 12px rgba(0,0,0,0.2)" }}>
          {slide.title}
        </h1>
        <p style={{ fontSize: "15px", opacity: 0.85, maxWidth: "480px", lineHeight: 1.6, marginBottom: "24px" }}>
          {slide.sub}
        </p>
        <button
          style={{ background: "#fff", color: "#0891b2", border: "none", padding: "11px 28px", borderRadius: "24px", fontSize: "13px", fontWeight: 800, cursor: "pointer", letterSpacing: "0.5px", boxShadow: "0 4px 14px rgba(0,0,0,0.15)" }}
          onClick={(e) => { e.stopPropagation(); router.push("/venue"); }}
        >
          Explore Spaces
        </button>
      </div>

      {/* Dots */}
      <div style={{ position: "absolute", bottom: "16px", left: "50%", transform: "translateX(-50%)", display: "flex", gap: "6px", zIndex: 20 }}>
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={(e) => { e.stopPropagation(); setIndex(i); }}
            style={{ width: i === index ? "22px" : "8px", height: "8px", borderRadius: "4px", background: i === index ? "#fff" : "rgba(255,255,255,0.4)", border: "none", cursor: "pointer", padding: 0, transition: "all 0.3s" }}
          />
        ))}
      </div>
    </div>
  );
}