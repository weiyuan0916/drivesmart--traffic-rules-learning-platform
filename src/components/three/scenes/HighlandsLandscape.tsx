import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { DeviceProfile } from '../hooks/useDeviceProfile';

interface HighlandsLandscapeProps {
  isActive: boolean;
  progress: number;
  profile: DeviceProfile;
}

export function HighlandsLandscape({ isActive, progress, profile }: HighlandsLandscapeProps) {
  const groupRef = useRef<THREE.Group>(null);
  const particlesRef = useRef<THREE.Points>(null);

  // Mountain terrain geometry
  const terrainGeometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(60, 40, profile.terrainSegments, profile.terrainSegments);
    const positions = geo.attributes.position.array as Float32Array;

    for (let i = 0; i < positions.length; i += 3) {
      const x = positions[i];
      const y = positions[i + 1];
      // Create mountainous terrain with noise-like displacement
      positions[i + 2] =
        Math.sin(x * 0.1) * Math.cos(y * 0.15) * 3 +
        Math.sin(x * 0.3 + y * 0.2) * 1.5 +
        Math.sin(x * 0.05 - y * 0.08) * 2;
    }

    geo.computeVertexNormals();
    return geo;
  }, [profile.terrainSegments]);

  // Floating particles for atmosphere
  const particlesGeometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const count = profile.particleCount;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 50;
      positions[i * 3 + 1] = Math.random() * 20;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 30;

      // Warm golden particles
      colors[i * 3] = 1.0;
      colors[i * 3 + 1] = 0.9 + Math.random() * 0.1;
      colors[i * 3 + 2] = 0.7 + Math.random() * 0.2;
    }

    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    return geo;
  }, [profile.particleCount]);

  // Animate particles floating
  useFrame((state) => {
    if (!particlesRef.current || !isActive) return;

    const positions = particlesRef.current.geometry.attributes.position.array as Float32Array;
    const time = state.clock.elapsedTime;

    for (let i = 0; i < positions.length; i += 3) {
      positions[i + 1] += Math.sin(time * 0.5 + i) * 0.002;
    }

    particlesRef.current.geometry.attributes.position.needsUpdate = true;
    particlesRef.current.rotation.y = time * 0.02;
  });

  // Animate group entrance
  useFrame(() => {
    if (!groupRef.current) return;

    if (isActive) {
      groupRef.current.rotation.y = THREE.MathUtils.lerp(
        groupRef.current.rotation.y,
        progress * Math.PI * 0.5,
        0.05
      );
    }
  });

  if (!isActive && progress === 0) return null;

  return (
    <group ref={groupRef} scale={isActive ? 1 : 0.8}>
      {/* Mountain terrain */}
      <mesh
        geometry={terrainGeometry}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -2, 0]}
        receiveShadow
      >
        <meshStandardMaterial
          color="#4A7C59"
          roughness={0.9}
          metalness={0.1}
          flatShading
        />
      </mesh>

      {/* Second layer of mountains */}
      <mesh
        position={[0, -3, -15]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <planeGeometry args={[80, 30, profile.terrainSegments / 2, profile.terrainSegments / 2]} />
        <meshStandardMaterial
          color="#3D6B4F"
          roughness={1}
          metalness={0}
        />
      </mesh>

      {/* Atmospheric particles */}
      {profile.enableParticles && (
        <points ref={particlesRef} geometry={particlesGeometry}>
          <pointsMaterial
            size={0.08}
            vertexColors
            transparent
            opacity={0.6}
            sizeAttenuation
          />
        </points>
      )}

      {/* Sun/light source */}
      <mesh position={[15, 15, -20]}>
        <sphereGeometry args={[3, 32, 32]} />
        <meshBasicMaterial color="#FFF8E1" />
      </mesh>
    </group>
  );
}
