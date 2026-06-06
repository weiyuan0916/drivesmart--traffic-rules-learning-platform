import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { DeviceProfile } from '../hooks/useDeviceProfile';
import { products } from '../../marketing/data/products';

interface ProductShowcase3DProps {
  isActive: boolean;
  progress: number;
  profile: DeviceProfile;
}

export function ProductShowcase3D({ isActive, progress, profile }: ProductShowcase3DProps) {
  const groupRef = useRef<THREE.Group>(null);
  const carouselRef = useRef<THREE.Group>(null);

  const activeIndex = useMemo(() => {
    return Math.floor(progress * products.length) % products.length;
  }, [progress]);

  const rotationY = useMemo(() => {
    return (activeIndex / products.length) * Math.PI * 2;
  }, [activeIndex]);

  useFrame((state) => {
    if (!groupRef.current || !isActive) return;

    // Gentle float animation
    groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;

    // Rotate carousel
    if (carouselRef.current) {
      carouselRef.current.rotation.y = THREE.MathUtils.lerp(
        carouselRef.current.rotation.y,
        rotationY,
        0.05
      );
    }
  });

  if (!isActive) return null;

  const product = products[activeIndex];

  return (
    <group ref={groupRef}>
      {/* Rotating product platform */}
      <mesh position={[0, -1, 0]} receiveShadow>
        <cylinderGeometry args={[2.5, 2.5, 0.1, 32]} />
        <meshStandardMaterial color="#2E2E2E" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Product carousel */}
      <group ref={carouselRef}>
        {products.map((p, i) => {
          const angle = (i / products.length) * Math.PI * 2;
          const x = Math.cos(angle) * 3;
          const z = Math.sin(angle) * 3;

          return (
            <group key={p.id} position={[x, 0, z]} rotation={[0, -angle, 0]}>
              {/* Product packaging */}
              <mesh castShadow>
                <boxGeometry args={[0.8, 1.2, 0.3]} />
                <meshStandardMaterial
                  color={p.bgColor}
                  roughness={0.3}
                  metalness={0.1}
                />
              </mesh>

              {/* Product label */}
              <mesh position={[0, 0.1, 0.16]}>
                <planeGeometry args={[0.6, 0.8]} />
                <meshStandardMaterial
                  color="#FFF8E1"
                  roughness={0.9}
                />
              </mesh>

              {/* Spotlight for active product */}
              {i === activeIndex && (
                <pointLight
                  position={[0, 3, 0]}
                  intensity={2}
                  color={p.accentColor}
                  distance={5}
                />
              )}
            </group>
          );
        })}
      </group>

      {/* Active product info */}
      <mesh position={[0, 2.5, 0]}>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshBasicMaterial color={product.accentColor} />
      </mesh>

      {/* Particle ring */}
      <mesh position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[4, 4.1, 64]} />
        <meshBasicMaterial
          color={product.accentColor}
          transparent
          opacity={0.3}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}
