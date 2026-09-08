<script setup>
import { computed, watch, onMounted, onBeforeUnmount, nextTick, ref } from "vue";
import { TOOLTIP_ICONS } from "@/configs/gameplay.config.js";

const props = defineProps({
  icon: {
    type: String,
    default: null,
  },
  viewTime: {
    type: Number,
    default: 0,
  },
  text: {
    type: String,
    default: "",
  },
  id: {
    type: String,
    default: "",
  },
});

const emit = defineEmits(["hide"]);

const isProgressStarted = ref(false);
let hideTimeout = null;
let animationFrameId = null;

const iconSrc = computed(() => {
  if (!props.icon) return null;
  return TOOLTIP_ICONS[props.icon] || props.icon;
});

const hasTimer = computed(() => {
  return typeof props.viewTime === "number" && props.viewTime > 0;
});

const clearTimer = () => {
  if (hideTimeout) {
    clearTimeout(hideTimeout);
    hideTimeout = null;
  }
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }
};

const startTimer = () => {
  clearTimer();
  isProgressStarted.value = false;

  if (hasTimer.value) {
    animationFrameId = requestAnimationFrame(() => {
      isProgressStarted.value = true;
    });

    hideTimeout = setTimeout(() => {
      emit("hide", props.id);
    }, props.viewTime);
  }
};

watch(
  () => [props.id, props.text, props.icon, props.viewTime],
  () => {
    nextTick(() => {
      startTimer();
    });
  }
);

onMounted(() => {
  startTimer();
});

onBeforeUnmount(() => {
  clearTimer();
});
</script>

<template>
  <div :id="id || undefined" class="tooltip">
    <div class="tooltip__content">
      <div v-if="iconSrc" class="tooltip__icon-wrapper">
        <img :src="iconSrc" alt="" aria-hidden="true" class="tooltip__icon" draggable="false" />
      </div>
      <p class="tooltip__text">{{ text }}</p>
    </div>

    <div v-if="hasTimer" class="tooltip__track">
      <div
        class="tooltip__progress"
        :class="{ 'tooltip__progress--active': isProgressStarted }"
        :style="{
          transitionDuration: isProgressStarted ? `${viewTime}ms` : '0ms',
        }"
      ></div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.tooltip {
  position: relative;
  display: inline-flex;
  flex-direction: column;
  min-width: 220px;
  max-width: 420px;
  padding: 12px 18px;
  box-sizing: border-box;

  background: rgba(18, 18, 24, 0.85);
  border: 2px solid rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  backdrop-filter: blur(8px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
  user-select: none;
  overflow: hidden;

  &__content {
    display: flex;
    align-items: center;
    gap: 14px;
    width: 100%;
  }

  &__icon-wrapper {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 42px;
    height: 42px;
  }

  &__icon {
    width: 100%;
    height: 100%;
    object-fit: contain;
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.5));
    pointer-events: none;
  }

  &__text {
    margin: 0;
    flex: 1;
    font-size: 16px;
    font-weight: 700;
    line-height: 1.3;
    color: #d99b47;
    text-shadow:
      -1px -1px 0 #000,
      1px -1px 0 #000,
      -1px 1px 0 #000,
      1px 1px 0 #000,
      0 2px 4px rgba(0, 0, 0, 0.9);
    pointer-events: none;
  }

  &__track {
    width: 100%;
    height: 6px;
    margin-top: 10px;
    padding: 1px;
    box-sizing: border-box;
    overflow: hidden;

    background: rgba(18, 18, 24, 0.9);
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 4px;
  }

  &__progress {
    width: 100%;
    height: 100%;
    background: #d99b47;
    border-radius: 2px;
    transform-origin: right center;
    transform: scaleX(1);
    will-change: transform;
    transition-property: transform;
    transition-timing-function: linear;

    &--active {
      transform: scaleX(0);
    }
  }
}
</style>
