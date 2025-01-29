precision mediump float;

uniform float uHasTexture;
uniform sampler2D uSampler;
uniform vec4 uColor;

varying vec3 vLightPosition;
varying vec2 vTexCoordinate;
varying vec4 vVertex;
varying vec4 vNormal;

void main() {
  vec4 baseColor = mix(uColor, texture2D(uSampler, vTexCoordinate.st), uHasTexture);

  vec4 ambient = vec4(0.2, 0.2, 0.2, 1.0);

  float diffuse = max(dot(normalize(vNormal.xyz), normalize(vLightPosition - vVertex.xyz)), 0.0);

  gl_FragColor = baseColor * (ambient + vec4(diffuse, diffuse, diffuse, 1.0));
}