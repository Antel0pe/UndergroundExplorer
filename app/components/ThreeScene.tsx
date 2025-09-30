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


export default function ThreeScene({
  time,
  xRayEnabled,
  density,
  confidence,
  setShowChart,               // ← add
}: {
  time: number;
  xRayEnabled: boolean;
  density: number;
  confidence: number;
  setShowChart: React.Dispatch<React.SetStateAction<boolean>>;
}) {
      const mountRef = useRef<HTMLDivElement>(null);
  const slicesRef = useRef<THREE.Mesh[]>([]);
  const hiCubesRef = useRef<THREE.Mesh[]>([]);


  useEffect(() => {
    if (!mountRef.current) return;

    while (mountRef.current.firstChild) {
      mountRef.current.removeChild(mountRef.current.firstChild);
    }

    hiCubesRef.current = []; // reset on (re)build

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


    // Cube
for (let i = 0; i < 20; i++) {
  const sliceThickness = 1 / 20;
  const geo = new THREE.BoxGeometry(1, 1, sliceThickness);

  // Move slice along Z
  geo.translate(0, 0, -0.5 + i * sliceThickness);

  // Color like before
  const colors: number[] = [];
  const pos = geo.attributes.position;
// normalize time 0..100 → 0..1
const tNorm = time / 100;

// Color like before, but flip gradually
for (let j = 0; j < pos.count; j++) {
  const x = pos.getX(j);
  const y = pos.getY(j);
  const z = pos.getZ(j);

  // normal 0..1
  const rx = (x + 0.5);
  const gx = (y + 0.5);
  const bx = (z + 0.5);

  // flipped versions
  const rxFlip = 1 - rx;
  const gxFlip = 1 - gx;
  const bxFlip = 1 - bx;

  // interpolate between normal and flipped
  const r = rx * (1 - tNorm) + rxFlip * tNorm;
  const g = gx * (1 - tNorm) + gxFlip * tNorm;
  const b = bx * (1 - tNorm) + bxFlip * tNorm;

  colors.push(r, g, b);
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
  hiMesh.userData.density = dens;     // 0..1
  hiMesh.userData.confidence = conf;  // 0..1

  // initial visibility using current props (0..100 → 0..1)
  const dThresh = density / 100;
  const cThresh = confidence / 100;
  hiMesh.visible = dens >= dThresh && conf >= cThresh;

  scene.add(hiMesh);
  hiCubesRef.current.push(hiMesh);
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
  const tNorm = time / 100;
  for (const mesh of slicesRef.current) {
    const pos = mesh.geometry.attributes.position as THREE.BufferAttribute;
    const colors: number[] = [];
    for (let j = 0; j < pos.count; j++) {
      const x = pos.getX(j);
      const y = pos.getY(j);
      const z = pos.getZ(j);
      const rx = (x + 0.5);
      const gx = (y + 0.5);
      const bx = (z + 0.5);
      const r = rx * (1 - tNorm) + (1 - rx) * tNorm;
      const g = gx * (1 - tNorm) + (1 - gx) * tNorm;
      const b = bx * (1 - tNorm) + (1 - bx) * tNorm;
      colors.push(r, g, b);
    }
    mesh.geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
  }
}, [time]);

// useEffect(() => {
//   for (const mesh of hiCubesRef.current) {
//     const mat = mesh.material as THREE.MeshBasicMaterial;

//     mat.transparent = xRayEnabled;

//     mat.needsUpdate = true;
//   }
// }, [xRayEnabled]);

useEffect(() => {
  const dThresh = density / 100;
  const cThresh = confidence / 100;

  for (const mesh of hiCubesRef.current) {
    // visibility by thresholds
    const dens = mesh.userData.density as number;     // 0..1
    const conf = mesh.userData.confidence as number;  // 0..1
    mesh.visible = dens >= dThresh && conf >= cThresh;

    // match the X-Ray / Underground look
    const mat = mesh.material as THREE.MeshBasicMaterial;
    mat.transparent = xRayEnabled;
    mat.needsUpdate = true;
  }
}, [density, confidence, xRayEnabled]);



  return <div ref={mountRef} style={{ width: "100%", height: "100%" }} />;
}


