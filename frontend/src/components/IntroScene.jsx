import React, { useState, useRef, useMemo, useEffect, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";

// Check WebGL availability safely
function isWebGLAvailable() {
  try {
    const canvas = document.createElement("canvas");
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext("webgl") || canvas.getContext("experimental-webgl"))
    );
  } catch (e) {
    return false;
  }
}

// -------------------------------------------------------------
// 1. Procedural 3D Plastic Waste Meshes
// -------------------------------------------------------------

function PlasticBottle({ position, rotation, scale = 1, isWarping, progress }) {
  const meshRef = useRef();
  const initPos = useMemo(() => new THREE.Vector3(...position), [position]);
  const initRot = useMemo(() => new THREE.Euler(...rotation), [rotation]);

  useFrame((state, delta) => {
    if (!meshRef.current) return;
    if (!isWarping) {
      meshRef.current.position.y = initPos.y + Math.sin(state.clock.elapsedTime * 1.5 + initPos.x) * 0.22;
      meshRef.current.rotation.x = initRot.x + Math.sin(state.clock.elapsedTime * 0.8) * 0.2;
      meshRef.current.rotation.y += delta * 0.5;
    } else {
      // Funnel directly into bin opening cavity at (0, 0.4, -42)
      const target = new THREE.Vector3(0, 0.4, -42);
      meshRef.current.position.lerpVectors(initPos, target, Math.min(progress * 1.25, 1));
      meshRef.current.scale.set(
        scale * (1 - progress * 0.75),
        scale * (1 - progress * 0.75),
        scale * (1 + progress * 2.8)
      );
      meshRef.current.rotation.x += delta * 14;
      meshRef.current.rotation.z += delta * 12;
    }
  });

  return (
    <group ref={meshRef} position={position} rotation={rotation} scale={scale}>
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.3, 0.32, 1.2, 16]} />
        <meshStandardMaterial
          color="#89CFF0"
          transparent
          opacity={0.7}
          roughness={0.15}
          metalness={0.1}
        />
      </mesh>
      <mesh position={[0, 0.7, 0]}>
        <cylinderGeometry args={[0.15, 0.3, 0.25, 16]} />
        <meshStandardMaterial
          color="#89CFF0"
          transparent
          opacity={0.7}
          roughness={0.15}
        />
      </mesh>
      <mesh position={[0, 0.9, 0]}>
        <cylinderGeometry args={[0.12, 0.12, 0.2, 16]} />
        <meshStandardMaterial color="#E84C32" roughness={0.3} />
      </mesh>
    </group>
  );
}

function PlasticCup({ position, rotation, scale = 1, isWarping, progress }) {
  const meshRef = useRef();
  const initPos = useMemo(() => new THREE.Vector3(...position), [position]);
  const initRot = useMemo(() => new THREE.Euler(...rotation), [rotation]);

  useFrame((state, delta) => {
    if (!meshRef.current) return;
    if (!isWarping) {
      meshRef.current.position.y = initPos.y + Math.cos(state.clock.elapsedTime * 1.8 + initPos.z) * 0.2;
      meshRef.current.rotation.y += delta * 0.4;
      meshRef.current.rotation.z = initRot.z + Math.sin(state.clock.elapsedTime) * 0.25;
    } else {
      const target = new THREE.Vector3(0, 0.4, -42);
      meshRef.current.position.lerpVectors(initPos, target, Math.min(progress * 1.25, 1));
      meshRef.current.scale.set(
        scale * (1 - progress * 0.75),
        scale * (1 - progress * 0.75),
        scale * (1 + progress * 2.2)
      );
      meshRef.current.rotation.y += delta * 16;
    }
  });

  return (
    <group ref={meshRef} position={position} rotation={rotation} scale={scale}>
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.42, 0.26, 0.85, 16, 1, true]} />
        <meshStandardMaterial
          color="#F0F4F8"
          transparent
          opacity={0.65}
          roughness={0.25}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}

