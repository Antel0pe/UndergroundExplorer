"use client";

type Props = { onAddScene: () => void };

export default function Sidebar({ onAddScene }: Props) {
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
