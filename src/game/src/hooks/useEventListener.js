import { onMounted, onUnmounted } from "vue";

export function useEventListener(
  type,
  listener,
  options,
  target = document.body.querySelector("#app") ?? document.body
) {
  onMounted(() => {
    target.setAttribute("tabindex", 0);
    target.addEventListener(type, listener, options);
  });
  onUnmounted(() => {
    target.removeEventListener(type, listener, options);
  });
}
