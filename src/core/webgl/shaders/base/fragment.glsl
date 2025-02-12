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
varying vec4 vLightPVMVertex;
varying vec3 vNormal;
varying vec2 vTexture;

bool inShadow(vec4 lightPVMVertex) {
  vec3 projCoords = lightPVMVertex.xyz / lightPVMVertex.w;
  projCoords = projCoords * 0.5 + 0.5;
  if(projCoords.z > 1.0)
    return false;
  float closestDepth = texture2D(uShadowMap, projCoords.xy).r;
  float bias = 0.005;
  float currentDepth = projCoords.z;
  return currentDepth - bias > closestDepth ? true : false;
}

vec3 calculateReflection(vec3 baseColor) {
  vec3 ambientColor = uLight.ambient * baseColor;

  if(inShadow(vLightPVMVertex)) {
    return ambientColor;
  }

  vec3 normal = normalize(vNormal);
  vec3 lightDir = normalize(uLight.position - vVertex.xyz);
  vec3 viewDir = normalize(-vVertex.xyz);

  vec3 diffuseColor = max(dot(normal, lightDir), 0.0) * baseColor;
  vec3 specularColor = pow(max(dot(viewDir, reflect(-lightDir, normal)), 0.0), uLight.shininess) * vec3(uLight.color);

  return ambientColor + diffuseColor + specularColor;
}

void main() {
  vec4 baseColor = mix(uColor, texture2D(uSampler, vTexture.st), uHasTexture);

  vec3 totalColor = calculateReflection(baseColor.rgb);

  gl_FragColor = vec4(totalColor, baseColor.a);
}