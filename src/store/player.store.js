import { defineStore } from "pinia";
import { PLAYER_CURRENT_HEALTH } from "@/configs/gameplay.config.js";

export const usePlayer = defineStore("player", {
  state: () => ({
    currentHealth: PLAYER_CURRENT_HEALTH,
    isGameOver: false,
    isWin: false,
  }),
  actions: {}
});
