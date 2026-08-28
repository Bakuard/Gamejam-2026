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
    if (onlyTopCollision) tileLayer.forEachTile((tile) => tile.setCollision(false, false, true, false, false));
    return tileLayer;
  },

  createImageLayer(scene, rawMapKey, layerName, imageName) {
    const rawMap = scene.cache.json.get(rawMapKey);

    if (!rawMap) {
      console.warn(`Raw Tiled map "${rawMapKey}" not found`);
      return null;
    }

    const layerMeta = rawMap.layers?.find((layer) => layer.type === "imagelayer" && layer.name === layerName);

    if (!layerMeta) {
      console.warn(`Image layer "${layerName}" not found`);
      return null;
    }

    const camera = scene.cameras.main;

    // Tiled defaults
    const parallaxX = layerMeta.parallaxx ?? 1;
    const parallaxY = layerMeta.parallaxy ?? 1;

    const repeatX = layerMeta.repeatx ?? false;
    const repeatY = layerMeta.repeaty ?? false;

    const offsetX = (layerMeta.x ?? 0) + (layerMeta.offsetx ?? 0);

    const offsetY = (layerMeta.y ?? 0) + (layerMeta.offsety ?? 0);

    const texture = scene.textures.get(imageName).getSourceImage();

    let imageLayer;

    if (repeatX || repeatY) {
      imageLayer = scene.add.tileSprite(offsetX, offsetY, repeatX ? camera.width : texture.width, repeatY ? camera.height : texture.height, imageName);

      imageLayer.setOrigin(0, 0).setScrollFactor(0, 0);

      const updateParallax = () => {
        if (repeatX) {
          imageLayer.tilePositionX = camera.scrollX * parallaxX;
        }

        if (repeatY) {
          imageLayer.tilePositionY = camera.scrollY * parallaxY;
        }

        /*
         * Если повторения по оси нет,
         * но параллакс по ней нужен,
         * двигаем сам объект.
         */
        if (!repeatX) {
          imageLayer.x = offsetX - camera.scrollX * parallaxX;
        }

        if (!repeatY) {
          imageLayer.y = offsetY - camera.scrollY * parallaxY;
        }
      };

      scene.events.on(Phaser.Scenes.Events.UPDATE, updateParallax);

      imageLayer.once(Phaser.GameObjects.Events.DESTROY, () => {
        scene.events.off(Phaser.Scenes.Events.UPDATE, updateParallax);
      });

      updateParallax();
    } else {
      imageLayer = scene.add.image(offsetX, offsetY, imageName);

      imageLayer.setOrigin(0, 0).setScrollFactor(parallaxX, parallaxY);
    }

    imageLayer.setDepth(-1000);

    imageLayer.setAlpha(layerMeta.opacity ?? 1);

    imageLayer.setVisible(layerMeta.visible ?? true);

    return imageLayer;
  },

  findEmptyTilesCenterInArea(map, camera, areas, ...excludedTileLayers) {
    const result = [];

    for (let x = 0; x < map.width; x++) {
      for (let y = 0; y < map.height; y++) {
        const isOccupied = excludedTileLayers.some((layer) => layer.hasTileAt(x, y));
        if (isOccupied) continue;

        const tilePosX = map.tileToWorldX(x, camera) + map.tileWidth / 2;
        const tilePosY = map.tileToWorldY(y, camera) + map.tileHeight / 2;
        const inSomeArea = areas.some((area) => isPointInArea(tilePosX, tilePosY, area));
        if (!inSomeArea) continue;

        result.push({ x: tilePosX, y: tilePosY });
      }
    }

    return result;
  },
};

function extractPropertyValue(objMeta, propertyName) {
  if (!objMeta) return undefined;
  if (objMeta[propertyName] !== undefined) return objMeta[propertyName];
  if (!objMeta.properties) return undefined;

  if (Array.isArray(objMeta.properties)) {
    return objMeta.properties.find((property) => property.name === propertyName)?.value;
  }
  if (typeof objMeta.properties === "object") {
    return objMeta.properties[propertyName];
  }
  return undefined;
}

function copyAllProperties(objMeta, targetObj) {
  if (!objMeta?.properties) return;
  if (Array.isArray(objMeta.properties)) {
    objMeta.properties.forEach((property) => (targetObj[property.name] = property.value));
  } else if (typeof objMeta.properties === "object") {
    Object.assign(targetObj, objMeta.properties);
  }
}

function isPointInArea(x, y, area) {
  return x >= area.x && x <= (area.x + area.width) && y >= area.y && y <= (area.y + area.height);
}