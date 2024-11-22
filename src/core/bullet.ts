import { mat4, vec3 } from 'gl-matrix';
import { BulletModel } from '../models/bullet';

export class Bullet {
  private model: BulletModel;
  private modelMatrix: mat4;
  private position: vec3;
  private direction: vec3;
  private readonly SPEED = 20;
  private readonly LIFETIME = 2.0;
  private time = 0;

  public constructor(position: vec3, direction: vec3) {
    this.model = new BulletModel();
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

  public getPosition(): vec3 {
    return this.position;
  }

  public getModelMatrix(): mat4 {
    return this.modelMatrix;
  }

  public getModel(): BulletModel {
    return this.model;
  }
}
