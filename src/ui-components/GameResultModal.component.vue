<script setup>
import UiModal from "@/ui-components/UiModal.component.vue";

const props = defineProps({
  isGameOver: {
    type: Boolean,
    required: true,
  },
  isWin: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["again"]);

const onAgain = () => {
  emit("again");
};
</script>

<template>
  <UiModal
    :model-value="isGameOver"
    target=".platformer-screen__game-wrapper"
    max-width="520px"
  >
    <div class="game-result-modal">
      <h2 class="game-result-modal__title">
        {{ isWin ? "You Win!" : "Game Over" }}
      </h2>

      <div class="game-result-modal__image">
        <img
          :src="isWin ? 'https://placehold.co/540x360/4a7c59/d99b47' : 'https://placehold.co/540x360/7f4837/d99b47'"
          alt="result"
        />
      </div>

      <p class="game-result-modal__text">
        {{
          isWin
            ? "Congratulations! You have successfully completed the level. Your skills are truly impressive!"
            : "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore."
        }}
      </p>

      <button class="game-result-modal__btn" @click="onAgain">Again</button>
    </div>
  </UiModal>
</template>

<style scoped lang="scss">
.game-result-modal {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;

  &__title {
    font-size: 32px;
    font-weight: bold;
    text-transform: uppercase;
    color: #d99b47;
    text-align: center;
    margin: 0;
    letter-spacing: 2px;
    text-shadow: 2px 2px 0px #2c1f1a;
  }

  &__image {
    width: 100%;
    display: flex;
    justify-content: center;

    img {
      width: 100%;
      height: auto;
      display: block;
      object-fit: cover;
    }
  }

  &__text {
    font-size: 13px;
    color: #d99b47;
    text-align: center;
    margin: 0;
    line-height: 1.5;
  }

  &__btn {
    display: block;
    margin: 4px auto 0;
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
}
</style>
