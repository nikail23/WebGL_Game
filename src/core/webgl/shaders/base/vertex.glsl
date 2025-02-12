attribute vec4 aVertexPosition;
attribute vec2 aTextureCoordinate;
attribute vec4 aNormal;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;
uniform mat3 uNormalMatrix;
uniform mat4 uLightViewProjectionMatrix;

varying vec4 vVertex;
varying vec3 vNormal;
varying vec2 vTexture;
varying vec4 vLightPVMVertex;

void main() {
  vVertex = uViewMatrix * uModelMatrix * aVertexPosition;
  vLightPVMVertex = uLightViewProjectionMatrix * uModelMatrix * aVertexPosition;

  vNormal = normalize(uNormalMatrix * aNormal.xyz);
  vTexture = aTextureCoordinate;

  gl_Position = uProjectionMatrix * vVertex;
}