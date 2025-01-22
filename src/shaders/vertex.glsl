attribute vec4 aVertexPosition;
attribute vec2 aTextureCoordinate;

uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;

varying mediump vec2 vTexCoordinate;

void main() {
  gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
  vTexCoordinate = aTextureCoordinate;
}