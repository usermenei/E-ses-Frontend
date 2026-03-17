const BASE = "http://localhost:5000/api/v1";

export interface UpdateReservationBody {
  apptDate?: string; // ISO date-time string
}

export default async function updateReservation(
  reservationId: string,
  body: UpdateReservationBody,
  token: string
): Promise<void> {
  const response = await fetch(`${BASE}/reservations/${reservationId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err?.message ?? "Failed to update reservation");
  }
}
