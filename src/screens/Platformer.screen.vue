<script setup lang="ts">
import { onMounted, ref, onBeforeUnmount, computed } from "vue";
import Phaser from "phaser";
import { PlatformerScene } from "@/scenes/platformer.scene";
import Preloader from "@/ui-components/Preloader.component.vue";
import UiAnchor from "@/ui-components/UiAnchor.component.vue";
import Inventory from "@/ui-components/Inventory.component.vue";
import GameResultModal from "@/ui-components/GameResultModal.component.vue";
import { usePlayer } from "@/store/player.store";
import { useCalendarStore } from "@/store/calendar.store.js";
import { useGhostStore } from "@/store/ghost.store";
import { useInventoryStore } from "@/store/inventory.store";
import { LEVEL_GRAVITY, LEVEL_HEIGHT, LEVEL_WIDTH } from "@/configs/engine.config";
import { router } from "@/router.js";
import { EventBus } from "@/utils/utils.js";
import * as EventNames from "@/configs/eventNames.config.js";
import TimeProgress from "@/ui-components/TimeProgress.component.vue";
import NightCounter from "@/ui-components/NightCounter.component.vue";
import SurvivalAlert from "@/ui-components/SurvivalAlert.component.vue";
import { dayPhases } from "@/compositions/Calendar.composition.js";

const gameContainer = ref(null);
const playerStore = usePlayer();
const calendarStore = useCalendarStore();
const ghostStore = useGhostStore();
const inventoryStore = useInventoryStore();
let game = null;

const isNightPhase = computed(() => {
  return calendarStore.currentPhase === dayPhases.night || calendarStore.currentPhase === dayPhases.morning;
});

const dayTotalDuration = computed(() => {
  return calendarStore.afternoonInMs + calendarStore.eveningInMs;
});

const nightTotalDuration = computed(() => {
  return calendarStore.nightInMs + calendarStore.morningInMs;
});

const allTime = computed(() => {
  return isNightPhase.value ? nightTotalDuration.value : dayTotalDuration.value;
});

const remainingTime = computed(() => {
  if (isNightPhase.value) {
    if (calendarStore.currentPhase === dayPhases.night) {
      const elapsedInNight = calendarStore.msSinceDayStart - (calendarStore.morningInMs + calendarStore.afternoonInMs + calendarStore.eveningInMs);
      return Math.max(0, nightTotalDuration.value - Math.max(0, elapsedInNight));
    }
    // morning
    return Math.max(0, calendarStore.morningInMs - calendarStore.msSinceDayStart);
  }

  // day (afternoon or evening)
  const elapsedInDay = calendarStore.msSinceDayStart - calendarStore.morningInMs;
  return Math.max(0, dayTotalDuration.value - Math.max(0, elapsedInDay));
});

const createGame = () => {
  game = new Phaser.Game({
    type: Phaser.WEBGL,
    scene: new PlatformerScene(playerStore, calendarStore, ghostStore, inventoryStore),
    render: {
      // TODO: настройки сглаживания
      antialias: true,
      roundPixels: false,
      pixelArt: false,
      // ВАЖНО: не должно быть pixelArt: true
    },
    scale: {
      width: LEVEL_WIDTH,
      height: LEVEL_HEIGHT,
      mode: Phaser.Scale.FIT,
      parent: gameContainer.value,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      // TODO: при этих настройках рендер в физических пикселях
      zoom: 1 / window.devicePixelRatio,
    },
    physics: {
      default: "arcade",
      arcade: {
        gravity: { x: 0, y: LEVEL_GRAVITY },
        tileBias: 32,
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
  game.scene.getScene("MainScene").scene.restart();
};
</script>

<template>
  <div class="platformer-screen">
    <Preloader />
    <UiAnchor anchor="top-center" :offset-x="0" :offset-y="10" target=".platformer-screen__game-wrapper">
      <SurvivalAlert :count="ghostStore.survivalCounter" :view-time="3000" />
    </UiAnchor>
    <UiAnchor anchor="top-left" :offset-x="10" :offset-y="10" target=".platformer-screen__game-wrapper">
      <NightCounter :count="ghostStore.survivalCounter" />
    </UiAnchor>
    <UiAnchor v-if="!playerStore.isNight" anchor="top-right" :offset-x="10" :offset-y="10" target=".platformer-screen__game-wrapper">
      <TimeProgress :all-time="allTime" :remaining-time="remainingTime" :is-night="isNightPhase" />
    </UiAnchor>
    <UiAnchor anchor="bottom-center" :offset-x="0" :offset-y="10" target=".platformer-screen__game-wrapper">
      <Inventory :items="inventoryStore.items" />
    </UiAnchor>
    <GameResultModal :is-game-over="playerStore.isGameOver" :is-win="playerStore.isWin" @again="onAgain" />
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
