import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { DeviceProfile } from '../hooks/useDeviceProfile';

interface ContactCTAProps {
  isActive: boolean;
  progress: number;
  profile: DeviceProfile;
}

export function ContactCTA({ isActive, progress, profile }: ContactCTAProps) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!groupRef.current || !isActive) return;

    // Gentle floating animation
    groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.05;
  });

  if (!isActive) return null;

  return (
    <group ref={groupRef}>
      {/* Product display case */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[3, 4, 1.5]} />
        <meshStandardMaterial
          color="#1E1E1E"
          metalness={0.9}
          roughness={0.1}
          transparent
          opacity={0.9}
        />
      </mesh>

      {/* Glass front */}
      <mesh position={[0, 0, 0.76]}>
        <planeGeometry args={[2.8, 3.8]} />
        <meshStandardMaterial
          color="#FFFFFF"
          metalness={0}
          roughness={0}
          transparent
          opacity={0.1}
        />
      </mesh>

      {/* Product inside */}
      <mesh position={[0, 0.3, 0]} castShadow>
        <boxGeometry args={[1.2, 1.8, 0.4]} />
        <meshStandardMaterial
          color="#3D2B1F"
          roughness={0.3}
          metalness={0.2}
        />
      </mesh>

      {/* Product label */}
      <mesh position={[0, 0.5, 0.21]}>
        <planeGeometry args={[0.9, 1.2]} />
        <meshStandardMaterial
          color="#FFF8E1"
          roughness={0.9}
        />
      </mesh>

      {/* Spotlights */}
      <pointLight position={[0, 3, 2]} intensity={1} color="#FFF8E1" />
      <pointLight position={[-2, 1, 2]} intensity={0.5} color="#C4956A" />
      <pointLight position={[2, 1, 2]} intensity={0.5} color="#C4956A" />

      {/* Reflection plane */}
      <mesh position={[0, -2.5, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[8, 8]} />
        <meshStandardMaterial
          color="#1E1E1E"
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>

      {/* Floating accent particles */}
      {profile.enableParticles && Array.from({ length: 20 }).map((_, i) => (
        <mesh
          key={i}
          position={[
            (Math.random() - 0.5) * 6,
            (Math.random() - 0.5) * 4 + 2,
            (Math.random() - 0.5) * 4,
          ]}
        >
          <sphereGeometry args={[0.03, 8, 8]} />
          <meshBasicMaterial
            color="#C4956A"
            transparent
            opacity={0.6}
          />
        </mesh>
      ))}
    </group>
  );
}
