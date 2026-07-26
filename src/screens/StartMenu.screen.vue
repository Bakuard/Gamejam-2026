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

const goToGame = (event) => {
  event.preventDefault();
  router.push("/platformer");
};
</script>

<template>
  <div class="start-menu-screen">
    <TutorialModal v-if="isSliderVisible">
      <div>
        <img class="tutorial-modal__image" src="/assets/img/tutorial/introduction_1.jpg" alt="placeholder" />
      </div>
      <div>
        <img class="tutorial-modal__image" src="/assets/img/tutorial/introduction_2.jpg" alt="placeholder" />
      </div>
      <div>
        <img class="tutorial-modal__image" src="/assets/img/tutorial/introduction_3.jpg" alt="placeholder" />
      </div>
      <div class="slide-with-btn">
        <button class="slide-lets-go-btn" @click="goToGame">Let's go</button>
        <img class="tutorial-modal__image" src="/assets/img/tutorial/introduction_4.jpg" alt="placeholder" />
      </div>
    </TutorialModal>
    <div class="start-menu-screen__content">
      <h1 class="start-menu-screen__title">
        <span class="start-menu-screen__title-main">{{ tContent(UI_LOCALIZATION.main_title) }}</span>
        <span class="start-menu-screen__title-sub">{{ tContent(UI_LOCALIZATION.main_description) }}</span>
      </h1>
      <form class="start-menu-screen__form">
        <button
          v-if="!isSliderVisible"
          class="start-menu-screen__btn"
          @click="showSlider"
        >
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

  // Было: центрирование и прижатие к низу — из‑за этого контент «уезжает» на персонажа справа
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
    width: min(520px, 45vw);

    transform: scale(0.9);
  }

  &__title {
    color: #2c1f1a;

    // Было: text-align: center;
    text-align: left;

    display: flex;
    flex-direction: column;
    line-height: 1;
    margin-bottom: 240px;

    &-main {
      font-size: 80px;
      text-transform: uppercase;
      letter-spacing: 4px;
      text-shadow: 4px 4px 0px #7f4837;
      color: #d99b47;
    }

    &-sub {
      font-size: 24px;
      margin-top: 5px;
      font-weight: normal;
      opacity: 0.9;
      letter-spacing: 2px;
      color: #d99b47;
    }
  }

  &__form {
    display: flex;
    flex-direction: column;

    // Было: align-items: center;
    align-items: flex-start;

    gap: 10px;

    // Было: width: 900px;
    width: 100%;

    // Было: transform: translateY(30px);
    transform: none;
  }

  &__btn {
    width: 300px;
    height: 70px;
    cursor: pointer;
    border: none;
    background: #7f4837;
    background-size: 100%;
    color: #d99b47;
    text-transform: uppercase;
    font-weight: bold;
    font-size: 36px;
    font-family: inherit;
    transition: background 0.2s ease;

    &:hover {
      background: #b56f44;
    }
  }
}

@media (min-height: 800px) {
  .start-menu-screen__content {
    transform: scale(1);
    margin-bottom: 0;
  }
}

/* остальной стиль без изменений */
@keyframes float {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-15px);
  }
}

.slide-images {
  display: flex;
  gap: 8px;
  justify-content: center;
  margin-bottom: 10px;

  img {
    width: 50%;
    height: auto;
    display: block;
    object-fit: cover;
  }
}

.slide-text {
  font-size: 13px;
  color: #d99b47;
  text-align: center;
  margin: 0;
  line-height: 1.5;
}

.slide-lets-go-btn {
  display: block;
  margin: 12px auto 0;
  padding: 10px 32px;
  cursor: pointer;
  border: none;
  background: #7f4837;
  color: #d99b47;
  text-transform: uppercase;
  font-weight: bold;
  font-size: 20px;
  font-family: inherit;
  transition: background 0.2s ease;

  &:hover {
    background: #b56f44;
  }
}

.slide-with-btn {
  position: relative;

  .slide-lets-go-btn {
    position: absolute;
    bottom: 30px;
    left: 50%;
    transform: translateX(-50%);
    margin: 0;
  }
}
</style>
