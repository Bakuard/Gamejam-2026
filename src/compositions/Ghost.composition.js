import Phaser from "phaser";

export const ghostComposition = {
  preloadGhostAnimation(scene, ghostsConfig) {
    for (let ghostConfig of ghostsConfig) {
      for (let state of ghostConfig.states) scene.load.atlas(state.animationAtlasName, `assets/animation/ghosts/${state.animationAtlasName}.png`, `assets/animation/ghosts/${state.animationAtlasName}.json`);
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
        ghostConfig.states
      );

      result.push(ghost);
    }

    return result;
  },

  createGhost(scene, x, y, animationAtlasName, displayWidth, displayHeight, bodyWidth, bodyHeight, speed, detectionRadius, nextTempAimDistance, wanderArea, states) {
    const ghost = scene.physics.add
      .sprite(x, y, animationAtlasName, "1")
      .setOrigin(0.5, 1)
      .refreshBody();
    ghost.body.setAllowGravity(false);
    ghost.velocity = new Phaser.Math.Vector2();
    ghost.tempAim = new Phaser.Math.Vector2(x, y);
    ghost.wanderArea = wanderArea;
    ghost.stateIndex = 0;
    ghost.states = states;
    ghost.currentStateDurationInMs = 0;
    updateGhostWithState(ghost, states[0]);
    return ghost;
  },

  handlePlayerCollision(playerStore) {
    playerStore.isGameOver = true;
    playerStore.isWin = false;
  },

  moveGhost(player, ghost, deltaTime) {
    ghost.velocity.set(player.x - ghost.x, player.y - ghost.y);
    const distanceToPlayer = ghost.velocity.length();
    const currentSpeed = (ghost.speed * deltaTime) / 1000;
    if (distanceToPlayer <= ghost.detectionRadius && distanceToPlayer > currentSpeed) {
      ghost.velocity.scale(1 / distanceToPlayer).scale(currentSpeed);
      ghost.x += ghost.velocity.x;
      ghost.y += ghost.velocity.y;
      ghost.setFlipX(player.x < ghost.x);
      return;
    }

    ghost.velocity.set(ghost.tempAim.x - ghost.x, ghost.tempAim.y - ghost.y);
    const distanceToTempAim = ghost.velocity.length();
    if (distanceToTempAim >= currentSpeed) {
      ghost.velocity.scale(1 / distanceToTempAim).scale(currentSpeed);
      ghost.x += ghost.velocity.x;
      ghost.y += ghost.velocity.y;
    } else {
      setNextTempAim(ghost);
    }
    ghost.setFlipX(ghost.tempAim.x < ghost.x);
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
  }
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