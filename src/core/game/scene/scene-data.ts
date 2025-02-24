import { Camera } from '../camera';
import { Object3D } from '../object';

export interface SceneData {
  camera: Camera | null;
  objects: Object3D[];
}
