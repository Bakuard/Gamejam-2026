<script setup lang="ts">
import i18next from "@/i18n.js";
import { createI18nContentHelpers } from "@/utils/utils.js";
import { UI_LOCALIZATION } from "@/configs/uiLocalization.config.js";

const { tContent, currentLanguage: rawLanguage } = createI18nContentHelpers(i18next);

const handleLanguageToggle = () => {
  const newLanguage = rawLanguage.value.startsWith("ru") ? "en" : "ru";
  i18next.changeLanguage(newLanguage);
};
</script>

<template>
  <button class="language-switcher" @click="handleLanguageToggle">
    {{ tContent(UI_LOCALIZATION.language_label) }}
  </button>
</template>

<style scoped lang="scss">
.language-switcher {
  position: relative;
  z-index: 1000;
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
  text-transform: uppercase;
  font-weight: 700;
  font-size: 20px;
  font-family: inherit;
  text-shadow:
    -1px -1px 0 #000,
    1px -1px 0 #000,
    -1px 1px 0 #000,
    1px 1px 0 #000,
    0 2px 4px rgba(0, 0, 0, 0.9);
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
}
</style>