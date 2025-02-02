attribute vec4 aVertexPosition;
attribute vec2 aTextureCoordinate;
attribute vec4 aNormal;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;
uniform mat3 uNormalMatrix;
uniform vec3 uLightPosition;

varying vec4 vVertex;
varying vec2 vTexCoordinate;
varying vec3 vNormal;
varying vec3 vLightPosition;

void main() {
  vLightPosition = vec3(uViewMatrix * vec4(uLightPosition, 1.0));
  vVertex = uViewMatrix * uModelMatrix * aVertexPosition;
  vNormal = normalize(uNormalMatrix * aNormal.xyz);
  vTexCoordinate = aTextureCoordinate;

  gl_Position = uProjectionMatrix * vVertex;
}