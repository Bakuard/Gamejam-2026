import { defineStore } from "pinia";

export const useTutorial = defineStore("tutorial", {
  state: () => ({
    tooltips: [],
    tutorial: [],
  }),
});