<script setup lang="ts">
import { onMounted, ref, onBeforeUnmount } from "vue";
import Phaser from "phaser";
import { PlatformerScene } from "@/scenes/platformer.scene";
import Preloader from "@/ui-components/Preloader.component.vue";
import UiAnchor from "@/ui-components/UiAnchor.component.vue";
import GameResultModal from "@/ui-components/GameResultModal.component.vue";
import { usePlayer } from "@/store/player.store";
import { LEVEL_WIDTH, LEVEL_HEIGHT, LEVEL_GRAVITY } from "@/configs/engine.config";
import { router } from "@/router.js";
import { EventBus } from "@/utils/utils.js";
import * as EventNames from "@/configs/eventNames.config.js";
import LanguageSwitcher from "@/ui-components/LanguageSwitcher.vue";

const gameContainer = ref(null);
const playerStore = usePlayer();
let game = null;

const createGame = () => {
  game = new Phaser.Game({
    type: Phaser.AUTO,
    scene: new PlatformerScene(playerStore),
    backgroundColor: "#a09380",
    scale: {
      width: LEVEL_WIDTH,
      height: LEVEL_HEIGHT,
      mode: Phaser.Scale.FIT,
      parent: gameContainer.value,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    physics: {
      default: "arcade",
      arcade: {
        gravity: { x: 0, y: LEVEL_GRAVITY },
        debug: false,
      },
    },
  });

  EventBus.on(EventNames.GO_TO_ANOTHER_SCENE, () => {
    EventBus.off(EventNames.GO_TO_ANOTHER_SCENE);
    game?.destroy(true);
    router.push({ path: "/topdown" });
  });
};

onMounted(() => {
  createGame();
});

onBeforeUnmount(() => {
  EventBus.off(EventNames.GO_TO_ANOTHER_SCENE);
  game?.destroy(true);
});

const onAgain = () => {
  playerStore.isGameOver = false;
  playerStore.isWin = false;
  game?.destroy(true);
  game = null;
  createGame();
};
</script>

<template>
  <div class="platformer-screen">
    <Preloader />
    <UiAnchor anchor="top-right" :offset-x="10" :offset-y="10" target=".platformer-screen__game-wrapper">
      <LanguageSwitcher />
    </UiAnchor>
    <div ref="gameContainer" class="platformer-screen__game-wrapper"></div>
  </div>
</template>

<style scoped lang="scss">
.platformer-screen {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
}
</style>
