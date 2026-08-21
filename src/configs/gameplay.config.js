// ... existing code ...
/* PLAYER SETTINGS */
import gameplay from "@/content/configs/gameplay.json";

export const PLAYER = structuredClone(gameplay.PLAYER);
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