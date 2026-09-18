import { defineStore } from "pinia";

export const useLeaderboardStore = defineStore("leaderboard", {
  state: () => ({
    entries: [],
    userNeighbors: [],
    userRank: null,
    userScore: 0,
    isLoading: false,
    hasError: false,
    errorMessage: "",
    isAuthenticated: false,
  }),
});