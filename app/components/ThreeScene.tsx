"use client"; // if using Next.js App Router

import { useEffect, useRef } from "react";
import * as THREE from "three";

// values are in [-0.5..0.5, size, density 0..1, confidence 0..1]
const ORES: Array<[number, number, number, number, number, number]> = [
  [ 0.3,   0.43,  0.10, 0.10, 0.3, 0.8 ],
  [ -0.20,-0.20,  0.09, 0.13, 0.7, 0.1 ],
  [ -0.33, 0.38,  0.23, 0.05, 0.4, 0.5 ],
  [ 0.2,   0.21,  0.40, 0.12, 0.9, 0.4 ],
  [ 0.11, -0.27, -0.20, 0.09, 0.2, 0.8 ],
];

// Move left by 0.01 per unit time (t in 0..100)
const MOVE_PER_T = 0.005;



export default function ThreeScene({
  time,
  xRayEnabled,
  density,
  confidence,
  setShowChart,
  extraTime,
}: {
  time: number;
  xRayEnabled: boolean;
  density: number;
  confidence: number;
  setShowChart: React.Dispatch<React.SetStateAction<boolean>>;
  extraTime: number;
}) {
      const mountRef = useRef<HTMLDivElement>(null);
  const slicesRef = useRef<THREE.Mesh[]>([]);
  const hiCubesRef = useRef<THREE.Mesh[]>([]);
const deltaCubesRef = useRef<THREE.Mesh[]>([]);
const depthPrepassRef = useRef<THREE.Mesh[]>([]);


  useEffect(() => {
    if (!mountRef.current) return;

    while (mountRef.current.firstChild) {
      mountRef.current.removeChild(mountRef.current.firstChild);
    }

    hiCubesRef.current = []; // reset on (re)build
    deltaCubesRef.current = [];
depthPrepassRef.current = [];


    // Scene
    const scene = new THREE.Scene();

    // Camera
    const camera = new THREE.PerspectiveCamera(
      75, 
      mountRef.current.clientWidth / mountRef.current.clientHeight, 
  0.1,
  1000
);
    camera.position.z = 3;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    mountRef.current.appendChild(renderer.domElement);

    const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();


    // --- helper: simple coherent noise field (no flicker slice-to-slice)
function hash(n: number) {
  return (Math.sin(n) * 43758.5453123) % 1;
}
function noise3(x: number, y: number, z: number) {
  const xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z);
  const xf = x - xi, yf = y - yi, zf = z - zi;
  const sx = xf * xf * (3 - 2 * xf);
  const sy = yf * yf * (3 - 2 * yf);
  const sz = zf * zf * (3 - 2 * zf);
  const h = (X: number, Y: number, Z: number) => hash(X * 157 + Y * 113 + Z * 71);
  const c000 = h(xi, yi, zi);
  const c100 = h(xi+1, yi, zi);
  const c010 = h(xi, yi+1, zi);
  const c110 = h(xi+1, yi+1, zi);
  const c001 = h(xi, yi, zi+1);
  const c101 = h(xi+1, yi, zi+1);
  const c011 = h(xi, yi+1, zi+1);
  const c111 = h(xi+1, yi+1, zi+1);
  const ix00 = c000 * (1 - sx) + c100 * sx;
  const ix10 = c010 * (1 - sx) + c110 * sx;
  const ix01 = c001 * (1 - sx) + c101 * sx;
  const ix11 = c011 * (1 - sx) + c111 * sx;
  const iy0 = ix00 * (1 - sy) + ix10 * sy;
  const iy1 = ix01 * (1 - sy) + ix11 * sy;
  return iy0 * (1 - sz) + iy1 * sz;
}
for (let i = 0; i < 20; i++) {
  const sliceThickness = 1 / 20;
  // instead of 1x1xsliceThickness
const geo = new THREE.BoxGeometry(1, 1, sliceThickness, 10, 10, 1);

  geo.translate(0, 0, -0.5 + i * sliceThickness);

  const colors: number[] = [];
  const pos = geo.attributes.position as THREE.BufferAttribute;

  if (i === 0) {
    // --- FRONT SLICE: noisy rock face ---
for (let j = 0; j < pos.count; j++) {
  const x = pos.getX(j);
  const y = pos.getY(j);
  const z = pos.getZ(j);

let n1 = noise3(x * 2000, y * 2000, z * 2000);
let n2 = noise3(x * 8000, y * 8000, z * 8000);

let n = 0.6 * n1 + 0.4 * n2; // fine + medium detail
n = Math.pow(n, 1.3);

const r = 0.2 + 0.6 * n;
const g = 0.15 + 0.5 * n;
const b = 0.1 + 0.4 * n;



  colors.push(r, g, b);
}

  } else {
    // --- INNER SLICES: flat brown/grey shading by depth ---
    // darken slightly as depth increases
    const depthFactor = 0.8 - i * 0.02; // goes from ~0.8 → 0.4
    const r = 0.25 * depthFactor;
    const g = 0.22 * depthFactor;
    const b = 0.2  * depthFactor;

    for (let j = 0; j < pos.count; j++) {
      colors.push(r, g, b);
    }
  }

  geo.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));

  const mat = new THREE.MeshBasicMaterial({
    vertexColors: true,
    transparent: true,
    opacity: 0.6,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  const mesh = new THREE.Mesh(geo, mat);
  slicesRef.current.push(mesh);
  scene.add(mesh);
}




hiCubesRef.current = []; // reset any previous refs (defensive)

for (let j = 0; j < ORES.length; j++) {
  const [x, y, z, size, dens, conf] = ORES[j];

  const hiGeo = new THREE.BoxGeometry(size, size, size);
  const hiMat = new THREE.MeshBasicMaterial({
    color: 0xffff00,
    transparent: xRayEnabled, // initial look
    depthTest: false,
    depthWrite: false,
  });

  const hiMesh = new THREE.Mesh(hiGeo, hiMat);
  hiMesh.position.set(x, y, z);
  
  hiMesh.renderOrder = 9999;
  
  // stash metadata for fast threshold checks later
  hiMesh.userData.baseX = x; 
  hiMesh.userData.baseY = y; 
  hiMesh.userData.baseZ = z; 
  hiMesh.userData.density = dens;     // 0..1
  hiMesh.userData.confidence = conf;  // 0..1

  // initial visibility using current props (0..100 → 0..1)
  const dThresh = density / 100;
  const cThresh = confidence / 100;
  hiMesh.visible = dens >= dThresh && conf >= cThresh;

  scene.add(hiMesh);
  hiCubesRef.current.push(hiMesh);

  const deltaMat = new THREE.MeshBasicMaterial({
  color: 0xff0000,
  transparent: true,
  opacity: 0.65,           // softened; we’ll tweak with xRay below
  depthTest: true,
  depthWrite: false,
});
const deltaMesh = new THREE.Mesh(hiGeo, deltaMat);
deltaMesh.position.set(x, y, z);
deltaMesh.visible = false;           // toggled in effect
deltaMesh.renderOrder = 200;         // after depth prepass
scene.add(deltaMesh);
deltaCubesRef.current.push(deltaMesh);

// keep the main visible pass last
hiMesh.renderOrder = 300;

}





    // Track which keys are pressed
const keys: Record<string, boolean> = {};

    mountRef.current.tabIndex = 0;

    // Key handlers scoped to the canvas container
    const handleKeyDown = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (k === "w" || k === "a" || k === "s" || k === "d" || k === " " || k === "shift") {
        e.preventDefault(); // stop page scroll / button activation
        keys[k] = true;
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (k === "w" || k === "a" || k === "s" || k === "d" || k === " " || k === "shift") {
        e.preventDefault();
        keys[k] = false;
      }
    };

window.addEventListener("keydown", handleKeyDown);
window.addEventListener("keyup", handleKeyUp);

    // Size to container (single source of truth)
    const setSizeToContainer = () => {
      if (!mountRef.current) return;
      const { width, height } = mountRef.current.getBoundingClientRect();
      const w = Math.max(1, Math.floor(width));
      const h = Math.max(1, Math.floor(height));
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      console.log('setting size')
      renderer.setSize(w, h, true);
    };
    const ro = new ResizeObserver(setSizeToContainer);
    ro.observe(mountRef.current);
    setSizeToContainer(); // initial

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
    //   cube.rotation.x += 0.01;
    //   cube.rotation.y += 0.01;

      const speed = 0.05;

// Forward/back
if (keys["w"]) camera.translateZ(-speed);
if (keys["s"]) camera.translateZ(speed);

// Left/right
if (keys["a"]) camera.translateX(-speed);
if (keys["d"]) camera.translateX(speed);

if (keys["shift"]) camera.translateY(-speed);
if (keys[" "]) camera.translateY(speed);

      renderer.render(scene, camera);


    };
    animate();

    // Handle resize
    const handleResize = () => {
      if (!mountRef.current) return;
    //   camera.aspewct = mountRef.current.clientWidth / mountRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    };
    window.addEventListener("resize", handleResize);


// after you create the renderer:
const canvas = renderer.domElement;

// helper: convert a pointer event on the canvas → NDC
function getMouseNDC(e: MouseEvent | PointerEvent) {
  const rect = canvas.getBoundingClientRect();
  const x = ( (e.clientX - rect.left) / rect.width ) * 2 - 1;
  const y = -( (e.clientY - rect.top)  / rect.height) * 2 + 1;
  return { x, y };
}

// listen on the canvas, not window
canvas.addEventListener("click", (e) => {
  const { x, y } = getMouseNDC(e);
  mouse.set(x, y);

  // ensure matrices are current if you moved the camera this frame
  camera.updateMatrixWorld();
  raycaster.setFromCamera(mouse, camera);

  const hits = raycaster.intersectObjects(hiCubesRef.current, true);
  if (hits.length) {
    const hit = hits[0].object as THREE.Mesh;
    (hit.material as THREE.MeshBasicMaterial).color.set(0xff0000);
    setShowChart(true); 
  }
});

    



    return () => {
      window.removeEventListener("resize", handleResize);
      mountRef.current?.removeChild(renderer.domElement);
      window.removeEventListener("keydown", handleKeyDown);
window.removeEventListener("keyup", handleKeyUp);
hiCubesRef.current = [];
    };
  }, []);

  useEffect(() => {
  // const tNorm = time / 100;
  // for (const mesh of slicesRef.current) {
  //   const pos = mesh.geometry.attributes.position as THREE.BufferAttribute;
  //   const colors: number[] = [];
  //   for (let j = 0; j < pos.count; j++) {
  //     const x = pos.getX(j);
  //     const y = pos.getY(j);
  //     const z = pos.getZ(j);
  //     const rx = (x + 0.5);
  //     const gx = (y + 0.5);
  //     const bx = (z + 0.5);
  //     const r = rx * (1 - tNorm) + (1 - rx) * tNorm;
  //     const g = gx * (1 - tNorm) + (1 - gx) * tNorm;
  //     const b = bx * (1 - tNorm) + (1 - bx) * tNorm;
  //     colors.push(r, g, b);
  //   }
  //   mesh.geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
  // }

  const dx1 = time * MOVE_PER_T;        // current
  const dx2 = extraTime * MOVE_PER_T;   // comparison

  for (let i = 0; i < hiCubesRef.current.length; i++) {
    const main  = hiCubesRef.current[i];
    const delta = deltaCubesRef.current[i];
    // const depth = depthPrepassRef.current[i];

    const baseX = typeof main.userData.baseX === "number" ? main.userData.baseX : main.position.x;

    // positions
    main.position.x  = baseX - dx1;   // yellow @ time
    // depth.position.x = main.position.x; // depth prepass tracks yellow
    if (delta) delta.position.x = baseX - dx2; // red @ extraTime

    // show delta only if it's a *different* time and main is visible
    if (delta && extraTime !== 0 && xRayEnabled) {
      delta.visible = extraTime !== time && main.visible;
      (delta.material as THREE.MeshBasicMaterial).opacity = xRayEnabled ? 0.5 : 0.65;
    }
  }

}, [time, extraTime, xRayEnabled]);

