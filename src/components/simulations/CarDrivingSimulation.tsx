import { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, Line, OrbitControls } from '@react-three/drei';
import type { Group } from 'three';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { useLanguage } from '../../context/LanguageContext';
import SceneHUD from './common/SceneHUD';

type CarPhase = 'cruise' | 'mergeIn' | 'intersectionStop' | 'mergeOut';

interface CarDrivingSimulationProps {
  onBack: () => void;
}

function prepareMustangModel(source: THREE.Object3D): THREE.Object3D {
  const model = source.clone(true);
  model.updateMatrixWorld(true);

  model.traverse((node) => {
    if (node instanceof THREE.Mesh) {
      node.castShadow = true;
      node.receiveShadow = true;
      if (Array.isArray(node.material)) {
        node.material.forEach((material) => {
          material.needsUpdate = true;
        });
      } else if (node.material) {
        node.material.needsUpdate = true;
      }
    }
  });

  const initialBox = new THREE.Box3().setFromObject(model);
  if (initialBox.isEmpty()) return model;

  const center = initialBox.getCenter(new THREE.Vector3());
  const size = initialBox.getSize(new THREE.Vector3());
  const horizontalLongest = Math.max(size.x, size.z) || 1;
  const targetLength = 6.0;
  const scale = targetLength / horizontalLongest;

  model.scale.setScalar(scale);
  model.position.sub(center.multiplyScalar(scale));
  model.updateMatrixWorld(true);

  const groundedBox = new THREE.Box3().setFromObject(model);
  model.position.y -= groundedBox.min.y;

  return model;
}

function CarFallback() {
  return (
    <group>
      <mesh castShadow>
        <boxGeometry args={[1.8, 0.5, 4]} />
        <meshStandardMaterial color="#1e40af" metalness={0.4} roughness={0.35} />
      </mesh>
      <mesh position={[0, 0.4, -0.2]} castShadow>
        <boxGeometry args={[1.4, 0.45, 2.2]} />
        <meshStandardMaterial color="#172554" metalness={0.5} roughness={0.25} />
      </mesh>
    </group>
  );
}

function SceneVehicle({
  phase,
  onSpeedChange,
  mustangModel,
}: {
  phase: CarPhase;
  onSpeedChange: (speed: number) => void;
  mustangModel: THREE.Object3D | null;
}) {
  const carRef = useRef<Group>(null);
  const elapsedRef = useRef(0);
  const progressRef = useRef(0);
  const laneOffsetRef = useRef(0);
  const signalSideRef = useRef<'left' | 'right' | null>(null);
  const signalOnRef = useRef(false);

  const { roadCurve, laneWidth, stopAtT } = useMemo(() => {
    const points = [
      new THREE.Vector3(-34, 0, 26),
      new THREE.Vector3(-18, 0, 18),
      new THREE.Vector3(-6, 0, 6),
      new THREE.Vector3(-2, 0, -10),
      new THREE.Vector3(-10, 0, -26),
      new THREE.Vector3(6, 0, -34),
      new THREE.Vector3(22, 0, -18),
      new THREE.Vector3(32, 0, 0),
      new THREE.Vector3(24, 0, 20),
      new THREE.Vector3(6, 0, 32),
      new THREE.Vector3(-12, 0, 32),
    ];
    const curve = new THREE.CatmullRomCurve3(points, true, 'catmullrom', 0.5);
    return { roadCurve: curve, laneWidth: 3.6, stopAtT: 0.34 };
  }, []);

  useFrame((_, delta) => {
    const car = carRef.current;
    if (!car) return;
    elapsedRef.current += delta;

    const driveSpeed = 0.035;

    if (phase === 'cruise') {
      progressRef.current = (progressRef.current + delta * driveSpeed) % 1;
      laneOffsetRef.current = 0;
      onSpeedChange(26);
      signalSideRef.current = null;
    } else if (phase === 'intersectionStop') {
      progressRef.current = stopAtT;
      laneOffsetRef.current = 0;
      onSpeedChange(0);
      signalSideRef.current = null;
    } else {
      progressRef.current = (progressRef.current + delta * driveSpeed * 0.8) % 1;
      const change = THREE.MathUtils.smoothstep(Math.min(elapsedRef.current * 0.22, 1), 0, 1);
      if (phase === 'mergeIn') {
        laneOffsetRef.current = THREE.MathUtils.lerp(-laneWidth * 1.65, 0, change);
        signalSideRef.current = 'left';
        onSpeedChange(20);
      } else {
        laneOffsetRef.current = THREE.MathUtils.lerp(0, laneWidth * 1.65, change);
        signalSideRef.current = 'right';
        onSpeedChange(18);
      }
    }

    const t = progressRef.current;
    const point = roadCurve.getPointAt(t);
    const tangent = roadCurve.getTangentAt(t).normalize();
    const up = new THREE.Vector3(0, 1, 0);
    const normal = new THREE.Vector3().crossVectors(up, tangent).normalize();

    const lanePoint = point.clone().add(normal.multiplyScalar(laneOffsetRef.current));
    car.position.set(lanePoint.x, 0.6, lanePoint.z);

    const yaw = Math.atan2(tangent.x, tangent.z);
    car.rotation.set(0, yaw, 0);

    const blink = Math.sin(elapsedRef.current * 8) > 0.2;
    signalOnRef.current = Boolean(signalSideRef.current) && blink;
  });

  return (
    <group ref={carRef}>
      {mustangModel ? <primitive object={mustangModel} /> : <CarFallback />}
      <group visible={signalOnRef.current} position={[0, 0.6, 0]}>
        <mesh position={[1.2, 0.2, 1.7]}>
          <sphereGeometry args={[0.12, 12, 12]} />
          <meshStandardMaterial color="#f59e0b" emissive="#f59e0b" emissiveIntensity={1.2} />
        </mesh>
        <mesh position={[-1.2, 0.2, 1.7]}>
          <sphereGeometry args={[0.12, 12, 12]} />
          <meshStandardMaterial color="#f59e0b" emissive="#f59e0b" emissiveIntensity={1.2} />
        </mesh>
      </group>
    </group>
  );
}

