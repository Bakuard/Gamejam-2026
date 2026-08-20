import Phaser from "phaser";
import { GHOSTS_VFX } from "@/configs/gameplay.config.js";
import { GHOSTS_VFX_BY_PHASE_INDEX } from "@/configs/gameplay.config.js";
import { doorComposition } from "@/compositions/Door.composition.js";
import { pullEventManager } from "@/utils/PullEventManager.js";

export const ghostComposition = {
  preloadGhostAnimation(scene, ghostsConfig) {
    for (let ghostConfig of ghostsConfig) {
      for (let state of ghostConfig.states)
        scene.load.atlas(state.animationAtlasName, `assets/animation/ghosts/16x/${state.animationAtlasName}.png`, `assets/animation/ghosts/16x/${state.animationAtlasName}.json`);
    }
  },

  preloadGhostParticles(scene) {
    scene.load.on("loaderror", (file) => console.warn("[VFX] Файл не загрузился:", file.key, file.src));

    scene.load.image("smoke-puff-particle", "assets/vfx/smoke-puff.png");
    scene.load.image("fire-particle", "assets/vfx/yellow.png");
  },

  prepareGhostAnimation(scene, ghostsConfig) {
    for (let ghostConfig of ghostsConfig) {
      for (let state of ghostConfig.states) {
        scene.anims.create({
          key: state.animationAtlasName,
          frames: scene.anims.generateFrameNames(state.animationAtlasName),
          frameRate: 16,
          repeat: -1,
        });
      }
    }
  },

  createGhosts(scene, ghostsConfig, startPointsLayer, ghostsWanderAreaLayer, prowlGhostPointsLayer, ghostStore) {
    const result = [];

    for (let i = 0; i < ghostStore.currentGhostsNumber; i++) {
      const ghostConfig = ghostsConfig[i % ghostsConfig.length];
      const wanderAreaConfig = ghostsWanderAreaLayer[ghostConfig.ghostWanderAreaName];
      const wanderArea = prepareWanderArea(wanderAreaConfig);
      const startPoint = startPointsLayer[ghostConfig.startPointName];
      const ghost = createGhost(scene, startPoint.x, startPoint.y, wanderArea, prowlGhostPointsLayer, ghostConfig);

      result.push(ghost);
    }

    return result;
  },

  handlePlayerCollision(scene, playerStore, eventStore) {
    /*pullEventManager.clearAll();
    playerStore.isGameOver = true;
    playerStore.isWin = false;
    setTimeout(() => scene.scene.stop(), 0);
    */
  },

  moveAllGhosts(allGhosts, player, time, deltaTime) {
    for (const ghost of allGhosts) {
      moveGhost(player, ghost, time, deltaTime);
      updateGhostParticlesPosition(ghost);
    }
  },

  updateGhostsStateTimer(allGhosts, deltaTime) {
    for (let i = allGhosts.length - 1; i >= 0; i--) {
      const ghost = allGhosts[i];
      const isDestroyed = updateGhostStateTimer(ghost, deltaTime);
      if (isDestroyed) allGhosts.splice(i, 1);
    }
  },

  tryCloseDoor(ghost, door) {
    if (ghost.currentState.closeDoorProbability >= Math.random()) doorComposition.lockDoor(door);
  },
};

function prepareWanderArea(wanderAreaConfig) {
  return {
    left: wanderAreaConfig.x,
    right: wanderAreaConfig.x + wanderAreaConfig.width,
    top: wanderAreaConfig.y,
    bottom: wanderAreaConfig.y + wanderAreaConfig.height,
  };
}

