import Phaser from "phaser";
import { GHOSTS, GHOSTS_VFX, LIGHT_POINT } from "@/configs/gameplay.config.js";
import { GHOSTS_VFX_BY_PHASE_INDEX } from "@/configs/gameplay.config.js";
import { doorComposition } from "@/compositions/Door.composition.js";
import { pullEventManager } from "@/utils/PullEventManager.js";
import { dynamicLightingComposition } from "@/compositions/DynamicLighting.composition.js";

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

  clearGhostStore(ghostStore) {
    ghostStore.currentGhostsNumber = GHOSTS.startGhostNumber;
    ghostStore.survivalCounter = 0;
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

    ghostStore.currentGhostsNumber += GHOSTS.newGhostNumberStep;
    return result;
  },

  handlePlayerCollision(scene, playerStore, eventStore) {
    pullEventManager.clearAll();
    playerStore.isGameOver = true;
    playerStore.isWin = false;
    dynamicLightingComposition.stop();
    setTimeout(() => scene.scene.stop(), 0);
  },

  handleLightPointCollision(ghost, lightPoint) {
    if (lightPoint.turnOn) ghost.nearestLightPoint = lightPoint;
  },

  moveAllGhosts(allGhosts, player, time, deltaTime) {
    for (const ghost of allGhosts) {
      moveGhost(player, ghost, allGhosts, time, deltaTime);
      updateGhostParticlesPosition(ghost);
    }
  },

  updateGhostsStateTimer(allGhosts, deltaTime, ghostsStore) {
    for (let i = allGhosts.length - 1; i >= 0; i--) {
      const ghost = allGhosts[i];
      const isDestroyed = updateGhostStateTimer(ghost, deltaTime);
      if (isDestroyed) {
        allGhosts.splice(i, 1);
        if (allGhosts.length === 0 && ghostsStore) {
          ghostsStore.survivalCounter++;
          pullEventManager.setEvent("ghostsDespawned");
        }
      }
    }
  },

  tryCloseDoor(ghost, door) {
    if (ghost.currentState.closeDoorProbability >= Math.random()) doorComposition.lockDoor(door);
  },

  setRunAwayState(ghost) {
    ghost.runAwayTimer = ghost.runAwayMaxTimeInMs;
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
  const ghost = scene.physics.add.sprite(x, y, ghostConfig.states[0].animationAtlasName, "1")
    .setOrigin(0.5, 1)
    .refreshBody();
  ghost.body.setAllowGravity(false);
  ghost.aim = new Phaser.Math.Vector2(x, y);
  ghost.directionToAim = new Phaser.Math.Vector2();
  ghost.separationVector = new Phaser.Math.Vector2();
  ghost.directionFromLightPointCenter = new Phaser.Math.Vector2();
  ghost.wanderArea = wanderArea;
  ghost.stateIndex = 0;
  ghost.states = ghostConfig.states;
  ghost.currentStateDurationInMs = 0;
  ghost.chaseType = ghostConfig.chaseType;
  ghost.roamType = ghostConfig.roamType;
  ghost.prowlGhostPointsLayer = prowlGhostPointsLayer;
  ghost.ambushTimeLimitInMs = ghostConfig.ambushTimeLimitInMs;
  ghost.runAwayTimer = 0;
  ghost.runAwayMaxTimeInMs = ghostConfig.runAwayMaxTimeInSec * 1000;
  ghost.randomOffsetForWaveMovement = Phaser.Math.Between(0, 100);
  updateGhostWithState(ghost, ghostConfig.states[0]);
  createGhostParticles(scene, ghost);
  applyGhostVfxForCurrentPhase(ghost);
  return ghost;
}


function updateGhostStateTimer(ghost, deltaTime) {
  const currentState = ghost.states[ghost.stateIndex];
  ghost.currentStateDurationInMs += deltaTime;

  const isLastState = ghost.stateIndex === ghost.states.length - 1;
  if (isLastState) {
    const remainingFraction = Math.max(0, 1 - ghost.currentStateDurationInMs / currentState.durationInMs);
    ghost.setAlpha(remainingFraction);
  }
  if (ghost.currentStateDurationInMs >= currentState.durationInMs) {
    ghost.currentStateDurationInMs = 0;
    if (ghost.stateIndex + 1 < ghost.states.length) {
      const newState = ghost.states[++ghost.stateIndex];
      updateGhostWithState(ghost, newState);
      applyGhostVfxForCurrentPhase(ghost);
      if (ghost.stateIndex === 1) {
        pullEventManager.setEvent("ghostSecondState");
      }
    } else {
      destroyGhostParticles(ghost);
      ghost.destroy();
      return true;
    }
  }
  return false;
}

function updateGhostWithState(ghost, state) {
  ghost.speed = Phaser.Math.RND.pick(state.speedPxPerSec);
  ghost.detectionRadius = Phaser.Math.RND.pick(state.detectionRadius);
  ghost.nextTempAimDistance = state.nextTempAimDistance;
  ghost.currentState = state;

  ghost.play(state.animationAtlasName);
  ghost.setDisplaySize(state.displayWidth, state.displayHeight);

  const unscaledBodyWidth = state.physicBodyWidth / ghost.scaleX;
  const unscaledBodyHeight = state.physicBodyHeight / ghost.scaleY;
  ghost.body.setSize(unscaledBodyWidth, unscaledBodyHeight, false);

  const offsetX = (ghost.width - unscaledBodyWidth) / 2;
  const offsetY = ghost.height - unscaledBodyHeight;
  ghost.body.setOffset(offsetX, offsetY);
}


