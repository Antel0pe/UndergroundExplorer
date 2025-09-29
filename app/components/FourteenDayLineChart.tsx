// FourteenDayLineChart.tsx
"use client";

import React, { useMemo } from "react";

// tiny seeded RNG (mulberry32)
function mulberry32(seed: number) {
  return () => {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// hard-coded base date in UTC so SSR/CSR match
const BASE_UTC = Date.UTC(2025, 8, 29); // 2025-09-29
const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

export default function FourteenDayLineChart({
  onClose,
}: {
  onClose?: () => void;
}) {
  // deterministic data + labels
  const data = useMemo(() => {
    const rand = mulberry32(42);
    const out: { label: string; value: number }[] = [];
    for (let i = 13; i >= 0; i--) {
      const ms = BASE_UTC - i * 24 * 60 * 60 * 1000;
      const d = new Date(ms);
      const label = `${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}`;
      const value = Math.round(20 + rand() * 80);
      out.push({ label, value });
    }
    return out;
  }, []);

  const width = 720;
  const height = 300;
  const margin = { top: 36, right: 20, bottom: 40, left: 44 };
  const innerW = width - margin.left - margin.right;
  const innerH = height - margin.top - margin.bottom;

  const xs = (i: number) => (i / (data.length - 1)) * innerW;
  const minY = 0;
  const maxY = Math.max(100, ...data.map((d) => d.value));
  const ys = (v: number) => innerH - ((v - minY) / (maxY - minY)) * innerH;

  const path = data.map((d, i) => `${i ? "L" : "M"}${xs(i)},${ys(d.value)}`).join(" ");
  const yTicks = Array.from({ length: 6 }, (_, i) => minY + ((maxY - minY) * i) / 5);
  const showEvery = 2;

  return (
    <div className="relative w-full max-w-3xl">
      {/* Close button (only if onClose provided) */}
      {onClose && (
        <button
          onClick={onClose}
          aria-label="Close chart"
          className="absolute left-2 top-2 z-10 inline-flex h-8 w-8 items-center justify-center rounded-full border bg-white/80 backdrop-blur text-gray-700 hover:bg-white shadow-sm"
        >
          ×
        </button>
      )}

      <div className="rounded-2xl border bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="text-lg font-semibold text-gray-500 ml-10">  Density Prediction</h2>
          <span className="text-xs text-gray-500">Last 14 days</span>
        </div>

        <svg viewBox={`0 0 ${width} ${height}`} className="w-full">
          <g transform={`translate(${margin.left},${margin.top})`}>
            {yTicks.map((t, i) => (
              <g key={i}>
                <line x1={0} x2={innerW} y1={ys(t)} y2={ys(t)} className="stroke-gray-200" />
                <text
                  x={-10}
                  y={ys(t)}
                  textAnchor="end"
                  dominantBaseline="middle"
                  className="fill-gray-500 text-[10px]"
                >
                  {Math.round(t)}
                </text>
              </g>
            ))}

            {data.map((d, i) => (
              <g key={i} transform={`translate(${xs(i)},0)`}>
                <line y1={innerH} y2={innerH + 4} className="stroke-gray-300" />
                {i % showEvery === 0 && (
                  <text y={innerH + 16} textAnchor="middle" className="fill-gray-600 text-[10px]">
                    {d.label}
                  </text>
                )}
              </g>
            ))}

            <path d={path} fill="none" strokeWidth={2.5} className="stroke-gray-800" />
            <path d={`${path} L ${xs(data.length - 1)},${innerH} L 0,${innerH} Z`} className="fill-gray-900/5" />
            {data.map((d, i) => (
              <circle key={i} cx={xs(i)} cy={ys(d.value)} r={3} className="fill-gray-800" />
            ))}
            <line x1={0} x2={innerW} y1={innerH} y2={innerH} className="stroke-gray-300" />
            <line x1={0} x2={0} y1={0} y2={innerH} className="stroke-gray-300" />
          </g>
        </svg>
      </div>
    </div>
  );
}
