<template>
  <div class="showcase">
    <nav>
      <button @click="set('game1')">Game1</button>
      <button @click="set('game2')">Game2</button>
    </nav>
    <component :is="game"></component>
  </div>
</template>

<style>
.showcase nav {
  position: absolute;
  top: 1rem;
  left: 1rem;
}
.showcase,
.showcase > div {
  height: 100vh;
  overflow: hidden;
}
</style>

<script>
import { ref } from "vue";

import Game1 from "game/game-1/Game.vue";
import Game2 from "game/game-2/Game.vue";

export default {
  components: { Game1, Game2 },
  setup() {
    const game = ref("game2");
    return {
      game,
      set: (name) => (game.value = name),
    };
  },
};
</script>
