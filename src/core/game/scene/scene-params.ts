import { vec3 } from 'gl-matrix';
import { Model3D } from '../model';
import { UpdateStrategy } from '../update-strategies';

export interface SceneParams {
  camera: {
    position: vec3;
    rotation: vec3;
    fov: number;
    aspect: number;
    near: number;
    far: number;
  };
  models: Model3D[];
  objects: {
    position: vec3;
    rotation: vec3;
    scale: vec3;
    model: string;
    strategy?: UpdateStrategy;
  }[];
  light?: {
    color: vec3;
    shininess: number;
    ambient: number;
    position: vec3;
    lookAt: vec3;
    fovy: number;
    aspect: number;
    near: number;
    far: number;
  };
  shadows: {
    enabled: boolean;
    width: number;
    height: number;
  };
}
