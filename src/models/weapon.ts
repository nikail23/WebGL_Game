import { Object3DModelData } from '../core/object-model-data';

const positions = [
  // Basic gun shape
  // Left side
  -0.1, -0.1, -0.3, -0.1, 0.1, -0.3, -0.1, 0.1, 0.3, -0.1, -0.1, 0.3,
  // Right side
  0.1, -0.1, -0.3, 0.1, 0.1, -0.3, 0.1, 0.1, 0.3, 0.1, -0.1, 0.3,
];

export const weapon: Object3DModelData = {
  positions,
  colors: [
    // Dark grey color
    0.2, 0.2, 0.2, 1.0, 0.2, 0.2, 0.2, 1.0, 0.2, 0.2, 0.2, 1.0, 0.2, 0.2, 0.2,
    1.0, 0.3, 0.3, 0.3, 1.0, 0.3, 0.3, 0.3, 1.0, 0.3, 0.3, 0.3, 1.0, 0.3, 0.3,
    0.3, 1.0,
  ],
  uv: new Array((positions.length / 3) * 2).fill(0.0),
  indices: [
    // Front
    0, 1, 2, 0, 2, 3,
    // Back
    4, 5, 6, 4, 6, 7,
    // Top
    1, 5, 6, 1, 6, 2,
    // Bottom
    0, 4, 7, 0, 7, 3,
    // Right
    3, 2, 6, 3, 6, 7,
    // Left
    0, 1, 5, 0, 5, 4,
  ],
};