function createGhost(scene, x, y, wanderArea, prowlGhostPointsLayer, ghostConfig) {
  const ghost = scene.physics.add.sprite(x, y, ghostConfig.states[0].animationAtlasName, "1").setOrigin(0.5, 1).refreshBody();
  ghost.body.setAllowGravity(false);
  ghost.velocity = new Phaser.Math.Vector2();
  ghost.tempAim = new Phaser.Math.Vector2(x, y);
  ghost.directionToAim = new Phaser.Math.Vector2();
  ghost.wanderArea = wanderArea;
  ghost.stateIndex = 0;
  ghost.states = ghostConfig.states;
  ghost.currentStateDurationInMs = 0;
  ghost.chaseType = ghostConfig.chaseType;
  ghost.roamType = ghostConfig.roamType;
  ghost.prowlGhostPointsLayer = prowlGhostPointsLayer;
  ghost.ambushTimeLimitInMs = ghostConfig.ambushTimeLimitInMs;
  updateGhostWithState(ghost, ghostConfig.states[0]);
  createGhostParticles(scene, ghost);
  applyGhostVfxForCurrentPhase(ghost);
  return ghost;
}


function updateGhostStateTimer(ghost, deltaTime) {
  const currentState = ghost.states[ghost.stateIndex];
  ghost.currentStateDurationInMs += deltaTime;
  if (ghost.currentStateDurationInMs >= currentState.durationInMs) {
    ghost.currentStateDurationInMs = 0;
    if (ghost.stateIndex + 1 < ghost.states.length) {
      const newState = ghost.states[++ghost.stateIndex];
      updateGhostWithState(ghost, newState);
      applyGhostVfxForCurrentPhase(ghost);
    } else {
      destroyGhostParticles(ghost);
      ghost.destroy();
      return true;
    }
  }
  return false;
}

function updateGhostWithState(ghost, state) {
  ghost.speed = state.speedPxPerSec;
  ghost.detectionRadius = state.detectionRadius;
  ghost.nextTempAimDistance = state.nextTempAimDistance;
  ghost.currentState = state;

  ghost.play(state.animationAtlasName);
  ghost.setDisplaySize(state.displayWidth, state.displayHeight);

  const unscaledBodyWidth = state.physicBodyWidth / ghost.scaleX;
  const unscaledBodyHeight = state.physicBodyHeight / ghost.scaleY;
  ghost.body.setSize(unscaledBodyWidth, unscaledBodyHeight, false);

  const offsetX = (ghost.width - unscaledBodyWidth) / 2; // По центру по горизонтали
  const offsetY = ghost.height - unscaledBodyHeight;
  ghost.body.setOffset(offsetX, offsetY);
}


function moveGhost(player, ghost, totalTime, deltaTime) {
  const speedInCurrentFrame = (ghost.speed * deltaTime) / 1000;

  calculateDirectionAndDistanceToAim(ghost, player);
  if (ghost.distanceToAim <= ghost.detectionRadius) {
    chasePlayer(player, ghost, speedInCurrentFrame, totalTime);
    ghost.setAlpha(1);
    ghost.ambushed = false;
  } else if (ghost.roamType === "straight") {
    roam(ghost, speedInCurrentFrame);
  } else if (ghost.roamType === "prowl") {
    prowl(ghost, deltaTime);
    ghost.setAlpha(0.5);
    ghost.ambushed = true;
  }
}

function calculateDirectionAndDistanceToAim(ghost, aim) {
  ghost.directionToAim.set(aim.x - ghost.x, aim.y - ghost.y);
  ghost.distanceToAim = ghost.directionToAim.length();
}

function chasePlayer(player, ghost, speedInCurrentFrame, totalTime) {
  calculateStraightVelocity(ghost, speedInCurrentFrame);
  changeVelocityByMovementType(ghost, totalTime);
  moveToAim(ghost, player, speedInCurrentFrame);
}

function roam(ghost, speedInCurrentFrame) {
  calculateDirectionAndDistanceToAim(ghost, ghost.tempAim);
  calculateStraightVelocity(ghost, speedInCurrentFrame);
  const reachedAim = moveToAim(ghost, ghost.tempAim, speedInCurrentFrame);
  if (reachedAim) setNextTempAim(ghost);
}

