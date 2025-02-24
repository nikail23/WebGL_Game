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
uniform sampler2D uShadowMap;

in vec4 vVertex;
in vec4 vLightPVMVertex;
in vec3 vNormal;
in vec2 vTexture;

out vec4 fragColor;

float calculateShadow(vec4 lightPVMVertex) {
  vec3 projCoords = lightPVMVertex.xyz / lightPVMVertex.w;
  projCoords = projCoords * 0.5f + 0.5f;
  if(projCoords.z > 1.0f)
    return 1.0f;
  float closestDepth = texture(uShadowMap, projCoords.xy).r;
  float bias = 0.005f;
  float currentDepth = projCoords.z;
  return currentDepth - bias > closestDepth ? 0.5f : 1.0f;
}

vec3 calculateReflection(vec3 baseColor) {
  vec3 normal = normalize(vNormal);
  vec3 lightDir = normalize(uLight.position - vVertex.xyz);
  vec3 viewDir = normalize(-vVertex.xyz);

  vec3 ambientColor = uLight.ambient * baseColor;
  vec3 diffuseColor = max(dot(normal, lightDir), 0.0f) * baseColor;
  vec3 specularColor = pow(max(dot(viewDir, reflect(-lightDir, normal)), 0.0f), uLight.shininess) * uLight.color;

  float shadow = calculateShadow(vLightPVMVertex);

  return ambientColor + diffuseColor * shadow + specularColor;
}

void main() {
  vec4 baseColor = mix(uColor, texture(uSampler, vTexture.st), uHasTexture);
  vec3 totalColor = calculateReflection(baseColor.rgb);
  fragColor = vec4(totalColor, baseColor.a);
}