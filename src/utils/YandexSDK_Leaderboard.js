class YandexSDKService {
  constructor() {
    this.ysdk = null;
    this.player = null;
    this.leaderboards = null;
    this.isInitialized = false;
  }

  /**
   * Инициализация Yandex Games SDK
   */
  async init() {
    if (this.isInitialized) {
      return this.ysdk;
    }

    if (typeof window === "undefined" || typeof window.YaGames === "undefined") {
      console.warn("[YandexSDK] YaGames SDK is not available in the current environment.");
      return null;
    }

    try {
      this.ysdk = await window.YaGames.init();
      this.isInitialized = true;

      // Получаем сервис лидербордов
      await this.initLeaderboards();

      // Оповещаем платформу о готовности игры
      if (this.ysdk.features?.LoadingAPI?.ready) {
        this.ysdk.features.LoadingAPI.ready();
      }

      // Инициализируем игрока
      await this.initPlayer();

      return this.ysdk;
    } catch (error) {
      console.error("[YandexSDK] Failed to initialize SDK:", error);
      return null;
    }
  }

  /**
   * Инициализация сервиса лидербордов
   */
  async initLeaderboards() {
    if (!this.ysdk) return null;

    try {
      let lb = null;

      if (typeof this.ysdk.getLeaderboards === "function") {
        lb = await this.ysdk.getLeaderboards();
      } else if (this.ysdk.leaderboards) {
        lb = typeof this.ysdk.leaderboards.then === "function" 
          ? await this.ysdk.leaderboards 
          : this.ysdk.leaderboards;
      }

      this.leaderboards = lb;
      return this.leaderboards;
    } catch (error) {
      console.warn("[YandexSDK] Leaderboards init failed:", error);
      return null;
    }
  }

  /**
   * Инициализация объекта игрока
   */
  async initPlayer(options = { signed: false }) {
    if (!this.ysdk) return null;

    try {
      this.player = await this.ysdk.getPlayer(options);
      return this.player;
    } catch (error) {
      console.warn("[YandexSDK] Player initialization warning/failed:", error);
      return null;
    }
  }

  /**
   * Проверка авторизации игрока в Яндексе
   */
  isAuthenticated() {
    if (!this.player) return false;
    if (typeof this.player.isAuthorized === "function") {
      return this.player.isAuthorized();
    }
    if (typeof this.player.getMode === "function") {
      return this.player.getMode() !== "lite";
    }
    return false;
  }

  /**
   * Запрос на авторизацию игрока через диалог платформы
   */
  async requestAuth() {
    if (!this.ysdk) return false;

    try {
      await this.ysdk.auth.openAuthDialog();
      await this.initPlayer({ signed: true });
      return this.isAuthenticated();
    } catch (error) {
      console.warn("[YandexSDK] User cancelled or failed auth:", error);
      return false;
    }
  }

  /**
   * Отправка счета в лидерборд
   * @param {string} leaderboardName
   * @param {number} score
   * @param {string} extraData
   */
  async setScore(leaderboardName, score, extraData = "") {
    if (!this.leaderboards) {
      await this.initLeaderboards();
    }

    if (!this.leaderboards) {
      console.warn("[YandexSDK] Leaderboards API is not available");
      return null;
    }

    try {
      if (typeof this.leaderboards.setLeaderboardScore === "function") {
        return await this.leaderboards.setLeaderboardScore(leaderboardName, score, extraData);
      } else if (typeof this.leaderboards.setScore === "function") {
        return await this.leaderboards.setScore(leaderboardName, score, extraData);
      }
      throw new Error("No setScore method found on leaderboards service");
    } catch (error) {
      console.error(`[YandexSDK] Failed to set score for ${leaderboardName}:`, error);
      throw error;
    }
  }

  /**
   * Получение записей лидерборда
   * Возвращает отформатированные данные для Leaderboard.component.vue
   * @param {string} leaderboardName
   * @param {Object} options
   */
  async getLeaderboardData(
    leaderboardName,
    { topCount = 5, includeUser = true, quantityAround = 1, avatarSize = "small" } = {}
  ) {
    if (!this.leaderboards) {
      await this.initLeaderboards();
    }

    if (!this.leaderboards) {
      throw new Error("Leaderboards API is not available");
    }

    let result = null;

    if (typeof this.leaderboards.getLeaderboardEntries === "function") {
      result = await this.leaderboards.getLeaderboardEntries(leaderboardName, {
        quantityTop: topCount,
        includeUser,
        quantityAround,
        avatarSizeSmall: avatarSize,
      });
    } else if (typeof this.leaderboards.getEntries === "function") {
      result = await this.leaderboards.getEntries(leaderboardName, {
        quantityTop: topCount,
        includeUser,
        quantityAround,
        avatarSizeSmall: avatarSize,
      });
    } else {
      throw new Error("getLeaderboardEntries method is not found on leaderboards service");
    }

    const currentUserId = this.player?.getUniqueID?.();

    const formatEntry = (entry) => {
      const isUser =
        (currentUserId && entry.player?.uniqueID === currentUserId) ||
        entry.isCurrentUser ||
        false;

      return {
        id: entry.player?.uniqueID || `rank-${entry.rank}`,
        rank: entry.rank,
        score: entry.score,
        formattedScore: entry.formattedScore,
        name: entry.player?.publicName || "Игрок",
        avatar: entry.player?.getAvatarSrc?.(avatarSize) || entry.player?.avatarSrcSmall || "",
        isUser,
        extraData: entry.extraData,
      };
    };

    const entries = (result.entries || []).map(formatEntry);

    let userNeighbors = [];
    if (result.userRangeRanges && result.userRangeRanges.length > 0) {
      userNeighbors = result.userRangeRanges[0].entries.map(formatEntry);
    }

    return {
      entries,
      userNeighbors,
      userRank: result.userRank || null,
      leaderboard: result.leaderboard,
    };
  }
}

export const yandexSDK = new YandexSDKService();