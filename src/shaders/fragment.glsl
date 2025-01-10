precision mediump float;

uniform sampler2D uSampler;

varying lowp vec4 vColor;
varying lowp vec2 vTexCoord;

void main() {
  vec4 texColor = texture2D(uSampler, vTexCoord);
  if (texColor.a == 0.0) {
    gl_FragColor = vColor;
  } else {
    gl_FragColor = texColor * vColor;
  }
}