<script setup>

import { TIME_ICONS } from "@/configs/gameplay.config.js";

const props = defineProps({
  count: {
    type: Number,
    default: 0,
  },
});
</script>

<template>
  <div class="night-counter">
    <img :src="TIME_ICONS.MOON" alt="Night counter" class="night-counter__icon" draggable="false" />
    <span class="night-counter__amount">{{ props.count }}</span>
  </div>
</template>

<style scoped lang="scss">
.night-counter {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 70px;
  height: 70px;
  background: rgba(18, 18, 24, 0.85);
  border: 2px solid rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  backdrop-filter: blur(8px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
  user-select: none;

  &__icon {
    width: 40px;
    height: 40px;
    object-fit: contain;
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.5));
    pointer-events: none;
  }

  &__amount {
    position: absolute;
    bottom: 6px;
    right: 8px;
    font-size: 22px;
    font-weight: 700;
    line-height: 1;
    color: #d99b47;
    text-shadow:
      -1px -1px 0 #000,
      1px -1px 0 #000,
      -1px 1px 0 #000,
      1px 1px 0 #000,
      0 2px 4px rgba(0, 0, 0, 0.9);
    pointer-events: none;
  }
}
</style>
