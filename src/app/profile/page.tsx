import { getServerSession } from "next-auth/next";
import { authOptions } from "@/libs/authOptions";
import Profile from "@/components/Profile"; // ✅ Import UI Component เข้ามา

// ฟังก์ชันดึงข้อมูลเหมือนเดิม
async function getUserProfile(token: string | undefined | null) {
  if (!token) return null;
  try {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
    const res = await fetch(`${backendUrl}/api/v1/auth/me`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store", 
    });

    if (!res.ok) return null;
    const result = await res.json();
    return result.data;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return null;
  }
}

export default async function ProfilePage() {
  // ดึง Session ก่อน
  const session = await getServerSession(authOptions);

  // ถ้ามี Session ถึงจะดึงข้อมูล User ป้องกัน API Error
  const userData = session ? await getUserProfile(session.user?.token) : null;

  // ✅ โยนข้อมูลทั้งหมดเข้าไปใน UI Component
  return <Profile session={session} userData={userData} />;
}