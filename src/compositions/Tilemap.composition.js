export const tilemapComposition = {
  createObjectLayer(scene, map, layerName) {
    const objLayerMeta = map.getObjectLayer(layerName);
    const objLayer = scene.physics.add.staticGroup();
    objLayerMeta.objects.forEach(objMeta => {
      const resultObj = objLayer.get(objMeta.x + objMeta.width / 2, objMeta.y - objMeta.height / 2).setSize(objMeta.width, objMeta.height);

      const imageName = extractPropertyValue(objMeta, "imageName");
      if(imageName) resultObj.setTexture(imageName).setDisplaySize(objMeta.width, objMeta.height);

      const isFlipX = extractPropertyValue(objMeta, "flipX");
      resultObj.setFlipX(isFlipX);

      copyAllProperties(objMeta, resultObj);
    });
    return objLayer;
  },

  createTileLayer(map, tilesetName, layerId, collisionIndexes) {
    const tileset = map.addTilesetImage(tilesetName);
    const tileLayer = map.createLayer(layerId, [tileset]);
    map.setCollision(collisionIndexes);
    return tileLayer;
  }
};

function extractPropertyValue(objMeta, propertyName) {
  return objMeta.properties?.find((property) => property.name === propertyName)?.value;
}

function copyAllProperties(objMeta, targetObj) {
  objMeta.properties?.forEach((property) => (targetObj[property.name] = property.value));
}