import { defineStore } from "pinia";

export const useGhostStore = defineStore("ghosts", {
  state: () => ({
    currentGhostsNumber: 3,
    survivalCounter: 0,
  }),
  actions: {},
});
