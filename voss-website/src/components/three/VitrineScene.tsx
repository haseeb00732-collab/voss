"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import {
  AdaptiveDpr,
  ContactShadows,
  Environment,
  Lightformer,
  RoundedBox,
} from "@react-three/drei";
import * as THREE from "three";
import type { Config } from "@/lib/vitrine";

/**
 * The vitrine. Every polygon in here is generated in code — there is not a
 * single .glb, .hdr or texture fetched at runtime, which is the only reason a
 * 3D hero can sit above the fold without costing the page its LCP.
 *
 * The lighting is procedural too. `<Environment>` with `<Lightformer>`
 * children bakes a cube map from geometry we describe, so we get real
 * reflections in the hardware without downloading an HDRI. A `preset` would
 * have pulled ~2MB off a CDN and undone the whole point.
 *
 * The key light sits high and slightly left, matching the direction baked into
 * `--elev-*` in globals.css. If you move it, move those too, or the page will
 * have two suns.
 */

const KEY_POS: [number, number, number] = [-3.4, 5.2, 3.6];

function Bag({ config }: { config: Config }) {
  const group = useRef<THREE.Group>(null);

  /* Materials are memoised on the values that actually drive them. Rebuilding
     a physical material every frame is the classic way to make a scene that
     looks fine and runs at 12fps. */
  const leather = useMemo(() => {
    const m = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(config.finish.leather),
      roughness: config.finish.roughness,
      metalness: 0,
      sheen: config.finish.sheen,
      sheenRoughness: 0.7,
      sheenColor: new THREE.Color(config.finish.trim),
      clearcoat: 0.18,
      clearcoatRoughness: 0.6,
    });
    return m;
  }, [config.finish.leather, config.finish.trim, config.finish.roughness, config.finish.sheen]);

  const trim = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: new THREE.Color(config.finish.trim),
        roughness: Math.min(1, config.finish.roughness + 0.12),
        metalness: 0,
      }),
    [config.finish.trim, config.finish.roughness],
  );

  const metal = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color(config.hardware.color),
        metalness: config.hardware.metalness,
        roughness: config.hardware.roughness,
      }),
    [config.hardware.color, config.hardware.metalness, config.hardware.roughness],
  );

  /* A slow drift, not a spin. The piece is being presented, not demonstrated —
     a full rotation reads as a 3D viewer widget and kills the illusion that
     you are looking at a photograph that happens to breathe. */
  useFrame((state) => {
    if (!group.current) return;
    const t = state.clock.elapsedTime;
    group.current.rotation.y = Math.sin(t * 0.16) * 0.34 - 0.22;
    group.current.position.y = 0.62 + Math.sin(t * 0.5) * 0.008;
  });

  return (
    <group ref={group} position={[0, 0.62, 0]}>
      {/* Body — a structured box bag, the house silhouette. */}
      <RoundedBox args={[1.06, 1.02, 0.42]} radius={0.06} smoothness={4} material={leather} />

      {/* Gusset seam: a hair wider than the body so it reads as a welt
          rather than z-fighting with the panel it sits on. */}
      <RoundedBox
        args={[1.09, 0.09, 0.45]}
        radius={0.035}
        smoothness={3}
        material={trim}
        position={[0, -0.52, 0]}
      />

      {/* Flap, hinged at the back and falling just short of the base — a flap
          that reaches the bottom reads as a folder. */}
      <RoundedBox
        args={[1.1, 0.44, 0.46]}
        radius={0.05}
        smoothness={4}
        material={leather}
        position={[0, 0.38, 0.005]}
      />

      {/* Clasp. The one place the hardware is allowed to be the brightest
          thing in frame. */}
      <mesh material={metal} position={[0, 0.1, 0.235]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.085, 0.085, 0.05, 24]} />
      </mesh>
      <mesh material={metal} position={[0, 0.1, 0.258]}>
        <boxGeometry args={[0.03, 0.11, 0.012]} />
      </mesh>

      {/* Handle — a torus arc, not a full ring, so it sits on the bag rather
          than through it. */}
      <mesh material={metal} position={[0, 0.62, 0]} rotation={[0, 0, 0]}>
        <torusGeometry args={[0.3, 0.019, 12, 48, Math.PI]} />
      </mesh>

      {/* Anchors where the handle meets the body. */}
      {[-0.3, 0.3].map((x) => (
        <mesh key={x} material={metal} position={[x, 0.58, 0]}>
          <cylinderGeometry args={[0.045, 0.045, 0.06, 16]} />
        </mesh>
      ))}

      {/* Feet. Four studs is what stops a bag looking like it is sinking. */}
      {[
        [-0.4, -0.57, 0.14],
        [0.4, -0.57, 0.14],
        [-0.4, -0.57, -0.14],
        [0.4, -0.57, -0.14],
      ].map((p, i) => (
        <mesh key={i} material={metal} position={p as [number, number, number]}>
          <cylinderGeometry args={[0.035, 0.035, 0.04, 12]} />
        </mesh>
      ))}
    </group>
  );
}

