import Link from "next/link";

// สร้าง Interface เพื่อบอกว่า Component นี้ต้องการ Props อะไรบ้าง
interface ProfileProps {
  session: any;
  userData: any;
}

export default function Profile({ session, userData }: ProfileProps) {
  // ถ้ายังไม่ล็อกอิน ให้โชว์หน้านี้
  if (!session) {
    return (
      <main style={{ background: "#f4f5f7", minHeight: "100vh" }}>
        <div style={{ background: "linear-gradient(135deg, #0c4a6e 0%, #0891b2 100%)", padding: "40px 24px", textAlign: "center", color: "#fff" }}>
          <h1 style={{ fontSize: "32px", fontWeight: 800, fontFamily: "'Playfair Display', serif" }}>My Profile</h1>
        </div>
        <div style={{ padding: "60px 24px", textAlign: "center", color: "#9ca3af" }}>
          <p style={{ marginBottom: "16px", fontSize: "14px" }}>Please sign in to view your profile.</p>
          <Link href="/api/auth/signin" style={{ textDecoration: "none", background: "#0891b2", color: "#fff", fontWeight: 800, fontSize: "13px", padding: "10px 24px", borderRadius: "24px", display: "inline-block" }}>
            Sign In
          </Link>
        </div>
      </main>
    );
  }

  // ถ้าล็อกอินแล้ว เตรียมข้อมูล
  const initials = session.user?.name?.slice(0, 2).toUpperCase() ?? "?";

  const accountDetails = [
    { label: "Name", value: session.user?.name },
    { label: "Email", value: session.user?.email },
    { 
      label: "Rank", 
      value: userData ? `${userData.title} (Rank ${userData.rank})` : "Loading..." 
    },
    { 
      label: "Discount", 
      value: userData ? userData.discount : "0%" 
    }
  ];

  return (
    <main style={{ background: "#f4f5f7", minHeight: "100vh" }}>
      {/* Hero */}
      <div style={{ background: "linear-gradient(135deg, #0c4a6e 0%, #0891b2 100%)", padding: "36px 24px 28px", textAlign: "center", color: "#fff" }}>
        <div style={{ width: "68px", height: "68px", borderRadius: "50%", background: "rgba(255,255,255,0.2)", border: "3px solid rgba(255,255,255,0.4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px", fontWeight: 800, margin: "0 auto 12px" }}>
          {initials}
        </div>
        <h1 style={{ fontSize: "20px", fontWeight: 800, marginBottom: "4px" }}>{session.user?.name}</h1>
        <p style={{ fontSize: "12px", opacity: 0.75, marginBottom: "20px" }}>{session.user?.email}</p>
        
        <div style={{ display: "flex", justifyContent: "center", gap: "40px", marginBottom: "20px" }}>
          {[
            { num: userData?.numberOfEntries || "0", label: "Entries" }, 
            { num: "2025", label: "Member since" }
          ].map((s) => (
            <div key={s.label} style={{ textAlign: "center" }}>
              <p style={{ fontSize: "20px", fontWeight: 800 }}>{s.num}</p>
              <p style={{ fontSize: "11px", opacity: 0.7 }}>{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Details */}
      <div style={{ maxWidth: "460px", margin: "0 auto", padding: "20px 24px" }}>
        <div style={{ background: "#fff", borderRadius: "16px", border: "1px solid #e5e7eb", padding: "20px", marginBottom: "14px" }}>
          <p style={{ fontSize: "13px", fontWeight: 800, color: "#111", marginBottom: "14px", paddingBottom: "10px", borderBottom: "1px solid #f3f4f6" }}>Account Details</p>
          
          {accountDetails.map((row) => (
            <div key={row.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "13px", padding: "8px 0", borderBottom: "1px solid #f9fafb" }}>
              <span style={{ color: "#9ca3af" }}>{row.label}</span>
              <span style={{ fontWeight: 700, color: "#111" }}>{row.value}</span>
            </div>
          ))}
          
        </div>

        <div style={{ background: "#fff", borderRadius: "16px", border: "1px solid #e5e7eb", padding: "20px", marginBottom: "14px" }}>
          <p style={{ fontSize: "13px", fontWeight: 800, color: "#111", marginBottom: "14px", paddingBottom: "10px", borderBottom: "1px solid #f3f4f6" }}>My Bookings</p>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "13px" }}>
            <span style={{ color: "#9ca3af" }}>Upcoming reservations</span>
            <Link href="/mybooking" style={{ textDecoration: "none", fontSize: "12px", fontWeight: 700, color: "#92400e", background: "#fef3c7", border: "1px solid #fcd34d", padding: "5px 12px", borderRadius: "20px" }}>
              View Bookings →
            </Link>
          </div>
        </div>

        <Link href="/api/auth/signout" style={{ textDecoration: "none", display: "block", textAlign: "center", fontSize: "13px", fontWeight: 700, color: "#dc2626", background: "#fef2f2", border: "1px solid #fecaca", padding: "14px", borderRadius: "16px" }}>
          Sign Out
        </Link>
      </div>
    </main>
  );
}