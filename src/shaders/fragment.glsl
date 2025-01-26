precision mediump float;

uniform float uHasTexture;
uniform sampler2D uSampler;
uniform lowp vec4 uColor;

varying lowp vec2 vTexCoordinate;

void main() {
  gl_FragColor = mix(uColor, texture2D(uSampler, vTexCoordinate.st), uHasTexture);
}