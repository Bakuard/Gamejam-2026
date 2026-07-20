import Phaser from "phaser";
import {PLAYER_JUMP_MULTIPLICATOR, PLAYER_FALL_MULTIPLICATOR, HEAL_VALUE, BOMB_DAMAGE} from "@/configs/gameplay.config.js";

export const playerComposition = {
  preloadPlayerAnimation(scene) {
    scene.load.atlas("player_wait", "assets/animation/wait.png", "assets/animation/wait.json");
    scene.load.atlas("player_move", "assets/animation/move.png", "assets/animation/move.json");
    scene.load.atlas("player_jump", "assets/animation/jump.png", "assets/animation/jump.json");
  },

  preparePlayerAnimation(scene) {
    scene.anims.create({
      key: "player_wait",
      frames: scene.anims.generateFrameNames("player_wait", { start: 1, end: 8 }),
      frameRate: 10,
      repeat: -1,
    });
    scene.anims.create({
      key: "player_move",
      frames: scene.anims.generateFrameNames("player_move", { start: 1, end: 8 }),
      frameRate: 10,
      repeat: -1,
    });
    scene.anims.create({
      key: "player_jump",
      frames: scene.anims.generateFrameNames("player_jump", { start: 1, end: 8 }),
      frameRate: 8,
      repeat: 1,
    });
  },

  createPlayer(scene, x, y, displayWidth, displayHeight, bodyWidth, bodyHeight, speed, maxHealth) {
    const player = scene.physics.add
      .sprite(x, y, "player_wait", "1")
      .setBodySize(bodyWidth, bodyHeight)
      .setDisplaySize(displayWidth, displayHeight)
      .setOrigin(0.5, 1)
      .play("player_wait")
      .refreshBody();
    player.speed = speed;
    player.depth = 100;
    player.maxHealth = maxHealth;
    player.currentHealth = maxHealth;
    return player;
  },

  configureCameraFollow(scene, player, deadzoneWidth, deadzoneHeight) {
    scene.cameras.main.startFollow(player);
    scene.cameras.main.setDeadzone(deadzoneWidth, deadzoneHeight);
  },

  movePlayerOnPlatformers(player, userInput) {
    if (userInput.up.isDown && player.body.blocked.down) player.body.velocity.y = -player.speed * PLAYER_JUMP_MULTIPLICATOR;

    player.body.velocity.x = (userInput.right.isDown - userInput.left.isDown) * player.speed;

    if (player.body.velocity.equals(Phaser.Math.Vector2.ZERO)) {
      player.anims.play("player_wait", true);
    } else if (player.body.blocked.down && player.body.velocity.y === 0) {
      player.anims.play("player_move", true);
    } else {
      player.anims.play("player_jump", true);
      player.body.velocity.x *= PLAYER_FALL_MULTIPLICATOR;
    }

    if (player.body.velocity.x !== 0) player.setFlipX(userInput.left.isDown);
  },

  createUserInput(scene) {
    return scene.input.keyboard.addKeys({
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      pickUp: Phaser.Input.Keyboard.KeyCodes.E,
    });
  },

  handleChairCollision(player, userInput) {
    if (player.body.blocked.left && userInput.left.isDown || player.body.blocked.right && userInput.right.isDown) {
      player.body.velocity.x = 0;
    }
  },
};