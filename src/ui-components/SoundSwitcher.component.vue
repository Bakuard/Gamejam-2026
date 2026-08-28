<script setup lang="ts">
import SoundOnIcon from "/public/assets/img/icons/sound-on.svg";
import SoundOffIcon from "/public/assets/img/icons/sound-off.svg";

defineProps<{
  isPlaySound: boolean;
}>();

const emit = defineEmits<{
  (e: "toggle"): void;
}>();
</script>

<template>
  <button class="sound-switcher" @click="emit('toggle')">
    <SoundOnIcon v-if="isPlaySound" class="sound-switcher__icon" />
    <SoundOffIcon v-else class="sound-switcher__icon" />
  </button>
</template>

// ... existing code ...
<style scoped lang="scss">
.sound-switcher {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 50px;
  height: 50px;
  background: rgba(18, 18, 24, 0.85);
  border: 2px solid rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  backdrop-filter: blur(8px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
  color: #d99b47;
  cursor: pointer;
  user-select: none;
  transition:
    background 0.2s,
    border-color 0.2s,
    transform 0.1s;

  &:hover {
    background: rgba(30, 30, 40, 0.9);
    border-color: rgba(255, 255, 255, 0.3);
  }

  &:active {
    transform: scale(0.96);
  }

  &__icon {
    width: 30px;
    height: 30px;
    fill: currentColor;
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.5));
    pointer-events: none;

    :deep(g) {
      fill: currentColor;
    }

    :deep(path) {
      fill: currentColor;
    }
  }
}
</style>
