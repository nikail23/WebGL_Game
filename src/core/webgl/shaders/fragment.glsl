precision mediump float;

uniform float uHasTexture;
uniform sampler2D uSampler;
uniform vec4 uColor;
uniform vec3 uWorldLight;

varying vec4 vWorldVertex;
varying vec3 vWorldNormal;
varying vec2 vWorldTexture;

void main() {
  vec4 baseColor = mix(uColor, texture2D(uSampler, vWorldTexture.st), uHasTexture);

  vec3 ambientColor = 0.2 * vec3(baseColor);

  float cos = dot(normalize(vWorldNormal), normalize(uWorldLight - vWorldVertex.xyz));
  cos = clamp(cos, 0.0, 1.0);

  vec3 diffuseColor = cos * vec3(baseColor);

  vec3 totalColor = ambientColor + diffuseColor;

  gl_FragColor = vec4(totalColor, baseColor.a);
}