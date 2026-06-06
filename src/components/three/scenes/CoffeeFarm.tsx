import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { DeviceProfile } from '../hooks/useDeviceProfile';

interface CoffeeFarmProps {
  isActive: boolean;
  progress: number;
  profile: DeviceProfile;
}

export function CoffeeFarm({ isActive, progress, profile }: CoffeeFarmProps) {
  const groupRef = useRef<THREE.Group>(null);

  // Coffee plant geometry (simplified tree-like structure)
  const createCoffeePlant = (x: number, z: number, scale: number = 1) => (
    <group position={[x, 0, z]} scale={scale}>
      {/* Trunk */}
      <mesh position={[0, 0.5, 0]} castShadow>
        <cylinderGeometry args={[0.05, 0.08, 1, 8]} />
        <meshStandardMaterial color="#5D4037" roughness={0.9} />
      </mesh>
      {/* Leaves (simplified spheres) */}
      <mesh position={[0, 1.2, 0]} castShadow>
        <sphereGeometry args={[0.4, 8, 8]} />
        <meshStandardMaterial color="#2E7D32" roughness={0.8} />
      </mesh>
      {/* Coffee cherries (small red spheres) */}
      {[[-0.15, 1.1, 0.1], [0.15, 1.2, -0.1], [0, 1.3, 0.15]].map((pos, i) => (
        <mesh key={i} position={pos as [number, number, number]} castShadow>
          <sphereGeometry args={[0.06, 8, 8]} />
          <meshStandardMaterial color="#C62828" roughness={0.6} />
        </mesh>
      ))}
    </group>
  );

  // Generate farm rows
  const farmRows = useMemo(() => {
    const rows = [];
    for (let z = -8; z <= 8; z += 2) {
      for (let x = -10; x <= 10; x += 1.5) {
        rows.push(createCoffeePlant(x, z, 0.7 + Math.random() * 0.3));
      }
    }
    return rows;
  }, []);

  useFrame((state) => {
    if (!groupRef.current || !isActive) return;

    // Subtle swaying animation
    groupRef.current.children.forEach((child, i) => {
      if (child instanceof THREE.Group) {
        child.rotation.z = Math.sin(state.clock.elapsedTime + i * 0.1) * 0.02;
      }
    });
  });

  if (!isActive) return null;

  return (
    <group ref={groupRef}>
      {/* Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[40, 40]} />
        <meshStandardMaterial color="#5D4037" roughness={1} />
      </mesh>

      {/* Coffee plants */}
      {farmRows}

      {/* Sun rays effect (simplified) */}
      <mesh position={[0, 10, -15]}>
        <sphereGeometry args={[2, 16, 16]} />
        <meshBasicMaterial color="#FFF59D" transparent opacity={0.8} />
      </mesh>
    </group>
  );
}
