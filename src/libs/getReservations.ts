const BASE = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000/api/v1";

export interface Reservation {
  _id: string;
  apptDate: string;           // ISO date-time string e.g. "2026-03-01T10:00:00.000Z"
  user: string;               // user ID
  coworkingSpace: {
    _id: string;
    name: string;
    address: string;
    district: string;
    province: string;
    openTime: string;
    closeTime: string;
    picture?: string;
    caption?: string;
  };
  status: "pending" | "success" | "cancelled";
  createdAt: string;
}

export interface ReservationJson {
  success: boolean;
  count: number;
  data: Reservation[];
}

export default async function getReservations(token: string): Promise<ReservationJson> {
  const response = await fetch(`${BASE}/reservations`, {
    method: "GET",
    headers: {
      authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch reservations");
  }

  return await response.json();
}
