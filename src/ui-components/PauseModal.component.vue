<script setup>
import UiModal from "@/ui-components/UiModal.component.vue";
import { createI18nContentHelpers } from "@/utils/utils.js";
import i18next from "@/i18n.js";
import { UI_LOCALIZATION } from "@/configs/uiLocalization.config.js";

const { tContent } = createI18nContentHelpers(i18next);

const props = defineProps({
  isShow: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["resume", "again", "to-menu"]);

const onResume = () => {
  emit("resume");
};

const onAgain = () => {
  emit("again");
};

const onToMenu = () => {
  emit("to-menu");
};

const onModalUpdate = (val) => {
  if (!val) {
    emit("resume");
  }
};
</script>

<template>
  <UiModal :model-value="isShow" target=".platformer-screen__game-wrapper" max-width="520px" @update:model-value="onModalUpdate">
    <div class="pause-modal">
      <h2 class="pause-modal__title">{{ tContent(UI_LOCALIZATION.pause_title) }}</h2>

      <div class="pause-modal__actions">
        <button class="pause-modal__btn" @click="onResume">{{ tContent(UI_LOCALIZATION.resume_button) }}</button>
        <button class="pause-modal__btn" @click="onAgain">{{ tContent(UI_LOCALIZATION.again_button) }}</button>
        <button class="pause-modal__btn" @click="onToMenu">{{ tContent(UI_LOCALIZATION.to_menu_button) }}</button>
      </div>
    </div>
  </UiModal>
</template>

<style scoped lang="scss">
.pause-modal {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  user-select: none;

  &__title {
    font-size: 32px;
    font-weight: 800;
    text-transform: uppercase;
    color: #ffffff;
    text-align: center;
    margin: 0;
    letter-spacing: 2px;
    text-shadow:
      0 2px 10px rgba(0, 0, 0, 0.8),
      0 0 20px rgba(255, 255, 255, 0.2);
  }

  &__actions {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    width: 100%;
  }

  &__btn {
    display: block;
    margin: 0 auto;
    padding: 12px 36px;
    min-width: 250px;
    cursor: pointer;
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.25);
    border-radius: 10px;
    color: #ffffff;
    text-transform: uppercase;
    font-weight: 700;
    font-size: 18px;
    letter-spacing: 1.5px;
    font-family: inherit;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
    text-shadow: 0 1px 3px rgba(0, 0, 0, 0.8);
    transition: all 0.2s ease;

    &:hover {
      background: rgba(255, 255, 255, 0.16);
      border-color: rgba(255, 255, 255, 0.6);
      box-shadow: 0 6px 20px rgba(0, 0, 0, 0.6);
      transform: translateY(-2px);
    }

    &:active {
      transform: translateY(0);
      background: rgba(255, 255, 255, 0.1);
    }
  }
}
</style>
