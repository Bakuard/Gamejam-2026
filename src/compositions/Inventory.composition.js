import { INVENTORY } from "@/configs/gameplay.config.js";

export const inventoryComposition = {
  increaseItem(inventoryStore, itemType) {
    let inventoryItem = inventoryStore.items.find((item) => item.name === itemType && item.amount < INVENTORY.maxStackSize);

    if (!inventoryItem && inventoryStore.items.length === INVENTORY.maxStacks) return false;

    if (inventoryItem) inventoryItem.amount++;
    else inventoryStore.items.push({ name: itemType, amount: 1 });

    return true;
  },

  decreaseItem(inventoryStore, itemType) {
    let inventoryItemIndex = inventoryStore.items.findLastIndex((item) => item && item.name === itemType && item.amount > 0);
    if (inventoryItemIndex !== -1) {
      const item = inventoryStore.items[inventoryItemIndex];
      item.amount--;
      if (item.amount === 0) inventoryStore.items.splice(inventoryItemIndex, 1);
      return true;
    }
    return false;
  },
};