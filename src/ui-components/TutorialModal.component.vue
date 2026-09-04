<script setup lang="ts">
import { ref, useSlots, computed } from "vue";

const emit = defineEmits(["lets-go"]);

const slots = useSlots();
const currentIndex = ref(0);

const slides = computed(() => {
  const defaultSlot = slots.default?.();
  if (!defaultSlot) return [];
  return defaultSlot;
});

const total = computed(() => slides.value.length);
const isLastSlide = computed(() => total.value > 0 && currentIndex.value === total.value - 1);

const prev = () => {
  if (currentIndex.value > 0) {
    currentIndex.value--;
  }
};

const next = () => {
  if (currentIndex.value < total.value - 1) {
    currentIndex.value++;
  }
};

const letsGo = () => {
  emit("lets-go");
};
</script>

<template>
  <div class="tutorial-modal">
    <div class="tutorial-modal__viewport">
      <div class="tutorial-modal__track" :style="{ transform: `translateX(-${currentIndex * 100}%)` }">
        <div v-for="(slide, index) in slides" :key="index" class="tutorial-modal__slide">
          <component :is="slide" />
        </div>
      </div>
    </div>

    <div class="tutorial-modal__controls">
      <button class="tutorial-modal__btn" :disabled="currentIndex === 0" @click="prev">Предыдущий</button>

      <button v-if="!isLastSlide" class="tutorial-modal__btn" :disabled="currentIndex === total - 1" @click="next">Далее</button>

      <button v-else class="tutorial-modal__btn" @click="letsGo">Вперед!</button>
    </div>
  </div>
</template>

<style lang="scss">
.tutorial-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  gap: 16px;
  background: rgba(18, 18, 24, 0.85);
  backdrop-filter: blur(8px);
  padding: 24px;
  box-sizing: border-box;
  user-select: none;

  &__viewport {
    flex: 1;
    min-height: 0;
    width: 100%;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  &__track {
    display: flex;
    align-items: center;
    height: 100%;
    width: 100%;
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  &__slide {
    min-width: 100%;
    width: 100%;
    height: 100%;
    box-sizing: border-box;
    display: flex;
    align-items: center;
    justify-content: center;

    div {
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    img {
      display: block;
      width: auto;
      height: auto;
      max-height: 100%;
      max-width: min(960px, 90vw);
      object-fit: contain;
      border-radius: 12px;
      border: 2px solid rgba(255, 255, 255, 0.15);
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
    }
  }

  &__controls {
    flex-shrink: 0;
    display: flex;
    justify-content: center;
    gap: 12px;
  }

  &__btn {
    padding: 10px 28px;
    cursor: pointer;
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 8px;
    color: #ffffff;
    text-transform: uppercase;
    font-weight: 700;
    font-size: 15px;
    letter-spacing: 1px;
    font-family: inherit;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.8);
    transition: all 0.2s ease;

    &:hover:not(:disabled) {
      background: rgba(255, 255, 255, 0.16);
      border-color: rgba(255, 255, 255, 0.6);
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.5);
      transform: translateY(-1px);
    }

    &:active:not(:disabled) {
      transform: translateY(0);
      background: rgba(255, 255, 255, 0.1);
    }

    &:disabled {
      opacity: 0.3;
      cursor: not-allowed;
      border-color: rgba(255, 255, 255, 0.08);
      background: rgba(255, 255, 255, 0.03);
      box-shadow: none;
    }
  }
}
</style>
