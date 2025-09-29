"use client";

type Props = { onAddScene: () => void; xRayEnabled: boolean; onToggleXRay: () => void };
export default function Sidebar({ onAddScene, xRayEnabled, onToggleXRay }: Props) {

  return (
    <div
      style={{
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 1rem",
      }}
    >
      <div style={{ fontWeight: 600 }}>Sidebar</div>
      <button
  onClick={onToggleXRay}
  style={{
    padding: "8px 12px",
    borderRadius: 6,
    border: "1px solid #d4d4d8",
    background: xRayEnabled ? "#111827" : "#fff",
    color: xRayEnabled ? "#fff" : "#111827",
    cursor: "pointer",
    marginRight: 8,
  }}
>
  {xRayEnabled ? "X-Ray Mode" : "Underground Mode"}
</button>

<button
  onClick={onAddScene}
  style={{
    padding: "8px 12px",
    borderRadius: 6,
    border: "1px solid #d4d4d8",
    background: "#fff",
    cursor: "pointer",
  }}
>
  Add Scene
</button>

    </div>
  );
}
