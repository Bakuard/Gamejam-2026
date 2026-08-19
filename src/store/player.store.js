import { defineStore } from "pinia";

export const usePlayer = defineStore("player", {
  state: () => ({
    isGameOver: false,
    isWin: false,
    isNight: false,
    allTime: 0,
    remainingTime: 0,
  }),
  actions: {}
});
