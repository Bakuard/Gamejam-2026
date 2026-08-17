import Phaser from "phaser";

export const doorComposition = {
  preloadDoorAnimations(scene) {
    scene.load.atlas("door", "assets/animation/environment/door.png", "assets/animation/environment/door.json");
  },

  createDoors(scene, doorsLayerMeta) {
    const doorsPhysicLayer = scene.physics.add.staticGroup();
    doorsLayerMeta.forEach((doorMeta) => {
      const door = doorsPhysicLayer.get(doorMeta.x + doorMeta.width / 2, doorMeta.y + doorMeta.height / 2, "door", "1");
      door.setSize(doorMeta.width + 20, doorMeta.height);
      door.setDisplaySize(doorMeta.height, doorMeta.height);
      door.isClosed = true;
      door.isLocked = false;
      door.openSide = doorMeta.openSide;
    });
    return doorsPhysicLayer;
  },

  toggleDoor(door, userInput) {
    if (door.isClosed && door.isLocked) return;

    if (Phaser.Input.Keyboard.JustDown(userInput.interact)) door.isClosed = !door.isClosed;

    if (door.isClosed) door.setFrame("1");
    else if (door.openSide === "left") door.setFrame("2");
    else if (door.openSide === "right") door.setFrame("4");
  },

  lockDoor(door) {
    door.isClosed = true;
    door.isLocked = true;
    door.setFrame("1");
  },
};