import { useState, useEffect, useCallback } from 'react';
import { useMediaQuery } from '../hooks/useMediaQuery';

export interface DeviceProfile {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  pixelRatio: number;
  dpr: number;
  enableParticles: boolean;
  enablePostProcessing: boolean;
  enableShadows: boolean;
  particleCount: number;
  terrainSegments: number;
  fogDensity: number;
  antialias: boolean;
  shadowMapSize: number;
}

export function useDeviceProfile(): DeviceProfile {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const isTablet = useMediaQuery('(min-width: 769px) and (max-width: 1024px)');
  const isDesktop = useMediaQuery('(min-width: 1025px)');

  const [profile, setProfile] = useState<DeviceProfile>({
    isMobile,
    isTablet,
    isDesktop,
    pixelRatio: typeof window !== 'undefined' ? Math.min(window.devicePixelRatio, 2) : 1,
    dpr: typeof window !== 'undefined' ? Math.min(window.devicePixelRatio, 2) : 1,
    enableParticles: true,
    enablePostProcessing: !isMobile,
    enableShadows: !isMobile,
    particleCount: isMobile ? 500 : isTablet ? 1500 : 3000,
    terrainSegments: isMobile ? 32 : isTablet ? 64 : 128,
    fogDensity: isMobile ? 0.02 : 0.015,
    antialias: !isMobile,
    shadowMapSize: isMobile ? 512 : 1024,
  });

  useEffect(() => {
    const updateProfile = () => {
      const dpr = Math.min(window.devicePixelRatio, isMobile ? 1.5 : 2);
      setProfile({
        isMobile,
        isTablet,
        isDesktop,
        pixelRatio: dpr,
        dpr,
        enableParticles: !isMobile,
        enablePostProcessing: !isMobile && !isTablet,
        enableShadows: !isMobile,
        particleCount: isMobile ? 300 : isTablet ? 1000 : 3000,
        terrainSegments: isMobile ? 32 : isTablet ? 64 : 128,
        fogDensity: isMobile ? 0.03 : 0.015,
        antialias: !isMobile,
        shadowMapSize: isMobile ? 256 : 1024,
      });
    };

    updateProfile();
    window.addEventListener('resize', updateProfile);
    return () => window.removeEventListener('resize', updateProfile);
  }, [isMobile, isTablet, isDesktop]);

  return profile;
}
