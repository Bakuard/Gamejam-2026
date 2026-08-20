import { inventoryComposition } from "@/compositions/Inventory.composition.js";

export const dropItemsComposition = {
  preloadDropItemsImage(scene, allDropItemsConfig) {
    Object.values(allDropItemsConfig).forEach((dropItemsConfig) => {
      scene.load.image(dropItemsConfig.imageName, `assets/img/dropItems/${dropItemsConfig.imageName}.png`);
    });
  },

  spawnDropItems(scene, spawnPointsForMatches, spawnPointsForMasterKeys, allDropItemsConfig, totalDays) {
    const dropItems = [];
    spawnDropItems(scene, spawnPointsForMatches, allDropItemsConfig.matches, totalDays, dropItems);
    spawnDropItems(scene, spawnPointsForMasterKeys, allDropItemsConfig.masterKeys, totalDays, dropItems);
    return dropItems;
  },

  despawnDropItems(dropItems) {
    dropItems.forEach((dropItem) => dropItem.destroy());
    dropItems.length = 0;
  },

  handlePlayerCollision(player, item, dropItems, inventoryStore) {
    const index = dropItems.findIndex((i) => i === item);
    if (index >= 0 && inventoryComposition.increaseItem(inventoryStore, dropItems[index].type)) {
      item.destroy();
      dropItems.splice(index, 1);
    }
  },
};

function spawnDropItems(scene, spawnPoints, dropItemConfig, totalDays, dropItems) {
  const maxItemsNumber = getMaxItems(dropItemConfig, totalDays);
  Phaser.Math.RND.shuffle(spawnPoints);
  for (let i = 0; i < spawnPoints.length && i < maxItemsNumber; i++) {
    const spawnPoint = spawnPoints[i];

    const item = scene.physics.add.sprite(spawnPoint.x, spawnPoint.y, dropItemConfig.imageName);
    item.type = dropItemConfig.type;
    item.body.setAllowGravity(false);
    item.setDisplaySize(dropItemConfig.displayWidth, dropItemConfig.displayHeight);

    scene.tweens.add({
      targets: item,
      y: item.y - 15,
      duration: 1500,
      ease: "Sine.easeInOut",
      yoyo: true,
      repeat: -1,
      delay: Phaser.Math.Between(100, 1500),
    });

    dropItems.push(item);
  }
}

function getMaxItems(dropItemConfig, totalDays) {
  const maxItemsNumberConf = dropItemConfig.maxItemsOnMap;
  const conf = maxItemsNumberConf.find((conf) => conf.totalDays > totalDays);
  return conf ? conf.maxItemsNumber : maxItemsNumberConf[maxItemsNumberConf.length - 1].maxItemsNumber;
}