function Room({ config }: { config: Config }) {
  const wall = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color(config.vitrine.wall),
        roughness: 0.95,
        metalness: 0,
      }),
    [config.vitrine.wall],
  );

  const stone = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color(config.vitrine.stone),
        roughness: 0.82,
        metalness: 0.05,
      }),
    [config.vitrine.stone],
  );

  return (
    <group>
      {/* Back wall, set well behind the plinth so the falloff is visible. */}
      <mesh material={wall} position={[0, 1.6, -2.6]} receiveShadow>
        <planeGeometry args={[16, 9]} />
      </mesh>

      {/* The niche the piece stands in — a shallow recess, brighter than the
          wall around it, which is what makes a vitrine read as a vitrine. */}
      <mesh material={stone} position={[0, 1.35, -2.45]}>
        <planeGeometry args={[3.1, 3.4]} />
      </mesh>

      {/* Floor. */}
      <mesh material={stone} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.001, 0]}>
        <planeGeometry args={[16, 12]} />
      </mesh>

      {/* Plinth. */}
      <RoundedBox
        args={[2.1, 0.12, 1.1]}
        radius={0.012}
        smoothness={2}
        material={stone}
        position={[0, 0.06, 0]}
      />
    </group>
  );
}

export function VitrineScene({ config }: { config: Config }) {
  return (
    <>
      {/* Base fill. Kept low — the shape comes from the key and the rim. */}
      <ambientLight intensity={0.22} />

      {/* Key. High and slightly left, matching the CSS elevation direction. */}
      <spotLight
        position={KEY_POS}
        angle={0.42}
        penumbra={0.9}
        intensity={38}
        distance={22}
        color={config.vitrine.key}
      />

      {/* Rim from behind-right, to separate the piece from the niche. */}
      <pointLight position={[2.6, 1.9, -1.4]} intensity={9} color="#ffd9a8" />

      {/* A procedural studio. These lightformers are geometry we describe, so
          the hardware gets real reflections with zero network cost. */}
      <Environment resolution={128}>
        <Lightformer form="rect" intensity={2.6} position={[-2.4, 3.4, 2.6]} scale={[5, 3, 1]} />
        <Lightformer form="rect" intensity={1.1} position={[3.2, 1.6, 1.4]} scale={[3, 4, 1]} />
        <Lightformer form="ring" intensity={1.6} position={[0, 2.2, -3]} scale={4} />
      </Environment>

      {/* The whole set is offset rather than the camera aimed: an R3F camera
          looks at the origin, so putting the piece AT the origin is cheaper
          than fighting it with a lookAt every frame. The x shift hands the
          left half of the frame to the headline. */}
      <group position={[0.42, -0.78, 0]}>
        <Room config={config} />
        <Bag config={config} />

        <ContactShadows
          position={[0, 0.121, 0]}
          opacity={0.62}
          scale={6}
          blur={2.4}
          far={2}
          resolution={256}
        />
      </group>

      {/* Drops resolution rather than framerate when the GPU is struggling. */}
      <AdaptiveDpr pixelated />
    </>
  );
}
