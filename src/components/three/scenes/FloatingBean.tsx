import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { DeviceProfile } from '../hooks/useDeviceProfile';

interface FloatingBeanProps {
  isActive: boolean;
  progress: number;
  profile: DeviceProfile;
}

export function FloatingBean({ isActive, progress, profile }: FloatingBeanProps) {
  const beanRef = useRef<THREE.Group>(null);
  const glowRef = useRef<THREE.Mesh>(null);

  // Coffee bean shape (elongated sphere)
  const beanGeometry = useMemo(() => {
    const shape = new THREE.Shape();
    shape.ellipse(0, 0, 0.5, 0.8, 0, Math.PI * 2);
    const extrudeSettings = { depth: 0.3, bevelEnabled: true, bevelThickness: 0.05, bevelSize: 0.05 };
    return new THREE.ExtrudeGeometry(shape, extrudeSettings);
  }, []);

  // Particle ring around the bean
  const ringGeometry = useMemo(() => {
    const count = profile.particleCount / 10;
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const radius = 2 + Math.random() * 0.5;
      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 3;
      positions[i * 3 + 2] = Math.sin(angle) * radius;
    }

    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return geo;
  }, [profile.particleCount]);

  useFrame((state) => {
    if (!beanRef.current || !isActive) return;

    const time = state.clock.elapsedTime;

    // Floating animation
    beanRef.current.position.y = Math.sin(time * 0.8) * 0.3;
    beanRef.current.rotation.y = time * 0.3;
    beanRef.current.rotation.z = Math.sin(time * 0.5) * 0.1;

    // Glow pulsing
    if (glowRef.current) {
      const material = glowRef.current.material as THREE.MeshBasicMaterial;
      material.opacity = 0.3 + Math.sin(time * 2) * 0.15;
    }
  });

  if (!isActive) return null;

  return (
    <group ref={beanRef} scale={1 + progress * 0.3}>
      {/* Main coffee bean */}
      <mesh geometry={beanGeometry} castShadow>
        <meshStandardMaterial
          color="#3D2B1F"
          roughness={0.4}
          metalness={0.2}
        />
      </mesh>

      {/* Bean crease */}
      <mesh position={[0, 0, 0.15]}>
        <boxGeometry args={[0.08, 1.4, 0.02]} />
        <meshStandardMaterial color="#2A1F14" roughness={0.8} />
      </mesh>

      {/* Glow sphere */}
      <mesh ref={glowRef} scale={2}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshBasicMaterial
          color="#C4956A"
          transparent
          opacity={0.3}
        />
      </mesh>

      {/* Orbiting particles */}
      <points geometry={ringGeometry}>
        <pointsMaterial
          size={0.06}
          color="#C4956A"
          transparent
          opacity={0.8}
          sizeAttenuation
        />
      </points>

      {/* Light rays */}
      {[0, 60, 120, 180, 240, 300].map((angle, i) => (
        <mesh
          key={i}
          position={[
            Math.cos((angle * Math.PI) / 180) * 3,
            0,
            Math.sin((angle * Math.PI) / 180) * 3,
          ]}
          rotation={[0, 0, (angle * Math.PI) / 180]}
        >
          <planeGeometry args={[0.02, 2]} />
          <meshBasicMaterial
            color="#FFF8E1"
            transparent
            opacity={0.3}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </group>
  );
}
