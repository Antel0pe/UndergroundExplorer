"use client"; // if using Next.js App Router

import { useEffect, useRef } from "react";
import * as THREE from "three";

export default function ThreeScene() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

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
  for (let j = 0; j < pos.count; j++) {
    const x = pos.getX(j);
    const y = pos.getY(j);
    const z = pos.getZ(j);
    colors.push((x + 0.5), (y + 0.5), (z + 0.5));
  }
  geo.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));

  const mat = new THREE.MeshBasicMaterial({
    vertexColors: true,
    transparent: true,
    opacity: 0.6,
    side: THREE.DoubleSide
  });

  scene.add(new THREE.Mesh(geo, mat));
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

  return <div ref={mountRef} style={{ width: "100%", height: "100vh" }} />;
}
