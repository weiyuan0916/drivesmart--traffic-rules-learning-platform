import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { DeviceProfile } from '../hooks/useDeviceProfile';

interface FarmerStoryProps {
  isActive: boolean;
  progress: number;
  profile: DeviceProfile;
}

export function FarmerStory({ isActive, progress, profile }: FarmerStoryProps) {
  const groupRef = useRef<THREE.Group>(null);

  // Animated grain particles (like dust/soil)
  const grainGeometry = useMemo(() => {
    const count = profile.particleCount / 20;
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 1] = Math.random() * 10;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 20;
    }

    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return geo;
  }, [profile.particleCount]);

  useFrame((state) => {
    if (!groupRef.current || !isActive) return;

    // Subtle breathing animation
    const breathe = Math.sin(state.clock.elapsedTime * 0.5) * 0.02;
    groupRef.current.scale.setScalar(1 + breathe);
  });

  if (!isActive) return null;

  return (
    <group ref={groupRef}>
      {/* Silhouette of farmer (simplified geometric figure) */}
      <group position={[0, -1, 0]}>
        {/* Body */}
        <mesh position={[0, 1.5, 0]} castShadow>
          <capsuleGeometry args={[0.4, 1.5, 8, 16]} />
          <meshStandardMaterial color="#5D4037" roughness={0.9} />
        </mesh>

        {/* Head */}
        <mesh position={[0, 2.8, 0]} castShadow>
          <sphereGeometry args={[0.3, 16, 16]} />
          <meshStandardMaterial color="#8D6E63" roughness={0.8} />
        </mesh>

        {/* Hat (non la) */}
        <mesh position={[0, 3.15, 0]} castShadow>
          <cylinderGeometry args={[0.5, 0.3, 0.3, 16]} />
          <meshStandardMaterial color="#FDD835" roughness={0.9} />
        </mesh>

        {/* Arms holding basket */}
        <mesh position={[0.6, 1.8, 0.2]} rotation={[0.5, 0, 0.3]} castShadow>
          <capsuleGeometry args={[0.12, 0.8, 8, 16]} />
          <meshStandardMaterial color="#5D4037" roughness={0.9} />
        </mesh>
        <mesh position={[-0.6, 1.8, 0.2]} rotation={[0.5, 0, -0.3]} castShadow>
          <capsuleGeometry args={[0.12, 0.8, 8, 16]} />
          <meshStandardMaterial color="#5D4037" roughness={0.9} />
        </mesh>

        {/* Basket */}
        <mesh position={[0, 1.2, 0.5]} castShadow>
          <cylinderGeometry args={[0.5, 0.3, 0.4, 16]} />
          <meshStandardMaterial color="#A1887F" roughness={0.8} />
        </mesh>

        {/* Coffee cherries in basket */}
        {[0, 1, 2, 3, 4].map((i) => (
          <mesh key={i} position={[
            Math.sin(i) * 0.2,
            1.4,
            0.5 + Math.cos(i) * 0.2
          ]} castShadow>
            <sphereGeometry args={[0.08, 8, 8]} />
            <meshStandardMaterial color="#C62828" roughness={0.6} />
          </mesh>
        ))}
      </group>

      {/* Floating grain particles */}
      {profile.enableParticles && (
        <points geometry={grainGeometry}>
          <pointsMaterial
            size={0.05}
            color="#D7CCC8"
            transparent
            opacity={0.5}
            sizeAttenuation
          />
        </points>
      )}

      {/* Soft light rays */}
      {[0, 30, -30, 60, -60].map((angle, i) => (
        <mesh
          key={i}
          position={[Math.sin((angle * Math.PI) / 180) * 5, 5, 0]}
          rotation={[0, 0, (angle * Math.PI) / 180]}
        >
          <planeGeometry args={[0.1, 15]} />
          <meshBasicMaterial
            color="#FFF8E1"
            transparent
            opacity={0.05}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </group>
  );
}
