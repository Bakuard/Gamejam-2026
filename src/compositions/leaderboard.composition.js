import { yandexSDK } from "@/utils/YandexSDK_Leaderboard.js";

export const leaderboardComposition = {
  /**
   * Проверка и обновление статуса авторизации игрока в хранилище
   */
  checkAuth(leaderboardStore) {
    leaderboardStore.isAuthenticated = yandexSDK.isAuthenticated();
    return leaderboardStore.isAuthenticated;
  },

  /**
   * Запрос на авторизацию игрока через платформу
   */
  async login(leaderboardStore) {
    leaderboardStore.isLoading = true;
    try {
      const isAuthed = await yandexSDK.requestAuth();
      leaderboardStore.isAuthenticated = isAuthed;
      return isAuthed;
    } catch (error) {
      console.error("[leaderboardComposition] Auth error:", error);
      return false;
    } finally {
      leaderboardStore.isLoading = false;
    }
  },

  /**
   * Загрузка данных таблицы рекордов
   * @param {Object} leaderboardStore
   * @param {string} leaderboardName
   * @param {Object} options
   */
  async fetchLeaderboard(leaderboardStore, leaderboardName, options = {}) {
    leaderboardStore.isLoading = true;
    leaderboardStore.hasError = false;
    leaderboardStore.errorMessage = "";

    try {
      this.checkAuth(leaderboardStore);

      const data = await yandexSDK.getLeaderboardData(leaderboardName, options);

      leaderboardStore.entries = data.entries || [];
      leaderboardStore.userNeighbors = data.userNeighbors || [];
      leaderboardStore.userRank = data.userRank || null;

      // Ищем рекорд текущего пользователя среди полученных записей
      const userEntry =
        leaderboardStore.entries.find((entry) => entry.isUser) ||
        leaderboardStore.userNeighbors.find((entry) => entry.isUser);

      if (userEntry) {
        leaderboardStore.userScore = userEntry.score;
      }

      return data;
    } catch (error) {
      console.error("[leaderboardComposition] Fetch leaderboard error:", error);
      leaderboardStore.hasError = true;
      leaderboardStore.errorMessage = error.message || "Failed to load leaderboard";
      return null;
    } finally {
      leaderboardStore.isLoading = false;
    }
  },

  /**
   * Отправка нового счета в лидерборд
   * @param {Object} leaderboardStore
   * @param {string} leaderboardName
   * @param {number} score
   * @param {string} extraData
   */
  async submitScore(leaderboardStore, leaderboardName, score, extraData = "") {
    try {
      const result = await yandexSDK.setScore(leaderboardName, score, extraData);

      if (score > leaderboardStore.userScore) {
        leaderboardStore.userScore = score;
      }

      return result;
    } catch (error) {
      console.error("[leaderboardComposition] Submit score error:", error);
      throw error;
    }
  },

  /**
   * Сброс данных лидерборда
   */
  reset(leaderboardStore) {
    leaderboardStore.entries = [];
    leaderboardStore.userNeighbors = [];
    leaderboardStore.userRank = null;
    leaderboardStore.userScore = 0;
    leaderboardStore.isLoading = false;
    leaderboardStore.hasError = false;
    leaderboardStore.errorMessage = "";
  },
};