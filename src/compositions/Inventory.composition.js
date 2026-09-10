export const inventoryComposition = {
  clearInventory(inventoryStore) {
    inventoryStore.items.forEach((item) => (item.amount = 0));
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

  toggleHighLightItem(inventoryStore, itemType) {
    inventoryStore.$patch((state) => {
      const item = state.items.find((item) => item.name === itemType);
      if (item) {
        item.isHighLight = !item.isHighLight;
      }
    });
  },

  getItemAmount(inventoryStore, itemType) {
    let inventoryItem = inventoryStore.items.find((item) => item.name === itemType);
    return inventoryItem?.amount ?? 0;
  },
};