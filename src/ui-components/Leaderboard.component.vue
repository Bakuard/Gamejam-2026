<script setup>
import { computed } from "vue";

const props = defineProps({
  entries: {
    type: Array,
    default: () => [],
  },
  userNeighbors: {
    type: Array,
    default: () => [],
  },
  topCount: {
    type: Number,
    default: 5,
  },
  title: {
    type: String,
    default: "Лучшие игроки",
  },
  emptyText: {
    type: String,
    default: "Нет данных",
  },
  isLoading: {
    type: Boolean,
    default: false,
  },
  loadingText: {
    type: String,
    default: "Загрузка...",
  },
  hasError: {
    type: Boolean,
    default: false,
  },
  errorText: {
    type: String,
    default: "Не удалось загрузить таблицу лидеров",
  },
  retryText: {
    type: String,
    default: "Повторить",
  },
  isAuthenticated: {
    type: Boolean,
    default: true,
  },
  unauthenticatedText: {
    type: String,
    default: "Войдите в аккаунт Яндекс, чтобы сохранить свой рекорд и появиться в таблице лидеров.",
  },
});

const emit = defineEmits(["retry"]);

const onRetryClick = () => {
  emit("retry");
};

const displayEntries = computed(() => {
  if (!props.entries || props.entries.length === 0) return [];

  const topEntries = props.entries.slice(0, props.topCount);
  const userInTop = topEntries.some((entry) => entry.isUser);

  if (userInTop || (!props.userNeighbors.length && !props.entries.some((entry) => entry.isUser))) {
    return topEntries;
  }

  // Если переданы отдельные соседи игрока вне топ-5
  if (props.userNeighbors && props.userNeighbors.length > 0) {
    return [...topEntries, { isSeparator: true, id: "separator" }, ...props.userNeighbors];
  }

  // Если все записи переданы в одном массиве entries, ищем позицию пользователя
  const userIndex = props.entries.findIndex((entry) => entry.isUser);
  if (userIndex >= props.topCount) {
    const startIndex = Math.max(props.topCount, userIndex - 1);
    const endIndex = Math.min(props.entries.length, userIndex + 2);
    const neighbors = props.entries.slice(startIndex, endIndex);

    return [...topEntries, { isSeparator: true, id: "separator" }, ...neighbors];
  }

  return topEntries;
});
</script>

<template>
  <div class="leaderboard">
    <h2 v-if="title" class="leaderboard__title">{{ title }}</h2>

    <div v-if="isLoading" class="leaderboard__loading">
      <div class="leaderboard__spinner"></div>
      <p class="leaderboard__loading-text">{{ loadingText }}</p>
    </div>

    <div v-else-if="hasError" class="leaderboard__error">
      <p class="leaderboard__error-text">{{ errorText }}</p>
      <button v-if="retryText" class="leaderboard__retry-btn" @click="onRetryClick">
        {{ retryText }}
      </button>
    </div>

    <div v-else-if="displayEntries && displayEntries.length" class="leaderboard__list">
      <template v-for="(entry, index) in displayEntries" :key="entry.isSeparator ? 'sep-' + index : entry.rank || index">
        <div v-if="entry.isSeparator" class="leaderboard__separator">
          <span class="leaderboard__separator-dots">• • •</span>
        </div>

        <div
          v-else
          class="leaderboard__item"
          :class="{
            'leaderboard__item--top-1': entry.rank === 1,
            'leaderboard__item--top-2': entry.rank === 2,
            'leaderboard__item--top-3': entry.rank === 3,
            'leaderboard__item--user': entry.isUser,
          }"
        >
          <div class="leaderboard__rank">
            <span class="leaderboard__rank-badge">{{ entry.rank ?? index + 1 }}</span>
          </div>

          <div class="leaderboard__avatar">
            <img v-if="entry.avatar" :src="entry.avatar" :alt="entry.name" class="leaderboard__avatar-img" />
            <div v-else class="leaderboard__avatar-placeholder">
              {{ (entry.name || "?").charAt(0).toUpperCase() }}
            </div>
          </div>

          <div class="leaderboard__info">
            <span class="leaderboard__name" :title="entry.name">{{ entry.name || "Игрок" }}</span>
          </div>

          <div class="leaderboard__score">
            <span class="leaderboard__score-value">{{ entry.score }}</span>
          </div>
        </div>
      </template>
    </div>

    <div v-else class="leaderboard__empty">
      <p class="leaderboard__empty-text">{{ emptyText }}</p>
    </div>

    <div v-if="!isAuthenticated && !isLoading && !hasError" class="leaderboard__auth-notice">
      <p class="leaderboard__auth-notice-text">{{ unauthenticatedText }}</p>
    </div>
  </div>
</template>

