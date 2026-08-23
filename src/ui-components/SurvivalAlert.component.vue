<script setup>
import { computed, ref, watch, onBeforeUnmount } from "vue";

const props = defineProps({
  count: {
    type: Number,
    default: 0,
  },
  viewTime: {
    type: Number,
    default: 0,
  },
});

const isVisible = ref(false);
let hideTimeout = null;

const clearHideTimeout = () => {
  if (hideTimeout) {
    clearTimeout(hideTimeout);
    hideTimeout = null;
  }
};

const showAlert = () => {
  clearHideTimeout();
  isVisible.value = true;

  if (props.viewTime > 0) {
    hideTimeout = setTimeout(() => {
      isVisible.value = false;
    }, props.viewTime);
  }
};

watch(
  () => props.count,
  (newVal, oldVal) => {
    if (newVal > (oldVal ?? 0)) {
      showAlert();
    }
  }
);

onBeforeUnmount(() => {
  clearHideTimeout();
});

const pluralizeNights = (n) => {
  const absN = Math.abs(n);
  const rem100 = absN % 100;
  const rem10 = absN % 10;

  if (rem100 >= 11 && rem100 <= 19) {
    return "ночей";
  }

  if (rem10 === 1) {
    return "ночь";
  }

  if (rem10 >= 2 && rem10 <= 4) {
    return "ночи";
  }

  return "ночей";
};

const text = computed(() => {
  return `Ты выжил ${props.count} ${pluralizeNights(props.count)}`;
});
</script>

<template>
  <Transition name="fade">
    <div v-if="isVisible" class="survival-alert">
      <span class="survival-alert__text">{{ text }}</span>
    </div>
  </Transition>
</template>

<style scoped lang="scss">
.survival-alert {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 12px 24px;
  background: rgba(18, 18, 24, 0.85);
  border: 2px solid rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  backdrop-filter: blur(8px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
  user-select: none;

  &__text {
    font-size: 40px;
    font-weight: 700;
    line-height: 1.2;
    color: #d99b47;
    text-shadow:
      -1px -1px 0 #000,
      1px -1px 0 #000,
      -1px 1px 0 #000,
      1px 1px 0 #000,
      0 2px 4px rgba(0, 0, 0, 0.9);
    pointer-events: none;
    text-align: center;
  }
}
</style>
