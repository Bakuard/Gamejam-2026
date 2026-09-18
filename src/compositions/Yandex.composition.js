export const yandexComposition = {
  ysdk: null,

  loadYandexSdk() {
    const script = document.createElement("script");
    script.src = "/sdk.js";
    script.async = true;
    script.onload = initSDK;
    script.onerror = () => console.warn("Не удалось загрузить Yandex SDK");
    document.body.append(script);
  },

  notifyYandexAboutGameReady() {
    if (!yandexComposition.ysdk) {
      console.warn("Ошибка обращения к Yandex SDK: Yandex SDK ещё не инициализирован");
      return;
    }

    yandexComposition.ysdk.features.LoadingAPI?.ready();
  },

  notifyYandexAboutGameStart() {
    if (!yandexComposition.ysdk) {
      console.warn("Ошибка обращения к Yandex SDK: Yandex SDK ещё не инициализирован");
      return;
    }

    yandexComposition.ysdk.features.GameplayAPI?.start();
  },

  notifyYandexAboutGameStop() {
    if (!yandexComposition.ysdk) {
      console.warn("Ошибка обращения к Yandex SDK: Yandex SDK ещё не инициализирован");
      return;
    }

    yandexComposition.ysdk.features.GameplayAPI?.stop();
  },
};

async function initSDK() {
  if (typeof YaGames === "undefined") {
    console.warn("Ошибка при инициализации Yandex SDK: SDK не был загружен");
    return;
  }

  yandexComposition.ysdk = await YaGames.init({ signed: false });
}