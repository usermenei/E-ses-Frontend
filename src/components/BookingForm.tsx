"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import createReservation from "@/libs/createReservation";
import getCoworkingSpaces, {
  CoworkingSpaceItem,
} from "@/libs/getCoworkingSpaces";

export default function BookingForm() {
  const { data: session } = useSession();

  const [spaces, setSpaces] = useState<CoworkingSpaceItem[]>([]);
  const [spaceId, setSpaceId] = useState("");
  const [apptDate, setApptDate] = useState("");
  const [apptTime, setApptTime] = useState("09:00");
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ FETCH COWORKING SPACES
  useEffect(() => {
    const fetchSpaces = async () => {
      try {
        const token = (session?.user as any)?.token; // ✅ FIX

        if (!token) return;

        const json = await getCoworkingSpaces(token);
        setSpaces(json.data); // ✅ IMPORTANT
      } catch (err) {
        console.error(err);
        setErrorMsg("Failed to load spaces.");
      }
    };

    fetchSpaces();
  }, [session]);

  // ✅ SUBMIT BOOKING
  const handleSubmit = async () => {
    const token = (session?.user as any)?.token; // ✅ FIX

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

    const isoDate = new Date(`${apptDate}T${apptTime}:00`).toISOString();

    setLoading(true);
    setErrorMsg("");

    try {
      await createReservation(
        spaceId,
        { apptDate: isoDate },
        token // ✅ FIX
      );

      setSuccess(true);
      setSpaceId("");
      setApptDate("");
      setApptTime("09:00");

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
    color: "#9ca3af",
    marginBottom: "6px",
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "10px 14px",
    fontSize: "14px",
    border: "1.5px solid #e5e7eb",
    borderRadius: "10px",
    outline: "none",
    fontFamily: "'Nunito', sans-serif",
    color: "#111",
    background: "#fff",
  };

  return (
    <div style={{ maxWidth: "460px", margin: "0 auto" }}>
      <div style={{ textAlign: "center", marginBottom: "24px" }}>
        <h1 style={{ fontSize: "28px", fontWeight: 800 }}>
          Reserve a Space
        </h1>
        <p style={{ fontSize: "13px", color: "#9ca3af" }}>
          {session?.user?.name
            ? `Booking as ${session.user.name}`
            : "Sign in to make a reservation"}
        </p>
      </div>

      <div style={{ background: "#fff", padding: "28px", borderRadius: "20px" }}>
        {errorMsg && <p style={{ color: "red" }}>{errorMsg}</p>}
        {success && (
          <p style={{ color: "green" }}>
            Reservation successful 🎉
          </p>
        )}

        {/* SELECT SPACE */}
        <div style={{ marginBottom: "18px" }}>
          <label style={labelStyle}>Coworking Space</label>
          <select
            value={spaceId}
            onChange={(e) => setSpaceId(e.target.value)}
            style={inputStyle}
          >
            <option value="">-- Select a space --</option>
            {spaces.map((s) => (
              <option key={s._id} value={s._id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        {/* DATE */}
        <div style={{ marginBottom: "18px" }}>
          <label style={labelStyle}>Date</label>
          <input
            type="date"
            value={apptDate}
            onChange={(e) => setApptDate(e.target.value)}
            style={inputStyle}
          />
        </div>

        {/* TIME */}
        <div style={{ marginBottom: "18px" }}>
          <label style={labelStyle}>Time</label>
          <input
            type="time"
            value={apptTime}
            onChange={(e) => setApptTime(e.target.value)}
            style={inputStyle}
          />
        </div>

        {/* SUBMIT */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{
            width: "100%",
            background: "#0891b2",
            color: "#fff",
            padding: "12px",
            borderRadius: "10px",
            fontWeight: 700,
            marginTop: "10px",
          }}
        >
          {loading ? "Loading..." : "Confirm Reservation"}
        </button>
      </div>
    </div>
  );
}