function prowl(ghost, deltaTime) {
  ghost.ambushCurrentTime += deltaTime;
  if (ghost.ambushCurrentTime < ghost.currentState.ambushTimeLimitInMs && ghost.ambushed) return;
  ghost.ambushCurrentTime = 0;

  const ambushPosition = getRandomAmbushPosition(ghost);
  ghost.x = ambushPosition.x;
  ghost.y = ambushPosition.y;
}

function calculateStraightVelocity(ghost, moveDistance) {
  if (ghost.distanceToAim <= moveDistance) ghost.velocity.set(0, 0);
  else ghost.velocity.copy(ghost.directionToAim).scale(moveDistance / ghost.distanceToAim);
}

function changeVelocityByMovementType(ghost, totalTime) {
  if (ghost.chaseType === "arc_left") {
    rotateVector(ghost.velocity, -0.65);
  } else if (ghost.chaseType === "arc_right") {
    rotateVector(ghost.velocity, 0.45);
  } else if (ghost.chaseType === "wave") {
    const waveSpeed = 2.5;
    const waveAmplitude = 0.6;
    const totalTimeInSec = totalTime / 1000;
    const waveAngle = Math.sin(totalTimeInSec * waveSpeed) * waveAmplitude;
    rotateVector(ghost.velocity, waveAngle);
  }
}

function moveToAim(ghost, aim, moveDistance) {
  const reachedAim = ghost.distanceToAim <= moveDistance;
  if (reachedAim) {
    ghost.x = aim.x;
    ghost.y = aim.y;
  } else {
    ghost.x += ghost.velocity.x;
    ghost.y += ghost.velocity.y;
  }
  ghost.setFlipX(ghost.velocity.x < 0);
  return reachedAim;
}

function rotateVector(vector, angle) {
  const x = vector.x;
  const y = vector.y;
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  vector.set(x * cos - y * sin, x * sin + y * cos);
}

function setNextTempAim(ghost) {
  const angle = Math.random() * Math.PI * 2;
  ghost.tempAim.set(
    Phaser.Math.Clamp(ghost.x + Math.cos(angle) * ghost.nextTempAimDistance, ghost.wanderArea.left, ghost.wanderArea.right),
    Phaser.Math.Clamp(ghost.y + Math.sin(angle) * ghost.nextTempAimDistance, ghost.wanderArea.top, ghost.wanderArea.bottom)
  );
}

function getRandomAmbushPosition(ghost) {
  return ghost.prowlGhostPointsLayer[Math.floor(Math.random() * ghost.prowlGhostPointsLayer.length)];
}


function createGhostParticles(scene, ghost) {
  const fireEmitter = createGhostEmitter(scene, ghost, GHOSTS_VFX.fire);
  const smokeEmitter = createGhostEmitter(scene, ghost, GHOSTS_VFX.smoke);

  ghost.vfxEmitters = [fireEmitter, smokeEmitter];

  return ghost.vfxEmitters;
}

function createGhostEmitter(scene, ghost, vfxConfig) {
  const actualTextureKey = resolveParticleTexture(scene, vfxConfig);

  const textureScale = getParticleTextureScale(scene, actualTextureKey, vfxConfig.particleSizePx);

  const baseSpeed = vfxConfig.speed ?? { min: 0, max: 0 };
  const minSpeed = Number(baseSpeed.min ?? 0);
  const maxSpeed = Number(baseSpeed.max ?? 0);

  const trailVelocityFactor = Number(vfxConfig.trailVelocityFactor ?? 0);
  const trailRandom = Number(vfxConfig.trailRandom ?? 0);

  const emitter = scene.add.particles(ghost.x, ghost.y, actualTextureKey, {
    lifespan: vfxConfig.lifespan,
    frequency: vfxConfig.frequency,
    quantity: vfxConfig.quantity,
    angle: vfxConfig.angle,
    gravityY: vfxConfig.gravityY,
    alpha: vfxConfig.alpha,
    tint: vfxConfig.tint,
    blendMode: vfxConfig.blendMode,

    // Вместо speed: ... задаём компоненты скорости.
    // Частица получает скорость "назад" относительно движения призрака -> получается шлейф.
    speedX: () => {
      const base = Phaser.Math.Between(minSpeed, maxSpeed);
      const trail = -ghost.velocity.x * trailVelocityFactor;
      const rnd = Phaser.Math.Between(-trailRandom, trailRandom);
      return trail + rnd + Phaser.Math.FloatBetween(-base, base);
    },
    speedY: () => {
      const base = Phaser.Math.Between(minSpeed, maxSpeed);
      const trail = -ghost.velocity.y * trailVelocityFactor;
      const rnd = Phaser.Math.Between(-trailRandom, trailRandom);
      return trail + rnd + Phaser.Math.FloatBetween(-base, base);
    },

    scale: {
      start: vfxConfig.scale.start * textureScale,
      end: vfxConfig.scale.end * textureScale,
    },
    emitting: true,
  });

  emitter.setDepth(9999);

  emitter.__followTarget = ghost;
  emitter.__followOffsetX = Number(vfxConfig.followOffsetX ?? 0);
  emitter.__followOffsetY = ghost.displayHeight * Number(vfxConfig.followOffsetYFactor ?? 0);

  emitter.setPosition(ghost.x + emitter.__followOffsetX, ghost.y + emitter.__followOffsetY);

  return emitter;
}

