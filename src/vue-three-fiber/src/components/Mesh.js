import * as THREE from "three";
import {
  h,
  inject,
  shallowRef,
  onUnmounted,
  onMounted,
  watchEffect,
  computed,
} from "vue";

import { CanvasContextSymbol } from "vue-three-fiber/components/Renderer.js";

export default {
  props: {
    meshRef: Object,
    position: THREE.Vector3,
    rotation: THREE.Euler,
    scale: THREE.Vector3,
    material: THREE.Material,
    count: Number,
    geometry: [
      THREE.InstancedBufferGeometry,
      THREE.ParametricBufferGeometry,
      THREE.Geometry,
    ],
    visible: { type: Boolean, default: true },
    dispose: { type: Boolean, default: true },
  },
  setup(props, { emit }) {
    const standard = {
      material: new THREE.MeshBasicMaterial({
        color: new THREE.Color("red"),
      }),
      geometry: new THREE.BoxGeometry(1, 1),
      scale: new THREE.Vector3(1, 1, 1),
      rotation: new THREE.Euler(0, 0, 0),
      position: new THREE.Vector3(0, 0, 0),
    };

    const material = computed(() => props.material ?? standard.material);
    const geometry = computed(() => props.geometry ?? standard.geometry);
    const scale = computed(() => props.scale ?? standard.scale);
    const rotation = computed(() => props.rotation ?? standard.rotation);
    const position = computed(() => props.position ?? standard.position);

    const { scene, raycaster } = inject(CanvasContextSymbol);

    const mesh = shallowRef(null);
    const remove = () => {
      scene.remove(mesh.value);
      if (props.dispose) {
        geometry.value.dispose();
        material.value.dispose();
      }
    };

    watchEffect(() => {
      if (mesh.value) {
        remove();
      }

      mesh.value = props.count
        ? new THREE.InstancedMesh(geometry.value, material.value, props.count)
        : new THREE.Mesh(geometry.value, material.value);
      scene.add(mesh.value);
    });
    watchEffect(() => (props.meshRef.value = mesh.value));
    watchEffect(() => (mesh.value.visible = props.visible));
    watchEffect(() => mesh.value.position.copy(position.value));
    watchEffect(() => mesh.value.rotation.copy(rotation.value));
    watchEffect(() => mesh.value.scale.copy(scale.value));
    onUnmounted(() => remove());

    let over = false;
    let drag = false;
    const mouseHandler = (e) => {
      if (!mesh.value) return;

      const type = e.type;

      if (type === "mousemove") {
        emit("pointerMove");
        if (drag) {
          emit("pointerDrag");
        }
      }

      const intersect = raycaster.intersectObject(mesh.value);
      if (intersect.length) {
        if (type === "click") {
          emit("click");
        } else if (type === "mouseup") {
          emit("pointerUp");
          drag = false;
        } else if (type === "mousedown") {
          emit("pointerDown");
          drag = true;
        }

        if (type === "mousemove") {
          if (!over) emit("pointerEnter");
          emit("pointerOver");
          over = true;
        }
      } else if (over && type === "mousemove") {
        emit("pointerOut", e);
        emit("pointerLeave", e);
        over = false;
      }
    };

    onMounted(() => {
      document.addEventListener("mousemove", mouseHandler);
      document.addEventListener("click", mouseHandler);
    });
    onUnmounted(() => {
      document.removeEventListener("mousemove", mouseHandler);
      document.removeEventListener("click", mouseHandler);
    });

    return () => h("mesh");
  },
};
