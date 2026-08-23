import { defineStore } from "pinia";
import { ITEM_MATCHES, ITEM_SALT, ITEM_MASTER_KEY } from "@/configs/gameplay.config.js";

export const useInventoryStore = defineStore("inventory", {
  state: () => ({
    items: [
      { name: ITEM_MATCHES, amount: 50 }
    ]
  }),
  actions: {},
});