function resolveParticleTexture(scene, vfxConfig) {
  return vfxConfig.textureKey;
}

function getParticleTextureScale(scene, textureKey, particleSizePx) {
  if (!particleSizePx) return 1;

  const texture = scene.textures.get(textureKey);
  const sourceImage = texture?.getSourceImage?.();

  const width = sourceImage?.width ?? 0;
  const height = sourceImage?.height ?? 0;

  if (width <= 0 || height <= 0) return 1;

  return particleSizePx / Math.max(width, height);
}

function updateGhostParticlesPosition(ghost) {
  if (!ghost.vfxEmitters) return;

  for (const emitter of ghost.vfxEmitters) {
    const target = emitter.__followTarget;
    if (!target) continue;

    emitter.setPosition(
      target.x + (emitter.__followOffsetX ?? 0),
      target.y + (emitter.__followOffsetY ?? 0)
    );
  }
}

function destroyGhostParticles(ghost) {
  if (!ghost.vfxEmitters) return;
  for (const emitter of ghost.vfxEmitters) emitter.destroy();
  ghost.vfxEmitters = null;
}

function applyGhostVfxForCurrentPhase(ghost) {
  const phaseIndex = ghost.stateIndex ?? 0;
  const phaseOverrides = GHOSTS_VFX_BY_PHASE_INDEX?.[phaseIndex] ?? null;

  // Фаза 0 (появление) и 4 (смерть) = не горим
  if (!phaseOverrides) {
    destroyGhostParticles(ghost);
    return;
  }

  // Пересоздаём эмиттеры под новую фазу (проще и надёжнее, чем updateConfig)
  destroyGhostParticles(ghost);

  const fireConfig = mergeVfxConfig(GHOSTS_VFX.fire, phaseOverrides.fire);
  const smokeConfig = mergeVfxConfig(GHOSTS_VFX.smoke, phaseOverrides.smoke);

  const fireEmitter = createGhostEmitter(ghost.scene, ghost, fireConfig);
  const smokeEmitter = createGhostEmitter(ghost.scene, ghost, smokeConfig);

  ghost.vfxEmitters = [fireEmitter, smokeEmitter];
}

function mergeVfxConfig(baseConfig, overrides) {
  if (!overrides) return baseConfig;
  return {
    ...baseConfig,
    ...overrides,
    scale: overrides.scale ? { ...baseConfig.scale, ...overrides.scale } : baseConfig.scale,
    alpha: overrides.alpha ? { ...baseConfig.alpha, ...overrides.alpha } : baseConfig.alpha,
    speed: overrides.speed ? { ...baseConfig.speed, ...overrides.speed } : baseConfig.speed,
    angle: overrides.angle ? { ...baseConfig.angle, ...overrides.angle } : baseConfig.angle,
  };
}