// useEffect(() => {
//   for (const mesh of hiCubesRef.current) {
//     const mat = mesh.material as THREE.MeshBasicMaterial;

//     mat.transparent = xRayEnabled;

//     mat.needsUpdate = true;
//   }
// }, [xRayEnabled]);

// REPLACE your thresholds effect with this
useEffect(() => {
  const dThresh = density / 100;
  const cThresh = confidence / 100;

  for (let i = 0; i < hiCubesRef.current.length; i++) {
    const main = hiCubesRef.current[i];
    const dens = main.userData.density as number;     // 0..1
    const conf = main.userData.confidence as number;  // 0..1

    // visibility by thresholds
    const passes = dens >= dThresh && conf >= cThresh;
    main.visible = passes;

    // keep delta (red) visibility tied to main + time compare + xray
    const delta = deltaCubesRef.current[i];
    if (delta) {
      delta.visible = passes && xRayEnabled && (extraTime !== time);
      (delta.material as THREE.MeshBasicMaterial).opacity = xRayEnabled ? 0.5 : 0.65;
    }

    // match the X-Ray / Underground look
    const mat = main.material as THREE.MeshBasicMaterial;
    mat.transparent = xRayEnabled;
    mat.needsUpdate = true;
  }
}, [density, confidence, xRayEnabled, time, extraTime]);




  return <div ref={mountRef} style={{ width: "100%", height: "100%" }} />;
}


