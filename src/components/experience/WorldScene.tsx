"use client";

/**
 * react-three-fiber's whole animation model is imperative-by-design: useFrame
 * runs outside React's render phase, and mutating refs / instanced-mesh
 * matrices / the camera every frame is the only performant way to drive a
 * Three.js scene. That's exactly what this file does throughout, which the
 * React Compiler's render-purity/immutability rules (correctly, for regular
 * components) flag — so the immutability rule is disabled for this file
 * specifically (all randomness elsewhere is deterministic, so the purity
 * rule already has nothing to flag).
 */
/* eslint-disable react-hooks/immutability */

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { buildFormation, type FormationData } from "./formations";
import { getActiveChapter, getChapters, type Formation } from "./scrollStore";
import { PALETTE } from "./palette";

const FORMATIONS: Formation[] = ["seed", "crystal", "network", "grid", "orbitHub", "stream", "tree"];

/** How dominant the solid crystal core is while each formation is active. */
const CORE_PRESENCE: Record<Formation, { scale: number; opacity: number }> = {
  seed: { scale: 0.32, opacity: 0.5 },
  crystal: { scale: 1, opacity: 1 },
  network: { scale: 0.55, opacity: 0.6 },
  grid: { scale: 0.3, opacity: 0.22 },
  orbitHub: { scale: 0.58, opacity: 0.95 },
  stream: { scale: 0.26, opacity: 0.16 },
  tree: { scale: 0.3, opacity: 0.4 },
};

/** Base opacity for connecting lines once a formation has fully settled in. */
const LINE_PRESENCE: Record<Formation, number> = {
  seed: 0,
  crystal: 0.45,
  network: 0.55,
  grid: 0,
  orbitHub: 0.4,
  stream: 0,
  tree: 0.38,
};

