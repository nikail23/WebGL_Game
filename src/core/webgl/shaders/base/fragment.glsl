precision mediump float;

struct Light {
  vec3 position;
  vec3 color;
  float shininess;
  float ambient;
};

uniform float uHasTexture;
uniform sampler2D uSampler;
uniform vec4 uColor;
uniform Light uLight;
uniform float uHasShadows;
uniform sampler2D uShadowMap;
uniform vec2 uShadowMapSize;

varying vec4 vVertex;
varying vec4 vLightProjectedVertex;
varying vec3 vNormal;
varying vec2 vTexture;

vec3 getProjectionCoordinates() {
  vec3 projCoords = vLightProjectedVertex.xyz / vLightProjectedVertex.w;
  projCoords = projCoords * 0.5 + 0.5;
  return projCoords;
}

float getClosestDepth() {
  vec3 projCoords = getProjectionCoordinates();
  return texture2D(uShadowMap, projCoords.xy).r;
}

float getCurrentDepth() {
  return getProjectionCoordinates().z;
}

float getOffsetDepth(vec2 offset, vec2 texelSize) {
  vec3 projCoords = getProjectionCoordinates();
  return texture2D(uShadowMap, projCoords.xy + offset * texelSize).r;
}

float getBaseShadow(float bias) {
  float currentDepth = getCurrentDepth();
  float closestDepth = getClosestDepth();

  return currentDepth < 1.0 && currentDepth - bias > closestDepth ? 0.0 : 1.0;
}

float getPCFShadow(float bias) {
  float currentDepth = getCurrentDepth();
  vec2 texelSize = vec2(1.0 / uShadowMapSize.x, 1.0 / uShadowMapSize.y);

  float shadow = 0.0;
  for(int x = -2; x <= 2; ++x) {
    for(int y = -2; y <= 2; ++y) {
      float offsetDepth = getOffsetDepth(vec2(float(x), float(y)), texelSize);
      shadow += currentDepth < 1.0 && (currentDepth - bias > offsetDepth) ? 0.0 : 1.0;
    }
  }
  return shadow /= 25.0;
}

vec3 calculateReflection(vec3 baseColor) {
  vec3 ambientColor = uLight.ambient * baseColor;

  vec3 normal = normalize(vNormal);
  vec3 lightDir = normalize(uLight.position - vVertex.xyz);
  float bias = max(0.0005 * (1.0 - dot(vNormal, lightDir)), 0.00005);

  float shadowFactor = mix(1.0, getPCFShadow(bias), uHasShadows);

  vec3 viewDir = normalize(-vVertex.xyz);

  vec3 diffuseColor = max(dot(normal, lightDir), 0.0) * baseColor;
  vec3 specularColor = pow(max(dot(viewDir, reflect(-lightDir, normal)), 0.0), uLight.shininess) * vec3(uLight.color);

  return ambientColor + shadowFactor * (diffuseColor + specularColor);
}

void main() {
  vec4 baseColor = mix(uColor, texture2D(uSampler, vTexture.st), uHasTexture);

  vec3 totalColor = calculateReflection(baseColor.rgb);

  gl_FragColor = vec4(totalColor, baseColor.a);
}