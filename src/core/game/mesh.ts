import { Mesh3D } from './model';
import { Object3D } from './object';

export class PhysicleObject3D extends Object3D {
  public type = 'PhysicleObject3D';
  public textureScale = 1;
  public mesh: Mesh3D | null = null;
}
