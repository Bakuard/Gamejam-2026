import Phaser from "phaser";
import {PLAYER_JUMP_MULTIPLICATOR, PLAYER_FALL_MULTIPLICATOR} from "@/configs/gameplay.config.js";

export const playerComposition = {
  preloadPlayerAnimation(scene) {
    scene.load.atlas("player-run", "assets/animation/player/player-run.png", "assets/animation/player/player-run.json");
    scene.load.atlas("player-run-chair", "assets/animation/player/player-run-chair.png", "assets/animation/player/player-run-chair.json");
    scene.load.atlas("player-idle", "assets/animation/player/player-idle.png", "assets/animation/player/player-idle.json");
    scene.load.atlas("player-idle-chair", "assets/animation/player/player-idle-chair.png", "assets/animation/player/player-idle-chair.json");
    scene.load.atlas("player-jump", "assets/animation/player/player-jump.png", "assets/animation/player/player-jump.json");
    scene.load.atlas("player-jump-chair", "assets/animation/player/player-jump-chair.png", "assets/animation/player/player-jump-chair.json");
  },

  preloadPlayerSounds(scene) {
    scene.load.audio("footsteps-on-wood", "sounds/footsteps-on-wood.mp3");
    scene.load.audio("footsteps-on-bricks", "sounds/footsteps-on-bricks.mp3");
    scene.load.audio("wood-creaking", "sounds/wood-creaking.mp3");
    scene.load.audio("footsteps-on-concrete", "sounds/footsteps-on-concrete.mp3");
  },

  preparePlayerAnimation(scene) {
    scene.anims.create({
      key: "player-run",
      frames: scene.anims.generateFrameNames("player-run"),
      frameRate: 10,
      repeat: -1,
    });
    scene.anims.create({
      key: "player-run-chair",
      frames: scene.anims.generateFrameNames("player-run-chair"),
      frameRate: 10,
      repeat: -1,
    });
    scene.anims.create({
      key: "player-idle",
      frames: scene.anims.generateFrameNames("player-idle"),
      frameRate: 10,
      repeat: -1,
    });
    scene.anims.create({
      key: "player-idle-chair",
      frames: scene.anims.generateFrameNames("player-idle-chair"),
      frameRate: 10,
      repeat: -1,
    });
    scene.anims.create({
      key: "player-jump",
      frames: scene.anims.generateFrameNames("player-jump"),
      frameRate: 10,
      repeat: -1,
    });
    scene.anims.create({
      key: "player-jump-chair",
      frames: scene.anims.generateFrameNames("player-jump-chair"),
      frameRate: 10,
      repeat: -1,
    });
  },

  createPlayer(scene, x, y, displayWidth, displayHeight, bodyWidth, bodyHeight, speed) {
    const player = scene.physics.add.sprite(x, y, "player-idle", "1").setDisplaySize(displayWidth, displayHeight).setOrigin(0.5, 1).play("player-idle");

    const unscaledBodyWidth = bodyWidth / player.scaleX;
    const unscaledBodyHeight = bodyHeight / player.scaleY;
    player.body.setSize(unscaledBodyWidth, unscaledBodyHeight, false);

    const offsetX = (player.width - unscaledBodyWidth) / 2;
    const offsetY = player.height - unscaledBodyHeight;
    player.body.setOffset(offsetX, offsetY);

    player.speed = speed;
    player.depth = 100;

    player.footstepsOnBricks = scene.sound.add("footsteps-on-bricks");
    player.footstepsOnBricks.addMarker({ name: "step1", start: 0, duration: 0.5 });
    player.footstepsOnWood = scene.sound.add("footsteps-on-wood");
    player.footstepsOnWood.addMarker({ name: "step1", start: 0.5, duration: 0.5 });
    player.woodCreaking = scene.sound.add("wood-creaking");
    player.woodCreaking.addMarker({ name: "step1", start: 0, duration: 0.5 });
    player.footstepsOnConcrete = scene.sound.add("footsteps-on-concrete");
    player.footstepsOnConcrete.addMarker({ name: "step1", start: 0.5, duration: 1 });

    return player;
  },

  configureCameraFollow(scene, player, deadzoneWidth, deadzoneHeight) {
    scene.cameras.main.startFollow(player);
    scene.cameras.main.setDeadzone(deadzoneWidth, deadzoneHeight);
    // TODO: настроить камеру
    scene.cameras.main.setZoom(1.2);
  },

  movePlayerOnPlatformers(scene, player, userInput, platformLayer, woodPlatformLayer, camera) {
    if (userInput.up.isDown && player.body.blocked.down) {
      player.body.velocity.y = -player.speed * PLAYER_JUMP_MULTIPLICATOR;

      if (player.inStairArea) {
        player.body.setAllowGravity(true);
        player.inStairArea = false;
      }
    }

    player.body.velocity.x = (userInput.right.isDown - userInput.left.isDown) * player.speed;
    const solidTile = platformLayer.getTileAtWorldXY(player.body.center.x, player.body.bottom + 2, false, camera);
    const woodTile = woodPlatformLayer.getTileAtWorldXY(player.body.center.x, player.body.bottom + 2, false, camera);

    if (player.body.velocity.equals(Phaser.Math.Vector2.ZERO)) {
      if (player.currentChair) player.anims.play("player-idle-chair", true);
      else player.anims.play("player-idle", true);
    } else if (player.body.blocked.down && player.body.velocity.y === 0) {
      if (player.currentChair) player.anims.play("player-run-chair", true);
      else player.anims.play("player-run", true);
      playFootstepSound(scene, player, solidTile ?? woodTile);
    } else {
      if (player.currentChair) player.anims.play("player-jump-chair", true);
      else player.anims.play("player-jump", true);
      player.body.velocity.x *= PLAYER_FALL_MULTIPLICATOR;
      playChairCreakingSound(player, userInput);
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
};

function isAreaFree(scene, chair, posX, posY, wallsLayer) {
  const width = chair.body.width;
  const height = chair.body.height;

  const startX = posX - width / 2 + chair.body.offset.x;
  const startY = posY - height / 2 + chair.body.offset.y;

  const collidingTiles = wallsLayer.getTilesWithinWorldXY(startX, startY, width, height, { isColliding: true });

  return collidingTiles.length === 0;
}

function playFootstepSound(scene, player, tile) {
  if (!tile) return;

  if (tile.properties.tileType === "brick" && !player.footstepsOnBricks.isPlaying) {
    player.footstepsOnBricks.play("step1");
  } else if (tile.properties.tileType === "wood" && !player.footstepsOnWood.isPlaying) {
    player.footstepsOnWood.play("step1");
  } else if (tile.properties.tileType === "stone" && !player.footstepsOnConcrete.isPlaying) {
    player.footstepsOnConcrete.play("step1");
  }
}

function playChairCreakingSound(player, userInput) {
  if (player.isStandingOnChair && userInput.up.isDown) {
    player.woodCreaking.play("step1");
  }
}