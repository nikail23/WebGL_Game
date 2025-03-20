attribute vec4 aVertexPosition;

uniform mat4 uModelMatrix;
uniform mat4 uLightViewProjectionMatrix;

void main() {
  gl_Position = uLightViewProjectionMatrix * uModelMatrix * aVertexPosition;
}