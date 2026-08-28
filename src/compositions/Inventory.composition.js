export const inventoryComposition = {
  clearInventory(inventoryStore) {
    inventoryStore.items.forEach(item => item.amount = 0);
  },

  increaseItem(inventoryStore, itemType) {
    let inventoryItem = inventoryStore.items.find((item) => item.name === itemType);
    inventoryItem.amount++;
  },

  decreaseItem(inventoryStore, itemType) {
    let inventoryItemIndex = inventoryStore.items.findLastIndex((item) => item && item.name === itemType && item.amount > 0);
    if (inventoryItemIndex !== -1) {
      const item = inventoryStore.items[inventoryItemIndex];
      item.amount--;
      return true;
    }
    return false;
  },
};