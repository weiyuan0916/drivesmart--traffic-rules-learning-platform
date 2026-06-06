import { Suspense, useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { Preload } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette, ChromaticAberration } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import { useDeviceProfile } from './hooks/useDeviceProfile';
import { Scene } from './Scene';
import { Vector2 } from 'three';

interface AgriCanvasProps {
  scrollProgress: number;
  onLoaded?: () => void;
}

function LoadingFallback() {
  return (
    <mesh>
      <sphereGeometry args={[0.5, 16, 16]} />
      <meshStandardMaterial color="#3D2B1F" />
    </mesh>
  );
}

export function AgriCanvas({ scrollProgress, onLoaded }: AgriCanvasProps) {
  const profile = useDeviceProfile();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Simulate assets loading
    const timer = setTimeout(() => onLoaded?.(), 1500);
    return () => clearTimeout(timer);
  }, [onLoaded]);

  if (!mounted) {
    return <LoadingFallback />;
  }

  return (
    <div className="agri-canvas-container">
      <Canvas
        gl={{
          antialias: profile.antialias,
          alpha: true,
          powerPreference: profile.isMobile ? 'low-power' : 'high-performance',
          stencil: false,
          depth: true,
        }}
        dpr={profile.dpr}
        camera={{ position: [0, 2, 10], fov: 50, near: 0.1, far: 1000 }}
        shadows={profile.enableShadows}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          zIndex: 1,
          pointerEvents: 'none',
        }}
      >
        <Suspense fallback={<LoadingFallback />}>
          <Scene
            scrollProgress={scrollProgress}
            profile={profile}
          />

          {profile.enablePostProcessing && (
            <EffectComposer>
              <Bloom
                intensity={0.3}
                luminanceThreshold={0.8}
                luminanceSmoothing={0.9}
                blendFunction={BlendFunction.ADD}
              />
              <Vignette
                offset={0.3}
                darkness={0.4}
                blendFunction={BlendFunction.NORMAL}
              />
              <ChromaticAberration
                offset={new Vector2(0.0005, 0.0005)}
                blendFunction={BlendFunction.NORMAL}
              />
            </EffectComposer>
          )}

          <Preload all />
        </Suspense>
      </Canvas>
    </div>
  );
}
