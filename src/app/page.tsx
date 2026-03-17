import Banner from "@/components/Banner";
import Link from "next/link";

const featureCards = [
  {
    gradient: "linear-gradient(160deg, #0c4a6e 0%, #0891b2 100%)",
    emoji: "🌸", tag: "Private Office", name: "The Bloom Pavilion",
    desc: "Elegant private suites with natural light. Perfect for deep focus and creative teams.",
    href: "/venue",
  },
  {
    gradient: "linear-gradient(160deg, #134e4a 0%, #0f9b8e 100%)",
    emoji: "⚡", tag: "Hot Desk", name: "Spark Space",
    desc: "High-energy open workspace with blazing fiber, standing desks, and startup energy.",
    href: "/venue",
  },
  {
    gradient: "linear-gradient(160deg, #1e1b4b 0%, #4f46e5 100%)",
    emoji: "🪑", tag: "Meeting Room", name: "The Grand Table",
    desc: "Premium boardroom for client presentations, workshops, and team offsites.",
    href: "/venue",
  },
];

const quickLinks = [
  { tag: "Quick Action", title: "Reserve a Space",     desc: "Book your desk or room in minutes",     href: "/booking",    icon: "📅" },
  { tag: "My Account",   title: "View My Bookings",    desc: "Manage and cancel reservations",        href: "/mybooking",  icon: "📋" },
  { tag: "Profile",      title: "My CoSpace Profile",  desc: "Edit avatar and account settings",      href: "/profile",    icon: "👤" },
];

export default function Home() {
  return (
    <main style={{ background: "#f4f5f7", minHeight: "100vh" }}>

      <Banner />

      {/* Our Spaces */}
      <div style={{ background: "#fff", padding: "24px 24px 28px" }}>
        <p style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "3px", textTransform: "uppercase", color: "#0891b2", marginBottom: "18px" }}>
          Our Spaces
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
          {featureCards.map((card) => (
            <Link key={card.name} href={card.href} className="fc-card">
              <div style={{ background: card.gradient, height: "180px", position: "relative", display: "flex", alignItems: "flex-end", padding: "16px" }}>
                <span style={{ position: "absolute", top: "16px", right: "20px", fontSize: "52px", opacity: 0.15, userSelect: "none" }}>
                  {card.emoji}
                </span>
                <div>
                  <p style={{ fontSize: "10px", letterSpacing: "2px", textTransform: "uppercase", color: "rgba(255,255,255,0.65)", marginBottom: "4px" }}>{card.tag}</p>
                  <h3 style={{ fontSize: "18px", fontWeight: 800, color: "#fff", lineHeight: 1.2, fontFamily: "'Playfair Display', serif" }}>{card.name}</h3>
                </div>
              </div>
              <div style={{ padding: "16px 18px 20px" }}>
                <p style={{ fontSize: "13px", color: "#6b7280", lineHeight: 1.6, marginBottom: "12px" }}>{card.desc}</p>
                <span style={{ fontSize: "12px", fontWeight: 700, color: "#0891b2" }}>Reserve now →</span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Quick links */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px", padding: "16px 24px 28px" }}>
        {quickLinks.map((ql) => (
          <Link key={ql.title} href={ql.href} className="qk-card">
            <span style={{ fontSize: "22px", lineHeight: 1, flexShrink: 0 }}>{ql.icon}</span>
            <div>
              <p style={{ fontSize: "10px", fontWeight: 700, color: "#0891b2", letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: "3px" }}>{ql.tag}</p>
              <p style={{ fontSize: "13px", fontWeight: 700, color: "#111", marginBottom: "3px" }}>{ql.title}</p>
              <p style={{ fontSize: "12px", color: "#9ca3af" }}>{ql.desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}