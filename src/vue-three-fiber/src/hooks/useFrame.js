import { inject, onMounted, onUnmounted } from "vue";

import { CanvasContextSymbol } from "vue-three-fiber/components/Renderer.js";

export default (callback) => {
  const { updateCallbacks } = inject(CanvasContextSymbol);
  onMounted(() => updateCallbacks.add(callback));
  onUnmounted(() => updateCallbacks.delete(callback));
};
