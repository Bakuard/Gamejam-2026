// ... existing code ...
/* PLAYER SETTINGS */
import gameplay from "@/content/configs/gameplay.json";
import { UI_LOCALIZATION } from "@/configs/uiLocalization.config.js";

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

export const ITEM_TOOLTIPS = {
  [ITEM_SALT]: UI_LOCALIZATION.item_salt,
  [ITEM_MATCHES]: UI_LOCALIZATION.item_matches,
  [ITEM_MASTER_KEY]: UI_LOCALIZATION.item_master_key,
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
    text: UI_LOCALIZATION.tooltip_controls,
  },
  ITEMS: {
    id: "collect-items",
    icon: "MATCHES",
    viewTime: 12000,
    text: UI_LOCALIZATION.tooltip_items,
  },
  GHOST: {
    id: "ghosts-awakening",
    icon: "GHOST",
    viewTime: 5000,
    text: UI_LOCALIZATION.tooltip_ghosts,
  },
  SALT: {
    id: "item-salt",
    icon: "SALT",
    viewTime: 15000,
    text: UI_LOCALIZATION.item_salt,
  },
  MATCHES: {
    id: "item-matches",
    icon: "MATCHES",
    viewTime: 15000,
    text: UI_LOCALIZATION.item_matches,
  },
  MASTER_KEY: {
    id: "item-master-key",
    icon: "KEY",
    viewTime: 15000,
    text: UI_LOCALIZATION.item_master_key,
  },
};

export const INTERACTIVE_TOOLTIPS = {
  BOX_PICKUP: {
    id: "box-pickup",
    viewTime: 0,
    text: UI_LOCALIZATION.tooltip_box_pickup,
  },
  BOX_DROP: {
    id: "box-drop",
    viewTime: 0,
    text: UI_LOCALIZATION.tooltip_box_drop,
  },
  DOOR_OPEN: {
    id: "door-open",
    viewTime: 0,
    text: UI_LOCALIZATION.tooltip_door_open,
  },
  DOOR_CLOSE: {
    id: "door-close",
    viewTime: 0,
    text: UI_LOCALIZATION.tooltip_door_close,
  },
};
