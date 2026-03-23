"use client";

import { useState, useEffect, forwardRef } from "react";
import { useSession } from "next-auth/react";
import createReservation from "@/libs/createReservation";
import getCoworkingSpaces, {
  CoworkingSpaceItem,
} from "@/libs/getCoworkingSpaces";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export default function BookingForm({
  token: propToken,
  initialSpace,
}: {
  token?: string;
  initialSpace?: string;
} = {}) {
  const { data: session } = useSession();

  const [spaces, setSpaces] = useState<CoworkingSpaceItem[]>([]);
  const [spaceId, setSpaceId] = useState(initialSpace || "");
  const [apptDate, setApptDate] = useState<Date | null>(null);

  const [apptTime, setApptTime] = useState("09:00");
  const [apptEndTime, setApptEndTime] = useState("10:00");

  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ Sync spaceId when initialSpace prop changes (e.g. passed from URL ?spaceId=xxx)
  useEffect(() => {
    if (initialSpace) {
      setSpaceId(initialSpace);
    }
  }, [initialSpace]);

  useEffect(() => {
    const fetchSpaces = async () => {
      try {
        const token = (session?.user as any)?.token ?? propToken;
        if (!token) return;

        const json = await getCoworkingSpaces(token);
        setSpaces(json.data);
      } catch (err) {
        console.error(err);
        setErrorMsg("Failed to load spaces.");
      }
    };

    fetchSpaces();
  }, [session, propToken]);

  const handleSubmit = async () => {
    const token = (session?.user as any)?.token ?? propToken;

    if (!token) {
      setErrorMsg("You must be signed in to make a reservation.");
      return;
    }

    if (!spaceId) {
      setErrorMsg("Please select a coworking space.");
      return;
    }

    if (!apptDate) {
      setErrorMsg("Please select a date.");
      return;
    }

    const yyyy = apptDate.getFullYear();
    const mm = String(apptDate.getMonth() + 1).padStart(2, "0");
    const dd = String(apptDate.getDate()).padStart(2, "0");
    const formattedDate = `${yyyy}-${mm}-${dd}`;

    const isoDate = new Date(`${formattedDate}T${apptTime}:00`).toISOString();
    const isoEndDate = new Date(
      `${formattedDate}T${apptEndTime}:00`
    ).toISOString();

    if (new Date(isoEndDate) <= new Date(isoDate)) {
      setErrorMsg("End time must be after start time.");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    try {
      await createReservation(
        spaceId,
        {
          apptDate: isoDate,
          apptEndDate: isoEndDate,
        },
        token
      );

      setSuccess(true);
      setSpaceId(initialSpace || "");
      setApptDate(null);
      setApptTime("09:00");
      setApptEndTime("10:00");

      setTimeout(() => setSuccess(false), 4000);
    } catch (err: any) {
      setErrorMsg(err?.message ?? "Failed to create reservation.");
    } finally {
      setLoading(false);
    }
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: "11px",
    fontWeight: 700,
    letterSpacing: "2px",
    textTransform: "uppercase",
    color: "#6b7280",
    marginBottom: "10px",
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "12px 16px",
    fontSize: "15px",
    border: "1.5px solid #e5e7eb",
    borderRadius: "12px",
    outline: "none",
    fontFamily: "'Nunito', sans-serif",
    color: "#111",
    background: "#fff",
    boxSizing: "border-box",
    transition: "all 0.2s ease-in-out",
  };

  const inputWrapperStyle: React.CSSProperties = {
    marginBottom: "20px",
  };

  const cardStyle: React.CSSProperties = {
    maxWidth: "460px",
    margin: "0 auto",
    background: "#fff",
    padding: "36px",
    borderRadius: "24px",
    boxShadow:
      "0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)",
  };

  const CustomDatePickerInput = forwardRef(
    ({ value, onClick, ...props }: any, ref: any) => (
      <div style={{ position: "relative" }}>
        <input
          {...props}
          value={value}
          onClick={onClick}
          ref={ref}
          style={{ ...inputStyle, paddingLeft: "42px" }}
        />
        <span
          style={{
            position: "absolute",
            left: "12px",
            top: "50%",
            transform: "translateY(-50%)",
            color: "#6b7280",
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            style={{ width: "20px", height: "20px" }}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5m-9-6h.008v.008H12v-.008zM12 15h.008v.008H12V15zm0 2.25h.008v.008H12v-.008zM9.75 15h.008v.008H9.75V15zm0 2.25h.008v.008H9.75v-.008zM7.5 15h.008v.008H7.5V15zm0 2.25h.008v.008H7.5v-.008zM14.25 15h.008v.008H14.25V15zm0 2.25h.008v.008H14.25v-.008zM16.5 15h.008v.008H16.5V15zm0 2.25h.008v.008H16.5v-.008z"
            />
          </svg>
        </span>
      </div>
    )
  );

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
    <div style={{ padding: "40px 20px", background: "#f9fafb", minHeight: "100vh" }}>
      <style>{datePickerGlobalStyles}</style>
      <style>{`
        input:focus, select:focus {
          border-color: #0891b2 !important;
          box-shadow: 0 0 0 3px rgba(8, 145, 178, 0.2);
        }
      `}</style>

      <div style={cardStyle}>
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <h1 style={{ fontSize: "28px", fontWeight: 800, color: "#111", letterSpacing: "-0.5px" }}>
            Reserve a Space
          </h1>
          <p style={{ fontSize: "14px", color: "#6b7280", marginTop: "4px" }}>
            {session?.user?.name
              ? `Booking as ${session.user.name}`
              : "Sign in to make a reservation"}
          </p>
        </div>

        {errorMsg && (
          <div style={{ background: "#fee2e2", color: "#dc2626", padding: "12px 16px", borderRadius: "10px", marginBottom: "18px", fontSize: "14px", fontWeight: 600 }}>
            {errorMsg}
          </div>
        )}
        {success && (
          <div style={{ background: "#d1fae5", color: "#16a34a", padding: "12px 16px", borderRadius: "10px", marginBottom: "18px", fontSize: "14px", fontWeight: 600, display: "flex", alignItems: "center", gap: "8px" }}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{ width: "20px", height: "20px" }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Reservation successful 🎉
          </div>
        )}

        {/* SELECT SPACE */}
        <div style={inputWrapperStyle}>
          <label style={labelStyle}>Coworking Space</label>
          <div style={{ position: "relative" }}>
            <select
              value={spaceId}
              onChange={(e) => setSpaceId(e.target.value)}
              style={{ ...inputStyle, paddingRight: "40px", appearance: "none" }}
            >
              <option value="">-- Select a space --</option>
              {spaces.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name}
                </option>
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
        <div style={inputWrapperStyle}>
          <label style={labelStyle}>Date</label>
          <DatePicker
            selected={apptDate}
            onChange={(date: Date | null) => setApptDate(date)}
            dateFormat="yyyy-MM-dd"
            placeholderText="Select a date"
            minDate={new Date()}
            customInput={<CustomDatePickerInput />}
          />
        </div>

        {/* START & END TIME */}
        <div style={{ display: "flex", gap: "16px", marginBottom: "20px" }}>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Start Time</label>
            <div style={{ position: "relative" }}>
              <input
                type="time"
                value={apptTime}
                onChange={(e) => setApptTime(e.target.value)}
                style={{ ...inputStyle, paddingLeft: "42px" }}
              />
              <span style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#6b7280" }}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: "20px", height: "20px" }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </span>
            </div>
          </div>

          <div style={{ flex: 1 }}>
            <label style={labelStyle}>End Time</label>
            <div style={{ position: "relative" }}>
              <input
                type="time"
                value={apptEndTime}
                onChange={(e) => setApptEndTime(e.target.value)}
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

        {/* SUBMIT */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{
            width: "100%",
            background: "#0891b2",
            color: "#fff",
            padding: "14px",
            borderRadius: "12px",
            fontWeight: 700,
            marginTop: "10px",
            border: "none",
            cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.7 : 1,
            transition: "all 0.3s ease",
            fontSize: "16px",
            letterSpacing: "0.5px",
            boxShadow: loading ? "none" : "0 4px 6px -1px rgba(8, 145, 178, 0.4)",
          }}
          onMouseOver={(e) => (e.currentTarget.style.background = "#0e7490")}
          onMouseOut={(e) => (e.currentTarget.style.background = "#0891b2")}
        >
          {loading ? "Loading..." : "Confirm Reservation"}
        </button>
      </div>
    </div>
  );
}