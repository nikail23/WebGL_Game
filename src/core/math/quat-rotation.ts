import { quat, vec3 } from 'gl-matrix';

export function getRotationQuaternion(rotation: vec3): quat {
  const result = quat.create();
  quat.fromEuler(
    result,
    (-rotation[0] * 180) / Math.PI,
    (-rotation[1] * 180) / Math.PI,
    (-rotation[2] * 180) / Math.PI
  );
  return result;
}
