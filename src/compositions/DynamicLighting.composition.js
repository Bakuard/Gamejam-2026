import { dayPhases } from "@/compositions/Calendar.composition.js";
import { LIGHT_POINT } from "@/configs/gameplay.config.js";

export const dynamicLightingComposition = {
  preloadShaders: function (scene) {
    scene.load.glsl("night", "shaders/night.glsl");
  },

  prepareAmbientLightPipeline: function (scene, timeConfig, currentDayPhase, currentDayPhaseProgress, lightPointsLayer) {
    if (!scene.renderer.pipelines.has("night")) {
      const nightPipeline = new Phaser.Renderer.WebGL.Pipelines.PostFXPipeline({
        game: scene.game,
        renderTarget: true,
        fragShader: scene.cache.shader.get("night").fragmentSrc,
      });

      nightPipeline.morningPhaseTransitionFraction = timeConfig.morningPhaseTransitionFraction;
      nightPipeline.afternoonPhaseTransitionFraction = timeConfig.afternoonPhaseTransitionFraction;
      nightPipeline.eveningPhaseTransitionFraction = timeConfig.eveningPhaseTransitionFraction;
      nightPipeline.nightPhaseTransitionFraction = timeConfig.nightPhaseTransitionFraction;
      dynamicLightingComposition.updateAmbientLightPipeline(nightPipeline, currentDayPhase, currentDayPhaseProgress);

      nightPipeline.onPreRender = function () {
        this.set1i("uDayPhase", this.dayPhase);
        this.set1f("uIntensity", this.intensity);

        const camera = scene.cameras.main;
        this.set2f("uCameraPos", camera.worldView.x, camera.worldView.y);
        this.set2f("uCameraSize", camera.worldView.width, camera.worldView.height);

        let lightPointsCount = 0;
        const positions = [];
        const colors = [];
        const radius = [];
        lightPointsLayer.getChildren().forEach(lightPoint => {
          if (lightPointsCount < 20 && lightPoint.turnOn) {
            positions.push(lightPoint.centerX, lightPoint.centerY);
            colors.push(1.0, 0.5, 0.1);
            radius.push(LIGHT_POINT.protectionRadius);
            lightPointsCount++;
          }
        });
        this.set1i("uLightCount", lightPointsCount);
        if (lightPointsCount > 0) {
          this.set2fv("uLightPositions", positions);
          this.set3fv("uLightColors", colors);
          this.set1fv("uLightRadius", radius);
        }
      };
      scene.renderer.pipelines.addPostPipeline("night", function NightPipeline() {
        return nightPipeline;
      });
    }

    scene.cameras.main.setPostPipeline("night");
    return scene.renderer.pipelines.getPostPipeline("night");
  },

  updateAmbientLightPipeline: function (nightPipeline, currentDayPhase, currentDayPhaseProgress) {
    switch (currentDayPhase) {
      case dayPhases.morning:
        nightPipeline.dayPhase = 1;
        nightPipeline.intensity = Math.min(1, currentDayPhaseProgress / nightPipeline.morningPhaseTransitionFraction);
        break;
      case dayPhases.afternoon:
        nightPipeline.dayPhase = 2;
        nightPipeline.intensity = Math.min(1, currentDayPhaseProgress / nightPipeline.afternoonPhaseTransitionFraction);
        break;
      case dayPhases.evening:
        nightPipeline.dayPhase = 3;
        nightPipeline.intensity = Math.min(1, currentDayPhaseProgress / nightPipeline.eveningPhaseTransitionFraction);
        break;
      case dayPhases.night:
        nightPipeline.dayPhase = 4;
        nightPipeline.intensity = Math.min(1, currentDayPhaseProgress / nightPipeline.nightPhaseTransitionFraction);
        break;
    }
  },
};