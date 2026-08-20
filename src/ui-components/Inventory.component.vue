<script setup>
import { computed } from "vue";
import { ITEM_SALT, ITEM_MATCHES, ITEM_MASTER_KEY, ITEM_ICONS } from "@/configs/gameplay.config.js";

const TOTAL_SLOTS = 9;

const props = defineProps({
  items: {
    type: Array,
    default: () => [],
  },
});

const slots = computed(() => {
  return Array.from({ length: TOTAL_SLOTS }, (_, index) => {
    const item = props.items[index] || null;
    return {
      keyNumber: index + 1,
      item: item
        ? {
            ...item,
            icon: ITEM_ICONS[item.name] || null,
          }
        : null,
    };
  });
});
</script>

<template>
  <div class="inventory">
    <div v-for="slot in slots" :key="slot.keyNumber" class="inventory__slot" :class="{ 'inventory__slot--filled': !!slot.item }">
      <span class="inventory__key-badge">{{ slot.keyNumber }}</span>

      <template v-if="slot.item">
        <img v-if="slot.item.icon" :src="slot.item.icon" :alt="slot.item.name" class="inventory__item-icon" draggable="false" />
        <span class="inventory__item-amount">{{ slot.item.amount }}</span>
      </template>
    </div>
  </div>
</template>

<style scoped lang="scss">
.inventory {
  display: flex;
  width: fit-content;
  gap: 8px;
  padding: 8px;
  background: rgba(18, 18, 24, 0.85);
  border: 2px solid rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  backdrop-filter: blur(8px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
  user-select: none;

  &__slot {
    position: relative;
    width: 56px;
    height: 56px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
    box-sizing: border-box;

    &--filled {
      background: rgba(255, 255, 255, 0.08);
      border-color: rgba(255, 255, 255, 0.3);

      &:hover {
        border-color: rgba(255, 255, 255, 0.6);
        background: rgba(255, 255, 255, 0.14);
      }
    }
  }

  &__key-badge {
    position: absolute;
    top: 3px;
    left: 4px;
    font-size: 10px;
    font-weight: 700;
    line-height: 1;
    color: rgba(255, 255, 255, 0.5);
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.8);
    pointer-events: none;
  }

  &__item-icon {
    width: 34px;
    height: 34px;
    object-fit: contain;
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.5));
    pointer-events: none;
  }

  &__item-amount {
    position: absolute;
    bottom: 3px;
    right: 4px;
    font-size: 12px;
    font-weight: 700;
    line-height: 1;
    color: #ffffff;
    text-shadow:
      -1px -1px 0 #000,
      1px -1px 0 #000,
      -1px 1px 0 #000,
      1px 1px 0 #000,
      0 2px 4px rgba(0, 0, 0, 0.8);
    pointer-events: none;
  }
}
</style>
