attribute vec4 aVertexPosition;
attribute vec2 aTextureCoordinate;
attribute vec4 aNormal;

uniform mat4 uViewModelMatrix;
uniform mat4 uProjectionMatrix;
uniform vec3 uLightPosition;

varying vec4 vVertex;
varying vec2 vTexCoordinate;
varying vec4 vNormal;
varying vec3 vLightPosition;

void main() {
  vLightPosition = vec3(uViewModelMatrix * vec4(uLightPosition, 1.0));
  vTexCoordinate = aTextureCoordinate;
  vVertex = uViewModelMatrix * aVertexPosition;
  vNormal = uViewModelMatrix * aNormal;
  gl_Position = uProjectionMatrix * uViewModelMatrix * aVertexPosition;
}