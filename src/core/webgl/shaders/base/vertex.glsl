#version 300 es
precision mediump float;

in vec4 aVertexPosition;
in vec2 aTextureCoordinate;
in vec4 aNormal;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;
uniform mat3 uNormalMatrix;
uniform mat4 uLightViewProjectionMatrix;

out vec4 vVertex;
out vec3 vNormal;
out vec2 vTexture;
out vec4 vLightProjectedVertex;

void main() {
  vVertex = uViewMatrix * uModelMatrix * aVertexPosition;
  vLightProjectedVertex = uLightViewProjectionMatrix * uModelMatrix * aVertexPosition;

  vNormal = normalize(uNormalMatrix * aNormal.xyz);
  vTexture = aTextureCoordinate;

  gl_Position = uProjectionMatrix * vVertex;
}