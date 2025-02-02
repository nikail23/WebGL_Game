attribute vec4 aVertexPosition;
attribute vec2 aTextureCoordinate;
attribute vec4 aNormal;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;
uniform mat3 uNormalMatrix;

varying vec4 vWorldVertex;
varying vec3 vWorldNormal;
varying vec2 vWorldTexture;

void main() {
  vWorldVertex = uModelMatrix * aVertexPosition;
  vWorldNormal = normalize(uNormalMatrix * aNormal.xyz);
  vWorldTexture = aTextureCoordinate;

  gl_Position = uProjectionMatrix * uViewMatrix * vWorldVertex;
}