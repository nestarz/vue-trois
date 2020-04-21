import { h, shallowRef, onMounted, provide, onUnmounted, watchEffect, shallowReadonly } from "vue";
import * as THREE from "three";

import useFrame from "vue-three-fiber/hooks/useFrame.js";

export const CanvasContextSymbol = Symbol();

export const useMouse = (containerRef) => {
  const mouse = new THREE.Vector2();
  function onMouseMove(event) {
    const { width, height } = containerRef.value.getBoundingClientRect();
    mouse.x = (event.clientX / width) * 2 - 1;
    mouse.y = -(event.clientY / height) * 2 + 1;
  }
  onMounted(() =>
    containerRef.value.addEventListener("mousemove", onMouseMove, false)
  );
  onUnmounted(() =>
    containerRef.value.removeEventListener("mousemove", onMouseMove, false)
  );
  return mouse;
};

export const useResize = (callback, parentRef) => {
  onMounted(() => {
    if (window.ResizeObserver && parentRef.value)
      new window.ResizeObserver(callback).observe(parentRef.value);
    else window.addEventListener("resize", callback);
  });
  onUnmounted(() => window.removeEventListener("resize", callback));
};

export default {
  props: {
    contextRef: Object,
    gl: {
      type: Object,
      default: () => {},
    },
  },
  setup(props, { slots }) {
    const containerRef = shallowRef(null);
    const context = shallowReadonly({
      renderer: new THREE.WebGLRenderer({ ...props.gl }),
      camera: new THREE.PerspectiveCamera(75, 1, 0.1, 1000),
      scene: new THREE.Scene(),
      updateCallbacks: new Set(),
      raycaster: new THREE.Raycaster(),
    });

    provide(CanvasContextSymbol, context);
    watchEffect(() => (props.contextRef.value = context));

    const mouse = useMouse(containerRef);
    useFrame(() => context.raycaster.setFromCamera(mouse, context.camera));

    useResize(() => {
      const { width, height } = containerRef.value.getBoundingClientRect();
      context.renderer.setSize(width, height);
      context.camera.aspect = width / height;
      context.camera.updateProjectionMatrix();
    }, containerRef);

    onMounted(() => {
      containerRef.value.appendChild(context.renderer.domElement);
      context.renderer.setPixelRatio(window.devicePixelRatio);

      function animate() {
        if (!context.renderer.domElement.parentNode) {
          return;
        }

        if (context.scene && context.camera) {
          context.updateCallbacks.forEach((callback) => callback());
          context.renderer.render(context.scene, context.camera);
        }

        requestAnimationFrame(animate);
      }

      animate();
    });

    onUnmounted(() => context.renderer.dispose());

    return () =>
      h(
        "div",
        { style: { width: "100%", height: "100%" }, ref: containerRef },
        slots.default && slots.default()
      );
  },
};
