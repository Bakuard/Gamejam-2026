import Phaser from "phaser";

import { DROP_ITEMS, ITEM_SALT, PLAYER } from "@/configs/gameplay.config.js";
import { audioComposition } from "@/compositions/Audio.composition.js";
import { inventoryComposition } from "@/compositions/Inventory.composition.js";
import { ghostComposition } from "@/compositions/Ghost.composition.js";

export const playerComposition = {
  preloadPlayerAnimation(scene) {
    scene.load.atlas("player-run", "assets/animation/player/16x/player-run.png", "assets/animation/player/16x/player-run.json");
    scene.load.atlas("player-run-chair", "assets/animation/player/16x/player-run-item.png", "assets/animation/player/16x/player-run-item.json");
    scene.load.atlas("player-idle", "assets/animation/player/16x/player-idle.png", "assets/animation/player/16x/player-idle.json");
    scene.load.atlas("player-idle-chair", "assets/animation/player/16x/player-idle-item.png", "assets/animation/player/16x/player-idle-item.json");
    scene.load.atlas("player-jump", "assets/animation/player/16x/player-jump.png", "assets/animation/player/16x/player-jump.json");
    scene.load.atlas("player-jump-chair", "assets/animation/player/16x/player-jump-item.png", "assets/animation/player/16x/player-jump-item.json");
    scene.load.atlas("player-fall", "assets/animation/player/16x/player-fall.png", "assets/animation/player/16x/player-fall.json");
    scene.load.atlas("player-fall-chair", "assets/animation/player/16x/player-fall-item.png", "assets/animation/player/16x/player-fall-item.json");
  },

  preparePlayerAnimation(scene) {
    scene.anims.create({
      key: "player-run",
      frames: scene.anims.generateFrameNames("player-run"),
      frameRate: 32,
      repeat: -1,
    });
    scene.anims.create({
      key: "player-run-chair",
      frames: scene.anims.generateFrameNames("player-run-chair"),
      frameRate: 32,
      repeat: -1,
    });
    scene.anims.create({
      key: "player-idle",
      frames: scene.anims.generateFrameNames("player-idle"),
      frameRate: 16,
      repeat: -1,
    });
    scene.anims.create({
      key: "player-idle-chair",
      frames: scene.anims.generateFrameNames("player-idle-chair"),
      frameRate: 16,
      repeat: -1,
    });
    scene.anims.create({
      key: "player-jump",
      frames: scene.anims.generateFrameNames("player-jump"),
      frameRate: 32,
      repeat: 0,
    });
    scene.anims.create({
      key: "player-jump-chair",
      frames: scene.anims.generateFrameNames("player-jump-chair"),
      frameRate: 32,
      repeat: 0,
    });
    scene.anims.create({
      key: "player-fall",
      frames: scene.anims.generateFrameNames("player-fall"),
      frameRate: 32,
      repeat: -1,
    });
    scene.anims.create({
      key: "player-fall-chair",
      frames: scene.anims.generateFrameNames("player-fall-chair"),
      frameRate: 32,
      repeat: -1,
    });
  },

  prepareSaltParticle(scene) {
    const graphics = scene.add.graphics();
    graphics.fillStyle(0xffffff, 1);
    graphics.fillCircle(4, 4, 4);
    graphics.generateTexture("saltTexture", 8, 8);
    graphics.destroy();
  },

  createPlayer(scene, x, y) {
    const player = scene.physics.add.sprite(x, y, "player-idle", "1").setDisplaySize(PLAYER.displayWidth, PLAYER.displayHeight).setOrigin(0.5, 1).play("player-idle");

    const unscaledBodyWidth = PLAYER.bodyWidth / player.scaleX;
    const unscaledBodyHeight = PLAYER.bodyHeight / player.scaleY;
    player.body.setSize(unscaledBodyWidth, unscaledBodyHeight, false);

    const offsetX = (player.width - unscaledBodyWidth) / 2;
    const offsetY = player.height - unscaledBodyHeight - PLAYER.bodyOffsetY;
    player.body.setOffset(offsetX, offsetY);

    player.speed = PLAYER.speed;
    player.depth = 100;
    player.groundedCoyoteTime = 0;
    player.onStairInPreviousFrame = 0;

    player.isSaltParticlesActive = false;
    player.cloudEmitter = scene.add.particles(0, 0, "saltTexture", {
      tint: [0xffffff, 0x00aaff, 0x88ccff], // Массив цветов: белый и оттенки голубого
      speed: { min: 60, max: 150 }, // Скорость разлета
      angle: { min: 0, max: 360 }, // Летят во все стороны
      scale: { start: 1.5, end: 0.5 }, // Уменьшаются к концу жизни
      alpha: { start: 0.8, end: 0 }, // Плавно исчезают
      lifespan: 800, // Время жизни одной частицы (мс)
      frequency: 30, // Как часто вылетают новые частицы (мс)
      blendMode: "ADD", // Эффект свечения
      emitting: false, // Изначально выключен
    });
    player.cloudEmitter.startFollow(player, 0, -PLAYER.displayHeight / 2);

    return player;
  },

  configureCameraFollow(scene, player, deadzoneWidth, deadzoneHeight) {
    scene.cameras.main.startFollow(player);
    scene.cameras.main.setDeadzone(deadzoneWidth, deadzoneHeight);
    // TODO: настроить камеру
    scene.cameras.main.setZoom(1.2);
  },

  movePlayerOnPlatformers(scene, player, userInput, platformLayer, woodPlatformLayer, stairsLayer, tileMap, camera) {
    const stairTile = getTileAtFeetLevel(player, stairsLayer, camera);
    const onStair = stairTile && checkOnStair(player, stairTile, tileMap, PLAYER.footTolerance);
    player.body.setAllowGravity(!onStair);

    if (player.body.blocked.down) player.groundedCoyoteTime = PLAYER.onGroundCoyoteTime;

    const isGrounded = player.groundedCoyoteTime-- > 0;

    player.body.velocity.x = (userInput.right.isDown - userInput.left.isDown) * player.speed;

    if (userInput.up.isDown && (onStair || isGrounded)) {
      player.body.velocity.y = -player.speed * PLAYER.jumpMultiplicator;
      player.groundedCoyoteTime = 0;
      player.onStairInPreviousFrame = 0;

      if (player.currentChair) player.anims.play("player-jump-chair", true);
      else player.anims.play("player-jump", true);

      playChairCreakingSound(scene, player, userInput);
    } else if (onStair) {
      if (userInput.down.isDown) player.body.velocity.y = PLAYER.stairsDropAcceleration;
      else if (stairTile.properties.direction === "right" && player.body.velocity.x !== 0) player.body.velocity.y = -player.body.velocity.x;
      else if (stairTile.properties.direction === "left" && player.body.velocity.x !== 0) player.body.velocity.y = player.body.velocity.x;
      else if (player.body.velocity.y > 0) player.body.velocity.y = 0;
      player.onStairInPreviousFrame = PLAYER.stairCoyoteTime;
    } else if (--player.onStairInPreviousFrame === 0 && player.body.velocity.y < 0) {
      player.body.velocity.y = 0;
    }

    const currentlyGrounded = player.groundedCoyoteTime > 0 || player.onStairInPreviousFrame > 0;

    if (currentlyGrounded) {
      if (player.body.velocity.x === 0) {
        if (player.currentChair) player.anims.play("player-idle-chair", true);
        else player.anims.play("player-idle", true);
      } else {
        if (player.currentChair) player.anims.play("player-run-chair", true);
        else player.anims.play("player-run", true);

        const solidTile = getTileBelowFeet(player, platformLayer, camera);
        const woodTile = getTileBelowFeet(player, woodPlatformLayer, camera);
        playFootstepSound(scene, player, solidTile ?? woodTile);
      }
    } else {
      const currentAnim = player.anims.currentAnim?.key;
      const isJumpingAnim = currentAnim === "player-jump" || currentAnim === "player-jump-chair";

      if (player.body.velocity.y < 0) {
        player.body.velocity.x *= PLAYER.fallMultiplicator;
      }

      if (player.body.velocity.y > 0 || !isJumpingAnim || !player.anims.isPlaying) {
        if (player.currentChair) player.anims.play("player-fall-chair", true);
        else player.anims.play("player-fall", true);
      }
    }

    if (player.body.velocity.x !== 0) player.setFlipX(userInput.left.isDown);

    player.isStandingOnChair = false;
  },

  createUserInput(scene) {
    return scene.input.keyboard.addKeys({
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      interact: Phaser.Input.Keyboard.KeyCodes.E,
      throw: Phaser.Input.Keyboard.KeyCodes.Q,
      throwSalt: Phaser.Input.Keyboard.KeyCodes.R,
    });
  },

  pickUpChair(player, chair, userInput) {
    if (Phaser.Input.Keyboard.JustDown(userInput.interact) && !player.currentChair) {
      chair.disableBody(true, false);
      player.currentChair = chair;
    }
  },

  careChair(player) {
    if (player.currentChair) {
      player.currentChair.x = player.x;
      player.currentChair.y = player.y - player.body.height / 2 - player.currentChair.height;
    }
  },

  throwChair(player, userInput, wallsLayer) {
    if (player.currentChair && Phaser.Input.Keyboard.JustDown(userInput.interact)) {
      const direction = player.flipX ? -1 : 1;
      const posX = player.x + (player.body.width / 2 + player.currentChair.body.width / 2) * direction;
      const posY = player.body.bottom - player.currentChair.body.height / 2;

      if (isAreaFree(player.scene, player.currentChair, posX, posY, wallsLayer)) {
        player.currentChair.enableBody(true, posX, posY, true, true).refreshBody();
        player.currentChair = null;
      }
    }
  },

  jumpOff(player, platform, userInput) {
    return !userInput.down.isDown;
  },

  throwSalt(scene, player, userInput, allGhosts, inventoryStore) {
    const saltThrown = Phaser.Input.Keyboard.JustDown(userInput.throwSalt) && inventoryComposition.decreaseItem(inventoryStore, ITEM_SALT);
    if (!saltThrown) return;

    for (const ghost of allGhosts) {
      const distance = Phaser.Math.Distance.Between(player.x, player.y, ghost.x, ghost.y);
      if (distance <= DROP_ITEMS.salt.radius) ghostComposition.setRunAwayState(ghost);
    }

    if (!player.isSaltParticlesActive) {
      player.isSaltParticlesActive = true;
      player.cloudEmitter.start();
      scene.time.delayedCall(600, () => {
        player.cloudEmitter.stop();
        player.isSaltParticlesActive = false;
      });
    }
  },
};

