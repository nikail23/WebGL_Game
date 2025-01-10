import { Object3DModelData } from '../core/object-model-data';

const positions = [
  -10.0, 0.0, -10.0, 10.0, 0.0, -10.0, 10.0, 0.0, 10.0, -10.0, 0.0, 10.0,
];

export const floor: Object3DModelData = {
  positions,
  colors: [
    0.5, 0.5, 0.5, 1.0, 0.5, 0.5, 0.5, 1.0, 0.5, 0.5, 0.5, 1.0, 0.5, 0.5, 0.5,
    1.0,
  ],
  uv: new Array((positions.length / 3) * 2).fill(0.0),
  indices: [0, 1, 2, 0, 2, 3],
};
