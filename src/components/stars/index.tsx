import { h } from "preact";
import { useState, useRef, useEffect } from "preact/hooks";
import * as THREE from "three";

export const Stars = () => {
  const props = {
    renderParam: {
      width: window.innerWidth,
      height: window.innerHeight,
    },
    geometry: {},
    material: {},
    moveMouseWithCamera: true,
    speedUpOnScroll: true,
    scrollTimeOut: 0,
    xySpread: 700,
    zSpread: 20000,
    zSpeed: 0.8,
    starSize: 5,
  };
  let scene: THREE.Scene,
    renderer: THREE.WebGLRenderer,
    mesh: THREE.Points,
    camera: THREE.PerspectiveCamera;

  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(
    70, // ! Remove Numberwang
    props.renderParam.width / props.renderParam.height
  );

  const [isInitialized, setInitialized] = useState(false);
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    stageInit();
    initMesh();
    addListener();
    animate();

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  function stageInit() {
    if (isInitialized) return;
    initRenderer();
    initCamera();
    initFog();

    setInitialized(true);
  }

  function initRenderer() {
    renderer = new THREE.WebGLRenderer({
      canvas: canvas.current ?? undefined,
      alpha: true,
    });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(props.renderParam.width, props.renderParam.height);
  }

  function initCamera() {
    if (!isInitialized || !!camera) {
      camera = new THREE.PerspectiveCamera(
        70, // ! Remove Numberwang
        props.renderParam.width / props.renderParam.height
      );
      initRenderer();
    }
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
  }

  function initFog() {
    scene.fog = new THREE.Fog(0x000000, 50, 2000);
  }

  function stageAnimate() {
    if (camera.position.z < props.zSpread * 0.4) {
      camera.position.z += props.zSpeed;
    } else {
      camera.position.z = 0;
    }
    camera.lookAt(new THREE.Vector3(0, 0, props.zSpread * 0.4));
    renderer.render(scene, camera);
  }

  function onResize() {
    initCamera();
  }

  // Mesh Area
  function initMesh() {
    const points = [];
    // eslint-disable-next-line no-plusplus
    for (let i = 0; i < 10000; i++) {
      const star = new THREE.Vector3();
      star.x = THREE.MathUtils.randFloatSpread(props.xySpread);
      star.y = THREE.MathUtils.randFloatSpread(props.xySpread);
      star.z = THREE.MathUtils.randFloatSpread(props.zSpread);
      points.push(star);
    }
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.PointsMaterial({
      size: props.starSize,
      map: createStarMaterial("230, 230, 230", 256),
      transparent: true,
      depthWrite: false,
    });

    mesh = new THREE.Points(geometry, material);
    scene.add(mesh);
  }

  function createStarMaterial(color: string, size: number) {
    const starCanvas = document.createElement("canvas");
    // eslint-disable-next-line no-multi-assign
    starCanvas.width = starCanvas.height = size;
    const starContext: CanvasRenderingContext2D | null =
      starCanvas.getContext("2d");
    const texture = new THREE.Texture(starCanvas);
    const center = size / 2;
    if (starContext) {
      starContext.beginPath();
      starContext.arc(center, center, size / 2, 0, 2 * Math.PI, false);
      starContext.closePath();
      const colorGradient = starContext.createRadialGradient(
        size / 2,
        size / 2,
        0,
        size / 2,
        size / 2,
        size / 2
      );
      colorGradient.addColorStop(0, `rgba(${color}, 1)`);
      colorGradient.addColorStop(0.9, `rgba(${color}, .9)`);
      colorGradient.addColorStop(1, `rgba(${color}, 0)`);
      starContext.fillStyle = colorGradient;
      starContext.fill();
    }
    texture.needsUpdate = true;
    return texture;
  }

  function animate() {
    window.requestAnimationFrame(() => {
      stageAnimate();
      animate();
    });
  }

  function onMouseMove(e: MouseEvent) {
    if (props.moveMouseWithCamera) {
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;
      const targetX = e.clientX;
      const targetY = e.clientY;
      const ratioX = targetX / windowWidth;
      const ratioY = targetY / windowHeight;
      camera.position.x = (ratioX - 0.5) * (props.xySpread / 10);
      camera.position.y = (ratioY - 0.5) * (props.xySpread / 10);
    }
  }

  function onScroll() {
    if (props.speedUpOnScroll) {
      const speedDifference = 0.075;
      props.zSpeed = Math.min(3, props.zSpeed + speedDifference);
      if (props.scrollTimeOut) {
        window.clearTimeout(props.scrollTimeOut);
      }
      props.scrollTimeOut = window.setTimeout(() => {
        const numberOfIterations = (props.zSpeed - 0.8) / speedDifference;
        for (let i = 0; i < numberOfIterations; i += 1) {
          setTimeout(() => {
            props.zSpeed = Math.max(0.8, props.zSpeed - speedDifference);
          }, 50 * i);
        }
      }, 500);
    }
  }

  function addListener() {
    window.addEventListener("resize", onResize);
    window.addEventListener("mousemove", onMouseMove, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  return <canvas ref={canvas} />;
};
