#version 300 es
in vec2 aVertexPosition;

void main() {
    gl_Position = vec4(aVertexPosition, 0.0f, 1.0f);
}