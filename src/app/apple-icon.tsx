import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#faf9f7",
        }}
      >
        <div
          style={{
            width: 150,
            height: 150,
            borderRadius: "50%",
            background: "#e3efe9",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span
            style={{
              fontFamily: "Georgia, 'Times New Roman', serif",
              fontStyle: "italic",
              fontWeight: 700,
              fontSize: 84,
              color: "#2f6f5e",
              transform: "translateY(-4px)",
            }}
          >
            R
          </span>
        </div>
      </div>
    ),
    { ...size }
  );
}
