import { defineStore } from "pinia";
import { GHOSTS } from "@/configs/gameplay.config.js";

export const useGhostStore = defineStore("ghosts", {
  state: () => ({
    currentGhostsNumber: GHOSTS.startGhostNumber,
    survivalCounter: 0,
  }),
  actions: {},
});
