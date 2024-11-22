import { mat4, vec3 } from "gl-matrix";
import { WeaponModel } from "../models/weapon";

export class Weapon {
  private readonly FIRE_RATE = 0.1;
  private readonly WEAPON_OFFSET = vec3.fromValues(0.2, -0.15, -0.5);
  private lastFireTime: number = 0;
  private position: vec3;
  private rotation: vec3;
  private model: WeaponModel;
  private modelMatrix: mat4;

  constructor() {
    this.position = vec3.create();
    this.rotation = vec3.create();
    this.model = new WeaponModel();
    this.modelMatrix = mat4.create();
  }

  public update(
    deltaTime: number,
    cameraPosition: vec3,
    cameraRotation: vec3
  ): void {
    mat4.identity(this.modelMatrix);
    mat4.translate(this.modelMatrix, this.modelMatrix, cameraPosition);
    mat4.rotateY(this.modelMatrix, this.modelMatrix, -cameraRotation[1]);
    mat4.rotateX(this.modelMatrix, this.modelMatrix, -cameraRotation[0]);
    mat4.rotateZ(this.modelMatrix, this.modelMatrix, 0);
    mat4.translate(this.modelMatrix, this.modelMatrix, this.WEAPON_OFFSET);
  }

  public fire(): void {
    const now = performance.now() * 0.001;
    if (now - this.lastFireTime >= this.FIRE_RATE) {
      this.lastFireTime = now;
      // TODO: Создание пули
      console.log("Weapon fired!");
    }
  }

  public getModelMatrix(): mat4 {
    return this.modelMatrix;
  }

  public getModel(): WeaponModel {
    return this.model;
  }
}
