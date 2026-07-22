// ... existing code ...
/* PLAYER SETTINGS */
import gameplay from "@/content/configs/gameplay.json";

export const PLAYER_SPEED = gameplay.PLAYER_SPEED;
export const PLAYER_JUMP_MULTIPLICATOR = gameplay.PLAYER_JUMP_MULTIPLICATOR;
export const PLAYER_FALL_MULTIPLICATOR = gameplay.PLAYER_FALL_MULTIPLICATOR;
export const PLAYER_PLATFORM_BODY_WIDTH = gameplay.PLAYER_PLATFORM_BODY_WIDTH;
export const PLAYER_PLATFORM_BODY_HEIGHT = gameplay.PLAYER_PLATFORM_BODY_HEIGHT;
export const PLAYER_DISPLAY_WIDTH = gameplay.PLAYER_DISPLAY_WIDTH;
export const PLAYER_DISPLAY_HEIGHT = gameplay.PLAYER_DISPLAY_HEIGHT;
export const GHOSTS = structuredClone(gameplay.GHOSTS);