function moveGhost(player, ghost, allGhosts, totalTime, deltaTime) {
  if (ghost.runAwayTimer > 0) {
    ghost.runAwayTimer -= deltaTime;
    calculateDirectionAndDistanceToAim(ghost, player);
    calculateStraightNormalizedVelocity(ghost, allGhosts);
    changeNormalizedVelocityIfLightPoint(ghost);
    ghost.body.velocity.scale(ghost.speed).negate();
    ghost.setFlipX(ghost.body.velocity.x < 0);
    return;
  }

  calculateDirectionAndDistanceToAim(ghost, player);
  if (ghost.distanceToAim <= ghost.detectionRadius) {
    calculateStraightNormalizedVelocity(ghost);
    calculateSeparationVector(ghost, allGhosts);
    ghost.body.velocity.add(ghost.separationVector);
    changeVelocityByMovementType(ghost, totalTime);
    changeNormalizedVelocityIfLightPoint(ghost);
    ghost.body.velocity.scale(ghost.speed);
    ghost.setFlipX(ghost.body.velocity.x < 0);
    ghost.setAlpha(1);
    ghost.ambushed = false;
  } else if (ghost.roamType === "straight") {
    calculateDirectionAndDistanceToAim(ghost, ghost.aim);
    calculateStraightNormalizedVelocity(ghost, allGhosts);
    changeNormalizedVelocityIfLightPoint(ghost);
    ghost.body.velocity.scale(ghost.speed);
    ghost.setFlipX(ghost.body.velocity.x < 0);
    if (ghost.distanceToAim < ghost.speed) choseRandomAimInWanderArea(ghost);
  } else if (ghost.roamType === "prowl") {
    ghost.ambushCurrentTime += deltaTime;
    if (ghost.ambushCurrentTime < ghost.currentState.ambushTimeLimitInMs && ghost.ambushed) return;
    ghost.ambushCurrentTime = 0;

    const ambushPosition = getRandomAmbushPosition(ghost);
    ghost.x = ambushPosition.x;
    ghost.y = ambushPosition.y;

    ghost.setAlpha(0.5);
    ghost.ambushed = true;
    ghost.body.velocity.set(0, 0);
  }
}

function calculateDirectionAndDistanceToAim(ghost, aim) {
  ghost.directionToAim.set(aim.x - ghost.x, aim.y - ghost.y);
  ghost.distanceToAim = ghost.directionToAim.length();
}

function calculateStraightNormalizedVelocity(ghost) {
  ghost.body.velocity.copy(ghost.directionToAim).normalize();
}

function calculateSeparationVector(ghost, allGhosts) {
  ghost.separationVector.set(0, 0);

  for (const otherGhost of allGhosts) {
    if (ghost === otherGhost) continue;

    const dx = ghost.x - otherGhost.x;
    const dy = ghost.y - otherGhost.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    if (distance > 0 && distance < GHOSTS.separationRadius) {
      const separationPower = 1 - distance / GHOSTS.separationRadius;
      ghost.separationVector.x += (dx / distance) * separationPower;
      ghost.separationVector.y += (dy / distance) * separationPower;
    } else if (distance === 0) {
      ghost.separationVector.x += Math.random() - 0.5;
      ghost.separationVector.y += Math.random() - 0.5;
    }
  }
}

function changeVelocityByMovementType(ghost, totalTime) {
  if (ghost.chaseType === "arc_left") {
    rotateVector(ghost.body.velocity, -0.65);
  } else if (ghost.chaseType === "arc_right") {
    rotateVector(ghost.body.velocity, 0.45);
  } else if (ghost.chaseType === "wave") {
    const waveSpeed = 2.5;
    const waveAmplitude = 0.6;
    const totalTimeInSec = ghost.randomOffsetForWaveMovement + totalTime / 1000;
    const waveAngle = Math.sin(totalTimeInSec * waveSpeed) * waveAmplitude;
    rotateVector(ghost.body.velocity, waveAngle);
  }
}

function changeNormalizedVelocityIfLightPoint(ghost) {
  if (!ghost.nearestLightPoint || !ghost.nearestLightPoint.turnOn) return;

  ghost.directionFromLightPointCenter.set(ghost.x - ghost.nearestLightPoint.x, ghost.y - ghost.nearestLightPoint.y);

  const currentDistance = ghost.directionFromLightPointCenter.length();
  const bufferZone = 30;
  if (currentDistance < LIGHT_POINT.protectionRadius + bufferZone) {
    ghost.directionFromLightPointCenter.normalize();
    const error = LIGHT_POINT.protectionRadius - currentDistance;
    const dx = -ghost.directionFromLightPointCenter.y + ghost.directionFromLightPointCenter.x * error * 0.05;
    const dy = ghost.directionFromLightPointCenter.x + ghost.directionFromLightPointCenter.y * error * 0.05;
    ghost.body.velocity.set(dx, dy);
  }
}

function rotateVector(vector, angle) {
  const x = vector.x;
  const y = vector.y;
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  vector.set(x * cos - y * sin, x * sin + y * cos);
}

function choseRandomAimInWanderArea(ghost) {
  const angle = Math.random() * Math.PI * 2;
  ghost.aim.set(
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
      const trail = -ghost.body.velocity.x;
      const rnd = Phaser.Math.Between(-trailRandom, trailRandom);
      return trail + rnd + Phaser.Math.FloatBetween(-base, base);
    },
    speedY: () => {
      const base = Phaser.Math.Between(minSpeed, maxSpeed);
      const trail = -ghost.body.velocity.y;
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
