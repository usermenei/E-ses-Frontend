"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import getReservations, { Reservation } from "@/libs/getReservations";
import deleteReservation from "@/libs/deleteReservation"; // สำหรับลบถาวร
import confirmReservation from "@/libs/confirmReservation"; 
import updateReservationStatus from "@/libs/updateReservationStatus"; // ✅ Import ไฟล์ใหม่
import Link from "next/link";
import styles from "./BookingList.module.css"; 
import ReservationCard from "./ReservationCard"; 

export default function BookingList() {
  const { data: session } = useSession();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  const [searchTerm, setSearchTerm] = useState(""); 
  const [spaceSearchTerm, setSpaceSearchTerm] = useState(""); 
  const [sortBy, setSortBy] = useState("date-asc"); 
  const [statusFilter, setStatusFilter] = useState("all"); // ✅ State ใหม่สำหรับแยก Pending, Cancelled, Success
  
  const isAdmin = (session?.user as any)?.role === "admin";

  const fetchReservations = async () => {
    if (!session?.user?.token) { setLoading(false); return; }
    try {
      const json = await getReservations(session.user.token as string);
      setReservations(json.data);
    } catch {
      setError("Failed to load reservations.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReservations(); }, [session]);

  // ✅ 1. ฟังก์ชัน Cancel -> แค่เปลี่ยนสถานะเป็น Cancelled
  const handleCancelStatus = async (id: string) => {
    if (!session?.user?.token) return;
    if (!confirm("Are you sure you want to CANCEL this reservation?")) return;
    try {
      await updateReservationStatus(id, "cancelled", session.user.token as string);
      setReservations((prev) => 
        prev.map((r) => r._id === id ? { ...r, status: "cancelled" } : r)
      );
    } catch (err: any) {
      alert(err?.message ?? "Failed to cancel.");
    }
  };

  // ✅ 2. ฟังก์ชัน Delete -> ลบออกจาก Database ถาวร
  const handleDelete = async (id: string) => {
    if (!session?.user?.token) return;
    if (!confirm("Are you sure you want to PERMANENTLY DELETE this record?")) return;
    try {
      await deleteReservation(id, session.user.token as string);
      setReservations((prev) => prev.filter((r) => r._id !== id));
    } catch (err: any) {
      alert(err?.message ?? "Failed to delete.");
    }
  };

  const handleApprove = async (id: string) => {
    if (!session?.user?.token) return;
    if (!confirm("Approve this reservation?")) return;
    try {
      await confirmReservation(id, session.user.token as string);
      setReservations((prev) => 
        prev.map((r) => r._id === id ? { ...r, status: "success" } : r)
      );
    } catch (err: any) {
      alert(err?.message ?? "Failed to approve.");
    }
  };

  // ✅ กรองข้อมูล (เพิ่ม statusFilter เข้าไปดักจับ)
  const filteredReservations = reservations.filter((r) => {
    const userName = (r as any).user?.name?.toLowerCase() || "";
    const spaceName = r.coworkingSpace?.name?.toLowerCase() || "";

    const matchUser = !isAdmin || searchTerm === "" || userName.includes(searchTerm.toLowerCase());
    const matchSpace = spaceSearchTerm === "" || spaceName.includes(spaceSearchTerm.toLowerCase());
    const matchStatus = statusFilter === "all" || r.status === statusFilter; // เช็คสถานะ

    return matchUser && matchSpace && matchStatus;
  });

  const sortedReservations = [...filteredReservations].sort((a, b) => {
    if (sortBy === "date-asc") {
      return new Date(a.apptDate).getTime() - new Date(b.apptDate).getTime();
    } else if (sortBy === "date-desc") {
      return new Date(b.apptDate).getTime() - new Date(a.apptDate).getTime();
    } else if (sortBy === "space-asc") {
      const nameA = a.coworkingSpace?.name || "";
      const nameB = b.coworkingSpace?.name || "";
      return nameA.localeCompare(nameB);
    } else if (sortBy === "user-asc") {
      const userA = (a as any).user?.name || "";
      const userB = (b as any).user?.name || "";
      return userA.localeCompare(userB);
    }
    return 0;
  });

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>
        {isAdmin ? "All Reservations" : "My Reservations"}
      </h2>
      <p className={styles.subtitle}>
        {sortedReservations.length} {isAdmin ? "total" : "upcoming"} {sortedReservations.length === 1 ? "reservation" : "reservations"}
      </p>

      {reservations.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "24px" }}>
          
          {isAdmin && (
            <input
              type="text"
              placeholder="🔍 Search by user name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchInput}
            />
          )}

          <div className={styles.filterGrid}>
            <input
              type="text"
              placeholder="🏢 Search by space name..."
              value={spaceSearchTerm}
              onChange={(e) => setSpaceSearchTerm(e.target.value)}
              className={styles.searchInput}
            />

            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
              className={styles.sortSelect}
            >
              <option value="date-asc">📅 Date (Oldest First)</option>
              <option value="date-desc">📅 Date (Newest First)</option>
              <option value="space-asc">🏢 Space Name (A-Z)</option>
              {isAdmin && <option value="user-asc">👤 User Name (A-Z)</option>}
            </select>

            {/* ✅ เพิ่ม Dropdown สำหรับกรองตาม Status (Pending, Success, Cancelled) */}
            <select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)}
              className={styles.sortSelect}
              style={{ gridColumn: "1 / -1" }} // ให้แถวนี้ยาวเต็มบรรทัด
            >
              <option value="all">🟢 All Statuses</option>
              <option value="pending">⏳ Pending Only</option>
              <option value="success">✅ Approved (Success) Only</option>
              <option value="cancelled">❌ Cancelled Only</option>
            </select>
          </div>
        </div>
      )}

      {!session && (
        <div className={styles.messageCard}>
          <p className={styles.messageText}>Sign in to view your reservations.</p>
          <Link href="/api/auth/signin" className={styles.signInLink}>
            Sign In →
          </Link>
        </div>
      )}

      {session && loading && <p className={styles.messageText}>Loading...</p>}
      {session && error && <div className={styles.errorCard}>{error}</div>}

      {session && !loading && sortedReservations.length === 0 && !error && (
        <div className={styles.messageCard}>
          <div className={styles.emptyIcon}>🏢</div>
          <p className={styles.messageText}>
            {searchTerm || spaceSearchTerm || statusFilter !== "all" 
              ? "No reservations found matching your criteria." 
              : "No reservations yet."}
          </p>
        </div>
      )}

      {sortedReservations.map((r) => (
        <ReservationCard
          key={r._id}
          reservation={r}
          isAdmin={isAdmin}
          onApprove={handleApprove}
          onCancel={handleCancelStatus} // ✅ กด Cancel เรียกฟังก์ชันเปลี่ยนสถานะ
          onDelete={handleDelete}       // ✅ กด Delete เรียกฟังก์ชันลบทิ้งถาวร
        />
      ))}
    </div>
  );
}