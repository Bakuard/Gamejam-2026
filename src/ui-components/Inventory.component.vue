<script setup>
import { computed } from "vue";
import { ITEM_SALT, ITEM_MATCHES, ITEM_MASTER_KEY, ITEM_ICONS, ITEM_TOOLTIPS } from "@/configs/gameplay.config.js";

const TOTAL_SLOTS = 3;

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
            tooltipText: ITEM_TOOLTIPS[item.name] || "",
          }
        : null,
    };
  });
});
</script>

<template>
  <div class="inventory">
    <div
      v-for="slot in slots"
      :key="slot.keyNumber"
      class="inventory__slot"
      :class="{
        'inventory__slot--filled': !!slot.item,
        'inventory__slot--highlighted': slot.item?.isHighLight,
      }"
    >
      <span class="inventory__key-badge">{{ slot.keyNumber }}</span>

      <template v-if="slot.item">
        <img v-if="slot.item.icon" :src="slot.item.icon" :alt="slot.item.name" class="inventory__item-icon" draggable="false" />
        <span class="inventory__item-amount">{{ slot.item.amount }}</span>

        <div v-if="slot.item.tooltipText" class="inventory__tooltip">
          <p class="inventory__tooltip-text">{{ slot.item.tooltipText }}</p>
        </div>
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

        .inventory__tooltip {
          opacity: 1;
          visibility: visible;
          transform: translateX(-50%) translateY(0);
        }
      }
    }

    &--highlighted {
      animation: inventory-slot-highlight 0.3s ease-in-out infinite alternate;
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

  &__tooltip {
    position: absolute;
    bottom: calc(100% + 10px);
    left: 50%;
    transform: translateX(-50%) translateY(6px);
    opacity: 0;
    visibility: hidden;
    pointer-events: none;
    z-index: 200;
    width: max-content;
    max-width: 260px;
    padding: 8px 12px;
    box-sizing: border-box;

    background: rgba(18, 18, 24, 0.95);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 8px;
    backdrop-filter: blur(8px);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.6);
    transition:
      opacity 0.2s ease,
      transform 0.2s ease,
      visibility 0.2s ease;

    &::after {
      content: "";
      position: absolute;
      top: 100%;
      left: 50%;
      transform: translateX(-50%);
      border-width: 5px;
      border-style: solid;
      border-color: rgba(18, 18, 24, 0.95) transparent transparent transparent;
    }
  }

  &__tooltip-text {
    margin: 0;
    font-size: 13px;
    font-weight: 600;
    line-height: 1.3;
    color: #d99b47;
    text-align: center;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.8);
    white-space: normal;
  }
}

@keyframes inventory-slot-highlight {
  0% {
    border-color: rgba(255, 255, 255, 0.3);
    background: rgba(255, 255, 255, 0.08);
  }
  100% {
    border-color: rgba(255, 255, 255, 0.6);
    background: rgba(255, 255, 255, 0.14);
  }
}
</style>
