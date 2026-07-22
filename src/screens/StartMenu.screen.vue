<script setup lang="ts">
import { useRouter } from "vue-router";
import { createI18nContentHelpers } from "@/utils/utils.js";
import i18next from "@/i18n.js";
import { UI_LOCALIZATION } from "@/configs/uiLocalization.config.js";
import TutorialSlider from "@/ui-components/TutorialSlider.component.vue";
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
    <div class="start-menu-screen__content">
      <h1 class="start-menu-screen__title">
        <span class="start-menu-screen__title-main">{{ tContent(UI_LOCALIZATION.main_title) }}</span>
        <span class="start-menu-screen__title-sub">{{ tContent(UI_LOCALIZATION.main_description) }}</span>
      </h1>
      <form class="start-menu-screen__form">
        <TutorialSlider v-if="isSliderVisible">
          <div>
            <div class="slide-images">
              <img src="https://placehold.co/540x360" alt="placeholder" />
              <img src="https://placehold.co/540x360" alt="placeholder" />
            </div>
            <p class="slide-text">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
          </div>
          <div>
            <div class="slide-images">
              <img src="https://placehold.co/540x360" alt="placeholder" />
              <img src="https://placehold.co/540x360" alt="placeholder" />
            </div>
            <p class="slide-text">Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
          </div>
          <div>
            <div class="slide-images">
              <img src="https://placehold.co/540x360" alt="placeholder" />
              <img src="https://placehold.co/540x360" alt="placeholder" />
            </div>
            <p class="slide-text">Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.</p>
          </div>
          <div>
            <div class="slide-images">
              <img src="https://placehold.co/540x360" alt="placeholder" />
              <img src="https://placehold.co/540x360" alt="placeholder" />
            </div>
            <p class="slide-text">Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
          </div>
          <div>
            <div class="slide-images">
              <img src="https://placehold.co/540x360" alt="placeholder" />
              <img src="https://placehold.co/540x360" alt="placeholder" />
            </div>
            <p class="slide-text">Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Proin pharetra nonummy pede.</p>
          </div>
          <div>
            <div class="slide-images">
              <img src="https://placehold.co/540x360" alt="placeholder" />
              <img src="https://placehold.co/540x360" alt="placeholder" />
            </div>
            <p class="slide-text">Nunc fringilla lorem at ipsum semper sagittis. Curabitur congue ipsum at arcu faucibus, vel tincidunt nunc vehicula.</p>
            <button class="slide-lets-go-btn" @click="goToGame">Let's go</button>
          </div>
        </TutorialSlider>
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
  align-items: center;
  justify-content: flex-end;
  padding-bottom: 40px;
  background: #a09380 url("/public/assets/img/background/sky.jpg") center center;
  background-size: cover;

  &__content {
    display: flex;
    flex-direction: column;
    align-items: center;
    height: 100%;
    transform: scale(0.8);
  }

  &__logo-container {
    width: 180px;
    height: auto;
    margin-bottom: -15px;
    filter: drop-shadow(4px 4px 0px #2c1f1a);
    animation: float 4s ease-in-out infinite;
  }

  &__logo {
    width: 100%;
    height: 100%;
  }

  &__title {
    color: #2c1f1a;
    text-align: center;
    display: flex;
    flex-direction: column;
    line-height: 1;
    margin-bottom: auto;

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
    }
  }

  &__form {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    width: 900px;
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
    margin-bottom: 100px;
  }
}

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
</style>
