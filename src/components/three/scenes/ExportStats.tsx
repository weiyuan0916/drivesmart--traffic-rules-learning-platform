import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { DeviceProfile } from '../hooks/useDeviceProfile';

interface ExportStatsProps {
  isActive: boolean;
  progress: number;
  profile: DeviceProfile;
}

const exportStats = [
  { value: 1000, label: 'Partner Farmers', suffix: '+' },
  { value: 500, label: 'Hectares Farmed', suffix: '+' },
  { value: 20, label: 'Export Markets', suffix: '+' },
  { value: 15, label: 'Years Experience', suffix: '+' },
];

export function ExportStats({ isActive, progress, profile }: ExportStatsProps) {
  const groupRef = useRef<THREE.Group>(null);
  const statRefs = useRef<(THREE.Group | null)[]>([]);

  useFrame((state) => {
    if (!groupRef.current || !isActive) return;

    // Gentle rotation
    groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.2) * 0.05;

    // Animate stat counters
    statRefs.current.forEach((stat, i) => {
      if (!stat) return;
      const t = state.clock.elapsedTime * 0.5 + i * 0.5;
      const scale = 1 + Math.sin(t) * 0.05;
      stat.scale.setScalar(scale);
    });
  });

  if (!isActive) return null;

  return (
    <group ref={groupRef}>
      {/* Stats arranged in a circular pattern */}
      {exportStats.map((stat, i) => {
        const angle = (i / exportStats.length) * Math.PI * 2 - Math.PI / 2;
        const radius = 4;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;

        return (
          <group key={stat.label} position={[x, 0, z]}>
            {/* Stat card background */}
            <mesh position={[0, 0, 0]}>
              <boxGeometry args={[2, 2, 0.1]} />
              <meshStandardMaterial
                color="#1E1E1E"
                transparent
                opacity={0.8}
                metalness={0.3}
                roughness={0.5}
              />
            </mesh>

            {/* Glow border */}
            <mesh position={[0, 0, -0.01]}>
              <planeGeometry args={[2.1, 2.1]} />
              <meshBasicMaterial
                color="#C4956A"
                transparent
                opacity={0.3}
                side={THREE.DoubleSide}
              />
            </mesh>

            {/* Value display area (represented as geometric shapes) */}
            <group ref={(el) => { statRefs.current[i] = el; }}>
              {[0, 1, 2].map((j) => (
                <mesh
                  key={j}
                  position={[
                    -0.4 + j * 0.4,
                    0.3,
                    0.06
                  ]}
                >
                  <boxGeometry args={[0.25, 0.08, 0.01]} />
                  <meshStandardMaterial
                    color="#C4956A"
                    emissive="#C4956A"
                    emissiveIntensity={0.3}
                  />
                </mesh>
              ))}
              {[0, 1, 2, 3, 4, 5].map((j) => (
                <mesh
                  key={j}
                  position={[
                    -0.5 + j * 0.2,
                    0,
                    0.06
                  ]}
                >
                  <boxGeometry args={[0.1, 0.4 + Math.random() * 0.3, 0.01]} />
                  <meshStandardMaterial
                    color="#FFF8E1"
                    emissive="#FFF8E1"
                    emissiveIntensity={0.1}
                  />
                </mesh>
              ))}
            </group>

            {/* Label area */}
            <mesh position={[0, -0.5, 0.06]}>
              <planeGeometry args={[1.5, 0.3]} />
              <meshBasicMaterial
                color="#8B7355"
                transparent
                opacity={0.6}
              />
            </mesh>
          </group>
        );
      })}

      {/* Central connecting ring */}
      <mesh position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[2.8, 3, 32]} />
        <meshBasicMaterial
          color="#C4956A"
          transparent
          opacity={0.2}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Animated particles around stats */}
      {profile.enableParticles && Array.from({ length: 30 }).map((_, i) => {
        const angle = (i / 30) * Math.PI * 2;
        return (
          <mesh
            key={i}
            position={[
              Math.cos(angle + Date.now() * 0.001) * 5,
              Math.sin(Date.now() * 0.002 + i) * 0.5,
              Math.sin(angle + Date.now() * 0.001) * 5,
            ]}
          >
            <sphereGeometry args={[0.03, 8, 8]} />
            <meshBasicMaterial color="#C4956A" />
          </mesh>
        );
      })}
    </group>
  );
}
