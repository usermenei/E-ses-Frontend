const BASE = "http://localhost:5000/api/v1";

export interface CoworkingSpaceDetail {
  _id: string;
  id: string;
  name: string;
  address: string;
  district: string;
  province: string;
  postalcode: string;
  tel: string;
  region: string;
  openTime: string;
  closeTime: string;
  // Will be populated once added to DB
  picture?: string;
  caption?: string;
}

export interface CoworkingSpaceDetailJson {
  success: boolean;
  data: CoworkingSpaceDetail;
}

export default async function getCoworkingSpace(id: string): Promise<CoworkingSpaceDetailJson> {
  const response = await fetch(`${BASE}/coworkingspace/${id}`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch coworking space");
  }

  return await response.json();
}
