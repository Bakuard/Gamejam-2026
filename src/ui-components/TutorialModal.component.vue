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
  <div class="tutorial-modal">
    <div class="tutorial-modal__viewport">
      <div
        class="tutorial-modal__track"
        :style="{ transform: `translateX(-${currentIndex * 100}%)` }"
      >
        <div
          v-for="(slide, index) in slides"
          :key="index"
          class="tutorial-modal__slide"
        >
          <component :is="slide" />
        </div>
      </div>
    </div>

    <div class="tutorial-modal__controls">
      <button
        class="tutorial-modal__btn"
        :disabled="currentIndex === 0"
        @click="prev"
      >
        Prev
      </button>
      <button
        class="tutorial-modal__btn"
        :disabled="currentIndex === total - 1"
        @click="next"
      >
        Next
      </button>
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
  gap: 12px;
  background: rgba(20, 10, 5, 0.65);
  backdrop-filter: blur(6px);
  padding: 16px;
  box-sizing: border-box;

  &__viewport {
    flex: 1;
    min-height: 0;
    width: 100%;
    overflow: hidden;
  }

  &__track {
    display: flex;
    align-items: flex-start;
    height: 100%;
    transition: transform 0.3s ease;
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
    }

    img {
      display: block;
      width: auto;
      height: 100%;
      max-width: 100%;
      object-fit: contain;
    }
  }

  &__controls {
    flex-shrink: 0;
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
