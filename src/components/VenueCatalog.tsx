import Link from "next/link";
import Image from "next/image";
import { CoworkingSpaceJson } from "@/libs/getCoworkingSpaces";

const gradients = [
  "linear-gradient(160deg, #0c4a6e 0%, #0891b2 100%)",
  "linear-gradient(160deg, #134e4a 0%, #0f9b8e 100%)",
  "linear-gradient(160deg, #1e1b4b 0%, #4f46e5 100%)",
  "linear-gradient(160deg, #7c2d12 0%, #ea580c 100%)",
  "linear-gradient(160deg, #1e3a5f 0%, #2563eb 100%)",
  "linear-gradient(160deg, #14532d 0%, #16a34a 100%)",
];

export default function VenueCatalog({
  spacesJson,
}: {
  spacesJson: CoworkingSpaceJson | null;
}) {
  // ✅ กัน crash
  if (!spacesJson || !spacesJson.data) {
    return (
      <p style={{ color: "#9ca3af", fontSize: "14px" }}>
        Failed to load coworking spaces
      </p>
    );
  }

  return (
    <>
      <p
        style={{
          fontSize: "11px",
          fontWeight: 700,
          letterSpacing: "3px",
          textTransform: "uppercase",
          color: "#0891b2",
          marginBottom: "18px",
        }}
      >
        {spacesJson.count ?? 0} spaces available
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "16px",
        }}
      >
        {spacesJson.data.map((v, i) => (
          <div
            key={v._id}
            style={{
              background: "#fff",
              borderRadius: "16px",
              border: "1px solid #e5e7eb",
              overflow: "hidden",
            }}
          >
            <Link
              href={`/venue/${v._id}`}
              style={{ textDecoration: "none", display: "block" }}
            >
              {/* IMAGE */}
              {v.picture ? (
                <div
                  style={{
                    position: "relative",
                    height: "140px",
                    overflow: "hidden",
                  }}
                >
                  <Image
                    src={v.picture}
                    alt={v.caption ?? v.name}
                    fill
                    style={{ objectFit: "cover" }}
                    // unoptimized // 👈 เติมคำนี้ลงไปตรงนี้เลยครับ!
                  />
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      background:
                        "linear-gradient(transparent 40%, rgba(0,0,0,0.55))",
                      display: "flex",
                      alignItems: "flex-end",
                      padding: "12px 14px",
                    }}
                  >
                    <div>
                      <p
                        style={{
                          fontSize: "10px",
                          letterSpacing: "2px",
                          textTransform: "uppercase",
                          color: "rgba(255,255,255,0.7)",
                        }}
                      >
                        {v.region}
                      </p>
                      <p
                        style={{
                          fontSize: "15px",
                          fontWeight: 800,
                          color: "#fff",
                        }}
                      >
                        {v.name}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div
                  style={{
                    height: "140px",
                    background: gradients[i % gradients.length],
                    display: "flex",
                    alignItems: "flex-end",
                    padding: "14px",
                  }}
                >
                  <div>
                    <p style={{ fontSize: "10px", color: "#fff" }}>
                      {v.region}
                    </p>
                    <p style={{ fontSize: "15px", fontWeight: 800, color: "#fff" }}>
                      {v.name}
                    </p>
                  </div>
                </div>
              )}
            </Link>

            {/* DETAILS */}
            <div style={{ padding: "14px 16px" }}>
              <p style={{ fontSize: "12px", color: "#9ca3af" }}>
                {v.district}, {v.province}
              </p>

              {v.caption && (
                <p
                  style={{
                    fontSize: "12px",
                    color: "#6b7280",
                    fontStyle: "italic",
                  }}
                >
                  {v.caption}
                </p>
              )}

              <p
                style={{
                  fontSize: "12px",
                  fontWeight: 700,
                  color: "#0891b2",
                  marginTop: "6px",
                }}
              >
                🕐 {v.openTime} – {v.closeTime}
              </p>

              <Link
              href={`/booking?spaceId=${v._id}`}  // ✅ pass space ID
              style={{
              display: "block",
              textAlign: "center",
              background: "#0891b2",
              color: "#fff",
              fontSize: "12px",
              fontWeight: 800,
              padding: "10px",
              borderRadius: "10px",
              marginTop: "10px",
                  }}>
                Reserve This Space
              </Link>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}