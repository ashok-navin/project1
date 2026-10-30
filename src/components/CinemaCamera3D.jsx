import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { Sparkles, Move3D, Camera, Image as ImageIcon, Check } from 'lucide-react';

const photoshootSamples = [
  {
    id: 1,
    title: 'Royal Heritage Couple Shoot',
    category: 'Regal Wedding',
    url: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=800&q=80&sig=cam1'
  },
  {
    id: 2,
    title: 'Sunset Beach Pre-Wedding',
    category: 'Cinematic Sunset',
    url: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80&sig=cam2'
  },
  {
    id: 3,
    title: 'Grand Starlight Reception',
    category: 'Reception Party',
    url: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=800&q=80&sig=cam3'
  },
  {
    id: 4,
    title: 'Golden Hour Bride Portrait',
    category: 'Candid Bride',
    url: 'https://images.unsplash.com/photo-1537633552985-df8429e8048b?auto=format&fit=crop&w=800&q=80&sig=cam4'
  }
];

export default function CinemaCamera3D() {
  const mountRef = useRef(null);
  const [interactiveMode, setInteractiveMode] = useState(false);
  const [currentShotIndex, setCurrentShotIndex] = useState(0);

  // References to communicate between React state and Three.js animation loop
  const stateRef = useRef({
    interactive: false,
    mouseX: 0,
    mouseY: 0,
    targetRotationX: 0,
    targetRotationY: 0,
    isDragging: false,
    prevMousePos: { x: 0, y: 0 }
  });

  const monitorMatRef = useRef(null);
  const rearMatRef = useRef(null);
  const texturesRef = useRef([]);

  // Keep interactive mode in sync with stateRef
  useEffect(() => {
    stateRef.current.interactive = interactiveMode;
  }, [interactiveMode]);

  // When user selects a photoshoot chip, switch the camera monitor textures
  useEffect(() => {
    if (texturesRef.current[currentShotIndex]) {
      if (monitorMatRef.current) {
        monitorMatRef.current.map = texturesRef.current[currentShotIndex];
        monitorMatRef.current.needsUpdate = true;
      }
      if (rearMatRef.current) {
        rearMatRef.current.map = texturesRef.current[currentShotIndex];
        rearMatRef.current.needsUpdate = true;
      }
    }
  }, [currentShotIndex]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Helper to generate a photoshoot canvas texture with HUD overlay
    const createPhotoShootTexture = (imageUrl, label = 'PHOTO SHOOT') => {
      const canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 512;
      const ctx = canvas.getContext('2d');

      // 1. Initial rich cinematic background (so canvas is never blank or black)
      const grad = ctx.createLinearGradient(0, 0, 0, 512);
      grad.addColorStop(0, '#1c160e');
      grad.addColorStop(0.5, '#2e1e0a');
      grad.addColorStop(1, '#0c0b08');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 512, 512);

      // Warm golden glow in center
      const glow = ctx.createRadialGradient(256, 240, 10, 256, 240, 240);
      glow.addColorStop(0, 'rgba(212, 175, 55, 0.35)');
      glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, 512, 512);

      // Stylized cinematic couple silhouette / photo shoot preview placeholder
      ctx.fillStyle = '#D4AF37';
      ctx.font = 'bold 26px serif';
      ctx.textAlign = 'center';
      ctx.fillText('★ 5STAR CINEMATOGRAPHY', 256, 230);

      ctx.fillStyle = '#F5E6C8';
      ctx.font = '18px sans-serif';
      ctx.fillText(label.toUpperCase(), 256, 265);

      ctx.fillStyle = '#888';
      ctx.font = '13px monospace';
      ctx.fillText('4K RAW • 24 FPS • 50mm T1.2', 256, 295);

      // Viewfinder overlay on base
      drawHUD(ctx, label);

      const texture = new THREE.CanvasTexture(canvas);
      texture.colorSpace = THREE.SRGBColorSpace;

      // 2. Load the actual high-resolution photoshoot photograph
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = imageUrl;

      img.onload = () => {
        try {
          // Draw high-res photo filling the canvas
          ctx.drawImage(img, 0, 0, 512, 512);

          // Subtle warm color grading tint
          ctx.fillStyle = 'rgba(212, 175, 55, 0.08)';
          ctx.fillRect(0, 0, 512, 512);

          // Draw the cinematic camera viewfinder HUD over the image
          drawHUD(ctx, label);

          texture.needsUpdate = true;
        } catch (e) {
          console.warn('Canvas drawImage error (fallback kept):', e);
        }
      };

      img.onerror = () => {
        console.warn('Photoshoot image fetch error, using canvas artwork');
      };

      return texture;
    };

    const drawHUD = (ctx, label) => {
      // Top bar
      ctx.fillStyle = 'rgba(10, 10, 12, 0.65)';
      ctx.fillRect(0, 0, 512, 52);
      ctx.fillRect(0, 460, 512, 52);

      // REC Indicator
      ctx.fillStyle = '#EF4444';
      ctx.beginPath();
      ctx.arc(30, 26, 9, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 15px monospace';
      ctx.textAlign = 'left';
      ctx.fillText('REC [00:14:28:10]', 50, 32);

      ctx.fillStyle = '#D4AF37';
      ctx.font = 'bold 13px monospace';
      ctx.textAlign = 'right';
      ctx.fillText('4K UHD • ISO 400', 490, 32);

      // Center crosshair / autofocus bracket
      ctx.strokeStyle = 'rgba(212, 175, 55, 0.6)';
      ctx.lineWidth = 1.5;

      // Center bracket corners
      const cx = 256;
      const cy = 256;
      const bs = 45;
      const bl = 12;

      ctx.beginPath();
      // top-left
      ctx.moveTo(cx - bs, cy - bs + bl);
      ctx.lineTo(cx - bs, cy - bs);
      ctx.lineTo(cx - bs + bl, cy - bs);
      // top-right
      ctx.moveTo(cx + bs - bl, cy - bs);
      ctx.lineTo(cx + bs, cy - bs);
      ctx.lineTo(cx + bs, cy - bs + bl);
      // bottom-left
      ctx.moveTo(cx - bs, cy + bs - bl);
      ctx.lineTo(cx - bs, cy + bs);
      ctx.lineTo(cx - bs + bl, cy + bs);
      // bottom-right
      ctx.moveTo(cx + bs - bl, cy + bs);
      ctx.lineTo(cx + bs, cy + bs);
      ctx.lineTo(cx + bs, cy + bs - bl);
      ctx.stroke();

      // Rule of thirds subtle grid
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.moveTo(170, 52);
      ctx.lineTo(170, 460);
      ctx.moveTo(342, 52);
      ctx.lineTo(342, 460);
      ctx.moveTo(0, 188);
      ctx.lineTo(512, 188);
      ctx.moveTo(0, 324);
      ctx.lineTo(512, 324);
      ctx.stroke();

      // Bottom info bar
      ctx.fillStyle = '#F5E6C8';
      ctx.font = 'bold 14px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`★ 5STAR CINEMATOGRAPHY • ${label.toUpperCase()}`, 256, 492);
    };

    // Pre-create all photoshoot textures
    texturesRef.current = photoshootSamples.map((s) => createPhotoShootTexture(s.url, s.title));

    // 1. Scene setup
    const scene = new THREE.Scene();

    // 2. Camera setup
    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 0.35, 4.3);

    // 3. WebGL Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.3;
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);

    // 4. Studio Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xF5E6C8, 3.2);
    keyLight.position.set(4, 5, 4);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x60A5FA, 2.2);
    rimLight.position.set(-4, -2, -3);
    scene.add(rimLight);

    const lensLight = new THREE.PointLight(0xD4AF37, 3.5, 6);
    lensLight.position.set(0, 0, 1.8);
    scene.add(lensLight);

    // 5. Build 3D Cinema Camera Group
    const cameraRig = new THREE.Group();
    scene.add(cameraRig);

    // Materials
    const matteBodyMat = new THREE.MeshStandardMaterial({
      color: 0x141418,
      roughness: 0.35,
      metalness: 0.8
    });

    const goldTrimMat = new THREE.MeshStandardMaterial({
      color: 0xD4AF37,
      roughness: 0.2,
      metalness: 0.95,
      emissive: 0x332608
    });

    const glassLensMat = new THREE.MeshPhysicalMaterial({
      color: 0x111e2e,
      roughness: 0.05,
      metalness: 0.1,
      transmission: 0.7,
      reflectivity: 0.9,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1
    });

    // Camera Main Body
    const bodyGeo = new THREE.BoxGeometry(1.3, 0.95, 1.2);
    const bodyMesh = new THREE.Mesh(bodyGeo, matteBodyMat);
    cameraRig.add(bodyMesh);

    // Gold side accent plates
    const sidePlateGeo = new THREE.BoxGeometry(1.32, 0.4, 0.9);
    const sidePlateMesh = new THREE.Mesh(sidePlateGeo, goldTrimMat);
    cameraRig.add(sidePlateMesh);

    // Front Lens Barrel (Master Cinema Lens)
    const lensStage1 = new THREE.CylinderGeometry(0.48, 0.48, 0.4, 32);
    const lensMesh1 = new THREE.Mesh(lensStage1, matteBodyMat);
    lensMesh1.rotation.x = Math.PI / 2;
    lensMesh1.position.set(0, 0, 0.8);
    cameraRig.add(lensMesh1);

    // Gold Focus Ring
    const goldRingGeo = new THREE.CylinderGeometry(0.5, 0.5, 0.1, 32);
    const goldRingMesh = new THREE.Mesh(goldRingGeo, goldTrimMat);
    goldRingMesh.rotation.x = Math.PI / 2;
    goldRingMesh.position.set(0, 0, 0.85);
    cameraRig.add(goldRingMesh);

    // Lens Stage 2
    const lensStage2 = new THREE.CylinderGeometry(0.55, 0.48, 0.35, 32);
    const lensMesh2 = new THREE.Mesh(lensStage2, matteBodyMat);
    lensMesh2.rotation.x = Math.PI / 2;
    lensMesh2.position.set(0, 0, 1.15);
    cameraRig.add(lensMesh2);

    // Front Glass Element
    const glassGeo = new THREE.SphereGeometry(0.46, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2);
    const glassMesh = new THREE.Mesh(glassGeo, glassLensMat);
    glassMesh.rotation.x = -Math.PI / 2;
    glassMesh.position.set(0, 0, 1.25);
    cameraRig.add(glassMesh);

    // Matte Box with Barn Doors
    const matteBoxGeo = new THREE.BoxGeometry(1.4, 1.1, 0.2);
    const matteBoxMesh = new THREE.Mesh(matteBoxGeo, matteBodyMat);
    matteBoxMesh.position.set(0, 0, 1.38);
    cameraRig.add(matteBoxMesh);

    const flagGeo = new THREE.BoxGeometry(1.42, 0.45, 0.04);
    const topFlag = new THREE.Mesh(flagGeo, matteBodyMat);
    topFlag.position.set(0, 0.68, 1.48);
    topFlag.rotation.x = -0.35;
    cameraRig.add(topFlag);

    // Top Handle Rig
    const handleBarGeo = new THREE.BoxGeometry(0.16, 0.16, 1.1);
    const handleBar = new THREE.Mesh(handleBarGeo, goldTrimMat);
    handleBar.position.set(0, 0.75, -0.05);
    cameraRig.add(handleBar);

    const handlePostGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.3, 16);
    const handlePostFront = new THREE.Mesh(handlePostGeo, matteBodyMat);
    handlePostFront.position.set(0, 0.6, 0.35);
    cameraRig.add(handlePostFront);

    const handlePostBack = new THREE.Mesh(handlePostGeo, matteBodyMat);
    handlePostBack.position.set(0, 0.6, -0.45);
    cameraRig.add(handlePostBack);

    // Articulated Side Monitor Screen with Real Photoshoot Image!
    const monitorArmGeo = new THREE.CylinderGeometry(0.05, 0.05, 0.45, 16);
    const monitorArm = new THREE.Mesh(monitorArmGeo, goldTrimMat);
    monitorArm.rotation.z = Math.PI / 2;
    monitorArm.position.set(-0.85, 0.3, 0.3);
    cameraRig.add(monitorArm);

    // Monitor housing angled facing forward towards viewer
    const monitorHousingGeo = new THREE.BoxGeometry(0.08, 0.78, 1.05);
    const monitorHousing = new THREE.Mesh(monitorHousingGeo, matteBodyMat);
    monitorHousing.position.set(-1.12, 0.3, 0.35);
    monitorHousing.rotation.y = 0.75;
    cameraRig.add(monitorHousing);

    // Photoshoot Texture on Monitor Screen
    const monitorScreenMat = new THREE.MeshBasicMaterial({
      map: texturesRef.current[0]
    });
    monitorMatRef.current = monitorScreenMat;

    const monitorScreenGeo = new THREE.PlaneGeometry(0.72, 0.98);
    const monitorScreen = new THREE.Mesh(monitorScreenGeo, monitorScreenMat);
    monitorScreen.position.set(-1.165, 0.3, 0.35);
    monitorScreen.rotation.y = -Math.PI / 2 + 0.75;
    cameraRig.add(monitorScreen);

    // Rear Operator Screen
    const rearMat = new THREE.MeshBasicMaterial({
      map: texturesRef.current[0]
    });
    rearMatRef.current = rearMat;
    const rearScreenGeo = new THREE.PlaneGeometry(0.85, 0.62);
    const rearScreen = new THREE.Mesh(rearScreenGeo, rearMat);
    rearScreen.position.set(0, 0.1, -0.61);
    rearScreen.rotation.y = Math.PI;
    cameraRig.add(rearScreen);

    // 6. Floating 3D Photoshoot Picture Frames Orbiting the Camera!
    const floatingFramesGroup = new THREE.Group();
    scene.add(floatingFramesGroup);

    const floatingCards = [];
    photoshootSamples.forEach((sample, i) => {
      const cardGroup = new THREE.Group();

      // Golden Beveled Frame
      const frameGeo = new THREE.BoxGeometry(0.84, 1.08, 0.03);
      const frameMesh = new THREE.Mesh(frameGeo, goldTrimMat);
      cardGroup.add(frameMesh);

      // Photoshoot Image Plane (front & back)
      const photoTexture = texturesRef.current[i];
      const photoMat = new THREE.MeshBasicMaterial({ map: photoTexture });

      const photoPlaneGeo = new THREE.PlaneGeometry(0.76, 1.0);
      const photoPlaneFront = new THREE.Mesh(photoPlaneGeo, photoMat);
      photoPlaneFront.position.z = 0.018;
      cardGroup.add(photoPlaneFront);

      const photoPlaneBack = new THREE.Mesh(photoPlaneGeo, photoMat);
      photoPlaneBack.position.z = -0.018;
      photoPlaneBack.rotation.y = Math.PI;
      cardGroup.add(photoPlaneBack);

      floatingFramesGroup.add(cardGroup);

      floatingCards.push({
        group: cardGroup,
        angleOffset: (i * (Math.PI * 2)) / photoshootSamples.length,
        baseY: i === 0 ? 0.35 : i === 1 ? -0.4 : i === 2 ? 0.6 : -0.2,
        floatSpeed: 0.6 + i * 0.12
      });
    });

    // 7. Floating 5 Golden 3D Stars Ring
    const starsGroup = new THREE.Group();
    scene.add(starsGroup);

    const starShape = new THREE.Shape();
    const points = 5;
    const outerRadius = 0.14;
    const innerRadius = 0.06;
    for (let i = 0; i < points * 2; i++) {
      const radius = i % 2 === 0 ? outerRadius : innerRadius;
      const angle = (i * Math.PI) / points - Math.PI / 2;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      if (i === 0) starShape.moveTo(x, y);
      else starShape.lineTo(x, y);
    }
    starShape.closePath();

    const extrudeSettings = { depth: 0.04, bevelEnabled: true, bevelSegments: 2, steps: 1, bevelSize: 0.015, bevelThickness: 0.015 };
    const starGeometry = new THREE.ExtrudeGeometry(starShape, extrudeSettings);

    const goldenStars = [];
    for (let i = 0; i < 5; i++) {
      const starMesh = new THREE.Mesh(starGeometry, goldTrimMat);
      starsGroup.add(starMesh);
      goldenStars.push({
        mesh: starMesh,
        angleOffset: (i * (Math.PI * 2)) / 5
      });
    }

    // 8. Background Golden Particle Sparks
    const particlesCount = 280;
    const particleGeometry = new THREE.BufferGeometry();
    const posArray = new Float32Array(particlesCount * 3);

    for (let i = 0; i < particlesCount * 3; i += 3) {
      posArray[i] = (Math.random() - 0.5) * 8;
      posArray[i + 1] = (Math.random() - 0.5) * 8;
      posArray[i + 2] = (Math.random() - 0.5) * 8;
    }

    particleGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    const particleMaterial = new THREE.PointsMaterial({
      size: 0.025,
      color: 0xD4AF37,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending
    });
    const particleMesh = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particleMesh);

    // Initial angled pose so monitor screen is directly visible
    cameraRig.rotation.y = 0.45;
    cameraRig.rotation.x = 0.12;

    // Mouse / Touch Event Handlers
    const handleMouseMove = (e) => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);

      if (stateRef.current.interactive && stateRef.current.isDragging) {
        const deltaX = e.clientX - stateRef.current.prevMousePos.x;
        const deltaY = e.clientY - stateRef.current.prevMousePos.y;
        stateRef.current.targetRotationY += deltaX * 0.008;
        stateRef.current.targetRotationX += deltaY * 0.008;
        stateRef.current.prevMousePos = { x: e.clientX, y: e.clientY };
      } else {
        stateRef.current.mouseX = x;
        stateRef.current.mouseY = y;
      }
    };

    const handleMouseDown = (e) => {
      if (stateRef.current.interactive) {
        stateRef.current.isDragging = true;
        stateRef.current.prevMousePos = { x: e.clientX, y: e.clientY };
      }
    };

    const handleMouseUp = () => {
      stateRef.current.isDragging = false;
    };

    const handleWheel = (e) => {
      if (stateRef.current.interactive) {
        e.preventDefault();
        camera.position.z = Math.max(2.6, Math.min(6.5, camera.position.z + e.deltaY * 0.003));
      }
    };

    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    container.addEventListener('wheel', handleWheel, { passive: false });

    // Handle Window Resize
    const handleResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    // 9. Animation Loop
    let clock = new THREE.Clock();
    let animationFrameId;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Orbit floating photoshoot frames in 3D around camera
      floatingCards.forEach((card, index) => {
        const orbitAngle = elapsedTime * 0.38 + card.angleOffset;
        const radiusX = 2.05;
        const radiusZ = 1.55;
        card.group.position.x = Math.cos(orbitAngle) * radiusX;
        card.group.position.z = Math.sin(orbitAngle) * radiusZ;
        card.group.position.y = card.baseY + Math.sin(elapsedTime * 1.5 + index) * 0.12;

        // Face towards viewer/center gently
        card.group.rotation.y = -orbitAngle + Math.PI / 2 + Math.sin(elapsedTime * 0.8) * 0.15;
        card.group.rotation.x = Math.sin(elapsedTime * 1.2 + index) * 0.1;
      });

      // Orbit 5 golden stars in an ellipse above camera
      goldenStars.forEach((star, index) => {
        const angle = elapsedTime * 0.7 + star.angleOffset;
        star.mesh.position.x = Math.cos(angle) * 1.6;
        star.mesh.position.z = Math.sin(angle) * 1.1;
        star.mesh.position.y = 0.95 + Math.sin(elapsedTime * 2 + index) * 0.12;
        star.mesh.rotation.y = elapsedTime * 2;
        star.mesh.rotation.x = Math.sin(elapsedTime) * 0.5;
      });

      // Slowly rotate particle field
      particleMesh.rotation.y = elapsedTime * 0.04;

      // Camera Rig orientation
      if (stateRef.current.interactive) {
        cameraRig.rotation.y += (stateRef.current.targetRotationY - cameraRig.rotation.y) * 0.1;
        cameraRig.rotation.x += (stateRef.current.targetRotationX - cameraRig.rotation.x) * 0.1;
      } else {
        const targetRotY = 0.45 + stateRef.current.mouseX * 0.35 + Math.sin(elapsedTime * 0.5) * 0.06;
        const targetRotX = 0.12 - stateRef.current.mouseY * 0.25 + Math.cos(elapsedTime * 0.7) * 0.04;
        cameraRig.rotation.y += (targetRotY - cameraRig.rotation.y) * 0.05;
        cameraRig.rotation.x += (targetRotX - cameraRig.rotation.x) * 0.05;
        cameraRig.position.y = Math.sin(elapsedTime * 1.2) * 0.08;
      }

      renderer.render(scene, camera);
    };

    animate();

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      container.removeEventListener('wheel', handleWheel);
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div className="relative w-full h-[470px] sm:h-[540px] lg:h-[600px] rounded-3xl overflow-hidden glass-card border border-[#D4AF37]/40 shadow-[0_0_50px_rgba(212,175,55,0.2)] group select-none">
      {/* 3D WebGL Canvas Container */}
      <div
        ref={mountRef}
        className={`w-full h-full cursor-grab active:cursor-grabbing ${
          interactiveMode ? 'ring-2 ring-[#D4AF37]' : ''
        }`}
      />

      {/* Mode Indicator & Photoshoot Badge */}
      <div className="absolute top-4 left-4 z-20 flex flex-wrap items-center gap-2">
        <span className="flex h-2.5 w-2.5 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#D4AF37] opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#D4AF37]"></span>
        </span>
        <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[#F5E6C8] bg-black/70 backdrop-blur-md px-3 py-1 rounded-full border border-zinc-800">
          {interactiveMode ? '🎮 3D Orbit Mode Active' : '✨ 3D Camera & Live Photoshoot'}
        </span>
      </div>

      {/* Floating 3D Controls Button */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
        <button
          onClick={() => setInteractiveMode(!interactiveMode)}
          className={`px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all backdrop-blur-md shadow-lg ${
            interactiveMode
              ? 'bg-gold-gradient text-black shadow-[0_0_20px_rgba(212,175,55,0.4)]'
              : 'border border-zinc-700 bg-zinc-900/80 text-zinc-300 hover:border-[#D4AF37] hover:text-white'
          }`}
        >
          <Move3D className="w-3.5 h-3.5" />
          {interactiveMode ? 'Exit 3D Orbit' : 'Explore 3D Mode'}
        </button>
      </div>

      {/* Photoshoot Mini Badge Strip at Bottom */}
      <div className="absolute bottom-4 left-4 right-4 z-20 pointer-events-auto flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-2xl bg-black/85 backdrop-blur-md border border-[#D4AF37]/35 shadow-2xl">
        <div className="flex items-center gap-2">
          <Camera className="w-4 h-4 text-[#D4AF37] shrink-0" />
          <span className="text-[11px] font-bold text-white uppercase tracking-wider">
            Photoshoot Feed:
          </span>
        </div>

        {/* 4 Photoshoot Mini Chips with Active State */}
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {photoshootSamples.map((sample, idx) => {
            const isActive = currentShotIndex === idx;
            return (
              <button
                key={sample.id}
                onClick={() => setCurrentShotIndex(idx)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] uppercase font-bold tracking-wider whitespace-nowrap shadow-sm transition-all ${
                  isActive
                    ? 'bg-gold-gradient text-black border border-[#ffeaa7] shadow-[0_0_12px_rgba(212,175,55,0.4)] scale-105'
                    : 'bg-zinc-900/90 border border-zinc-800 text-zinc-300 hover:border-[#D4AF37] hover:text-white'
                }`}
              >
                <img
                  src={sample.url}
                  alt={sample.title}
                  className="w-4 h-4 rounded-full object-cover"
                />
                <span>{sample.title}</span>
                {isActive && <Check className="w-3 h-3 text-black stroke-[3]" />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
