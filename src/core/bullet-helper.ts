import { mat4, vec3 } from 'gl-matrix';
import { Object3D } from 'core/object';

export class BulletHelper {
  private object: Object3D;
  private modelMatrix: mat4;
  private position: vec3;
  private direction: vec3;
  private readonly SPEED = 20;
  private readonly LIFETIME = 2.0;
  private time = 0;

  public constructor(object: Object3D, position: vec3, direction: vec3) {
    this.object = object;
    this.position = vec3.clone(position);
    this.direction = vec3.normalize(vec3.create(), direction);
    this.modelMatrix = mat4.create();
  }

  public update(deltaTime: number): boolean {
    this.time += deltaTime;
    if (this.time >= this.LIFETIME) return false;

    vec3.scaleAndAdd(
      this.position,
      this.position,
      this.direction,
      this.SPEED * deltaTime
    );
    mat4.identity(this.modelMatrix);
    mat4.translate(this.modelMatrix, this.modelMatrix, this.position);

    return true;
  }

  public render(viewMatrix: mat4): void {
    const bulletViewMatrix = mat4.create();
    mat4.copy(bulletViewMatrix, viewMatrix);
    mat4.multiply(bulletViewMatrix, bulletViewMatrix, this.modelMatrix);
    this.object.render(bulletViewMatrix);
  }
}
