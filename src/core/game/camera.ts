import { mat4, vec3 } from 'gl-matrix';
import { Object3D } from './object';

export class Camera extends Object3D {
  public type = 'Camera';
  public aspect: number = 1920 / 1080;
  public fov: number = Math.PI / 4;
  public near: number = 0.1;
  public far: number = 100;
  public visible = false;

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
