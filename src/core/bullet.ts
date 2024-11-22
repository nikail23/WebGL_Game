import { vec3 } from 'gl-matrix';

export class Bullet {
  private position: vec3;
  private direction: vec3;
  private readonly SPEED = 20;
  private readonly LIFETIME = 2.0;
  private time = 0;

  public constructor(position: vec3, direction: vec3) {
    this.position = vec3.clone(position);
    this.direction = vec3.normalize(vec3.create(), direction);
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
    return true;
  }

  public getPosition(): vec3 {
    return this.position;
  }
}
