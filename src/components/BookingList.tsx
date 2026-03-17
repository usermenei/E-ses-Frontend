"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import getReservations, { Reservation } from "@/libs/getReservations";
import deleteReservation from "@/libs/deleteReservation";
import Link from "next/link";

const statusColors: Record<string, { bg: string; text: string; border: string }> = {
  pending:   { bg: "#fef3c7", text: "#92400e", border: "#fcd34d" },
  success:   { bg: "#f0fdf4", text: "#166534", border: "#86efac" },
  cancelled: { bg: "#fef2f2", text: "#991b1b", border: "#fca5a5" },
};

export default function BookingList() {
  const { data: session } = useSession();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  const handleCancel = async (id: string) => {
    if (!session?.user?.token) return;
    if (!confirm("Cancel this reservation?")) return;
    try {
      await deleteReservation(id, session.user.token as string);
      setReservations((prev) => prev.filter((r) => r._id !== id));
    } catch (err: any) {
      alert(err?.message ?? "Failed to cancel.");
    }
  };

  return (
    <div style={{ maxWidth: "600px", margin: "0 auto", width: "100%" }}>
      <h2 style={{ fontSize: "26px", fontWeight: 800, color: "#111", marginBottom: "4px", fontFamily: "'Playfair Display', serif" }}>
        My Reservations
      </h2>
      <p style={{ fontSize: "13px", color: "#9ca3af", marginBottom: "24px" }}>
        {reservations.length} upcoming {reservations.length === 1 ? "reservation" : "reservations"}
      </p>

      {!session && (
        <div style={{ textAlign: "center", padding: "60px 0", color: "#9ca3af" }}>
          <p style={{ fontSize: "14px", marginBottom: "16px" }}>Sign in to view your reservations.</p>
          <Link href="/api/auth/signin" style={{ textDecoration: "none", fontSize: "13px", fontWeight: 700, color: "#0891b2" }}>
            Sign In →
          </Link>
        </div>
      )}

      {session && loading && (
        <p style={{ color: "#9ca3af", fontSize: "14px" }}>Loading...</p>
      )}

      {session && error && (
        <div style={{ background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca", borderRadius: "10px", padding: "12px 16px", fontSize: "13px" }}>
          {error}
        </div>
      )}

      {session && !loading && reservations.length === 0 && !error && (
        <div style={{ textAlign: "center", padding: "60px 0", color: "#9ca3af" }}>
          <div style={{ fontSize: "48px", marginBottom: "12px" }}>🏢</div>
          <p style={{ fontSize: "14px", marginBottom: "16px" }}>No reservations yet.</p>
          <Link href="/venue" style={{ textDecoration: "none", fontSize: "13px", fontWeight: 700, color: "#0891b2" }}>
            Browse Spaces →
          </Link>
        </div>
      )}

      {reservations.map((r) => {
        const space = r.coworkingSpace;
        const dateObj = new Date(r.apptDate);
        const dateStr = dateObj.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
        const timeStr = dateObj.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
        const sc = statusColors[r.status] ?? statusColors.pending;

        return (
          <div key={r._id} style={{ background: "#fff", borderRadius: "16px", border: "1px solid #e5e7eb", padding: "16px", marginBottom: "12px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
              {/* Space picture or fallback */}
              <div style={{ width: "52px", height: "52px", borderRadius: "12px", background: "#e0f2fe", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px", flexShrink: 0, overflow: "hidden" }}>
                {space?.picture
                  ? <img src={space.picture} alt={space.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  : "🏢"}
              </div>
              <div>
                <p style={{ fontSize: "14px", fontWeight: 800, color: "#111", marginBottom: "2px" }}>
                  {space?.name ?? "Unknown Space"}
                </p>
                <p style={{ fontSize: "12px", color: "#6b7280", marginBottom: "4px" }}>
                  {space?.district}, {space?.province}
                </p>
                <p style={{ fontSize: "12px", fontWeight: 700, color: "#0891b2", marginBottom: "4px" }}>
                  📅 {dateStr} at {timeStr}
                </p>
                {space?.caption && (
                  <p style={{ fontSize: "11px", color: "#9ca3af", fontStyle: "italic" }}>{space.caption}</p>
                )}
                {/* Status badge */}
                <span style={{ fontSize: "11px", fontWeight: 700, background: sc.bg, color: sc.text, border: `1px solid ${sc.border}`, padding: "2px 8px", borderRadius: "20px" }}>
                  {r.status.charAt(0).toUpperCase() + r.status.slice(1)}
                </span>
              </div>
            </div>

            {r.status !== "cancelled" && (
              <button
                onClick={() => handleCancel(r._id)}
                style={{ fontSize: "12px", fontWeight: 700, color: "#dc2626", background: "#fef2f2", border: "1px solid #fecaca", padding: "7px 14px", borderRadius: "8px", cursor: "pointer", flexShrink: 0, fontFamily: "'Nunito', sans-serif" }}
              >
                Cancel
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