<style scoped lang="scss">
.leaderboard {
  box-sizing: border-box;
  width: 100%;
  max-width: 460px;
  padding: 16px;
  background: rgba(18, 18, 24, 0.85);
  border: 2px solid rgba(255, 255, 255, 0.15);
  border-radius: 16px;
  backdrop-filter: blur(8px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.6);
  user-select: none;
  display: flex;
  flex-direction: column;
  gap: 12px;

  &__title {
    margin: 0 0 4px 0;
    font-size: 20px;
    font-weight: 800;
    text-transform: uppercase;
    color: #ffffff;
    text-align: center;
    letter-spacing: 1.5px;
    text-shadow:
      0 2px 8px rgba(0, 0, 0, 0.8),
      0 0 16px rgba(255, 255, 255, 0.2);
  }

  &__list {
    display: flex;
    flex-direction: column;
    gap: 6px;
    max-height: 420px;
    overflow-y: auto;
    padding-right: 4px;

    &::-webkit-scrollbar {
      width: 6px;
    }

    &::-webkit-scrollbar-track {
      background: rgba(255, 255, 255, 0.05);
      border-radius: 4px;
    }

    &::-webkit-scrollbar-thumb {
      background: rgba(255, 255, 255, 0.2);
      border-radius: 4px;

      &:hover {
        background: rgba(255, 255, 255, 0.35);
      }
    }
  }

  &__separator {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2px 0;
  }

  &__separator-dots {
    color: rgba(255, 255, 255, 0.35);
    font-size: 14px;
    letter-spacing: 4px;
  }

  &__item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px 12px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 10px;
    box-sizing: border-box;
    transition: all 0.2s ease;

    &:hover {
      background: rgba(255, 255, 255, 0.09);
      border-color: rgba(255, 255, 255, 0.25);
    }

    &--top-1 {
      border-color: rgba(255, 215, 0, 0.5);
      background: rgba(255, 215, 0, 0.08);

      .leaderboard__rank-badge {
        color: #ffd700;
        text-shadow: 0 0 10px rgba(255, 215, 0, 0.6);
      }
    }

    &--top-2 {
      border-color: rgba(192, 192, 192, 0.5);
      background: rgba(192, 192, 192, 0.08);

      .leaderboard__rank-badge {
        color: #e0e0e0;
      }
    }

    &--top-3 {
      border-color: rgba(205, 127, 50, 0.5);
      background: rgba(205, 127, 50, 0.08);

      .leaderboard__rank-badge {
        color: #cd7f32;
      }
    }

    &--user {
      border-color: #d99b47;
      background: rgba(217, 155, 71, 0.15);
      box-shadow: 0 0 12px rgba(217, 155, 71, 0.25);

      .leaderboard__name {
        color: #d99b47;
        font-weight: 700;
      }
    }
  }

  &__rank {
    width: 28px;
    text-align: center;
    flex-shrink: 0;
  }

  &__rank-badge {
    font-size: 15px;
    font-weight: 800;
    color: rgba(255, 255, 255, 0.7);
    text-shadow: 0 1px 3px rgba(0, 0, 0, 0.8);
  }

  &__avatar {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    overflow: hidden;
    flex-shrink: 0;
    border: 1px solid rgba(255, 255, 255, 0.2);
    background: rgba(255, 255, 255, 0.05);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  &__avatar-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  &__avatar-placeholder {
    font-size: 13px;
    font-weight: 700;
    color: rgba(255, 255, 255, 0.6);
  }

  &__info {
    flex: 1;
    min-width: 0;
  }

  &__name {
    display: block;
    font-size: 14px;
    font-weight: 600;
    color: #ffffff;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.8);
  }

  &__score {
    flex-shrink: 0;
    text-align: right;
  }

  &__score-value {
    font-size: 16px;
    font-weight: 800;
    color: #d99b47;
    text-shadow:
      -1px -1px 0 #000,
      1px -1px 0 #000,
      -1px 1px 0 #000,
      1px 1px 0 #000,
      0 2px 4px rgba(0, 0, 0, 0.9);
  }

  &__loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12px;
    padding: 36px 16px;
  }

  &__spinner {
    width: 32px;
    height: 32px;
    border: 3px solid rgba(255, 255, 255, 0.15);
    border-top-color: #d99b47;
    border-radius: 50%;
    animation: leaderboard-spin 0.8s linear infinite;
  }

  &__loading-text {
    margin: 0;
    font-size: 14px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.7);
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.8);
  }

  &__error {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12px;
    padding: 28px 16px;
    text-align: center;
  }

  &__error-text {
    margin: 0;
    font-size: 14px;
    font-weight: 600;
    color: #ff6b6b;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.8);
  }

  &__retry-btn {
    padding: 8px 20px;
    cursor: pointer;
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.25);
    border-radius: 8px;
    color: #ffffff;
    font-size: 13px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 1px;
    font-family: inherit;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    transition: all 0.2s ease;

    &:hover {
      background: rgba(255, 255, 255, 0.16);
      border-color: rgba(255, 255, 255, 0.5);
      transform: translateY(-1px);
    }

    &:active {
      transform: translateY(0);
      background: rgba(255, 255, 255, 0.1);
    }
  }

  &__empty {
    padding: 32px 16px;
    text-align: center;
  }

  &__empty-text {
    margin: 0;
    font-size: 14px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.5);
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.8);
  }

  &__auth-notice {
    padding: 10px 14px;
    background: rgba(217, 155, 71, 0.1);
    border: 1px dashed rgba(217, 155, 71, 0.4);
    border-radius: 10px;
    text-align: center;
  }

  &__auth-notice-text {
    margin: 0;
    font-size: 12px;
    font-weight: 500;
    line-height: 1.4;
    color: rgba(255, 255, 255, 0.8);
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.8);
  }
}

@keyframes leaderboard-spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
