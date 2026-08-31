import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { globalAudioPlayer } from '../audio/audioPlayer';

interface CosmicUniverseProps {
  isPlaying?: boolean;
}

export const CosmicUniverse: React.FC<CosmicUniverseProps> = ({ isPlaying = false }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const animFrameIdRef = useRef<number | null>(null);

  // Mouse & Parallax
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });
  const isPlayingRef = useRef(isPlaying);
  isPlayingRef.current = isPlaying;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 1. Scene setup
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x030508, 0.0008);
    sceneRef.current = scene;

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    // 2. Camera setup
    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 2000);
    camera.position.z = 600;
    cameraRef.current = camera;

    // 3. Renderer with WebGL (and fallback detection)
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
      });
    } catch (e) {
      console.warn('WebGL initialization fallback', e);
      renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true });
    }

    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x030508, 1);
    container.replaceChildren(renderer.domElement);
    rendererRef.current = renderer;

    // 4. Create Procedural GLSL Particle System
    const isMobile = window.innerWidth < 768;
    const particleCount = isMobile ? 2200 : 6500;

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.5 : 2));

    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const scales = new Float32Array(particleCount);
    const phases = new Float32Array(particleCount);

    // Color palettes: cyan, subtle gold, deep indigo, icy white
    const colorTeal = new THREE.Color(0x22d3ee); // Cyan
    const colorGold = new THREE.Color(0xf59e0b); // Gold
    const colorBlue = new THREE.Color(0x38bdf8); // Sky blue
    const colorWhite = new THREE.Color(0xf8fafc); // Bright star

    for (let i = 0; i < particleCount; i++) {
      // Cylindrical/spherical galactic distribution
      const radius = THREE.MathUtils.randFloat(30, 900);
      const theta = THREE.MathUtils.randFloat(0, Math.PI * 2);
      const z = THREE.MathUtils.randFloat(-600, 500);

      positions[i * 3] = Math.cos(theta) * radius;
      positions[i * 3 + 1] = Math.sin(theta) * radius * 0.7 + THREE.MathUtils.randFloatSpread(100);
      positions[i * 3 + 2] = z;

      // Color distribution (70% cyan/blue, 18% gold accents, 12% crisp white)
      const randType = Math.random();
      let pColor = colorBlue;
      if (randType > 0.85) {
        pColor = colorGold;
      } else if (randType > 0.65) {
        pColor = colorTeal;
      } else if (randType < 0.12) {
        pColor = colorWhite;
      }

      colors[i * 3] = pColor.r;
      colors[i * 3 + 1] = pColor.g;
      colors[i * 3 + 2] = pColor.b;

      scales[i] = THREE.MathUtils.randFloat(1.5, 4.2);
      phases[i] = THREE.MathUtils.randFloat(0, Math.PI * 2);
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('aScale', new THREE.BufferAttribute(scales, 1));
    geometry.setAttribute('aPhase', new THREE.BufferAttribute(phases, 1));

    // Custom Shader Material for glow & audio reactivity
    const customShaderMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0.0 },
        uAudioEnergy: { value: 0.0 },
      },
      vertexShader: `
        uniform float uTime;
        uniform float uAudioEnergy;
        attribute float aScale;
        attribute float aPhase;
        varying vec3 vColor;
        varying float vAlpha;

        void main() {
          vColor = color;
          
          // Organic slow floating drift
          vec3 transformed = position;
          transformed.x += sin(uTime * 0.3 + aPhase) * 12.0;
          transformed.y += cos(uTime * 0.2 + aPhase) * 10.0;
          transformed.z += sin(uTime * 0.15 + aPhase * 2.0) * (8.0 + uAudioEnergy * 25.0);

          vec4 mvPosition = modelViewMatrix * vec4(transformed, 1.0);
          
          // Audio-reactive size burst
          float audioMultiplier = 1.0 + uAudioEnergy * 1.6;
          gl_PointSize = (aScale * audioMultiplier) * (300.0 / -mvPosition.z);
          
          // Depth fading
          vAlpha = smoothstep(-200.0, -900.0, mvPosition.z) * 0.9 + 0.1;
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        varying vec3 vColor;
        varying float vAlpha;
        uniform float uAudioEnergy;

        void main() {
          // Circular particle shape with soft radial glow
          float dist = length(gl_PointCoord - vec2(0.5));
          if (dist > 0.5) discard;

          float intensity = smoothstep(0.5, 0.0, dist);
          intensity = pow(intensity, 1.8);

          vec3 finalColor = vColor + vec3(uAudioEnergy * 0.25, uAudioEnergy * 0.15, uAudioEnergy * 0.3);
          gl_FragColor = vec4(finalColor, intensity * vAlpha * (0.85 + uAudioEnergy * 0.4));
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      vertexColors: true,
    });

    const particleSystem = new THREE.Points(geometry, customShaderMaterial);
    scene.add(particleSystem);

    // 5. Constellation Guide Rings (Subtle sci-fi orbital telemetry grid)
    const ringGeo = new THREE.RingGeometry(240, 241, 64);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x22d3ee,
      transparent: true,
      opacity: 0.07,
      side: THREE.DoubleSide,
    });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.rotation.x = Math.PI / 2.8;
    ringMesh.position.z = -100;
    scene.add(ringMesh);

    const ringGeo2 = new THREE.RingGeometry(420, 421.5, 96);
    const ringMat2 = new THREE.MeshBasicMaterial({
      color: 0xf59e0b,
      transparent: true,
      opacity: 0.04,
      side: THREE.DoubleSide,
    });
    const ringMesh2 = new THREE.Mesh(ringGeo2, ringMat2);
    ringMesh2.rotation.x = Math.PI / 3.4;
    ringMesh2.rotation.y = Math.PI / 8;
    ringMesh2.position.z = -250;
    scene.add(ringMesh2);

    // Mouse listener
    const handleMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      mouseRef.current.targetX = (e.clientX / innerWidth - 0.5) * 80;
      mouseRef.current.targetY = (e.clientY / innerHeight - 0.5) * 60;
    };
    window.addEventListener('mousemove', handleMouseMove);

    // Resize observer
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width: newW, height: newH } = entry.contentRect;
        if (newW && newH && cameraRef.current && rendererRef.current) {
          cameraRef.current.aspect = newW / newH;
          cameraRef.current.updateProjectionMatrix();
          rendererRef.current.setSize(newW, newH);
        }
      }
    });
    resizeObserver.observe(container);

    // 6. Render Animation Loop
    let clock = new THREE.Clock();
    let currentEnergy = 0;

    const animate = () => {
      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      // Smooth mouse parallax damping
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.04;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.04;

      if (cameraRef.current) {
        cameraRef.current.position.x = mouseRef.current.x;
        cameraRef.current.position.y = -mouseRef.current.y;
        cameraRef.current.lookAt(0, 0, 0);
      }

      // Audio Reactivity Calculation
      let targetEnergy = 0;
      if (isPlayingRef.current) {
        const freqData = globalAudioPlayer.getFrequencyData();
        if (freqData && freqData.length > 0) {
          let sum = 0;
          for (let i = 0; i < 32; i++) {
            sum += freqData[i];
          }
          targetEnergy = Math.min(1.0, (sum / 32) / 140);
        } else {
          // Synthetic subtle pulsation if playing
          targetEnergy = (Math.sin(elapsed * 8) + 1) * 0.35;
        }
      }
      currentEnergy += (targetEnergy - currentEnergy) * 0.12;

      // Update shader uniforms
      customShaderMaterial.uniforms.uTime.value = elapsed;
      customShaderMaterial.uniforms.uAudioEnergy.value = currentEnergy;

      // Rotate orbital rings
      ringMesh.rotation.z = elapsed * 0.02;
      ringMesh2.rotation.z = -elapsed * 0.015;
      particleSystem.rotation.y = elapsed * 0.012;

      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }

      animFrameIdRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
      window.removeEventListener('mousemove', handleMouseMove);
      resizeObserver.disconnect();
      if (rendererRef.current && rendererRef.current.domElement) {
        rendererRef.current.dispose();
      }
      geometry.dispose();
      customShaderMaterial.dispose();
      ringGeo.dispose();
      ringMat.dispose();
      ringGeo2.dispose();
      ringMat2.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
      aria-hidden="true"
    />
  );
};
