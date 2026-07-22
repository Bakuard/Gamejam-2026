import Phaser from "phaser";
import {PLAYER_JUMP_MULTIPLICATOR, PLAYER_FALL_MULTIPLICATOR} from "@/configs/gameplay.config.js";

export const playerComposition = {
  preloadPlayerAnimation(scene) {
    scene.load.atlas("player-run", "assets/animation/player/player-run.png", "assets/animation/player/player-run.json");
    scene.load.atlas("player-idle", "assets/animation/player/player-idle.png", "assets/animation/player/player-idle.json");
    scene.load.atlas("player-jump", "assets/animation/player/player-jump.png", "assets/animation/player/player-jump.json");
  },

  preparePlayerAnimation(scene) {
    scene.anims.create({
      key: "player-run",
      frames: scene.anims.generateFrameNames("player-run"),
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
      key: "player-jump",
      frames: scene.anims.generateFrameNames("player-jump"),
      frameRate: 10,
      repeat: 1,
    });
  },

  createPlayer(scene, x, y, displayWidth, displayHeight, bodyWidth, bodyHeight, speed) {
    const player = scene.physics.add.sprite(x, y, "player-idle", "1")
      .setDisplaySize(displayWidth, displayHeight)
      .setOrigin(0.5, 1)
      .play("player-idle");

    const unscaledBodyWidth = bodyWidth / player.scaleX;
    const unscaledBodyHeight = bodyHeight / player.scaleY;
    player.body.setSize(unscaledBodyWidth, unscaledBodyHeight, false);

    const offsetX = (player.width - unscaledBodyWidth) / 2;
    const offsetY = player.height - unscaledBodyHeight;
    player.body.setOffset(offsetX, offsetY);

    player.speed = speed;
    player.depth = 100;
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
      player.anims.play("player-idle", true);
    } else if (isOnGround && player.body.velocity.y === 0) {
      player.anims.play("player-run", true);
    } else {
      player.anims.play("player-jump", true);
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
      interract: Phaser.Input.Keyboard.KeyCodes.E,
      throw: Phaser.Input.Keyboard.KeyCodes.Q,
    });
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

  pickUpChair(player, chair, userInput) {
    if (Phaser.Input.Keyboard.JustDown(userInput.interract)) {
      chair.disableBody(true, false);
      player.currentChair = chair;
    }
  },

  careChair(player) {
    if (player.currentChair) {
      player.currentChair.x = player.x;
      player.currentChair.y = player.y - player.currentChair.height;
    }
  },

  throwChair(player, userInput) {
    if (player.currentChair && Phaser.Input.Keyboard.JustDown(userInput.interract)) {
      const direction = player.flipX ? -1 : 1;
      const posX = player.x + (player.body.width + player.currentChair.body.width) * direction;
      const posY = player.body.bottom - player.currentChair.body.height / 2;
      player.currentChair.x = posX;
      player.currentChair.y = posY;
      player.currentChair.enableBody(true, posX, posY, true, true).refreshBody();
      player.currentChair = null;
    }
  },
};