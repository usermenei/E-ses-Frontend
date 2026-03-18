import getCoworkingSpaces from "@/libs/getCoworkingSpaces";
import VenueCatalog from "@/components/VenueCatalog";
import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/authOptions";
import Link from "next/link"; // ✅ อย่าลืม Import Link

export default async function VenuePage() {
  const session = await getServerSession(authOptions);
  const token = (session?.user as any)?.token;
  const role = (session?.user as any)?.role; // ✅ ดึง role ออกมาเช็ค

  let spaces = null;

  try {
    if (token) {
      spaces = await getCoworkingSpaces(token);
    }
  } catch (err) {
    console.error("Failed to fetch spaces:", err);
  }

  return (
    <main style={{ background: "#f4f5f7", minHeight: "100vh" }}>
      {/* HEADER */}
      <div
        style={{
          background: "linear-gradient(135deg, #0c4a6e 0%, #0891b2 100%)",
          padding: "40px 24px",
          textAlign: "center",
          color: "#fff",
          position: "relative", // ✅ เพิ่ม position สำหรับจัดวางปุ่ม
        }}
      >
        <h1
          style={{
            fontSize: "32px",
            fontWeight: 800,
            marginBottom: "8px",
            fontFamily: "'Playfair Display', serif",
          }}
        >
          Our Coworking Spaces
        </h1>
        <p style={{ fontSize: "14px", opacity: 0.8 }}>
          Choose a space that fits your work style
        </p>

        {/* ✅ ปุ่มสร้าง Space (เห็นเฉพาะ Admin) */}
        {role === "admin" && (
          <div style={{ marginTop: "20px" }}>
            <Link
              href="/venue/create"
              style={{
                background: "#fff",
                color: "#0891b2",
                padding: "10px 20px",
                borderRadius: "30px",
                textDecoration: "none",
                fontWeight: "bold",
                fontSize: "14px",
                boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
              }}
            >
              + Create New Space
            </Link>
          </div>
        )}
      </div>

      {/* CONTENT */}
      <div style={{ padding: "24px" }}>
        {!token ? (
          <p>Please login to view spaces</p>
        ) : (
          <VenueCatalog spacesJson={spaces} />
        )}
      </div>
    </main>
  );
}