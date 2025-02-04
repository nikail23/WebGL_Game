attribute vec4 aVertexPosition;
attribute vec2 aTextureCoordinate;
attribute vec4 aNormal;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;
uniform mat3 uNormalMatrix;

varying vec4 vVertex;
varying vec3 vNormal;
varying vec2 vTexture;

void main() {
  vVertex = uViewMatrix * uModelMatrix * aVertexPosition;
  vNormal = normalize(uNormalMatrix * aNormal.xyz);
  vTexture = aTextureCoordinate;

  gl_Position = uProjectionMatrix * vVertex;
}