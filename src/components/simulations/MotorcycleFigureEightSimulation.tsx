import { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, Line, OrbitControls } from '@react-three/drei';
import type { Group } from 'three';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { useLanguage } from '../../context/LanguageContext';
import SceneHUD from './common/SceneHUD';

interface MotorcycleFigureEightSimulationProps {
  onBack: () => void;
}

function MotorcycleFallback() {
  return (
    <group>
      <mesh castShadow>
        <boxGeometry args={[0.55, 0.55, 1.8]} />
        <meshStandardMaterial color="#7c2d12" metalness={0.4} roughness={0.35} />
      </mesh>
      <mesh position={[0, 0.1, 0.95]} castShadow>
        <torusGeometry args={[0.25, 0.08, 16, 32]} />
        <meshStandardMaterial color="#111827" />
      </mesh>
      <mesh position={[0, 0.1, -0.95]} castShadow>
        <torusGeometry args={[0.25, 0.08, 16, 32]} />
        <meshStandardMaterial color="#111827" />
      </mesh>
    </group>
  );
}

function FigureEightPathVehicle({
  motorcycleModel,
  onSpeedChange,
  onLeanChange,
}: {
  motorcycleModel: THREE.Object3D | null;
  onSpeedChange: (speed: number) => void;
  onLeanChange: (degrees: number) => void;
}) {
  const bikeRef = useRef<Group>(null);
  const timeRef = useRef(0);

  useFrame((_, delta) => {
    const bike = bikeRef.current;
    if (!bike) return;

    timeRef.current += delta * 0.55;
    const t = timeRef.current;
    const a = 4.2;

    const x = a * Math.sin(t);
    const z = a * Math.sin(t) * Math.cos(t);

    const dt = 0.01;
    const x2 = a * Math.sin(t + dt);
    const z2 = a * Math.sin(t + dt) * Math.cos(t + dt);
    const heading = Math.atan2(z2 - z, x2 - x);

    const lean = THREE.MathUtils.clamp((z2 - z) * 2.6, -0.38, 0.38);

    bike.position.set(x, 0.36, z);
    bike.rotation.y = -heading + Math.PI / 2;
    bike.rotation.z = lean;

    onLeanChange(Math.round(THREE.MathUtils.radToDeg(lean)));
    onSpeedChange(14);
  });

  return (
    <group ref={bikeRef}>
      {motorcycleModel ? <primitive object={motorcycleModel} scale={0.78} /> : <MotorcycleFallback />}
    </group>
  );
}

function FigureEightTrack() {
  const points = useMemo(() => {
    const values: THREE.Vector3[] = [];
    for (let i = 0; i <= 220; i += 1) {
      const t = (i / 220) * Math.PI * 2;
      values.push(new THREE.Vector3(4.2 * Math.sin(t), 0.01, 4.2 * Math.sin(t) * Math.cos(t)));
    }
    return values;
  }, []);

  return (
    <>
      <mesh rotation-x={-Math.PI / 2} receiveShadow>
        <planeGeometry args={[24, 24]} />
        <meshStandardMaterial color="#c7d2fe" />
      </mesh>
      <Line points={points} color="#1e3a8a" lineWidth={3} />
      <mesh position={[0, 0.07, 0]} castShadow>
        <cylinderGeometry args={[0.25, 0.25, 0.14, 20]} />
        <meshStandardMaterial color="#dc2626" />
      </mesh>
    </>
  );
}

export default function MotorcycleFigureEightSimulation({ onBack }: MotorcycleFigureEightSimulationProps) {
  const { t } = useLanguage();
  const [motorcycleModel, setMotorcycleModel] = useState<THREE.Object3D | null>(null);
  const [speed, setSpeed] = useState(0);
  const [lean, setLean] = useState(0);

  useEffect(() => {
    const loader = new GLTFLoader();
    loader.load(
      '/models/motorcycle-large.glb',
      (gltf) => setMotorcycleModel(gltf.scene.clone()),
      undefined,
      () => setMotorcycleModel(null),
    );
    return () => {
      setMotorcycleModel(null);
    };
  }, []);

  return (
    <div className="relative h-screen w-full bg-[var(--bg-primary)]">
      <SceneHUD
        title={t('motorcycleTestMenu')}
        subtitle={t('motorcycleFigureEightSubtitle')}
        phaseLabel={`${t('simulationLean')}: ${lean}°`}
        speedLabel={`${t('simulationSpeed')}: ${speed} km/h`}
        onBack={onBack}
        backLabel={t('backToLanding')}
      />
      <Canvas shadows camera={{ position: [0, 11, 12], fov: 42 }} dpr={[1, 1.75]}>
        <color attach="background" args={['#bfdbfe']} />
        <ambientLight intensity={0.5} />
        <directionalLight position={[8, 13, 8]} intensity={1.1} castShadow shadow-mapSize-width={1024} shadow-mapSize-height={1024} />
        <Environment preset="sunset" />
        <FigureEightTrack />
        <FigureEightPathVehicle motorcycleModel={motorcycleModel} onSpeedChange={setSpeed} onLeanChange={setLean} />
        <OrbitControls enablePan={false} minDistance={7} maxDistance={20} />
      </Canvas>
    </div>
  );
}
