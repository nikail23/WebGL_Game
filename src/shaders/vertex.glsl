attribute vec4 aVertexPosition;
attribute vec2 aTextureCoordinate;

uniform mat4 uViewModelMatrix;
uniform mat4 uProjectionMatrix;

varying mediump vec2 vTexCoordinate;

void main() {
  gl_Position = uProjectionMatrix * uViewModelMatrix * aVertexPosition;
  vTexCoordinate = aTextureCoordinate;
}