function PlasticBag({ position, rotation, scale = 1, isWarping, progress }) {
  const meshRef = useRef();
  const initPos = useMemo(() => new THREE.Vector3(...position), [position]);

  useFrame((state, delta) => {
    if (!meshRef.current) return;
    if (!isWarping) {
      meshRef.current.position.x = initPos.x + Math.sin(state.clock.elapsedTime * 1.2) * 0.18;
      meshRef.current.position.y = initPos.y + Math.sin(state.clock.elapsedTime * 1.5) * 0.18;
      meshRef.current.rotation.x += delta * 0.35;
      meshRef.current.rotation.y += delta * 0.45;
    } else {
      const target = new THREE.Vector3(0, 0.4, -42);
      meshRef.current.position.lerpVectors(initPos, target, Math.min(progress * 1.25, 1));
      meshRef.current.scale.set(
        scale * (1 - progress * 0.75),
        scale * (1 - progress * 0.75),
        scale * (1 + progress * 3)
      );
      meshRef.current.rotation.x += delta * 18;
    }
  });

  return (
    <group ref={meshRef} position={position} rotation={rotation} scale={scale}>
      <mesh>
        <dodecahedronGeometry args={[0.48, 1]} />
        <meshStandardMaterial
          color="#D8E2DC"
          transparent
          opacity={0.58}
          roughness={0.35}
          metalness={0.08}
        />
      </mesh>
    </group>
  );
}