function smoothstep(edge0: number, edge1: number, x: number) {
  const t = Math.min(1, Math.max(0, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

/** Deterministic pseudo-random in [0, 1) — same helper as formations.ts, kept local to avoid a cross-import. */
function hash(n: number) {
  const x = Math.sin(n * 12.9898 + 43.111) * 43758.5453;
  return x - Math.floor(x);
}

/** Small radial-gradient sprite so point clouds render as soft dots, not hard squares. */
function useDotTexture() {
  return useMemo(() => {
    if (typeof document === "undefined") return null;
    const size = 64;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    gradient.addColorStop(0, "rgba(255,255,255,1)");
    gradient.addColorStop(0.4, "rgba(255,255,255,0.7)");
    gradient.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);
    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
  }, []);
}

export function WorldScene({
  count,
  reducedMotion,
  compact = false,
}: {
  count: number;
  reducedMotion: boolean;
  compact?: boolean;
}) {
  // This component is built entirely around R3F's imperative useFrame loop —
  // mutating refs, instanced-mesh matrices and the camera every frame is the
  // whole point (and the only performant way to animate a Three.js scene).
  // Opt out of React Compiler's purity/immutability analysis, which assumes
  // plain render-phase code.
  "use no memo";

  const { camera } = useThree();

  const crystalGroup = useRef<THREE.Group>(null);
  const crystalMaterial = useRef<THREE.MeshPhysicalMaterial>(null);
  const edgesMaterial = useRef<THREE.LineBasicMaterial>(null);
  const nodesMesh = useRef<THREE.InstancedMesh>(null);
  const linesRef = useRef<THREE.LineSegments>(null);
  const dustRef = useRef<THREE.Points>(null);

  const mouse = useRef({ x: 0, y: 0 });
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const currentPositions = useMemo(() => new Float32Array(count * 3), [count]);
  const initialized = useRef(false);

  const formationCache = useMemo(() => {
    const cache = {} as Record<Formation, FormationData>;
    for (const f of FORMATIONS) cache[f] = buildFormation(f, count);
    return cache;
  }, [count]);

  const originSpokeEdges = useMemo<Array<[number, number]>>(
    () => Array.from({ length: count }, (_, i) => [i, -1]),
    [count]
  );

  const maxEdges = count * 2;
  const lineGeometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(maxEdges * 2 * 3), 3));
    geo.setDrawRange(0, 0);
    return geo;
  }, [maxEdges]);

  const nodeColors = useMemo(() => {
    const royal = new THREE.Color(PALETTE.royal);
    const cyan = new THREE.Color(PALETTE.cyan);
    const colors: THREE.Color[] = [];
    for (let i = 0; i < count; i++) {
      colors.push(royal.clone().lerp(cyan, i / Math.max(count - 1, 1)));
    }
    return colors;
  }, [count]);

  const dustGeometry = useMemo(() => {
    if (reducedMotion) return null;
    const dustCount = count > 40 ? 140 : 60;
    const positions = new Float32Array(dustCount * 3);
    for (let i = 0; i < dustCount; i++) {
      const r = 4.5 + hash(i * 1.31) * 3.5;
      const theta = hash(i * 2.71 + 5) * Math.PI * 2;
      const phi = Math.acos(hash(i * 3.53 + 11) * 2 - 1);
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.cos(phi) * 0.6;
      positions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return geo;
  }, [count, reducedMotion]);

  // Icosahedron core geometry + its crisp facet-outline overlay.
  const coreGeometry = useMemo(() => new THREE.IcosahedronGeometry(1.28, 0), []);
  const coreEdgesGeometry = useMemo(() => new THREE.EdgesGeometry(coreGeometry, 1), [coreGeometry]);
  const dotTexture = useDotTexture();

  useEffect(() => {
    if (reducedMotion) return;
    const onMove = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [reducedMotion]);

  useEffect(() => {
    const mesh = nodesMesh.current;
    if (!mesh) return;
    nodeColors.forEach((c, i) => mesh.setColorAt(i, c));
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, [nodeColors]);

  useFrame((state, rawDelta) => {
    const delta = Math.min(rawDelta, 1 / 30);
    const time = state.clock.elapsedTime;

    const chapters = getChapters();
    const { chapter, local } = getActiveChapter();
    const thisFormation: Formation = chapter?.formation ?? "crystal";
    const chapterIdx = chapter ? chapters.indexOf(chapter) : 0;
    const prevFormation: Formation = chapterIdx > 0 ? chapters[chapterIdx - 1].formation : thisFormation;

    const blend = reducedMotion ? 1 : smoothstep(0, 0.35, local);
    const prevData = formationCache[prevFormation];
    const thisData = formationCache[thisFormation];

    if (!initialized.current) {
      currentPositions.set(thisData.points);
      initialized.current = true;
    }

    const k = reducedMotion ? 1 : 1 - Math.exp(-5.5 * delta);

    for (let i = 0; i < count; i++) {
      const tx = lerp(prevData.points[i * 3], thisData.points[i * 3], blend);
      const ty = lerp(prevData.points[i * 3 + 1], thisData.points[i * 3 + 1], blend);
      const tz = lerp(prevData.points[i * 3 + 2], thisData.points[i * 3 + 2], blend);

      currentPositions[i * 3] += (tx - currentPositions[i * 3]) * k;
      currentPositions[i * 3 + 1] += (ty - currentPositions[i * 3 + 1]) * k;
      currentPositions[i * 3 + 2] += (tz - currentPositions[i * 3 + 2]) * k;

      if (nodesMesh.current) {
        dummy.position.set(currentPositions[i * 3], currentPositions[i * 3 + 1], currentPositions[i * 3 + 2]);
        const wobble = reducedMotion ? 1 : 1 + Math.sin(time * 1.6 + i) * 0.12;
        dummy.scale.setScalar(wobble);
        dummy.updateMatrix();
        nodesMesh.current.setMatrixAt(i, dummy.matrix);
      }
    }
    if (nodesMesh.current) nodesMesh.current.instanceMatrix.needsUpdate = true;

    // Connecting lines for the active (settling-in) formation.
    const activeEdges = thisFormation === "orbitHub" ? originSpokeEdges : thisData.edges;
    if (linesRef.current) {
      const posAttr = lineGeometry.getAttribute("position") as THREE.BufferAttribute;
      const arr = posAttr.array as Float32Array;
      const edgeCount = Math.min(activeEdges.length, maxEdges);
      for (let e = 0; e < edgeCount; e++) {
        const [a, b] = activeEdges[e];
        arr[e * 6] = currentPositions[a * 3];
        arr[e * 6 + 1] = currentPositions[a * 3 + 1];
        arr[e * 6 + 2] = currentPositions[a * 3 + 2];
        if (b === -1) {
          arr[e * 6 + 3] = 0;
          arr[e * 6 + 4] = 0;
          arr[e * 6 + 5] = 0;
        } else {
          arr[e * 6 + 3] = currentPositions[b * 3];
          arr[e * 6 + 4] = currentPositions[b * 3 + 1];
          arr[e * 6 + 5] = currentPositions[b * 3 + 2];
        }
      }
      posAttr.needsUpdate = true;
      lineGeometry.setDrawRange(0, edgeCount * 2);
      const targetOpacity = LINE_PRESENCE[thisFormation] * blend;
      const mat = linesRef.current.material as THREE.LineBasicMaterial;
      mat.opacity += (targetOpacity - mat.opacity) * (reducedMotion ? 1 : 0.08);
      linesRef.current.visible = mat.opacity > 0.01;
    }

    // Crystal core presence (scale/opacity), blended the same way as the nodes.
    const prevPresence = CORE_PRESENCE[prevFormation];
    const thisPresence = CORE_PRESENCE[thisFormation];
    const targetScale = lerp(prevPresence.scale, thisPresence.scale, blend);
    const targetOpacity = lerp(prevPresence.opacity, thisPresence.opacity, blend);

    if (crystalGroup.current) {
      const s = crystalGroup.current.scale.x + (targetScale - crystalGroup.current.scale.x) * (reducedMotion ? 1 : 0.06);
      crystalGroup.current.scale.setScalar(s);

      const scrollSpin = reducedMotion ? 0 : (chapter ? chapter.start + local * (chapter.end - chapter.start) : 0) * 5.2;
      const idleSpin = reducedMotion ? time * 0.02 : time * 0.06;
      crystalGroup.current.rotation.y = scrollSpin + idleSpin;
      crystalGroup.current.rotation.x = Math.sin(time * 0.05) * 0.08;
    }
    if (crystalMaterial.current) {
      crystalMaterial.current.opacity += (targetOpacity - crystalMaterial.current.opacity) * (reducedMotion ? 1 : 0.06);
      crystalMaterial.current.emissiveIntensity = 0.35 + Math.sin(time * 1.1) * (reducedMotion ? 0 : 0.08);
    }
    if (edgesMaterial.current) {
      edgesMaterial.current.opacity += (targetOpacity * 0.7 - edgesMaterial.current.opacity) * (reducedMotion ? 1 : 0.06);
    }

    // Camera: gentle overall dolly tied to total progress + subtle cursor parallax.
    const overallProgress = chapter ? chapter.start + local * (chapter.end - chapter.start) : 0;
    const baseZ = (compact ? 7.6 : 6.1) - overallProgress * 0.5;
    const targetX = reducedMotion ? 0 : mouse.current.x * 0.35;
    const targetY = reducedMotion ? 0 : -mouse.current.y * 0.22;
    camera.position.x += (targetX - camera.position.x) * (reducedMotion ? 1 : 0.04);
    camera.position.y += (targetY + 0.15 - camera.position.y) * (reducedMotion ? 1 : 0.04);
    camera.position.z += (baseZ - camera.position.z) * (reducedMotion ? 1 : 0.05);
    camera.lookAt(0, 0, 0);

    if (dustRef.current) {
      dustRef.current.rotation.y = time * 0.015;
    }
  });

  return (
    <>
      <color attach="background" args={["#ffffff"]} />
      <ambientLight intensity={0.75} color="#eaf1ff" />
      <directionalLight position={[3.5, 5, 2.5]} intensity={1.35} color="#ffffff" />
      <pointLight position={[-4, -1.5, 3]} intensity={22} color={PALETTE.cyan} distance={12} decay={2} />
      <pointLight position={[4, -2.5, -2]} intensity={18} color={PALETTE.royal} distance={12} decay={2} />

      <group ref={crystalGroup}>
        <mesh geometry={coreGeometry}>
          <meshPhysicalMaterial
            ref={crystalMaterial}
            color={PALETTE.royal}
            emissive={PALETTE.navy}
            emissiveIntensity={0.35}
            flatShading
            metalness={0.28}
            roughness={0.32}
            clearcoat={0.6}
            clearcoatRoughness={0.25}
            transparent
            opacity={1}
          />
        </mesh>
        <lineSegments geometry={coreEdgesGeometry}>
          <lineBasicMaterial ref={edgesMaterial} color={PALETTE.navy} transparent opacity={0.4} />
        </lineSegments>
      </group>

      <instancedMesh ref={nodesMesh} args={[undefined, undefined, count]}>
        <icosahedronGeometry args={[0.055, 0]} />
        <meshStandardMaterial emissive={PALETTE.cyan} emissiveIntensity={0.5} roughness={0.4} metalness={0.2} />
      </instancedMesh>

      <lineSegments ref={linesRef} geometry={lineGeometry}>
        <lineBasicMaterial color={PALETTE.electric} transparent opacity={0} />
      </lineSegments>

      {dustGeometry && (
        <points ref={dustRef} geometry={dustGeometry}>
          <pointsMaterial
            color={PALETTE.bright}
            size={0.16}
            map={dotTexture ?? undefined}
            transparent
            opacity={0.5}
            sizeAttenuation
            depthWrite={false}
            alphaTest={0.02}
          />
        </points>
      )}
    </>
  );
}
