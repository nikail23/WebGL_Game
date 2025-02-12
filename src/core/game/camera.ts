import { mat4, vec3 } from 'gl-matrix';
import { Object3D } from './object';
import { CameraStrategy } from './update-strategies/camera-strategy';

export class Camera extends Object3D {
  public constructor(
    public position: vec3,
    public rotation: vec3,
    public aspect: number,
    public fov: number,
    public near: number,
    public far: number
  ) {
    super(position, rotation, undefined, undefined, new CameraStrategy());
  }

  public get viewMatrix(): mat4 {
    const viewMatrix = mat4.create();
    mat4.identity(viewMatrix);
    mat4.rotate(viewMatrix, viewMatrix, this.rotation[0], [1, 0, 0]);
    mat4.rotate(viewMatrix, viewMatrix, this.rotation[1], [0, 1, 0]);
    mat4.translate(
      viewMatrix,
      viewMatrix,
      vec3.negate(vec3.create(), this.position)
    );
    return viewMatrix;
  }

  public get projectionMatrix(): mat4 {
    const projectionMatrix = mat4.create();
    mat4.perspective(
      projectionMatrix,
      this.fov,
      this.aspect,
      this.near,
      this.far
    );
    return projectionMatrix;
  }
}
