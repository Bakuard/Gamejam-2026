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
    const isOnGround = player.body.blocked.down || player.onStair;

    if (userInput.up.isDown && isOnGround) {
      player.body.velocity.y = -player.speed * PLAYER_JUMP_MULTIPLICATOR;

      if (player.inStairArea) {
        player.body.setAllowGravity(true);
        player.inStairArea = false;
      }
    }

    player.body.velocity.x = (userInput.right.isDown - userInput.left.isDown) * player.speed;

    if (player.body.velocity.equals(Phaser.Math.Vector2.ZERO)) {
      player.anims.play("player_wait", true);
    } else if (isOnGround && player.body.velocity.y === 0) {
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
      throw: Phaser.Input.Keyboard.KeyCodes.Q,
    });
  },

  handleChairCollision(player, userInput) {
    if ((player.body.blocked.left && userInput.left.isDown) || (player.body.blocked.right && userInput.right.isDown)) {
      player.body.velocity.x = 0;
    }
  },

  moveOnStair(scene, player, stairLayer, userInput) {
    let currentStair = null;
    player.inStairArea = scene.physics.overlap(player, stairLayer, (player, stair) => (currentStair = stair));
    if (!player.inStairArea || player.ignoreStair) {
      player.body.setAllowGravity(true);
      player.ignoreStair = false;
      player.onStair = false;
      return;
    }

    //Если нажали "Вниз" - включаем режим игнорирования до выхода из зоны
    if (userInput.down.isDown) player.ignoreStair = true;

    //Если лестница проигнорирована (игрок спрыгивает), прерываем метод
    if (player.ignoreStair) return;

    //Если набирает высоту во время прыжка, то же игнорируем лестницу.
    if (player.body.velocity.y < 0) return;

    //Как далеко находится игрок от основания лестницы по оси Х
    let progressX = Phaser.Math.Clamp((player.body.center.x - currentStair.body.x) / currentStair.body.width, 0, 1);
    if (currentStair.stairDir === "left") progressX = 1 - progressX;

    //На какой высоте находится ступенька лестницы рядом с которой сейчас стоит игрок
    const targetFootY = currentStair.body.bottom - currentStair.body.height * progressX;

    //Если линия ног отклоняется от ступенек не больше указанного значения - значит игрок на лестнице.
    const snapThreshold = 24;
    player.onStair = Math.abs(player.body.bottom - targetFootY) < snapThreshold;
    if (!player.onStair) return;

    player.body.setAllowGravity(false);
    player.body.setVelocityY(0);
    player.body.y = targetFootY - player.body.height;
  },
};