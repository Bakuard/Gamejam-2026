#ifdef GL_ES
precision mediump float;
#endif

const vec3 MORNING_TINT = vec3(1.1, 0.8, 0.9); //оттенок рассвета
const vec3 EVENING_TINT = vec3(1.2, 0.75, 0.6); //оттенок заката
const vec3 NIGHT_TINT = vec3(0.3, 0.65, 1.25); //оттенок ночи

const int MORNING_DAY_PHASE = 1;
const int AFTERNOON_DAY_PHASE = 2;
const int EVENING_DAY_PHASE = 3;
const int NIGHT_DAY_PHASE = 4;

varying vec2 outTexCoord;
uniform sampler2D uMainSampler;
uniform float uIntensity;
uniform int uDayPhase;

//Источники света
uniform int uLightCount;
uniform vec2 uLightPositions[20]; //Мировые координаты источников света в пикселях
uniform vec3 uLightColors[20];
uniform float uLightRadius[20];
uniform vec2 uCameraPos;
uniform vec2 uCameraSize;

vec4 nightColor(vec4 color) {
    vec3 nightColor = color.rgb * NIGHT_TINT;
    return vec4(nightColor / (2.3 + nightColor), color.a);
}

vec4 morningColor(vec4 color) {
    return vec4(color.rgb * MORNING_TINT, color.a);
}

vec4 eveningColor(vec4 color) {
    return vec4(color.rgb * EVENING_TINT, color.a);
}

vec4 changeColor(vec4 originalColor, vec4 targetColor, float intensity) {
    originalColor.rgb = mix(originalColor.rgb, targetColor.rgb, intensity);
    originalColor.rgb = clamp(originalColor.rgb, 0.0, 1.0);
    return originalColor;
}

vec2 worldPointFromScreenPoint(vec2 screenPoint) {
    vec2 flippedScreenPoint = vec2(screenPoint.x, 1.0 - screenPoint.y);
    return uCameraPos + (flippedScreenPoint * uCameraSize);
}

/*
* lightPointWorldCenter - задается в пикселях, в мировых координатах
* lightPointRadius - задается в пикселях
* originColorWorldPos - задается в пикселях, в мировых координатах
*/
vec4 lightPoint(vec2 lightPointWorldCenter,
                vec3 lightPointColor,
                float lightPointRadius,
                vec4 originColor,
                vec4 currentColor,
                vec2 originColorWorldPos,
                float intensity) {
    float dist = distance(originColorWorldPos, lightPointWorldCenter);
    float lightAttenuation = (1.0 - smoothstep(0.0, lightPointRadius, dist)) * intensity;
    vec3 lighteningColor = lightPointColor * originColor.rgb;
    vec3 finalColor = mix(currentColor.rgb, lighteningColor, lightAttenuation);
    return vec4(finalColor, currentColor.a);
}

vec4 lightPoints(vec4 originColor, vec4 currentColor, vec2 colorScreenPos, float intensity) {
    vec2 colorWorldPos = worldPointFromScreenPoint(colorScreenPos);
    for (int i = 0; i < 20; i++) {
        if (i >= uLightCount) break;
        currentColor = lightPoint(uLightPositions[i], uLightColors[i], uLightRadius[i], originColor, currentColor, colorWorldPos, intensity);
    }
    return currentColor;
}

void main(void) {
	vec4 color = texture2D(uMainSampler, outTexCoord);
	vec4 originColor = color;

	if(uDayPhase == MORNING_DAY_PHASE) {
		color = changeColor(nightColor(color), morningColor(color), uIntensity);
		color = lightPoints(originColor, color, outTexCoord, 1.0 - uIntensity);
	} else if(uDayPhase == AFTERNOON_DAY_PHASE) {
		color = changeColor(morningColor(color), color, uIntensity);
	} else if(uDayPhase == EVENING_DAY_PHASE) {
		color = changeColor(color, eveningColor(color), uIntensity);
	} else if(uDayPhase == NIGHT_DAY_PHASE) {
		color = changeColor(eveningColor(color), nightColor(color), uIntensity);
		color = lightPoints(originColor, color, outTexCoord, uIntensity);
	}

	gl_FragColor = color;
}
