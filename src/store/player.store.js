import { defineStore } from "pinia";

export const usePlayer = defineStore("player", {
  state: () => ({
    isGameOver: false,
    isWin: false,
  }),
  actions: {}
});
