#version 300 es
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

in vec4 vVertex;
in vec4 vLightProjectedVertex;
in vec3 vNormal;
in vec2 vTexture;

out vec4 fragColor;

vec3 getProjectionCoordinates() {
  vec3 projCoords = vLightProjectedVertex.xyz / vLightProjectedVertex.w;
  projCoords = projCoords * 0.5f + 0.5f;
  return projCoords;
}

float getClosestDepth() {
  vec3 projCoords = getProjectionCoordinates();
  return texture(uShadowMap, projCoords.xy).r;
}

float getCurrentDepth() {
  return getProjectionCoordinates().z;
}

float getOffsetDepth(vec2 offset, vec2 texelSize) {
  vec3 projCoords = getProjectionCoordinates();
  return texture(uShadowMap, projCoords.xy + offset * texelSize).r;
}

float getBaseShadow(float bias) {
  float currentDepth = getCurrentDepth();
  float closestDepth = getClosestDepth();
  return currentDepth < 1.0f && currentDepth - bias > closestDepth ? 0.0f : 1.0f;
}

float getPCFShadow(float bias) {
  float currentDepth = getCurrentDepth();
  vec2 texelSize = vec2(1.0f / uShadowMapSize.x, 1.0f / uShadowMapSize.y);
  float shadow = 0.0f;

  for(int x = -2; x <= 2; ++x) {
    for(int y = -2; y <= 2; ++y) {
      float offsetDepth = getOffsetDepth(vec2(float(x), float(y)), texelSize);
      shadow += currentDepth < 1.0f && (currentDepth - bias > offsetDepth) ? 0.0f : 1.0f;
    }
  }
  return shadow / 25.0f;
}

vec3 calculateReflection(vec3 baseColor) {
  vec3 ambientColor = uLight.ambient * baseColor;
  vec3 normal = normalize(vNormal);
  vec3 lightDir = normalize(uLight.position - vVertex.xyz);
  float bias = max(0.0005f * (1.0f - dot(vNormal, lightDir)), 0.00005f);
  float shadowFactor = mix(1.0f, getPCFShadow(bias), uHasShadows);
  vec3 viewDir = normalize(-vVertex.xyz);
  vec3 diffuseColor = max(dot(normal, lightDir), 0.0f) * baseColor;
  vec3 specularColor = pow(max(dot(viewDir, reflect(-lightDir, normal)), 0.0f), uLight.shininess) * uLight.color;

  return ambientColor + shadowFactor * (diffuseColor + specularColor);
}

void main() {
  vec4 textureColor = texture(uSampler, vTexture);
  vec4 baseColor = mix(uColor, textureColor, uHasTexture);
  vec3 totalColor = calculateReflection(baseColor.rgb);
  fragColor = vec4(totalColor, baseColor.a);
}
