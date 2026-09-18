<script setup lang="ts">
import { ref, useSlots, computed, onMounted, onBeforeUnmount, Fragment, Comment, type VNode } from "vue";
import CloseIcon from "/public/assets/img/icons/close.svg";
import LanguageSwitcher from "@/ui-components/LanguageSwitcher.vue";
import { createI18nContentHelpers } from "@/utils/utils.js";
import i18next from "@/i18n.js";
import { UI_LOCALIZATION } from "@/configs/uiLocalization.config.js";

const props = defineProps({
  hasControl: {
    type: Boolean,
    default: true,
  },
});

const emit = defineEmits<{
  (e: "lets-go"): void;
  (e: "close"): void;
}>();

const { tContent } = createI18nContentHelpers(i18next);

const slots = useSlots();
const currentIndex = ref(0);

const slides = computed(() => {
  const defaultSlot = slots.default?.();
  if (!defaultSlot) return [];

  const flatten = (nodes) => {
    return nodes.flatMap((node) => {
      if (node.type === Fragment && Array.isArray(node.children)) {
        return flatten(node.children);
      }
      if (node.type === Comment) {
        return [];
      }
      return [node];
    });
  };

  return flatten(defaultSlot);
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

const close = () => {
  emit("close");
};

const onKeyDown = (e: KeyboardEvent) => {
  if (e.key === "Escape") {
    close();
  }
};

onMounted(() => {
  window.addEventListener("keydown", onKeyDown);
});

onBeforeUnmount(() => {
  window.removeEventListener("keydown", onKeyDown);
});
</script>

<template>
  <div class="tutorial-modal">
    <div class="tutorial-modal__actions">
      <LanguageSwitcher />
      <button class="tutorial-modal__close-btn" type="button" aria-label="Закрыть" @click="close">
        <CloseIcon class="tutorial-modal__close-icon" />
      </button>
    </div>

    <div class="tutorial-modal__viewport">
      <div class="tutorial-modal__track" :style="{ transform: `translateX(-${currentIndex * 100}%)` }">
        <div v-for="(slide, index) in slides" :key="index" class="tutorial-modal__slide">
          <component :is="slide" />
        </div>
      </div>
    </div>

    <div v-if="hasControl" class="tutorial-modal__controls">
      <button class="tutorial-modal__btn" :disabled="currentIndex === 0" @click="prev">
        {{ tContent(UI_LOCALIZATION.prev_button) }}
      </button>

      <button v-if="!isLastSlide" class="tutorial-modal__btn" :disabled="currentIndex === total - 1" @click="next">
        {{ tContent(UI_LOCALIZATION.next_button) }}
      </button>

      <button v-else class="tutorial-modal__btn" @click="letsGo">
        {{ tContent(UI_LOCALIZATION.lets_go_button) }}
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

  &__actions {
    position: absolute;
    top: 24px;
    right: 24px;
    z-index: 10;
    display: flex;
    align-items: center;
    gap: 12px;
  }

  &__close-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 44px;
    height: 44px;
    padding: 0;
    cursor: pointer;
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 10px;
    color: #ffffff;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    transition: all 0.2s ease;

    &:hover {
      background: rgba(255, 255, 255, 0.16);
      border-color: rgba(255, 255, 255, 0.6);
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.5);
      transform: translateY(-1px);
    }

    &:active {
      transform: translateY(0);
      background: rgba(255, 255, 255, 0.1);
    }
  }

  &__close-icon {
    width: 20px;
    height: 20px;
    fill: currentColor;
    display: block;

    :deep(path) {
      fill: currentColor;
    }
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
