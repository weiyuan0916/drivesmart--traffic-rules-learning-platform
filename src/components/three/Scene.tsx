import { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { DeviceProfile } from './hooks/useDeviceProfile';
import { HighlandsLandscape } from './scenes/HighlandsLandscape';
import { CoffeeFarm } from './scenes/CoffeeFarm';
import { FloatingBean } from './scenes/FloatingBean';
import { BeanTransform } from './scenes/BeanTransform';
import { ProductShowcase3D } from './scenes/ProductShowcase3D';
import { FarmerStory } from './scenes/FarmerStory';
import { ExportStats } from './scenes/ExportStats';
import { ContactCTA } from './scenes/ContactCTA';

interface SceneProps {
  scrollProgress: number;
  profile: DeviceProfile;
}

export function Scene({ scrollProgress, profile }: SceneProps) {
  const { camera } = useThree();

  // Scene thresholds (0-1 scroll progress mapped to scenes)
  const sceneConfig = useMemo(() => [
    { start: 0.00, end: 0.12, component: HighlandsLandscape },
    { start: 0.12, end: 0.25, component: CoffeeFarm },
    { start: 0.25, end: 0.38, component: FloatingBean },
    { start: 0.38, end: 0.50, component: BeanTransform },
    { start: 0.50, end: 0.62, component: ProductShowcase3D },
    { start: 0.62, end: 0.75, component: FarmerStory },
    { start: 0.75, end: 0.88, component: ExportStats },
    { start: 0.88, end: 1.00, component: ContactCTA },
  ], []);

  // Camera movement based on scroll
  useFrame(() => {
    const cam = camera;

    // Scene 1: Highlands - slow orbit
    if (scrollProgress < 0.12) {
      const t = scrollProgress / 0.12;
      cam.position.set(
        Math.sin(t * Math.PI) * 5,
        3 + Math.cos(t * Math.PI) * 1.5,
        10 - t * 3
      );
      cam.lookAt(0, 0, 0);
    }
    // Scene 2: Flying over farms - forward sweep
    else if (scrollProgress < 0.25) {
      const t = (scrollProgress - 0.12) / 0.13;
      cam.position.set(
        -8 + t * 16,
        5 - t * 3,
        5 - t * 10
      );
      cam.lookAt(
        -8 + t * 16 + 2,
        1,
        5 - t * 10 - 5
      );
    }
    // Scene 3-4: Coffee bean close-up
    else if (scrollProgress < 0.50) {
      const t = (scrollProgress - 0.25) / 0.25;
      cam.position.set(
        0,
        4 - t * 3,
        8 - t * 6
      );
      cam.lookAt(0, 0, 0);
    }
    // Scene 5: Product showcase - orbit
    else if (scrollProgress < 0.62) {
      const t = (scrollProgress - 0.50) / 0.12;
      cam.position.set(
        Math.sin(t * Math.PI * 2) * 8,
        3 + Math.sin(t * Math.PI) * 1,
        Math.cos(t * Math.PI * 2) * 8
      );
      cam.lookAt(0, 0, 0);
    }
    // Scene 6-7: Farmer + stats - pull back
    else if (scrollProgress < 0.88) {
      const t = (scrollProgress - 0.62) / 0.26;
      cam.position.set(
        0,
        5 - t * 2,
        5 + t * 10
      );
      cam.lookAt(0, 1, 0);
    }
    // Scene 8: Contact - center
    else {
      cam.position.set(0, 2, 12);
      cam.lookAt(0, 0, 0);
    }
  });

  // Background color transition
  const bgColors = useMemo(() => [
    '#FAF8F3', // Scene 1: Cream
    '#4A7C59', // Scene 2: Forest green
    '#3D2B1F', // Scene 3-4: Coffee brown
    '#F6D860', // Scene 5: Durian gold
    '#E8D5B7', // Scene 6: Warm beige
    '#2E4A1C', // Scene 7: Deep forest
    '#1E1E1E', // Scene 8: Dark
  ], []);

  const currentBgIndex = useMemo(() => {
    if (scrollProgress < 0.12) return 0;
    if (scrollProgress < 0.25) return 1;
    if (scrollProgress < 0.38) return 2;
    if (scrollProgress < 0.50) return 2;
    if (scrollProgress < 0.62) return 3;
    if (scrollProgress < 0.75) return 4;
    if (scrollProgress < 0.88) return 5;
    return 6;
  }, [scrollProgress]);

  // Ambient lighting
  const ambientColor = useMemo(() => {
    const colors = ['#FFF8F0', '#E8F5E9', '#FFF8E1', '#FFFDE7', '#FFF3E0', '#E0F2F1', '#263238'];
    return colors[currentBgIndex];
  }, [currentBgIndex]);

  return (
    <>
      {/* Environment lighting */}
      <ambientLight intensity={0.4} color={ambientColor} />
      <directionalLight
        position={[10, 20, 10]}
        intensity={1.2}
        color="#FFFAF0"
        castShadow={profile.enableShadows}
        shadow-mapSize={[profile.shadowMapSize, profile.shadowMapSize]}
      />
      <pointLight position={[-10, 10, -10]} intensity={0.5} color="#FFF0D0" />

      {/* Fog for depth */}
      <fog attach="fog" args={[bgColors[currentBgIndex], 20, 100]} />

      {/* Background */}
      <color attach="background" args={[bgColors[currentBgIndex]]} />

      {/* Render active scene based on scroll */}
      {sceneConfig.map(({ start, end, component: Component }, index) => {
        const isActive = scrollProgress >= start && scrollProgress < end;
        const localProgress = isActive
          ? (scrollProgress - start) / (end - start)
          : 0;

        return (
          <Component
            key={index}
            isActive={isActive}
            progress={localProgress}
            profile={profile}
          />
        );
      })}
    </>
  );
}
