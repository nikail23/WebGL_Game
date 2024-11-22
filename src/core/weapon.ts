import { mat4, vec3 } from "gl-matrix";
import { WeaponModel } from "../models/weapon";

export class Weapon {
  private readonly RECOIL_OFFSET = vec3.fromValues(0, 0.02, 0.1);
  private readonly RECOIL_ROTATION = 0.15;
  private readonly RECOIL_DURATION = 0.3;
  private readonly RECOVERY_SPEED = 5.0;
  private readonly FIRE_RATE = 0.1;
  private readonly WEAPON_OFFSET = vec3.fromValues(0.2, -0.15, -0.5);

  private lastFireTime: number = 0;
  private model: WeaponModel;
  private modelMatrix: mat4;
  private isRecoiling: boolean = false;
  private recoilTime: number = 0;
  private recoilProgress: number = 0;
  private animationOffset: vec3 = vec3.create();
  private animationRotation: number = 0;

  constructor() {
    this.model = new WeaponModel();
    this.modelMatrix = mat4.create();
  }

  public update(
    deltaTime: number,
    cameraPosition: vec3,
    cameraRotation: vec3
  ): void {
    if (this.isRecoiling) {
      this.recoilTime += deltaTime;
      this.recoilProgress = Math.min(this.recoilTime / this.RECOIL_DURATION, 1);

      if (this.recoilProgress >= 1) {
        this.isRecoiling = false;
        this.recoilTime = 0;
      }
      const curve = Math.sin(this.recoilProgress * Math.PI);
      vec3.scale(this.animationOffset, this.RECOIL_OFFSET, curve);
      this.animationRotation = this.RECOIL_ROTATION * curve;
    } else {
      vec3.scale(
        this.animationOffset,
        this.animationOffset,
        Math.max(0, 1 - this.RECOVERY_SPEED * deltaTime)
      );
      this.animationRotation *= Math.max(
        0,
        1 - this.RECOVERY_SPEED * deltaTime
      );
    }

    mat4.identity(this.modelMatrix);
    mat4.translate(this.modelMatrix, this.modelMatrix, cameraPosition);
    mat4.rotateY(this.modelMatrix, this.modelMatrix, -cameraRotation[1]);
    mat4.rotateX(
      this.modelMatrix,
      this.modelMatrix,
      -cameraRotation[0] + this.animationRotation
    );

    const totalOffset = vec3.create();
    vec3.add(totalOffset, this.WEAPON_OFFSET, this.animationOffset);
    mat4.translate(this.modelMatrix, this.modelMatrix, totalOffset);
  }

  public fire(): void {
    const now = performance.now() * 0.001;
    if (now - this.lastFireTime >= this.FIRE_RATE) {
      this.lastFireTime = now;
      this.isRecoiling = true;
      this.recoilTime = 0;
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
