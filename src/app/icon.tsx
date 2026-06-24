import { ImageResponse } from "next/og";

export const size = {
  width: 64,
  height: 64,
};

export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#eff6ff",
          borderRadius: 16,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            gap: 4,
          }}
        >
          <div
            style={{
              width: 8,
              height: 12,
              borderRadius: 3,
              background: "#93c5fd",
            }}
          />
          <div
            style={{
              width: 8,
              height: 22,
              borderRadius: 3,
              background: "#60a5fa",
            }}
          />
          <div
            style={{
              width: 8,
              height: 32,
              borderRadius: 3,
              background: "#3b82f6",
            }}
          />
          <div
            style={{
              width: 8,
              height: 42,
              borderRadius: 3,
              background: "#2563eb",
            }}
          />
        </div>
      </div>
    ),
    size
  );
}
