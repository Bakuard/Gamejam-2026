import { defineStore } from "pinia";

export const useGhostStore = defineStore("ghosts", {
  state: () => ({
    currentGhostsNumber: 3
  }),
  actions: {},
});
