import { Object3DModelData } from '../core/object-model-data';

const positions = [
  // Front face
  -1.0, -1.0, 1.0, 1.0, -1.0, 1.0, 1.0, 1.0, 1.0, -1.0, 1.0, 1.0,
  // Back face
  -1.0, -1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0, -1.0, 1.0, -1.0, -1.0,
  // Top face
  -1.0, 1.0, -1.0, -1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, -1.0,
  // Bottom face
  -1.0, -1.0, -1.0, 1.0, -1.0, -1.0, 1.0, -1.0, 1.0, -1.0, -1.0, 1.0,
  // Right face
  1.0, -1.0, -1.0, 1.0, 1.0, -1.0, 1.0, 1.0, 1.0, 1.0, -1.0, 1.0,
  // Left face
  -1.0, -1.0, -1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0, -1.0, 1.0, -1.0,
];

export const cube: Object3DModelData = {
  positions,
  colors: new Array((positions.length / 3) * 4).fill(1.0),
  uv: [
    // Front face: white
    0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
    // Back face: red
    0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
    // Top face: green
    0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
    // Bottom face: blue
    0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
    // Right face: yellow
    0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
    // Left face: purple
    0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
  ],
  indices: [
    0,
    1,
    2,
    0,
    2,
    3, // front
    4,
    5,
    6,
    4,
    6,
    7, // back
    8,
    9,
    10,
    8,
    10,
    11, // top
    12,
    13,
    14,
    12,
    14,
    15, // bottom
    16,
    17,
    18,
    16,
    18,
    19, // right
    20,
    21,
    22,
    20,
    22,
    23, // left
  ],
  texture: 'assets/textures/box.jpg',
};
