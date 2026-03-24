"use client";

import { Reservation } from "@/libs/getReservations";
import Image from "next/image"; // ✅ 1. Import Image จาก Next.js
import styles from "./BookingList.module.css";

// ฟังก์ชันแปลงลิงก์ Google Drive
const formatImageUrl = (url: string | undefined) => {
  if (!url) return "";
  if (url.includes("drive.google.com/file/d/")) {
    const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
    if (match && match[1]) {
      return `https://drive.google.com/uc?export=view&id=${match[1]}`;
    }
  }
  return url; 
};

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

  const validImageUrl = formatImageUrl(space?.picture);

  return (
    <div className={styles.reservationCard}>
      <div className={styles.cardLeft}>
        <div className={styles.imageContainer}>
          {/* ✅ 2. เปลี่ยนมาใช้ <Image> ของ Next.js */}
          {validImageUrl ? (
            <Image 
              src={validImageUrl} 
              alt={space?.name ?? "Space"} 
              width={120} // กำหนดความกว้าง (ปรับตัวเลขได้ตามต้องการ)
              height={120} // กำหนดความสูง
              className={styles.image} 
            />
          ) : (
            "🏢"
          )}
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
        {(isAdmin || r.status === "pending") && (
          <button onClick={() => onEdit(r)} className={styles.btnEdit}>Edit</button>
        )}

        {isAdmin && r.status === "pending" && (
          <button onClick={() => onApprove(r._id)} className={styles.btnApprove}>Approve</button>
        )}

        {r.status === "pending" && (
          <button onClick={() => onCancel(r._id)} className={styles.btnCancel}>Cancel</button>
        )}

        {(isAdmin || r.status === "cancelled" || r.status === "success") && (
            <button onClick={() => onDelete(r._id)} className={styles.btnDelete}>Delete</button>
        )}
      </div>
    </div>
  );
}