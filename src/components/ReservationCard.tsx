"use client";

import { Reservation } from "@/libs/getReservations";
import styles from "./BookingList.module.css";

interface ReservationCardProps {
  reservation: Reservation;
  isAdmin: boolean;
  onApprove: (id: string) => void;
  onCancel: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (res: Reservation) => void;
}

export default function ReservationCard({
  reservation: r,
  isAdmin,
  onApprove,
  onCancel,
  onDelete,
  onEdit,
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
        {/* ปุ่ม Edit โชว์ให้ Admin หรือ User เฉพาะสถานะ pending */}
        {(isAdmin || r.status === "pending") && (
          <button onClick={() => onEdit(r)} className={styles.btnEdit}>Edit</button>
        )}

        {/* ปุ่ม Approve โชว์เฉพาะ Admin และสถานะต้อง pending */}
        {isAdmin && r.status === "pending" && (
          <button onClick={() => onApprove(r._id)} className={styles.btnApprove}>Approve</button>
        )}

        {/* ✅ แก้แล้ว: ปุ่ม Cancel โชว์เฉพาะตอน pending เท่านั้น */}
        {r.status === "pending" && (
          <button onClick={() => onCancel(r._id)} className={styles.btnCancel}>Cancel</button>
        )}

        {/* ✅ แก้แล้ว: ปุ่ม Delete โชว์ให้ Admin, หรือคิวที่ cancelled แล้ว, หรือคิวที่ success แล้ว */}
        {(isAdmin || r.status === "cancelled" || r.status === "success") && (
           <button onClick={() => onDelete(r._id)} className={styles.btnDelete}>Delete</button>
        )}
      </div>
    </div>
  );
}