import { Object3D } from './object';
import { mat4, vec3 } from 'gl-matrix';

export class Light3D extends Object3D {
  public type = 'Light3D';
  public shininess = 32;
  public color = vec3.fromValues(1, 1, 1);
  public ambient = 0.2;
  public lookAt = vec3.fromValues(0, 0, 0);
  public fovy = Math.PI / 1.5;
  public aspect = 1;
  public near = 0.1;
  public far = 100;

  public getLightViewProjectionMatrix(): mat4 {
    const lightProjectionMatrix = mat4.create();
    mat4.perspective(
      lightProjectionMatrix,
      this.fovy,
      this.aspect,
      this.near,
      this.far
    );

    const lightViewMatrix = mat4.create();
    mat4.lookAt(
      lightViewMatrix,
      [this.position[0], this.position[1], this.position[2]],
      [this.lookAt[0], this.lookAt[1], this.lookAt[2]],
      [0, this.position[1] + 1, 0]
    );

    const lightViewProjectionMatrix = mat4.create();
    mat4.multiply(
      lightViewProjectionMatrix,
      lightProjectionMatrix,
      lightViewMatrix
    );

    return lightViewProjectionMatrix;
  }
}
