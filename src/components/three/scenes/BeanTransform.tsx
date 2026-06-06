import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { DeviceProfile } from '../hooks/useDeviceProfile';

interface BeanTransformProps {
  isActive: boolean;
  progress: number;
  profile: DeviceProfile;
}

export function BeanTransform({ isActive, progress, profile }: BeanTransformProps) {
  const groupRef = useRef<THREE.Group>(null);
  const boxRef = useRef<THREE.Mesh>(null);

  // Lerp between coffee bean shape and product box
  const morphScale = useMemo(() => {
    if (progress < 0.3) return 0;
    if (progress > 0.7) return 1;
    return (progress - 0.3) / 0.4;
  }, [progress]);

  useFrame((state) => {
    if (!groupRef.current || !isActive) return;

    // Slow rotation
    groupRef.current.rotation.y = state.clock.elapsedTime * 0.2;

    // Scale animation for morph effect
    if (boxRef.current) {
      const scale = 1 + morphScale * 0.5;
      boxRef.current.scale.set(scale, scale, scale * 0.5);
    }
  });

  if (!isActive) return null;

  const lerpedColor = useMemo(() => {
    const c1 = new THREE.Color('#3D2B1F');
    const c2 = new THREE.Color('#5D4037');
    return c1.lerp(c2, morphScale);
  }, [morphScale]);

  return (
    <group ref={groupRef}>
      {/* Coffee bean (morphing into product) */}
      <mesh ref={boxRef} castShadow>
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial
          color={lerpedColor}
          roughness={THREE.MathUtils.lerp(0.4, 0.2, morphScale)}
          metalness={THREE.MathUtils.lerp(0.2, 0.4, morphScale)}
        />
      </mesh>

      {/* Product label appearing */}
      {morphScale > 0.3 && (
        <mesh position={[0, 0.6, 0.9]} rotation={[0, 0, 0]}>
          <planeGeometry args={[1.2, 0.8]} />
          <meshStandardMaterial
            color="#FFF8E1"
            transparent
            opacity={Math.min((morphScale - 0.3) / 0.3, 1)}
          />
        </mesh>
      )}

      {/* Glow effect */}
      <mesh scale={1.5}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshBasicMaterial
          color="#C4956A"
          transparent
          opacity={0.2 * (1 - morphScale * 0.5)}
        />
      </mesh>

      {/* Steam particles rising */}
      {profile.enableParticles && Array.from({ length: 20 }).map((_, i) => (
        <mesh
          key={i}
          position={[
            Math.sin(i * 0.5) * 0.5,
            -1 + ((Date.now() / 50 + i * 0.3) % 3),
            Math.cos(i * 0.5) * 0.5,
          ]}
        >
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshBasicMaterial
            color="#FFF8E1"
            transparent
            opacity={0.3}
          />
        </mesh>
      ))}

      {/* Sparkles during transformation */}
      {morphScale > 0.2 && morphScale < 0.8 && profile.enableParticles && (
        <Sparkles count={50} progress={morphScale} />
      )}
    </group>
  );
}

function Sparkles({ count, progress }: { count: number; progress: number }) {
  const ref = useRef<THREE.Points>(null);

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 1 + Math.random() * 2;
      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 4;
      positions[i * 3 + 2] = Math.sin(angle) * radius;
    }

    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return geo;
  }, [count]);

  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.y = state.clock.elapsedTime;
    ref.current.rotation.x = state.clock.elapsedTime * 0.5;
  });

  return (
    <points ref={ref} geometry={geometry}>
      <pointsMaterial
        size={0.08}
        color="#FFD700"
        transparent
        opacity={Math.sin(progress * Math.PI) * 0.8}
        sizeAttenuation
      />
    </points>
  );
}
