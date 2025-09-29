"use client"; // if using Next.js App Router

import { useEffect, useRef } from "react";
import * as THREE from "three";

export default function ThreeScene({ time }: { time: number }) {

  const mountRef = useRef<HTMLDivElement>(null);
  const slicesRef = useRef<THREE.Mesh[]>([]);

  useEffect(() => {
    if (!mountRef.current) return;

    while (mountRef.current.firstChild) {
      mountRef.current.removeChild(mountRef.current.firstChild);
    }

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
for (let j = 0; j < 5; j++) {
    // === ADD: highlight cube inside the big cube ===
    const hiSize = 0.1; // small cube
    const hiGeo = new THREE.BoxGeometry(hiSize, hiSize, hiSize);

    // random position inside [-0.45, 0.45] so it stays well within the big cube
    const rand = () => (Math.random() - 0.5) * 0.9;
    const hiMesh = new THREE.Mesh(
    hiGeo,
    new THREE.MeshBasicMaterial({
        color: 0xffff00,       // yellow
        transparent: true,    // solid
        depthTest: false,      // <- always draw on top so it's visible from anywhere
        depthWrite: false,
    })
    );
    hiMesh.position.set(rand(), rand(), rand());
    hiMesh.renderOrder = 9999; // extra insurance to render last
    scene.add(hiMesh);
}


    // Track which keys are pressed
const keys: Record<string, boolean> = {};

const handleKeyDown = (e: KeyboardEvent) => {
  keys[e.key.toLowerCase()] = true;
};
const handleKeyUp = (e: KeyboardEvent) => {
  keys[e.key.toLowerCase()] = false;
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
      renderer.render(scene, camera);
    };
    animate();

    // Handle resize
    const handleResize = () => {
      if (!mountRef.current) return;
      camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    };
    window.addEventListener("resize", handleResize);



    



    return () => {
      window.removeEventListener("resize", handleResize);
      mountRef.current?.removeChild(renderer.domElement);
      window.removeEventListener("keydown", handleKeyDown);
window.removeEventListener("keyup", handleKeyUp);

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

  return <div ref={mountRef} style={{ width: "100%", height: "100%" }} />;
}


