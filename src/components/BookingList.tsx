"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import getReservations, { Reservation } from "@/libs/getReservations";
import deleteReservation from "@/libs/deleteReservation";
import confirmReservation from "@/libs/confirmReservation"; 
import updateReservationStatus from "@/libs/updateReservationStatus"; 
import Link from "next/link";
import styles from "./BookingList.module.css"; 
import ReservationCard from "./ReservationCard"; 
import EditModal from "./EditModal"; 

export default function BookingList() {
  const { data: session } = useSession();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  const [searchTerm, setSearchTerm] = useState(""); 
  const [spaceSearchTerm, setSpaceSearchTerm] = useState(""); 
  const [sortBy, setSortBy] = useState("date-asc"); 
  const [statusFilter, setStatusFilter] = useState("all"); 
  
  const [editingRes, setEditingRes] = useState<Reservation | null>(null);
  
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

  // ✅ ปรับปรุง handleDelete ให้ข้อความ Confirm เหมาะสมกับสถานะและ Role
  const handleDelete = async (id: string) => {
    if (!session?.user?.token) return;

    // หาคิวที่กำลังจะลบ เพื่อดู status
    const targetRes = reservations.find(r => r._id === id);
    const isUserClearingHistory = !isAdmin && targetRes?.status === "success";

    // กำหนดข้อความแจ้งเตือน
    const confirmMsg = isUserClearingHistory
      ? "Do you want to remove this completed reservation from your history?" // ข้อความสำหรับ User ทั่วไป
      : "Are you sure you want to PERMANENTLY DELETE this record?"; // ข้อความเตือนแรงๆ สำหรับ Admin หรือเคสอื่นๆ

    if (!confirm(confirmMsg)) return;
    
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

  const handleEditSuccess = () => {
    setEditingRes(null);
    fetchReservations(); 
  };

  // ... (ส่วนโค้ดฟิลเตอร์ เรียงลำดับ เหมือนเดิมเป๊ะครับ)
  const filteredReservations = reservations.filter((r) => {
    const userName = (r as any).user?.name?.toLowerCase() || "";
    const spaceName = r.coworkingSpace?.name?.toLowerCase() || "";
    const matchUser = !isAdmin || searchTerm === "" || userName.includes(searchTerm.toLowerCase());
    const matchSpace = spaceSearchTerm === "" || spaceName.includes(spaceSearchTerm.toLowerCase());
    const matchStatus = statusFilter === "all" || r.status === statusFilter;
    return matchUser && matchSpace && matchStatus;
  });

  const sortedReservations = [...filteredReservations].sort((a, b) => {
    if (sortBy === "date-asc") return new Date(a.apptDate).getTime() - new Date(b.apptDate).getTime();
    if (sortBy === "date-desc") return new Date(b.apptDate).getTime() - new Date(a.apptDate).getTime();
    if (sortBy === "space-asc") {
      const nameA = a.coworkingSpace?.name || "";
      const nameB = b.coworkingSpace?.name || "";
      return nameA.localeCompare(nameB);
    }
    if (sortBy === "user-asc") {
      const userA = (a as any).user?.name || "";
      const userB = (b as any).user?.name || "";
      return userA.localeCompare(userB);
    }
    return 0;
  });

  return (
    <div className={styles.container}>
      {/* ... (UI ท่อนบนเหมือนเดิมครับ ไม่มีการแก้ไข) ... */}
      <h2 className={styles.title}>
        {isAdmin ? "All Reservations" : "My Reservations"}
      </h2>
      <p className={styles.subtitle}>
        {sortedReservations.length} {isAdmin ? "total" : "upcoming"} {sortedReservations.length === 1 ? "reservation" : "reservations"}
      </p>

      {reservations.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "24px" }}>
          
          {isAdmin && (
            <input type="text" placeholder="🔍 Search by user name..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className={styles.searchInput} />
          )}

          <div className={styles.filterGrid}>
            <input type="text" placeholder="🏢 Search by space name..." value={spaceSearchTerm} onChange={(e) => setSpaceSearchTerm(e.target.value)} className={styles.searchInput} />

            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className={styles.sortSelect}>
              <option value="date-asc">📅 Date (Oldest First)</option>
              <option value="date-desc">📅 Date (Newest First)</option>
              <option value="space-asc">🏢 Space Name (A-Z)</option>
              {isAdmin && <option value="user-asc">👤 User Name (A-Z)</option>}
            </select>

            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className={styles.sortSelect} style={{ gridColumn: "1 / -1" }}>
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
          <Link href="/api/auth/signin" className={styles.signInLink}>Sign In →</Link>
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
          onCancel={handleCancelStatus}
          onDelete={handleDelete}
          onEdit={(res) => setEditingRes(res)} 
        />
      ))}

      {editingRes && (
        <EditModal 
          reservation={editingRes} 
          isAdmin={isAdmin} 
          token={session?.user?.token as string} 
          onClose={() => setEditingRes(null)} 
          onSuccess={handleEditSuccess} 
        />
      )}
    </div>
  );
}