const BASE = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000/api/v1";

export interface CreateReservationBody {
  apptDate: string; // ISO date-time string e.g. "2026-03-01T10:00:00.000Z"
  apptEndDate: string; // ✅ เพิ่มเวลาสิ้นสุด
}

export interface CreateReservationResponse {
  success: boolean;
  data: {
    _id: string;
    apptDate: string;
    apptEndDate: string; // ✅ เพิ่มเวลาสิ้นสุด
    user: string;
    coworkingSpace: string;
    status: "pending" | "success" | "cancelled";
    createdAt: string;
  };
}

export default async function createReservation(
  coworkingSpaceId: string,
  body: CreateReservationBody,
  token: string
): Promise<CreateReservationResponse> {
  const response = await fetch(
    `${BASE}/coworkingspaces/${coworkingSpaceId}/reservations`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    }
  );

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err?.message ?? "Failed to create reservation");
  }

  return await response.json();
}