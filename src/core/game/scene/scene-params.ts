import { vec3 } from 'gl-matrix';
import { UpdateStrategy } from '../update-strategies';

export interface SceneMeshParams {
  name: string;
  objUrl: string;
  textureUrl: string;
}

export type SceneObjectParams =
  | ScenePhysiscleObjectParams
  | SceneLightParams
  | SceneCameraParams;

export enum SceneObjectEnum {
  PHYSICAL_OBJECT = 'physical-object',
  LIGHT = 'light',
  CAMERA = 'camera',
}

export interface ScenePhysiscleObjectParams {
  type: SceneObjectEnum.PHYSICAL_OBJECT;
  position: vec3;
  rotation: vec3;
  scale: vec3;
  textureScale: number;
  model: string;
  strategy?: UpdateStrategy;
}

export interface SceneLightParams {
  type: SceneObjectEnum.LIGHT;
  color: vec3;
  shininess: number;
  ambient: number;
  position: vec3;
  lookAt: vec3;
  fovy: number;
  aspect: number;
  near: number;
  far: number;
}

export interface SceneCameraParams {
  type: SceneObjectEnum.CAMERA;
  position: vec3;
  rotation: vec3;
  fov: number;
  aspect: number;
  near: number;
  far: number;
}

export interface SceneParams {
  meshes: SceneMeshParams[];
  objects: SceneObjectParams[];
  shadows: {
    enabled: boolean;
    width: number;
    height: number;
  };
}
