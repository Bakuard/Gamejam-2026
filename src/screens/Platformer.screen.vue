<script setup lang="ts">
import { onMounted, ref, onBeforeUnmount, computed } from "vue";
import Phaser from "phaser";
import PlatformerScene from "@/scenes/platformer.scene";
import Preloader from "@/ui-components/Preloader.component.vue";
import UiAnchor from "@/ui-components/UiAnchor.component.vue";
import Inventory from "@/ui-components/Inventory.component.vue";
import GameResultModal from "@/ui-components/GameResultModal.component.vue";
import { usePlayer } from "@/store/player.store";
import { useCalendarStore } from "@/store/calendar.store.js";
import { useGhostStore } from "@/store/ghost.store";
import { useInventoryStore } from "@/store/inventory.store";
import { useTutorial } from "@/store/tutorial.store";
import { LEVEL_GRAVITY, LEVEL_HEIGHT, LEVEL_WIDTH } from "@/configs/engine.config";
import { router } from "@/router.js";
import { EventBus } from "@/utils/utils.js";
import * as EventNames from "@/configs/eventNames.config.js";
import TimeProgress from "@/ui-components/TimeProgress.component.vue";
import NightCounter from "@/ui-components/NightCounter.component.vue";
import SurvivalAlert from "@/ui-components/SurvivalAlert.component.vue";
import SoundSwitcherComponent from "@/ui-components/SoundSwitcher.component.vue";
import Tooltip from "@/ui-components/Tooltipe.component.vue";
import { dayPhases } from "@/compositions/Calendar.composition.js";

const gameContainer = ref(null);
const playerStore = usePlayer();
const calendarStore = useCalendarStore();
const ghostStore = useGhostStore();
const inventoryStore = useInventoryStore();
const tutorialStore = useTutorial();
const isSceneLoaded = ref(false);
let game = null;

const isNightPhase = computed(() => {
  return calendarStore.currentPhase === dayPhases.night;
});

const dayTotalDuration = computed(() => {
  return calendarStore.afternoonInMs + calendarStore.eveningInMs + calendarStore.morningInMs;
});

const nightTotalDuration = computed(() => {
  return calendarStore.nightInMs;
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
  }

  // day (afternoon or evening)
  const elapsedInDay = calendarStore.msSinceDayStart;
  return Math.max(0, dayTotalDuration.value - Math.max(0, elapsedInDay));
});

const createGame = () => {
  game = new Phaser.Game({
    type: Phaser.WEBGL,
    scene: new PlatformerScene(playerStore, calendarStore, ghostStore, inventoryStore, tutorialStore),
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

  EventBus.on(EventNames.COMPLETE_PRELOADING, () => {
    isSceneLoaded.value = true;
  });
};

onMounted(() => {
  createGame();
});

onBeforeUnmount(() => {
  EventBus.off(EventNames.GO_TO_ANOTHER_SCENE);
  EventBus.off(EventNames.COMPLETE_PRELOADING);
  game?.destroy(true);
});

const onAgain = () => {
  playerStore.isGameOver = false;
  playerStore.isWin = false;
  game.scene.getScene("MainScene").scene.restart();
};

const onHideTooltip = (id: string) => {
  const index = tutorialStore.tutorial.findIndex((item) => item.id === id);
  if (index !== -1) {
    tutorialStore.tutorial.splice(index, 1);
  }
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
      <div class="platformer-screen__controls">
        <TimeProgress :all-time="allTime" :remaining-time="remainingTime" :is-night="isNightPhase" />
        <SoundSwitcherComponent :is-play-sound="playerStore.isPlaySound" @toggle="playerStore.isPlaySound = !playerStore.isPlaySound" />
      </div>
    </UiAnchor>
    <UiAnchor v-if="isSceneLoaded" anchor="center-right" :offset-x="10" :offset-y="0" target=".platformer-screen__game-wrapper">
      <TransitionGroup name="tooltip-list" tag="div" class="platformer-screen__tutorial-list">
        <Tooltip v-for="item in tutorialStore.tutorial" :id="item.id" :key="item.id" :icon="item.icon" :text="item.text" :view-time="item.viewTime" @hide="onHideTooltip" />
      </TransitionGroup>
    </UiAnchor>
    <UiAnchor anchor="bottom-center" :offset-x="0" :offset-y="10" target=".platformer-screen__game-wrapper">
      <div class="platformer-screen__inventory-wrapper">
        <TransitionGroup name="interactive-tooltip" tag="div" class="platformer-screen__tooltips-list">
          <Tooltip v-for="item in tutorialStore.tooltips" :id="item.id" :key="item.id" :icon="item.icon" :text="item.text" :view-time="item.viewTime" />
        </TransitionGroup>
        <Inventory :items="inventoryStore.items" />
      </div>
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

  &__controls {
    display: flex;
    gap: 10px;
    align-items: center;
  }

  &__inventory-wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
  }

  &__tooltips-list {
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 12px;
    align-items: center;
  }

  &__tutorial-list {
    position: relative;
    width: 500px;
    display: flex;
    flex-direction: column;
    gap: 12px;
    align-items: flex-end;
  }
}

.tooltip-list-move,
.tooltip-list-enter-active,
.tooltip-list-leave-active {
  transition: all 1s cubic-bezier(0.25, 1, 0.2, 1);
}

.tooltip-list-enter-from {
  opacity: 0;
  transform: translateY(30px);
}

.tooltip-list-leave-active {
  position: absolute;
}

.tooltip-list-leave-to {
  opacity: 0;
  transform: translateY(30px);
}

.interactive-tooltip-move,
.interactive-tooltip-enter-active,
.interactive-tooltip-leave-active {
  transition: all 0.25s cubic-bezier(0.25, 1, 0.5, 1);
}

.interactive-tooltip-enter-from,
.interactive-tooltip-leave-to {
  opacity: 0;
  transform: translateY(10px) scale(0.96);
}

.interactive-tooltip-leave-active {
  position: absolute;
}
</style>
