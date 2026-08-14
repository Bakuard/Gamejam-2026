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
export const PLAYER_STAIRS_DROP_ACCELERATION = gameplay.PLAYER_STAIRS_DROP_ACCELERATION;
export const STAIR_FOOT_TOLERANCE = gameplay.STAIR_FOOT_TOLERANCE;
export const STAIR_COYOTE_TIME = gameplay.STAIR_COYOTE_TIME;
export const PLAYER_BODY_OFFSET_Y = gameplay.PLAYER_BODY_OFFSET_Y;
export const PLAYER_ON_GROUND_COYOTE_TIME = gameplay.PLAYER_ON_GROUND_COYOTE_TIME;
export const GHOSTS = structuredClone(gameplay.GHOSTS);
export const TIME = structuredClone(gameplay.TIME);
export const AUDIO = structuredClone(gameplay.AUDIO);
export const ANALYTICS = structuredClone(gameplay.ANALYTICS);
export const PARTICLES = structuredClone(gameplay.PARTICLES);
export const GHOSTS_VFX = structuredClone(gameplay.GHOSTS_VFX);
export const GHOSTS_VFX_BY_PHASE_INDEX = structuredClone(gameplay.GHOSTS_VFX_BY_PHASE_INDEX);
