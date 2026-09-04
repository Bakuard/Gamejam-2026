<script setup lang="ts">
import { useRouter } from "vue-router";
import { createI18nContentHelpers } from "@/utils/utils.js";
import i18next from "@/i18n.js";
import { UI_LOCALIZATION } from "@/configs/uiLocalization.config.js";
import TutorialModal from "@/ui-components/TutorialModal.component.vue";
import { ref } from "vue";

const router = useRouter();
const { tContent } = createI18nContentHelpers(i18next);

const isSliderVisible = ref(false);

const showSlider = (event) => {
  event.preventDefault();
  isSliderVisible.value = true;
};

const goToGame = () => {
  router.push("/platformer");
};
</script>

<template>
  <div class="start-menu-screen">
    <TutorialModal v-if="isSliderVisible" @lets-go="goToGame">
      <div>
        <img class="tutorial-modal__image" src="/assets/img/tutorial/introduction_1.jpg" alt="placeholder" />
      </div>
      <div>
        <img class="tutorial-modal__image" src="/assets/img/tutorial/introduction_2.jpg" alt="placeholder" />
      </div>
      <div>
        <img class="tutorial-modal__image" src="/assets/img/tutorial/introduction_3.jpg" alt="placeholder" />
      </div>
    </TutorialModal>
    <div class="start-menu-screen__content">
      <h1 class="start-menu-screen__title">
        <span class="start-menu-screen__title-main">{{ tContent(UI_LOCALIZATION.main_title) }}</span>
        <span class="start-menu-screen__title-sub">{{ tContent(UI_LOCALIZATION.main_description) }}</span>
      </h1>
      <form class="start-menu-screen__form">
        <button v-if="!isSliderVisible" class="start-menu-screen__btn" @click="showSlider">
          {{ tContent(UI_LOCALIZATION.start_button) }}
        </button>
      </form>
    </div>
  </div>
</template>

<style scoped lang="scss">
.start-menu-screen {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;

  // Смещаем композицию фона вправо, чтобы персонаж оставался справа
  background: #a09380 url("/assets/img/background/main_menu2.jpg") right center;
  background-size: cover;

  // Отступы, чтобы контент уверенно был слева и не залезал на правую часть
  padding: clamp(16px, 4vw, 64px);
  box-sizing: border-box;

  &__content {
    display: flex;
    flex-direction: column;

    // Было: align-items: center; height: 100%;
    align-items: flex-start;
    height: auto;

    // Ограничиваем ширину левой «колонки», чтобы текст/кнопка не расползались вправо
    width: min(750px, 50vw);
    transform: scale(0.9);
  }

  &__title {
    color: #ffffff;

    text-align: center;

    display: flex;
    flex-direction: column;
    line-height: 1;
    margin: 0 0 24px 0;

    &-main {
      font-size: 100px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 4px;
      color: #ffffff;
      text-shadow:
        0 2px 10px rgba(0, 0, 0, 0.8),
        0 0 20px rgba(255, 255, 255, 0.2);

      @media (min-width: 1368px) {
        font-size: 120px;
      }
    }

    &-sub {
      font-size: 20px;
      margin-top: 8px;
      font-weight: 500;
      letter-spacing: 2px;
      color: rgba(255, 255, 255, 0.7);
      text-shadow: 0 1px 4px rgba(0, 0, 0, 0.8);
    }
  }

  &__form {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    width: 100%;
    transform: none;
  }

  &__btn {
    width: 100%;
    max-width: 320px;
    height: 64px;
    cursor: pointer;
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.25);
    border-radius: 12px;
    color: #ffffff;
    text-transform: uppercase;
    font-weight: 700;
    font-size: 24px;
    letter-spacing: 2px;
    font-family: inherit;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
    text-shadow: 0 1px 3px rgba(0, 0, 0, 0.8);
    transition: all 0.2s ease;

    &:hover {
      background: rgba(255, 255, 255, 0.16);
      border-color: rgba(255, 255, 255, 0.6);
      box-shadow: 0 6px 24px rgba(0, 0, 0, 0.6);
      transform: translateY(-2px);
    }

    &:active {
      transform: translateY(0);
      background: rgba(255, 255, 255, 0.1);
    }
  }
}

@media (min-height: 800px) {
  .start-menu-screen__content {
    transform: scale(1);
    margin-bottom: 0;
  }
}
</style>
