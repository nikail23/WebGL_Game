import { vec3, vec4 } from 'gl-matrix';
import { UpdateStrategy } from '../update-strategies';

export interface SceneMeshParams {
  name: string;
  objUrl: string;
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

export interface TextureParams {
  url?: string;
  scale?: number;
  baseColor?: vec4;
  alpha?: number;
}

export interface ScenePhysiscleObjectParams {
  type: SceneObjectEnum.PHYSICAL_OBJECT;
  position: vec3;
  rotation: vec3;
  scale: vec3;
  model: string;
  strategy?: UpdateStrategy;
  texture: TextureParams;
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
  model: string;
  rotation: vec3;
  scale: vec3;
  texture: TextureParams;
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
