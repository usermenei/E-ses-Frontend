import { getServerSession } from "next-auth/next";
import { authOptions } from "@/libs/authOptions";
import Link from "next/link";

// 1️⃣ ฟังก์ชันสำหรับยิง API ไปดึงข้อมูล User ฉบับเต็มจาก Backend ของคุณ
async function getUserProfile(token: string | undefined | null) {
  if (!token) return null;
  try {
    // อย่าลืมเปลี่ยน URL ให้ตรงกับ Backend ของคุณ (หรือใช้ process.env) 
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
    
    const res = await fetch(`${backendUrl}/api/v1/auth/me`, {
      method: "GET",
      headers: {
        // ส่ง Token ไปเพื่อยืนยันตัวตน
        Authorization: `Bearer ${token}`, 
      },
      // ใช้ cache: 'no-store' เพื่อให้ดึงข้อมูลใหม่เสมอ
      cache: "no-store", 
    });

    if (!res.ok) return null;
    const result = await res.json();
    return result.data; // จะได้ object ที่มี rank, title, discount ออกมา
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return null;
  }
}

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return (
      <main style={{ background: "#f4f5f7", minHeight: "100vh" }}>
        <div style={{ background: "linear-gradient(135deg, #0c4a6e 0%, #0891b2 100%)", padding: "40px 24px", textAlign: "center", color: "#fff" }}>
          <h1 style={{ fontSize: "32px", fontWeight: 800, fontFamily: "'Playfair Display', serif" }}>My Profile</h1>
        </div>
        <div style={{ padding: "60px 24px", textAlign: "center", color: "#9ca3af" }}>
          <p style={{ marginBottom: "16px", fontSize: "14px" }}>Please sign in to view your profile.</p>
          <Link href="/api/auth/signin" style={{ textDecoration: "none", background: "#0891b2", color: "#fff", fontWeight: 800, fontSize: "13px", padding: "10px 24px", borderRadius: "24px" }}>
            Sign In
          </Link>
        </div>
      </main>
    );
  }

  // 2️⃣ เรียกใช้ฟังก์ชันดึงข้อมูล (สมมติว่าคุณเก็บ JWT Token ไว้ใน session.user.token)
  // หากคุณเก็บไว้ในชื่ออื่น (เช่น session.token) ให้ปรับแก้ตรงนี้นะครับ
  const userData = await getUserProfile(session.user?.token);

  const initials = session.user?.name?.slice(0, 2).toUpperCase() ?? "?";

  // เตรียมข้อมูลสำหรับแสดงผลใน Account Details
  // ถ้า fetch สำเร็จ จะโชว์ Title (Rank) และแถม Discount ให้ด้วย!
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
        
        {/* อัปเดตจำนวน Spaces ให้ตรงกับข้อมูลจริง (ถ้ามี) */}
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
        
        <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
          {["Edit Avatar", "Edit Profile"].map((label) => (
            <button key={label} style={{ background: "rgba(255,255,255,0.15)", color: "#fff", border: "1px solid rgba(255,255,255,0.3)", padding: "7px 16px", borderRadius: "20px", fontSize: "12px", fontWeight: 700, cursor: "pointer", fontFamily: "'Nunito', sans-serif" }}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Details */}
      <div style={{ maxWidth: "460px", margin: "0 auto", padding: "20px 24px" }}>
        <div style={{ background: "#fff", borderRadius: "16px", border: "1px solid #e5e7eb", padding: "20px", marginBottom: "14px" }}>
          <p style={{ fontSize: "13px", fontWeight: 800, color: "#111", marginBottom: "14px", paddingBottom: "10px", borderBottom: "1px solid #f3f4f6" }}>Account Details</p>
          
          {/* 3️⃣ Map ข้อมูล accountDetails ที่เราเตรียมไว้ */}
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