// -------------------------------------------------------------
// 2. High-Fidelity 3D Civic Dustbin / Smart Receptacle
// -------------------------------------------------------------
function CivicDustbin({ progress }) {
  const lidRef = useRef();
  const vortexRef = useRef();
  const shockwaveRef = useRef();

  // Create 14 vertical fluted slats around bin body
  const ribs = useMemo(() => {
    const arr = [];
    const count = 14;
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const r = 2.05;
      const x = Math.cos(angle) * r;
      const z = Math.sin(angle) * r;
      arr.push({ x, z, rotY: -angle });
    }
    return arr;
  }, []);

  useFrame((state, delta) => {
    // Mechanical lid movement:
    // Opens wide as debris approaches (progress 0.3 -> 0.82)
    // Slams shut with authority at progress 0.88
    if (lidRef.current) {
      if (progress > 0.28 && progress < 0.88) {
        const openAmount = Math.min((progress - 0.28) * 2.2, 1.35);
        lidRef.current.rotation.x = -openAmount;
      } else if (progress >= 0.88) {
        lidRef.current.rotation.x = 0;
      }
    }

    // Interior capture vortex rotation
    if (vortexRef.current) {
      vortexRef.current.rotation.y += delta * 6;
      const intensity = progress > 0.4 ? 1 + progress * 2 : 0.8;
      vortexRef.current.material.opacity = Math.min(progress * 1.5, 0.9);
      vortexRef.current.material.emissiveIntensity = intensity;
    }

    // Expanding shockwave ring on impact
    if (shockwaveRef.current) {
      if (progress >= 0.88) {
        const p = (progress - 0.88) / 0.12;
        const scaleVal = 1 + p * 12;
        shockwaveRef.current.scale.set(scaleVal, scaleVal, 1);
        shockwaveRef.current.material.opacity = Math.max(0, 1 - p * 1.2);
        shockwaveRef.current.visible = true;
      } else {
        shockwaveRef.current.visible = false;
      }
    }
  });

  return (
    <group position={[0, -1.0, -42]}>
      {/* Heavy Pedestal Base */}
      <mesh position={[0, -2.1, 0]}>
        <cylinderGeometry args={[2.5, 2.7, 0.45, 32]} />
        <meshStandardMaterial color="#11161B" roughness={0.7} metalness={0.4} />
      </mesh>

      {/* Main Bin Cylinder (Tapered) */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[2.0, 1.8, 3.8, 32]} />
        <meshStandardMaterial color="#182026" roughness={0.35} metalness={0.65} />
      </mesh>

      {/* Architectural Vertical Ribs / Park Slats */}
      {ribs.map((rib, idx) => (
        <mesh key={idx} position={[rib.x, 0, rib.z]} rotation={[0, rib.rotY, 0]}>
          <boxGeometry args={[0.08, 3.6, 0.16]} />
          <meshStandardMaterial color="#232C33" roughness={0.3} metalness={0.8} />
        </mesh>
      ))}

      {/* Upper Flared Collar */}
      <mesh position={[0, 2.0, 0]}>
        <cylinderGeometry args={[2.35, 2.05, 0.45, 32]} />
        <meshStandardMaterial color="#1E272E" roughness={0.3} metalness={0.75} />
      </mesh>

      {/* Polished Metal Top Rim */}
      <mesh position={[0, 2.25, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[2.32, 0.1, 16, 32]} />
        <meshStandardMaterial color="#D1D5DB" roughness={0.2} metalness={0.9} />
      </mesh>

      {/* Hollow Interior Capture Cavity (Hole into which items fly) */}
      <mesh position={[0, 1.5, 0]}>
        <cylinderGeometry args={[2.05, 1.5, 2.0, 32, 1, true]} />
        <meshBasicMaterial color="#050709" side={THREE.DoubleSide} />
      </mesh>

      {/* Swirling Interior Energy Vortex */}
      <mesh ref={vortexRef} position={[0, 1.2, 0]}>
        <cylinderGeometry args={[1.8, 0.8, 1.4, 24, 1, true]} />
        <meshStandardMaterial
          color="#22C55E"
          emissive="#22C55E"
          emissiveIntensity={1.2}
          transparent
          opacity={0.4}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* CleanTO Signature Orange Civic Accent Band */}
      <mesh position={[0, -0.2, 0]}>
        <cylinderGeometry args={[2.02, 1.95, 0.4, 32]} />
        <meshStandardMaterial color="#E84C32" roughness={0.3} emissive="#E84C32" emissiveIntensity={0.6} />
      </mesh>

      {/* Embossed Recycling Symbol Shield on Front */}
      <group position={[0, 0.6, 2.08]}>
        <mesh>
          <boxGeometry args={[1.1, 0.9, 0.05]} />
          <meshStandardMaterial color="#0F172A" roughness={0.4} />
        </mesh>
        <mesh position={[0, 0, 0.03]}>
          <ringGeometry args={[0.22, 0.35, 3]} />
          <meshBasicMaterial color="#22C55E" />
        </mesh>
      </group>

      {/* Hinged Top Domed Canopy / Hooded Lid */}
      <group ref={lidRef} position={[0, 2.3, -2.1]}>
        {/* Lid Body */}
        <mesh position={[0, 0.4, 2.1]}>
          <cylinderGeometry args={[1.6, 2.4, 0.8, 32]} />
          <meshStandardMaterial color="#141B22" roughness={0.25} metalness={0.8} />
        </mesh>

        {/* Top Handle / Sensor Dome */}
        <mesh position={[0, 0.9, 2.1]}>
          <cylinderGeometry args={[0.5, 0.7, 0.25, 24]} />
          <meshStandardMaterial color="#E84C32" roughness={0.3} emissive="#E84C32" emissiveIntensity={0.8} />
        </mesh>

        {/* Heavy Industrial Hinge Bracket */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[1.2, 0.35, 0.5]} />
          <meshStandardMaterial color="#0B0E12" roughness={0.4} metalness={0.9} />
        </mesh>
      </group>

      {/* Expanding Impact Shockwave Ring (Triggers on lid snap) */}
      <mesh ref={shockwaveRef} position={[0, 2.4, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.5, 2.2, 48]} />
        <meshBasicMaterial color="#FFA07A" transparent opacity={0} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

// -------------------------------------------------------------
// 3. Tapered Glowing Warp Streaks (Warp-Speed Lines)
// -------------------------------------------------------------
function TaperedWarpStreaks({ isWarping, progress }) {
  const count = 140;
  const meshRef = useRef();

  const streaks = useMemo(() => {
    const arr = [];
    for (let i = 0; i < count; i++) {
      arr.push({
        x: (Math.random() - 0.5) * 36,
        y: (Math.random() - 0.5) * 26,
        z: -Math.random() * 65,
        speed: 0.4 + Math.random() * 0.9,
        color: i % 4 === 0 ? "#E84C32" : i % 3 === 0 ? "#22C55E" : "#7DD3FC",
      });
    }
    return arr;
  }, []);

  useFrame((state, delta) => {
    if (!meshRef.current) return;
    const speedMult = isWarping ? 1 + progress * 48 : 1.2;

    meshRef.current.children.forEach((streak, idx) => {
      const p = streaks[idx];
      streak.position.z += p.speed * delta * 20 * speedMult;
      if (streak.position.z > 6) {
        streak.position.z = -60;
      }

      if (isWarping) {
        // Dynamic stretch & intense glowing tip
        const stretch = 1 + progress * 16;
        streak.scale.set(1 + progress * 0.8, 1 + progress * 0.8, stretch);
      } else {
        streak.scale.set(1, 1, 1);
      }
    });
  });

  return (
    <group ref={meshRef}>
      {streaks.map((s, i) => (
        <group key={i} position={[s.x, s.y, s.z]} rotation={[0, 0, 0]}>
          {/* Tapered Cone: Thick glowing leading head, tapering back */}
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <coneGeometry args={[0.07, 1.8, 6]} />
            <meshStandardMaterial
              color={s.color}
              emissive={s.color}
              emissiveIntensity={isWarping ? 3.5 : 0.8}
              transparent
              opacity={isWarping ? 0.95 : 0.4}
              roughness={0.1}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
}

// -------------------------------------------------------------
// 4. Volumetric Deep-Space Dust & Parallax Stars
// -------------------------------------------------------------
function SpaceAtmosphere() {
  const pointsRef = useRef();

  const [positions, colors] = useMemo(() => {
    const count = 350;
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const c1 = new THREE.Color("#89CFF0");
    const c2 = new THREE.Color("#FFA07A");
    const c3 = new THREE.Color("#CBD5E1");

    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 80;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 60;
      pos[i * 3 + 2] = -Math.random() * 80 + 10;

      const choice = Math.random();
      const c = choice > 0.6 ? c1 : choice > 0.3 ? c2 : c3;
      col[i * 3] = c.r;
      col[i * 3 + 1] = c.g;
      col[i * 3 + 2] = c.b;
    }
    return [pos, col];
  }, []);

  useFrame((state, delta) => {
    if (!pointsRef.current) return;
    pointsRef.current.rotation.y += delta * 0.02;
    pointsRef.current.rotation.x += delta * 0.01;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={colors.length / 3}
          array={colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial size={0.18} vertexColors transparent opacity={0.65} />
    </points>
  );
}

// -------------------------------------------------------------
// 5. Main 3D Scene Composition
// -------------------------------------------------------------
function Scene({ isWarping, progress }) {
  const debris = useMemo(() => {
    const items = [];
    const types = ["bottle", "cup", "bag"];
    for (let i = 0; i < 22; i++) {
      const type = types[i % types.length];
      const angle = (i / 22) * Math.PI * 2;
      // Push radius slightly wider so debris surrounds the text rather than blocking it
      const radius = 3.6 + Math.random() * 3.8;
      const x = Math.cos(angle) * radius;
      const y = (Math.random() - 0.5) * 4.8;
      const z = -Math.random() * 12;
      const rot = [Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI];
      const scale = 0.75 + Math.random() * 0.45;
      items.push({ id: i, type, pos: [x, y, z], rot, scale });
    }
    return items;
  }, []);

  useFrame(({ camera }, delta) => {
    if (!isWarping) {
      camera.position.z = 6.5;
      camera.position.y = 0;
      camera.position.x = 0;
    } else {
      // Warp camera forward smoothly toward z: -35
      const targetZ = 6.5 - progress * 42;
      camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetZ, 0.16);
      camera.position.y = THREE.MathUtils.lerp(camera.position.y, 0.1, 0.1);

      // Micro camera shake on impact (progress > 0.86)
      if (progress > 0.86) {
        const shake = (1 - (progress - 0.86) / 0.14) * 0.25;
        camera.position.x = (Math.random() - 0.5) * shake;
        camera.position.y += (Math.random() - 0.5) * shake;
      }
    }
  });

  return (
    <>
      {/* Volumetric Space Fog for Depth */}
      <fogExp2 attach="fog" args={["#0A0D14", 0.022]} />

      {/* Atmospheric Lighting */}
      <ambientLight intensity={0.65} />
      <directionalLight position={[12, 16, 12]} intensity={1.4} color="#FFFFFF" />
      <directionalLight position={[-15, -10, -20]} intensity={0.9} color="#38BDF8" />
      <pointLight position={[0, 1.2, -40]} intensity={4.5} color="#E84C32" distance={30} />

      {/* Parallax Star Dust & Atmosphere */}
      <SpaceAtmosphere />

      {/* Tapered Glowing Warp Streaks */}
      <TaperedWarpStreaks isWarping={isWarping} progress={progress} />

      {/* Floating Plastic Waste Items */}
      {debris.map((item) => {
        if (item.type === "bottle") {
          return (
            <PlasticBottle
              key={item.id}
              position={item.pos}
              rotation={item.rot}
              scale={item.scale}
              isWarping={isWarping}
              progress={progress}
            />
          );
        }
        if (item.type === "cup") {
          return (
            <PlasticCup
              key={item.id}
              position={item.pos}
              rotation={item.rot}
              scale={item.scale}
              isWarping={isWarping}
              progress={progress}
            />
          );
        }
        return (
          <PlasticBag
            key={item.id}
            position={item.pos}
            rotation={item.rot}
            scale={item.scale}
            isWarping={isWarping}
            progress={progress}
          />
        );
      })}

      {/* 3D Civic Dustbin Model */}
      <CivicDustbin progress={progress} />
    </>
  );
}

// -------------------------------------------------------------
// 6. IntroScene Controller & Cinematic HUD
// -------------------------------------------------------------
export default function IntroScene({ onComplete }) {
  const [isWarping, setIsWarping] = useState(false);
  const [progress, setProgress] = useState(0);
  const [hasWebGL, setHasWebGL] = useState(true);
  const [fadeComplete, setFadeComplete] = useState(false);

  useEffect(() => {
    if (!isWebGLAvailable()) {
      setHasWebGL(false);
      onComplete?.();
    }
  }, [onComplete]);

  // Warp progression loop
  useEffect(() => {
    if (!isWarping) return;
    let animId;
    let start = performance.now();
    const duration = 2400; // 2.4s cinematic sequence

    const tick = (now) => {
      const elapsed = now - start;
      const p = Math.min(elapsed / duration, 1);
      // Cinematic cubic-bezier ease
      const eased = p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
      setProgress(eased);

      if (p < 1) {
        animId = requestAnimationFrame(tick);
      } else {
        setTimeout(() => {
          setFadeComplete(true);
          setTimeout(() => {
            onComplete?.();
          }, 450);
        }, 120);
      }
    };

    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, [isWarping, onComplete]);

  const startWarp = () => {
    if (isWarping) return;
    setIsWarping(true);
  };

  const skipIntro = () => {
    setFadeComplete(true);
    setTimeout(() => {
      onComplete?.();
    }, 200);
  };

  if (!hasWebGL) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: fadeComplete ? 0 : 1 }}
      transition={{ duration: 0.45 }}
      className="fixed inset-0 z-50 bg-[#0A0D14] text-white flex flex-col justify-between overflow-hidden select-none"
    >
      {/* Top Bar with Skip Intro */}
      <div className="relative z-10 flex items-center justify-between p-6 sm:p-8">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-sm bg-[#E84C32] flex items-center justify-center font-bold text-white text-sm shadow">
            C
          </div>
          <div>
            <span className="font-extrabold tracking-tight text-white font-sans text-sm block">
              CleanTO Protocol
            </span>
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">
              3D Remediation Simulation
            </span>
          </div>
        </div>

        <button
          onClick={skipIntro}
          className="px-4 py-2 rounded-sm bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-mono tracking-wider uppercase transition-colors flex items-center gap-2 backdrop-blur-sm cursor-pointer"
        >
          <span>Skip Intro</span>
          <ArrowRight className="w-3.5 h-3.5 text-[#E84C32]" />
        </button>
      </div>

      {/* 3D Canvas Area */}
      <div className="absolute inset-0">
        <Canvas
          camera={{ position: [0, 0, 6.5], fov: 50 }}
          gl={{ antialias: true, alpha: false }}
          onCreated={({ gl }) => {
            gl.setClearColor(new THREE.Color("#0A0D14"));
          }}
        >
          <Suspense fallback={null}>
            <Scene isWarping={isWarping} progress={progress} />
          </Suspense>
        </Canvas>
      </div>

      {/* Cinematic Radial Impact Flash & Vignette (Clean and deliberate burst) */}
      {progress > 0.88 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.9 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 z-20 pointer-events-none"
          style={{
            background: "radial-gradient(circle at center, rgba(255,255,255,0.95) 0%, rgba(232,76,50,0.4) 45%, rgba(10,13,20,0.8) 100%)",
          }}
        />
      )}

      {/* Centered Editorial Call-To-Action (Refined Copy) */}
      <AnimatePresence>
        {!isWarping && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative z-10 max-w-2xl mx-auto text-center px-6 my-auto space-y-6"
          >
            {/* Subtle radial scrim to guarantee 100% text contrast over 3D space */}
            <div className="absolute inset-0 -inset-x-8 -inset-y-6 bg-[radial-gradient(ellipse_at_center,rgba(10,13,20,0.82)_0%,rgba(10,13,20,0.45)_55%,transparent_85%)] pointer-events-none rounded-3xl -z-10" />

            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-sm bg-white/10 border border-white/20 text-[#E84C32] font-mono text-[11px] font-bold uppercase tracking-wider backdrop-blur-sm shadow">
              <span className="w-2 h-2 rounded-full bg-[#E84C32] animate-pulse" />
              Proof-of-Cleanup Protocol &middot; Immutable Ledger
            </div>

            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white font-sans leading-[1.08]">
              From scattered waste <br />
              <span className="text-[#E84C32]">to verified impact.</span>
            </h1>

            <p className="text-slate-300 text-sm sm:text-base font-sans max-w-lg mx-auto leading-relaxed">
              Every discarded piece of litter holds measurable civic debt. CleanTO audits physical cleanup with neural models and commits permanent proof to the consortium ledger.
            </p>

            <div className="pt-2">
              <button
                onClick={startWarp}
                className="inline-flex items-center gap-3 px-8 py-4 rounded-sm bg-[#E84C32] hover:bg-[#D03C24] text-white font-bold text-xs uppercase tracking-widest transition-all shadow-[0_0_24px_rgba(232,76,50,0.45)] hover:shadow-[0_0_36px_rgba(232,76,50,0.65)] hover:scale-[1.02] active:scale-95 cursor-pointer"
              >
                <span>Begin Cleanup Sequence</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            
            <p className="text-[11px] font-mono text-slate-400">
              Interactive 3D Simulation &middot; Accelerates into CleanTO Ecosystem
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Status Ticker */}
      <div className="relative z-10 p-6 flex flex-wrap items-center justify-between text-[11px] font-mono text-slate-400 border-t border-white/10 bg-black/30 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#22C55E]" />
          <span>SIMULATION: 22 SCATTERED PLASTICS IN FLIGHT</span>
        </div>
        <div className="hidden sm:block text-slate-500">
          POWERED BY THREE.JS &middot; REACT THREE FIBER
        </div>
      </div>
    </motion.div>
  );
}
