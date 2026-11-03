import { useEffect, useRef } from "react";
import * as THREE from "three";

// The one bit of three.js we keep: a slow rotating star field.
// Plain three (no r3f/drei), pauses off screen, fewer points on phones, DPR capped.
const StarsBackground = () => {
  const mount = useRef(null);

  useEffect(() => {
    const el = mount.current;
    const small = window.innerWidth < 768;
    const COUNT = small ? 1800 : 5000;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false, powerPreference: "low-power" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setSize(el.clientWidth, el.clientHeight);
    el.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, el.clientWidth / el.clientHeight, 0.1, 10);
    camera.position.z = 1;

    // random points inside a sphere of radius 1.2
    const pos = new Float32Array(COUNT * 3);
    for (let i = 0; i < COUNT; i++) {
      const r = 1.2 * Math.cbrt(Math.random());
      const t = Math.random() * Math.PI * 2;
      const p = Math.acos(2 * Math.random() - 1);
      pos[i * 3] = r * Math.sin(p) * Math.cos(t);
      pos[i * 3 + 1] = r * Math.sin(p) * Math.sin(t);
      pos[i * 3 + 2] = r * Math.cos(p);
    }
    // mostly cool white, a few pink and lime stars for colour (one draw call, vertex colours)
    const col = new Float32Array(COUNT * 3);
    const c = new THREE.Color();
    for (let i = 0; i < COUNT; i++) {
      const roll = Math.random();
      c.set(roll < 0.1 ? "#f272c8" : roll < 0.17 ? "#c8ff3d" : "#e9e7ff");
      col.set([c.r, c.g, c.b], i * 3);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    geo.setAttribute("color", new THREE.BufferAttribute(col, 3));
    // soft round sprite so stars are dots, not squares
    const sprite = document.createElement("canvas");
    sprite.width = sprite.height = 64;
    const g = sprite.getContext("2d");
    const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0, "rgba(255,255,255,1)");
    grad.addColorStop(0.35, "rgba(255,255,255,0.85)");
    grad.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = grad;
    g.fillRect(0, 0, 64, 64);
    const map = new THREE.CanvasTexture(sprite);
    const mat = new THREE.PointsMaterial({ size: 0.006, map, alphaTest: 0.01, sizeAttenuation: true, transparent: true, depthWrite: false, vertexColors: true });
    const points = new THREE.Points(geo, mat);
    const group = new THREE.Group();
    group.rotation.z = Math.PI / 4;
    group.add(points);
    scene.add(group);

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf;
    let visible = true;
    const clock = new THREE.Clock();
    const loop = () => {
      raf = requestAnimationFrame(loop);
      if (!visible) return;
      const d = clock.getDelta();
      if (!reduce) { points.rotation.x -= d / 10; points.rotation.y -= d / 15; }
      renderer.render(scene, camera);
    };
    loop();

    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting), { rootMargin: "100px" });
    io.observe(el);
    const ro = new ResizeObserver(() => {
      renderer.setSize(el.clientWidth, el.clientHeight);
      camera.aspect = el.clientWidth / el.clientHeight;
      camera.updateProjectionMatrix();
    });
    ro.observe(el);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      geo.dispose();
      map.dispose();
      mat.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      renderer.domElement.remove();
    };
  }, []);

  return <div ref={mount} className="absolute inset-0" aria-hidden="true" />;
};

export default StarsBackground;
