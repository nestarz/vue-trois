import * as THREE from "three";
import {
  h,
  inject,
  onUnmounted,
  watchEffect,
  watch,
  shallowRef,
  computed,
} from "vue";

import { CanvasContextSymbol } from "vue-three-fiber/components/Renderer.js";

export default {
  props: {
    value: THREE.Object3D,
    objectRef: Object,
  },
  setup(props) {
    const { scene } = inject(CanvasContextSymbol);

    const object = shallowRef();
    const uuid = computed(() => (props.value ? props.value.uuid : null));
    watch(uuid, () => Reflect.set(object, "value", props.value), {
      immediate: true,
    });

    const remove = () => {
      scene.remove(object.value);
    };

    watchEffect(() => {
      if (props.objectRef) {
        props.objectRef.value = object.value;
      }
    });

    watchEffect(() => {
      if (object.value) {
        remove();
      }
      scene.add(object.value);
    });
    onUnmounted(() => remove());

    return () => h("object");
  },
};
