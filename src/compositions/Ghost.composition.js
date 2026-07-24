import Phaser from "phaser";

export const ghostComposition = {
  preloadGhostAnimation(scene, ghostsConfig) {
    for (let ghostConfig of ghostsConfig) {
      for (let state of ghostConfig.states)
        scene.load.atlas(state.animationAtlasName, `assets/animation/ghosts/${state.animationAtlasName}.png`, `assets/animation/ghosts/${state.animationAtlasName}.json`);
    }
  },

  prepareGhostAnimation(scene, ghostsConfig) {
    for (let ghostConfig of ghostsConfig) {
      for (let state of ghostConfig.states) {
        scene.anims.create({
          key: state.animationAtlasName,
          frames: scene.anims.generateFrameNames(state.animationAtlasName),
          frameRate: 5,
          repeat: -1,
        });
      }
    }
  },

  createGhosts(scene, ghostsConfig, startPointsLayer, ghostWanderAreaLayer) {
    const result = [];

    for (let ghostConfig of ghostsConfig) {
      const wanderAreaConfig = ghostWanderAreaLayer[ghostConfig.ghostWanderAreaName];

      const wanderArea = {
        left: wanderAreaConfig.x,
        right: wanderAreaConfig.x + wanderAreaConfig.width,
        top: wanderAreaConfig.y,
        bottom: wanderAreaConfig.y + wanderAreaConfig.height,
      };

      const startPoint = startPointsLayer[ghostConfig.startPointName];
      const firstState = ghostConfig.states[0];
      const ghost = ghostComposition.createGhost(
        scene,
        startPoint.x,
        startPoint.y,
        firstState.animationAtlasName,
        firstState.displayWidth,
        firstState.displayHeight,
        firstState.physicBodyWidth,
        firstState.physicBodyHeight,
        firstState.speedPxPerSec,
        firstState.detectionRadius,
        firstState.nextTempAimDistance,
        wanderArea,
        ghostConfig.states,
        ghostConfig.movementType
      );

      result.push(ghost);
    }

    return result;
  },

  createGhost(scene, x, y, animationAtlasName, displayWidth, displayHeight, bodyWidth, bodyHeight, speed, detectionRadius, nextTempAimDistance, wanderArea, states, movementType) {
    const ghost = scene.physics.add.sprite(x, y, animationAtlasName, "1").setOrigin(0.5, 1).refreshBody();
    ghost.body.setAllowGravity(false);
    ghost.velocity = new Phaser.Math.Vector2();
    ghost.tempAim = new Phaser.Math.Vector2(x, y);
    ghost.wanderArea = wanderArea;
    ghost.stateIndex = 0;
    ghost.states = states;
    ghost.currentStateDurationInMs = 0;
    ghost.movementType = movementType;
    updateGhostWithState(ghost, states[0]);
    return ghost;
  },

  handlePlayerCollision(scene, playerStore) {
    playerStore.isGameOver = true;
    playerStore.isWin = false;
    setTimeout(() => scene.scene.stop(), 0);
  },

  moveGhost(player, ghost, totalTime, deltaTime) {
    const currentSpeed = (ghost.speed * deltaTime) / 1000;

    calculateDirectionAndDistanceToAim(ghost, player);
    if (ghost.distanceToAim <= ghost.detectionRadius) {
      calculateStraightVelocity(ghost, currentSpeed);
      changeVelocityByMovementType(ghost, totalTime);
      moveToAim(ghost, player, currentSpeed);
      return;
    }

    calculateDirectionAndDistanceToAim(ghost, ghost.tempAim);
    calculateStraightVelocity(ghost, currentSpeed);
    const reachedAim = moveToAim(ghost, ghost.tempAim, currentSpeed);
    if (reachedAim) setNextTempAim(ghost);
  },

  ghostStateTimer(ghost, delta) {
    const currentState = ghost.states[ghost.stateIndex];
    ghost.currentStateDurationInMs += delta;
    if (ghost.currentStateDurationInMs >= currentState.durationInMs) {
      ghost.currentStateDurationInMs = 0;
      if (ghost.stateIndex + 1 < ghost.states.length) {
        const newState = ghost.states[++ghost.stateIndex];
        updateGhostWithState(ghost, newState);
      } else {
        ghost.destroy();
        ghost.isDestroyed = true;
      }
    }
  },
};

function updateGhostWithState(ghost, state) {
  ghost.speed = state.speedPxPerSec;
  ghost.detectionRadius = state.detectionRadius;
  ghost.nextTempAimDistance = state.nextTempAimDistance;

  ghost.setDisplaySize(state.displayWidth, state.displayHeight)
    .play(state.animationAtlasName);

  const unscaledBodyWidth = state.physicBodyWidth / ghost.scaleX;
  const unscaledBodyHeight = state.physicBodyHeight / ghost.scaleY;
  ghost.body.setSize(unscaledBodyWidth, unscaledBodyHeight, false);

  const offsetX = (ghost.width - unscaledBodyWidth) / 2; // По центру по горизонтали
  const offsetY = ghost.height - unscaledBodyHeight;
  ghost.body.setOffset(offsetX, offsetY);
}

function setNextTempAim(ghost) {
  const angle = Math.random() * Math.PI * 2;
  ghost.tempAim.set(
    Phaser.Math.Clamp(ghost.x + Math.cos(angle) * ghost.nextTempAimDistance, ghost.wanderArea.left, ghost.wanderArea.right),
    Phaser.Math.Clamp(ghost.y + Math.sin(angle) * ghost.nextTempAimDistance, ghost.wanderArea.top, ghost.wanderArea.bottom)
  );
}

function calculateDirectionAndDistanceToAim(ghost, aim) {
  ghost.directionToAim ??= new Phaser.Math.Vector2();
  ghost.directionToAim.set(aim.x - ghost.x, aim.y - ghost.y);
  ghost.distanceToAim = ghost.directionToAim.length();
}

function calculateStraightVelocity(ghost, moveDistance) {
  if (ghost.distanceToAim <= moveDistance) ghost.velocity.set(0, 0);
  else ghost.velocity.copy(ghost.directionToAim).scale(moveDistance / ghost.distanceToAim);
}

function changeVelocityByMovementType(ghost, totalTime) {
  if (ghost.movementType === "arc_left") {
    rotateVector(ghost.velocity, -0.6);
  } else if (ghost.movementType === "arc_right") {
    rotateVector(ghost.velocity, 0.6);
  } else if (ghost.movementType === "wave") {
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