function isAreaFree(scene, chair, posX, posY, wallsLayer) {
  const width = chair.body.width;
  const height = chair.body.height;

  const startX = posX - width / 2 + chair.body.offset.x;
  const startY = posY - height / 2 + chair.body.offset.y;

  const collidingTiles = wallsLayer.getTilesWithinWorldXY(startX, startY, width, height, { isColliding: true });

  return collidingTiles.length === 0;
}

function checkOnStair(player, stairTile, tileMap, tolerance) {
  const localX = player.body.center.x - tileMap.tileToWorldX(stairTile.x);
  const localY = stairTile.height - (player.body.bottom - tileMap.tileToWorldY(stairTile.y));
  const stairY = stairTile.properties.direction === "left" ? stairTile.width - localX : localX;
  return Phaser.Math.Within(localY, stairY, tolerance);
}

function playFootstepSound(scene, player, tile) {
  if (!tile) return;

  if (tile.properties.tileType === "brick") {
    audioComposition.play(scene, "footsteps-on-bricks");
  } else if (tile.properties.tileType === "wood") {
    audioComposition.play(scene, "footsteps-on-wood");
  } else if (tile.properties.tileType === "stone") {
    audioComposition.play(scene, "footsteps-on-concrete");
  }
}

function playChairCreakingSound(scene, player, userInput) {
  if (player.isStandingOnChair && userInput.up.isDown) {
    audioComposition.play(scene, "wood-creaking");
  }
}

function getTileBelowFeet(player, tileLayer, camera) {
  const x = player.body.center.x;
  const y = player.body.bottom + 2;
  return tileLayer.getTileAtWorldXY(x, y, false, camera);
}

function getTileAtFeetLevel(player, tileLayer, camera) {
  const x = player.body.center.x;
  const y = player.body.bottom - 1;
  return tileLayer.getTileAtWorldXY(x, y, false, camera);
}