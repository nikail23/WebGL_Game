import { vec3 } from 'gl-matrix';
import { Model3D } from '../model';
import { UpdateStrategy } from '../update-strategies';

export interface SceneParams {
  camera?: {
    position?: vec3;
    rotation?: vec3;
  };
  models: Model3D[];
  objects: {
    position: vec3;
    rotation: vec3;
    scale: vec3;
    model: string;
    strategy?: UpdateStrategy;
  }[];
}
