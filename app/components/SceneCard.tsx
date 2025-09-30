"use client";

import { useState } from "react";
import ThreeScene from "./ThreeScene";
import TimeSlider from "./TimeSlider";
import FourteenDayLineChart from "./FourteenDayLineChart";

export default function SceneCard({
  xRayEnabled,
  density,
  confidence,
}: { xRayEnabled: boolean; density: number; confidence: number }) {
  const [time, setTime] = useState(0);
  const [showChart, setShowChart] = useState(false);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        borderRadius: 8,
        overflow: "hidden",
        border: "1px solid #e4e4e7",
        background: "#fff",
        minHeight: 0,
      }}
    >
      {/* Canvas region fills available vertical space */}
      <div style={{ flex: 1, minHeight: 240, position: "relative" }}>
        <ThreeScene
          time={time}
          xRayEnabled={xRayEnabled}
          density={density}
          confidence={confidence}
          setShowChart={setShowChart}   
        />

        {/* Chart overlay (top-right) — only shows if true */}
        {showChart && (
          <div
            style={{
              position: "absolute",
              top: 10,
              right: 10,
              width: 420,
              pointerEvents: "auto",
              zIndex: 10,
            }}
          >
            <FourteenDayLineChart onClose={() => setShowChart(false)} />
          </div>
        )}
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
