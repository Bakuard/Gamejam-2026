#ifdef GL_ES
precision mediump float;
#endif

const vec3 MORNING_TINT = vec3(1.04, 0.92, 0.95); // мягкий, нежный рассвет (убрана резкая розоватость)
const vec3 AFTERNOON_TINT = vec3(0.85, 0.95, 1.05); // холодный пасмурный горный день
const vec3 EVENING_TINT = vec3(1.08, 0.90, 0.82); // мягкий, приглушенный закат (без ядовито-рыжего контраста)
const vec3 NIGHT_TINT = vec3(0.45, 0.75, 1.3); // оттенок ночи

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
    return vec4(nightColor / (1.4 + nightColor), color.a);
}

vec4 morningColor(vec4 color) {
    float luminance = dot(color.rgb, vec3(0.299, 0.587, 0.114));
    vec3 softened = mix(color.rgb, vec3(luminance), 0.2);
    return vec4(softened * MORNING_TINT, color.a);
}

vec4 afternoonColor(vec4 color) {
    // Вычисляем общую яркость (luminance) для обесцвечивания
    float luminance = dot(color.rgb, vec3(0.299, 0.587, 0.114));
    // Снижаем насыщенность на ~40%, делая картинку блеклой
    vec3 desaturated = mix(color.rgb, vec3(luminance), 0.4);
    // Применяем холодный горный оттенок
    return vec4(desaturated * AFTERNOON_TINT, color.a);
}

vec4 eveningColor(vec4 color) {
    float luminance = dot(color.rgb, vec3(0.299, 0.587, 0.114));
    vec3 softened = mix(color.rgb, vec3(luminance), 0.25);
    return vec4(softened * EVENING_TINT, color.a);
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
		color = changeColor(morningColor(color), afternoonColor(color), uIntensity);
	} else if(uDayPhase == EVENING_DAY_PHASE) {
		color = changeColor(afternoonColor(color), eveningColor(color), uIntensity);
	} else if(uDayPhase == NIGHT_DAY_PHASE) {
		color = changeColor(eveningColor(color), nightColor(color), uIntensity);
		color = lightPoints(originColor, color, outTexCoord, uIntensity);
	}

	gl_FragColor = color;
}
