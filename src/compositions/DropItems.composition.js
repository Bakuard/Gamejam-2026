import { ITEM_MATCHES } from "@/configs/gameplay.config.js";
import { inventoryComposition } from "@/compositions/Inventory.composition.js";

export const dropItemsComposition = {
  preloadDropItemsImage(scene) {
    scene.load.image("matches", "assets/img/dropItems/matches.png");
  },

  spawnMatches(scene, emptyTilesPos, dropItemsConfig, totalDays) {
    const matches = [];
    const maxItemsNumber = getMaxItems(dropItemsConfig, totalDays);
    Phaser.Math.RND.shuffle(emptyTilesPos);
    for (let i = 0; i < emptyTilesPos.length && i < maxItemsNumber; i++) {
      const emptyTile = emptyTilesPos[i];

      const item = scene.physics.add.sprite(emptyTile.x, emptyTile.y, "matches");
      item.type = ITEM_MATCHES;
      item.body.setAllowGravity(false);
      item.setDisplaySize(dropItemsConfig.matches.displayWidth, dropItemsConfig.matches.displayHeight);

      scene.tweens.add({
        targets: item,
        y: item.y - 15,
        duration: 1500,
        ease: "Sine.easeInOut",
        yoyo: true,
        repeat: -1,
        delay: Phaser.Math.Between(100, 1500),
      });

      matches.push(item);
    }
    return matches;
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

function getMaxItems(dropItemsConfig, totalDays) {
  const maxItemsNumberConf = dropItemsConfig.matches.maxItemsOnMap;
  const conf = maxItemsNumberConf.find((conf) => conf.totalDays > totalDays);
  return conf ? conf.maxItemsNumber : maxItemsNumberConf[maxItemsNumberConf.length - 1].maxItemsNumber;
}
