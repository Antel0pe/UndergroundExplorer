"use client";

import { useState } from "react";
import ThreeScene from "./ThreeScene";
import TimeSlider from "./TimeSlider";

export default function SceneCard({
  xRayEnabled,
  density,
  confidence,
}: { xRayEnabled: boolean; density: number; confidence: number }) {
  const [time, setTime] = useState(0);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        borderRadius: 8,
        overflow: "hidden",
        border: "1px solid #e4e4e7",
        background: "#fff",
        minHeight: 0, // helps grid children not overflow
      }}
    >
      {/* Canvas region fills available vertical space */}
      <div style={{ flex: 1, minHeight: 240, position: "relative" }}>
        <ThreeScene time={time} xRayEnabled={xRayEnabled} density={density} confidence={confidence} />
      </div>

      {/* Local slider */}
      <div
        style={{
          padding: "10px 12px",
          borderTop: "1px solid #ececee",
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}
      >
        <TimeSlider value={time} onChange={setTime} />
        <div style={{ width: 64, textAlign: "right" }}>t = {time}</div>
      </div>
    </div>
  );
}