function SceneRoad({ phase }: { phase: CarPhase }) {
  const trafficLightColor = phase === 'intersectionStop' ? '#dc2626' : '#16a34a';
  const { roadCurve, laneWidth, shoulderWidth, lanes, stopAtT } = useMemo(() => {
    const points = [
      new THREE.Vector3(-34, 0, 26),
      new THREE.Vector3(-18, 0, 18),
      new THREE.Vector3(-6, 0, 6),
      new THREE.Vector3(-2, 0, -10),
      new THREE.Vector3(-10, 0, -26),
      new THREE.Vector3(6, 0, -34),
      new THREE.Vector3(22, 0, -18),
      new THREE.Vector3(32, 0, 0),
      new THREE.Vector3(24, 0, 20),
      new THREE.Vector3(6, 0, 32),
      new THREE.Vector3(-12, 0, 32),
    ];
    const curve = new THREE.CatmullRomCurve3(points, true, 'catmullrom', 0.5);
    return { roadCurve: curve, laneWidth: 3.6, shoulderWidth: 1.2, lanes: 2, stopAtT: 0.34 };
  }, []);

  const roadGeometry = useMemo(() => {
    const steps = 260;
    const halfWidth = (laneWidth * lanes) / 2 + shoulderWidth;
    const left: number[] = [];
    const right: number[] = [];
    const up = new THREE.Vector3(0, 1, 0);

    for (let i = 0; i <= steps; i += 1) {
      const t = i / steps;
      const p = roadCurve.getPointAt(t);
      const tan = roadCurve.getTangentAt(t).normalize();
      const normal = new THREE.Vector3().crossVectors(up, tan).normalize();
      const l = p.clone().add(normal.clone().multiplyScalar(halfWidth));
      const r = p.clone().add(normal.clone().multiplyScalar(-halfWidth));
      left.push(l.x, 0.02, l.z);
      right.push(r.x, 0.02, r.z);
    }

    const positions: number[] = [];
    const uvs: number[] = [];
    const indices: number[] = [];

    for (let i = 0; i <= steps; i += 1) {
      const lx = left[i * 3 + 0];
      const ly = left[i * 3 + 1];
      const lz = left[i * 3 + 2];
      const rx = right[i * 3 + 0];
      const ry = right[i * 3 + 1];
      const rz = right[i * 3 + 2];

      positions.push(lx, ly, lz, rx, ry, rz);
      uvs.push(0, i / steps, 1, i / steps);
    }

    for (let i = 0; i < steps; i += 1) {
      const a = i * 2;
      const b = i * 2 + 1;
      const c = i * 2 + 2;
      const d = i * 2 + 3;
      indices.push(a, b, c, b, d, c);
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();
    return geometry;
  }, [laneWidth, lanes, roadCurve, shoulderWidth]);

  const stopPoint = useMemo(() => roadCurve.getPointAt(stopAtT), [roadCurve, stopAtT]);
  const stopTangent = useMemo(() => roadCurve.getTangentAt(stopAtT).normalize(), [roadCurve, stopAtT]);
  const stopYaw = useMemo(() => Math.atan2(stopTangent.x, stopTangent.z), [stopTangent]);

  const markingLines = useMemo(() => {
    const steps = 220;
    const up = new THREE.Vector3(0, 1, 0);
    const center: THREE.Vector3[] = [];
    const lane1: THREE.Vector3[] = [];
    const lane2: THREE.Vector3[] = [];
    const leftEdge: THREE.Vector3[] = [];
    const rightEdge: THREE.Vector3[] = [];
    const halfWidth = (laneWidth * lanes) / 2 + shoulderWidth;

    for (let i = 0; i <= steps; i += 1) {
      const t = i / steps;
      const p = roadCurve.getPointAt(t);
      const tan = roadCurve.getTangentAt(t).normalize();
      const normal = new THREE.Vector3().crossVectors(up, tan).normalize();

      center.push(new THREE.Vector3(p.x, 0.05, p.z));
      lane1.push(new THREE.Vector3(p.x + normal.x * (laneWidth / 2), 0.05, p.z + normal.z * (laneWidth / 2)));
      lane2.push(new THREE.Vector3(p.x - normal.x * (laneWidth / 2), 0.05, p.z - normal.z * (laneWidth / 2)));
      leftEdge.push(new THREE.Vector3(p.x + normal.x * halfWidth, 0.05, p.z + normal.z * halfWidth));
      rightEdge.push(new THREE.Vector3(p.x - normal.x * halfWidth, 0.05, p.z - normal.z * halfWidth));
    }

    return { center, lane1, lane2, leftEdge, rightEdge };
  }, [laneWidth, lanes, roadCurve, shoulderWidth]);

  const guardrailSegments = useMemo(() => {
    const segments: { left: THREE.Vector3; right: THREE.Vector3; yaw: number }[] = [];
    const steps = 90;
    const up = new THREE.Vector3(0, 1, 0);
    const halfWidth = (laneWidth * lanes) / 2 + shoulderWidth;
    for (let i = 0; i < steps; i += 1) {
      const t = i / steps;
      const p = roadCurve.getPointAt(t);
      const tan = roadCurve.getTangentAt(t).normalize();
      const normal = new THREE.Vector3().crossVectors(up, tan).normalize();
      const yaw = Math.atan2(tan.x, tan.z);
      segments.push({
        left: new THREE.Vector3(p.x + normal.x * (halfWidth + 0.45), 0.45, p.z + normal.z * (halfWidth + 0.45)),
        right: new THREE.Vector3(p.x - normal.x * (halfWidth + 0.45), 0.45, p.z - normal.z * (halfWidth + 0.45)),
        yaw,
      });
    }
    return segments;
  }, [laneWidth, lanes, roadCurve, shoulderWidth]);

  const medianSegments = useMemo(() => {
    const segments: { pos: THREE.Vector3; yaw: number }[] = [];
    const steps = 90;
    for (let i = 0; i < steps; i += 1) {
      const t = i / steps;
      const p = roadCurve.getPointAt(t);
      const tan = roadCurve.getTangentAt(t).normalize();
      const yaw = Math.atan2(tan.x, tan.z);
      segments.push({ pos: new THREE.Vector3(p.x, 0.18, p.z), yaw });
    }
    return segments;
  }, [roadCurve]);

  return (
    <>
      <mesh rotation-x={-Math.PI / 2} receiveShadow>
        <planeGeometry args={[140, 140]} />
        <meshStandardMaterial color="#93c5fd" />
      </mesh>

      <mesh geometry={roadGeometry} receiveShadow>
        <meshStandardMaterial color="#374151" roughness={0.9} metalness={0.05} />
      </mesh>

      <Line points={markingLines.leftEdge} color="#f8fafc" lineWidth={2} />
      <Line points={markingLines.rightEdge} color="#f8fafc" lineWidth={2} />
      <Line points={markingLines.center} color="#facc15" lineWidth={2} />
      <Line points={markingLines.lane1} color="#e5e7eb" lineWidth={1} />
      <Line points={markingLines.lane2} color="#e5e7eb" lineWidth={1} />

      {medianSegments.map((s, idx) => (
        <mesh key={`median-${idx}`} position={[s.pos.x, s.pos.y, s.pos.z]} rotation={[0, s.yaw, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.6, 0.36, 0.7]} />
          <meshStandardMaterial color="#9ca3af" roughness={0.95} />
        </mesh>
      ))}

      {guardrailSegments.map((s, idx) => (
        <group key={`guard-${idx}`}>
          <mesh position={[s.left.x, s.left.y, s.left.z]} rotation={[0, s.yaw, 0]} castShadow>
            <boxGeometry args={[1.9, 0.16, 0.12]} />
            <meshStandardMaterial color="#e5e7eb" metalness={0.2} roughness={0.55} />
          </mesh>
          <mesh position={[s.right.x, s.right.y, s.right.z]} rotation={[0, s.yaw, 0]} castShadow>
            <boxGeometry args={[1.9, 0.16, 0.12]} />
            <meshStandardMaterial color="#e5e7eb" metalness={0.2} roughness={0.55} />
          </mesh>
        </group>
      ))}

      <group position={[stopPoint.x, 0.02, stopPoint.z]} rotation={[0, stopYaw, 0]}>
        <mesh rotation-x={-Math.PI / 2} receiveShadow>
          <planeGeometry args={[24, 18]} />
          <meshStandardMaterial color="#4b5563" roughness={0.9} />
        </mesh>
        <mesh position={[0, 0.03, 3.1]} rotation-x={-Math.PI / 2} receiveShadow>
          <planeGeometry args={[8, 0.4]} />
          <meshStandardMaterial color="#f8fafc" />
        </mesh>
      </group>

      <mesh position={[stopPoint.x, 2.6, stopPoint.z]} castShadow>
        <boxGeometry args={[0.2, 4.2, 0.2]} />
        <meshStandardMaterial color="#4b5563" />
      </mesh>
      <mesh position={[stopPoint.x, 4.4, stopPoint.z]} castShadow>
        <boxGeometry args={[1.1, 0.9, 0.6]} />
        <meshStandardMaterial color="#111827" />
      </mesh>
      <mesh position={[stopPoint.x, 4.4, stopPoint.z + 0.3]} castShadow>
        <sphereGeometry args={[0.18, 16, 16]} />
        <meshStandardMaterial color={trafficLightColor} emissive={trafficLightColor} emissiveIntensity={0.5} />
      </mesh>
    </>
  );
}

export default function CarDrivingSimulation({ onBack }: CarDrivingSimulationProps) {
  const { t } = useLanguage();
  const [phase, setPhase] = useState<CarPhase>('cruise');
  const [speed, setSpeed] = useState(0);
  const [mustangModel, setMustangModel] = useState<THREE.Object3D | null>(null);

  useEffect(() => {
    let active = true;

    const normalizeAndSetModel = (object: THREE.Object3D) => {
      if (!active) return;
      setMustangModel(prepareMustangModel(object));
    };

    const tryLoadObj = () => {
      const objLoader = new OBJLoader();
      objLoader.load(
        '/models/mustang_GT.obj',
        (obj) => {
          obj.traverse((node) => {
            if (node instanceof THREE.Mesh && !node.material) {
              node.material = new THREE.MeshStandardMaterial({
                color: '#e5e7eb',
                metalness: 0.35,
                roughness: 0.5,
              });
            }
          });
          normalizeAndSetModel(obj);
        },
        undefined,
        () => {
          if (!active) return;
          setMustangModel(null);
        },
      );
    };

    const loader = new GLTFLoader();
    loader.load(
      '/models/mustang.glb',
      (gltf) => {
        if (!active) return;
        normalizeAndSetModel(gltf.scene);
      },
      undefined,
      () => {
        if (!active) return;
        tryLoadObj();
      },
    );
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const timers = [
      window.setTimeout(() => setPhase('mergeIn'), 4500),
      window.setTimeout(() => setPhase('intersectionStop'), 9000),
      window.setTimeout(() => setPhase('mergeOut'), 14000),
    ];
    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, []);

  const phaseText = useMemo(() => {
    if (phase === 'cruise') return t('carPhaseCruise');
    if (phase === 'mergeIn') return t('carPhaseMergeIn');
    if (phase === 'intersectionStop') return t('carPhaseIntersectionStop');
    return t('carPhaseMergeOut');
  }, [phase, t]);

  return (
    <div className="relative h-screen w-full bg-[var(--bg-primary)]">
      <SceneHUD
        title={t('carTestMenu')}
        subtitle={t('sim3dSubtitle')}
        phaseLabel={`${t('simulationPhase')}: ${phaseText}`}
        speedLabel={`${t('simulationSpeed')}: ${speed} km/h`}
        onBack={onBack}
        backLabel={t('backToLanding')}
      />
      <Canvas shadows camera={{ position: [28, 20, 28], fov: 48 }} dpr={[1, 1.75]}>
        <color attach="background" args={['#a7d2ff']} />
        <ambientLight intensity={0.45} />
        <directionalLight position={[12, 15, 8]} intensity={1.2} castShadow shadow-mapSize-width={1024} shadow-mapSize-height={1024} />
        <Environment preset="city" />
        <SceneRoad phase={phase} />
        <SceneVehicle phase={phase} onSpeedChange={setSpeed} mustangModel={mustangModel} />
        <OrbitControls enablePan={false} minDistance={18} maxDistance={70} />
      </Canvas>
    </div>
  );
}
