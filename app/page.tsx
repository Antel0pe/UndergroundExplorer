"use client";

import { useState } from "react";
import Sidebar from "./components/Sidebar";
import SceneCard from "./components/SceneCard";

export default function Home() {
  const [sceneIds, setSceneIds] = useState<number[]>([0]); // start with one
  // add below: const [sceneIds, setSceneIds] = useState<number[]>([0]);
const [xRayEnabled, setXRayEnabled] = useState(true);
const toggleXRay = () => setXRayEnabled(v => !v);


  const addScene = () => {
    setSceneIds((prev) => [...prev, (prev[prev.length - 1] ?? 0) + 1]);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      {/* Scenes area (85% total: canvas + local slider inside each card) */}
      <div
        style={{
          flex: "0 0 85%",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))",
          gap: "12px",
          padding: "12px",
          boxSizing: "border-box",
        }}
      >
{/* pass xRayEnabled to each SceneCard */}
{sceneIds.map((id) => (
  <SceneCard key={id} xRayEnabled={xRayEnabled} />
))}

      </div>

      {/* Sidebar (15%) */}
      <div style={{ flex: "0 0 15%", background: "#f0f0f0" }}>
        {/* pass toggle + current state to Sidebar */}
<Sidebar onAddScene={addScene} xRayEnabled={xRayEnabled} onToggleXRay={toggleXRay} />

      </div>
    </div>
  );
}
