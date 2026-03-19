"use client";

import { useState, useEffect, forwardRef } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import updateReservation from "@/libs/updateReservation";
import getCoworkingSpaces, { CoworkingSpaceItem } from "@/libs/getCoworkingSpaces";
import { Reservation } from "@/libs/getReservations";
import styles from "./BookingList.module.css";

interface EditModalProps {
  reservation: Reservation;
  isAdmin: boolean;
  token: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditModal({ reservation, isAdmin, token, onClose, onSuccess }: EditModalProps) {
  const startDate = new Date(reservation.apptDate);
  const [apptDate, setApptDate] = useState<Date | null>(startDate);
  const [apptTime, setApptTime] = useState(startDate.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }));
  
  let endStr = apptTime;
  if ((reservation as any).apptEndDate) {
    endStr = new Date((reservation as any).apptEndDate).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
  }
  const [apptEndTime, setApptEndTime] = useState(endStr);
  const [spaces, setSpaces] = useState<CoworkingSpaceItem[]>([]);
  const [spaceId, setSpaceId] = useState(reservation.coworkingSpace?._id || "");
  const [status, setStatus] = useState(reservation.status);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchSpaces = async () => {
      try {
        const json = await getCoworkingSpaces(token);
        setSpaces(json.data);
      } catch (err) {
        console.error("Failed to fetch coworking spaces:", err);
      }
    };
    fetchSpaces();
  }, [token]);

  // ✅ ฟังก์ชันช่วยตรวจสอบและปรับเวลาเมื่อ Start Time เปลี่ยน
  const handleStartTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newStartTime = e.target.value;
    setApptTime(newStartTime);
    
    // ถ้าเวลาจบ ดันน้อยกว่าหรือเท่ากับเวลาเริ่ม ให้ขยับเวลาจบหนีไปอีก 1 ชั่วโมงอัตโนมัติ
    if (apptEndTime <= newStartTime) {
      const [hours, minutes] = newStartTime.split(":");
      const newEndHour = String((parseInt(hours) + 1) % 24).padStart(2, "0");
      setApptEndTime(`${newEndHour}:${minutes}`);
    }
  };

  const handleSave = async () => {
    if (!apptDate || !spaceId) { alert("Please fill in all fields."); return; }
    
    const yyyy = apptDate.getFullYear();
    const mm = String(apptDate.getMonth() + 1).padStart(2, "0");
    const dd = String(apptDate.getDate()).padStart(2, "0");
    const formattedDate = `${yyyy}-${mm}-${dd}`;
    
    const isoDate = new Date(`${formattedDate}T${apptTime}:00`).toISOString();
    const isoEndDate = new Date(`${formattedDate}T${apptEndTime}:00`).toISOString();
    
    const now = new Date();
    const selectedStart = new Date(isoDate);
    const selectedEnd = new Date(isoEndDate);

    // ✅ 1. เช็คว่าเวลาจบ ต้องมากกว่าเวลาเริ่ม
    if (selectedEnd <= selectedStart) { 
      alert("End time must be after start time."); 
      return; 
    }

    // ✅ 2. เช็คว่าถ้ามีการ "เปลี่ยนวัน/เวลาใหม่" จะต้องไม่ใช่อดีต 
    // (อนุญาตให้เซฟอดีตได้ เฉพาะกรณีที่ Admin ไม่ได้แก้เวลา แต่เข้ามาแก้แค่ Status)
    const isTimeChanged = isoDate !== new Date(reservation.apptDate).toISOString() || isoEndDate !== new Date((reservation as any).apptEndDate).toISOString();
    if (isTimeChanged && selectedStart < now) {
      alert("Cannot select a date or time in the past.");
      return;
    }

    setLoading(true);
    try {
      const body: any = { apptDate: isoDate, apptEndDate: isoEndDate, coworkingSpace: spaceId };
      if (isAdmin) body.status = status;
      await updateReservation(reservation._id, body, token);
      onSuccess(); 
    } catch (err: any) { alert(err.message || "Failed to update"); } finally { setLoading(false); }
  };

  // --- 🎨 STYLES ---
  const labelStyle: React.CSSProperties = {
    display: "block", fontSize: "11px", fontWeight: 700, letterSpacing: "2px",
    textTransform: "uppercase", color: "#6b7280", marginBottom: "10px", textAlign: "left",
  };

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "12px 16px", fontSize: "15px", border: "1.5px solid #e5e7eb",
    borderRadius: "12px", outline: "none", fontFamily: "'Nunito', sans-serif",
    color: "#111", background: "#fff", boxSizing: "border-box", transition: "all 0.2s ease-in-out",
  };

  const CustomDatePickerInput = forwardRef(({ value, onClick, ...props }: any, ref: any) => (
    <div style={{ position: "relative" }}>
      <input {...props} value={value} onClick={onClick} ref={ref} style={{ ...inputStyle, paddingLeft: "42px" }} />
      <span style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#6b7280" }}>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: "20px", height: "20px" }}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5m-9-6h.008v.008H12v-.008zM12 15h.008v.008H12V15zm0 2.25h.008v.008H12v-.008zM9.75 15h.008v.008H9.75V15zm0 2.25h.008v.008H9.75v-.008zM7.5 15h.008v.008H7.5V15zm0 2.25h.008v.008H7.5v-.008zM14.25 15h.008v.008H14.25V15zm0 2.25h.008v.008H14.25v-.008zM16.5 15h.008v.008H16.5V15zm0 2.25h.008v.008H16.5v-.008z" />
        </svg>
      </span>
    </div>
  ));
  CustomDatePickerInput.displayName = "CustomDatePickerInput";

  const datePickerGlobalStyles = `
    .react-datepicker-wrapper { width: 100%; }
    .react-datepicker { font-family: 'Nunito', sans-serif; border: 1px solid #e5e7eb; border-radius: 12px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); }
    .react-datepicker__header { background-color: #f9fafb; border-bottom: 1px solid #e5e7eb; border-top-left-radius: 12px; border-top-right-radius: 12px; }
    .react-datepicker__day--selected { background-color: #0891b2; border-radius: 6px; }
    .react-datepicker__day--selected:hover { background-color: #0e7490; }
    .react-datepicker__day--today { color: #0891b2; font-weight: 700; }
    .react-datepicker__day--today:after { display: none; }
  `;

  return (
    <div className={styles.modalOverlay}>
      <style>{datePickerGlobalStyles}</style>
      <style>{`
        .modal-input:focus, .modal-select:focus {
          border-color: #0891b2 !important;
          box-shadow: 0 0 0 3px rgba(8, 145, 178, 0.2) !important;
        }
      `}</style>

      <div style={{ 
        maxWidth: "460px", width: "90%", background: "#fff", padding: "36px",
        borderRadius: "24px", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)",
        position: "relative"
      }}>
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <h1 style={{ fontSize: "28px", fontWeight: 800, color: "#111", letterSpacing: "-0.5px", margin: 0 }}>
            Edit Reservation
          </h1>
          <p style={{ fontSize: "14px", color: "#6b7280", marginTop: "4px", margin: 0 }}>
            ID: {reservation._id.slice(-6).toUpperCase()}
          </p>
        </div>
        
        {/* SELECT SPACE */}
        <div style={{ marginBottom: "20px" }}>
          <label style={labelStyle}>Coworking Space</label>
          <div style={{ position: "relative" }}>
            <select 
              value={spaceId} 
              onChange={(e) => setSpaceId(e.target.value)}
              className="modal-select"
              style={{ ...inputStyle, paddingRight: "40px", appearance: "none" }}
            >
              <option value="">-- Select a space --</option>
              {spaces.map((s) => (
                <option key={s._id} value={s._id}>{s.name}</option>
              ))}
            </select>
            <span style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", color: "#6b7280", pointerEvents: "none" }}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: "20px", height: "20px" }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
              </svg>
            </span>
          </div>
        </div>
        
        {/* DATE PICKER */}
        <div style={{ marginBottom: "20px" }}>
          <label style={labelStyle}>Date</label>
          <DatePicker 
            selected={apptDate} 
            onChange={(date) => setApptDate(date)} 
            dateFormat="yyyy-MM-dd" 
            minDate={new Date()} // ✅ กันไม่ให้จิ้มเลือกวันในอดีตได้
            customInput={<CustomDatePickerInput />}
          />
        </div>

        <div style={{ display: "flex", gap: "16px", marginBottom: "20px" }}>
          {/* START TIME */}
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Start Time</label>
            <div style={{ position: "relative" }}>
              <input 
                type="time" 
                value={apptTime} 
                onChange={handleStartTimeChange} // ✅ ใช้ฟังก์ชันใหม่ที่เราสร้างขึ้นมาจัดการ
                className="modal-input"
                style={{ ...inputStyle, paddingLeft: "42px" }} 
              />
              <span style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#6b7280" }}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: "20px", height: "20px" }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </span>
            </div>
          </div>
          {/* END TIME */}
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>End Time</label>
            <div style={{ position: "relative" }}>
              <input 
                type="time" 
                value={apptEndTime} 
                onChange={(e) => setApptEndTime(e.target.value)} 
                min={apptTime} // ✅ บังคับ UI ว่าต้องเลือกเวลาไม่น้อยกว่า Start Time
                className="modal-input"
                style={{ ...inputStyle, paddingLeft: "42px" }} 
              />
              <span style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#6b7280" }}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: "20px", height: "20px" }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </span>
            </div>
          </div>
        </div>

        {/* STATUS */}
        {isAdmin && (
          <div style={{ marginBottom: "32px" }}>
            <label style={labelStyle}>Status</label>
            <div style={{ position: "relative" }}>
              <select 
                value={status} 
                onChange={(e) => setStatus(e.target.value)} 
                className="modal-select"
                style={{ ...inputStyle, paddingRight: "40px", appearance: "none" }}
              >
                <option value="pending">Pending</option>
                <option value="success">Success</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <span style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", color: "#6b7280", pointerEvents: "none" }}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: "20px", height: "20px" }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </span>
            </div>
          </div>
        )}

        {/* BUTTONS */}
        <div style={{ display: "flex", gap: "12px", marginTop: "10px" }}>
          <button 
            onClick={onClose} 
            disabled={loading}
            style={{ 
              flex: 1, background: "#f3f4f6", color: "#4b5563", padding: "14px", 
              borderRadius: "12px", fontWeight: 700, cursor: "pointer", border: "none", 
              transition: "all 0.3s ease", fontSize: "16px" 
            }}
            onMouseOver={(e) => (e.currentTarget.style.background = "#e5e7eb")}
            onMouseOut={(e) => (e.currentTarget.style.background = "#f3f4f6")}
          >
            Cancel
          </button>
          <button 
            onClick={handleSave} 
            disabled={loading}
            style={{
              flex: 1, background: "#0891b2", color: "#fff", padding: "14px",
              borderRadius: "12px", fontWeight: 700, border: "none",
              cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1,
              transition: "all 0.3s ease", fontSize: "16px", letterSpacing: "0.5px",
              boxShadow: loading ? "none" : "0 4px 6px -1px rgba(8, 145, 178, 0.4)",
            }}
            onMouseOver={(e) => (e.currentTarget.style.background = "#0e7490")}
            onMouseOut={(e) => (e.currentTarget.style.background = "#0891b2")}
          >
            {loading ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}