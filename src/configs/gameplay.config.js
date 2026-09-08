// ... existing code ...
/* PLAYER SETTINGS */
import gameplay from "@/content/configs/gameplay.json";

export const PLAYER = structuredClone(gameplay.PLAYER);
export const LIGHT_POINT = structuredClone(gameplay.LIGHT_POINT);
export const GHOSTS = structuredClone(gameplay.GHOSTS);
export const TIME = structuredClone(gameplay.TIME);
export const AUDIO = structuredClone(gameplay.AUDIO);
export const ANALYTICS = structuredClone(gameplay.ANALYTICS);
export const PARTICLES = structuredClone(gameplay.PARTICLES);
export const DROP_ITEMS = structuredClone(gameplay.DROP_ITEMS);
export const GHOSTS_VFX = structuredClone(gameplay.GHOSTS_VFX);
export const GHOSTS_VFX_BY_PHASE_INDEX = structuredClone(gameplay.GHOSTS_VFX_BY_PHASE_INDEX);
export const INVENTORY = structuredClone(gameplay.INVENTORY);
export const ITEM_SALT = "salt";
export const ITEM_MATCHES = "matches";
export const ITEM_MASTER_KEY = "master_key";

export const ITEM_ICONS = {
  [ITEM_SALT]: "assets/img/icons/salt.svg",
  [ITEM_MATCHES]: "assets/img/icons/matches.svg",
  [ITEM_MASTER_KEY]: "assets/img/icons/skeleton-key.svg",
};

export const TIME_ICONS = {
  SUN: "assets/img/icons/sun.svg",
  MOON: "assets/img/icons/moon.svg",
};

export const TOOLTIP_ICONS = {
  CONTROLLER: "assets/img/icons/controller.svg",
  MATCHES: "assets/img/icons/matches.svg",
  GHOST: "assets/img/icons/ghost.svg",
  DOOR: "assets/img/icons/door.svg",
  KEY: "assets/img/icons/skeleton-key.svg",
  LAMP: "assets/img/icons/lamp.svg",
  SALT: "assets/img/icons/salt.svg",
  BOX: "assets/img/icons/box.svg",
};

export const TUTORIAL_TOOLTIPS = {
  CONTROLLER: {
    id: "controls-movement",
    icon: "CONTROLLER",
    viewTime: 10000,
    text: "Движение — [A] [D], прыжок — [W], спрыгнуть с деревянных платформ, лестниц и ящиков — [S]",
  },
  ITEMS: {
    id: "collect-items",
    icon: "MATCHES",
    viewTime: 12000,
    text: "Собирай предметы до наступления ночи. Новые появятся утром.",
  },
  GHOST: {
    id: "ghosts-awakening",
    icon: "GHOST",
    viewTime: 5000,
    text: "Призраки близко! Не дай им коснуться тебя до рассвета.",
  },
};