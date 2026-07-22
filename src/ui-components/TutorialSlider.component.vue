<script setup lang="ts">
import { ref, useSlots, computed } from "vue";

const slots = useSlots();
const currentIndex = ref(0);

const slides = computed(() => {
  const defaultSlot = slots.default?.();
  if (!defaultSlot) return [];
  return defaultSlot;
});

const total = computed(() => slides.value.length);

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
</script>

<template>
  <div class="tutorial-slider">
    <div class="tutorial-slider__viewport">
      <div
        class="tutorial-slider__track"
        :style="{ transform: `translateX(-${currentIndex * 100}%)` }"
      >
        <div
          v-for="(slide, index) in slides"
          :key="index"
          class="tutorial-slider__slide"
        >
          <component :is="slide" />
        </div>
      </div>
    </div>

    <div class="tutorial-slider__controls">
      <button
        class="tutorial-slider__btn"
        :disabled="currentIndex === 0"
        @click="prev"
      >
        Prev
      </button>
      <button
        class="tutorial-slider__btn"
        :disabled="currentIndex === total - 1"
        @click="next"
      >
        Next
      </button>
    </div>
  </div>
</template>

<style scoped lang="scss">
.tutorial-slider {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 12px;
  background: rgba(20, 10, 5, 0.65);
  backdrop-filter: blur(6px);
  border: 1px solid rgba(217, 155, 71, 0.3);
  border-radius: 4px;
  padding: 16px;
  box-sizing: border-box;

  &__viewport {
    width: 100%;
    overflow: hidden;
  }

  &__track {
    display: flex;
    transition: transform 0.3s ease;
  }

  &__slide {
    min-width: 100%;
    box-sizing: border-box;
  }

  &__controls {
    display: flex;
    justify-content: center;
    gap: 12px;
  }

  &__btn {
    padding: 8px 24px;
    cursor: pointer;
    border: none;
    background: #7f4837;
    color: #d99b47;
    text-transform: uppercase;
    font-weight: bold;
    font-size: 16px;
    font-family: inherit;
    transition: background 0.2s ease;

    &:hover:not(:disabled) {
      background: #b56f44;
    }

    &:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }
  }
}
</style>
