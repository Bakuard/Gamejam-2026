export const tilemapComposition = {
  createMetaObjectLayer(map, layerName) {
    const objLayerMeta = map.getObjectLayer(layerName);
    return objLayerMeta.objects.map((objMeta) => {
      const obj = {};
      Object.assign(obj, objMeta);
      copyAllProperties(objMeta, obj);
      return obj;
    });
  },

  toMap(layer, key) {
    const map = {};
    layer.forEach((obj) => (map[obj[key]] = obj));
    return map;
  },

  createObjectLayer(scene, map, layerName, onlyTopCollision) {
    const objLayerMeta = map.getObjectLayer(layerName);
    const objLayer = scene.physics.add.staticGroup();
    objLayerMeta.objects.forEach((objMeta) => {
      const resultObj = objLayer.get(objMeta.x + objMeta.width / 2, objMeta.y - objMeta.height / 2).setSize(objMeta.width, objMeta.height);

      const imageName = extractPropertyValue(objMeta, "imageName");
      if (imageName) resultObj.setTexture(imageName).setDisplaySize(objMeta.width, objMeta.height);

      const isFlipX = extractPropertyValue(objMeta, "flipX");
      resultObj.setFlipX(isFlipX);

      copyAllProperties(objMeta, resultObj);

      if (onlyTopCollision) {
        resultObj.body.checkCollision.left = false;
        resultObj.body.checkCollision.right = false;
        resultObj.body.checkCollision.down = false;
        resultObj.body.checkCollision.up = true;
      }
    });
    return objLayer;
  },

  createTileLayer(map, tilesetName, layerId, collisionIndexes, onlyTopCollision) {
    const tileset = map.addTilesetImage(tilesetName);
    const tileLayer = map.createLayer(layerId, [tileset]);
    tileLayer.setCollision(collisionIndexes);
    if (onlyTopCollision) tileLayer.forEachTile(tile => tile.setCollision(false, false, true, false, false));
    return tileLayer;
  },
};

function extractPropertyValue(objMeta, propertyName) {
  return objMeta.properties?.find((property) => property.name === propertyName)?.value;
}

function copyAllProperties(objMeta, targetObj) {
  objMeta.properties?.forEach((property) => (targetObj[property.name] = property.value));
}