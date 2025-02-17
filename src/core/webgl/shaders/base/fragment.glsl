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
uniform sampler2D uShadowMap;

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

float getShadow(float bias) {
  float currentDepth = getCurrentDepth();
  float closestDepth = getClosestDepth();

  return currentDepth < 1.0 && currentDepth - bias > closestDepth ? 0.0 : 1.0;
}

vec3 calculateReflection(vec3 baseColor) {
  vec3 ambientColor = uLight.ambient * baseColor;

  vec3 normal = normalize(vNormal);
  vec3 lightDir = normalize(uLight.position - vVertex.xyz);
  float bias = max(0.0005 * (1.0 - dot(vNormal, lightDir)), 0.00005);

  float shadowFactor = getShadow(bias);

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