"use client";

import { Reservation } from "@/libs/getReservations";
import styles from "./BookingList.module.css";

// ✅ 1. เพิ่ม onDelete เข้ามาใน Props
interface ReservationCardProps {
  reservation: Reservation;
  isAdmin: boolean;
  onApprove: (id: string) => void;
  onCancel: (id: string) => void;
  onDelete: (id: string) => void; 
}

export default function ReservationCard({
  reservation: r,
  isAdmin,
  onApprove,
  onCancel,
  onDelete, // ✅ รับ Props
}: ReservationCardProps) {
  const space = r.coworkingSpace;

  const startDateObj = new Date(r.apptDate);
  const dateStr = startDateObj.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  const startTimeStr = startDateObj.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });

  let timeDisplay = `${startTimeStr}`;
  if ((r as any).apptEndDate) {
    const endDateObj = new Date((r as any).apptEndDate);
    const endTimeStr = endDateObj.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
    timeDisplay = `${startTimeStr} - ${endTimeStr}`;
  }

  const userName = (r as any).user?.name || "Unknown User";

  const getStatusClass = (status: string) => {
    switch (status) {
      case "success": return styles.statusSuccess;
      case "cancelled": return styles.statusCancelled;
      default: return styles.statusPending;
    }
  };

  return (
    <div className={styles.reservationCard}>
      <div className={styles.cardLeft}>
        <div className={styles.imageContainer}>
          {space?.picture ? <img src={space.picture} alt={space.name} className={styles.image} /> : "🏢"}
        </div>

        <div className={styles.infoContainer}>
          <p className={styles.spaceName}>{space?.name ?? "Unknown Space"}</p>
          {isAdmin && <p className={styles.userName}>👤 {userName}</p>}
          <p className={styles.location}>{space?.district}, {space?.province}</p>

          <div className={styles.dateTimeContainer}>
            <p className={styles.dateTime}>📅 {dateStr} at {timeDisplay}</p>
            <span className={`${styles.statusBadge} ${getStatusClass(r.status)}`}>
              {r.status.charAt(0).toUpperCase() + r.status.slice(1)}
            </span>
          </div>
        </div>
      </div>

      <div className={styles.actionsContainer}>
        {isAdmin && r.status === "pending" && (
          <button onClick={() => onApprove(r._id)} className={styles.btnApprove}>Approve</button>
        )}

        {/* ✅ ปุ่ม Cancel จะโชว์เฉพาะตอนที่ยังไม่โดน Cancel */}
        {r.status !== "cancelled" && (
          <button onClick={() => onCancel(r._id)} className={styles.btnCancel}>Cancel</button>
        )}

        {/* ✅ ปุ่ม Delete (ลบทิ้งถาวร) โชว์ให้แอดมิน หรือโชว์เวลาที่สถานะถูก Cancelled ไปแล้วเผื่อผู้ใช้จะล้างประวัติ */}
        {(isAdmin || r.status === "cancelled") && (
           <button onClick={() => onDelete(r._id)} className={styles.btnDelete}>Delete</button>
        )}
      </div>
    </div>
  );
}