import { mat4, vec3 } from 'gl-matrix';
import { BulletHelper } from './bullet-helper';
import { getRotationQuaternion } from './math/quat-rotation';
import { Object3D } from 'core/object';
import { Object3DFabric } from 'core/object-fabric';

export class WeaponHelper {
  private readonly RECOIL_OFFSET = vec3.fromValues(0, 0.02, 0.1);
  private readonly RECOIL_ROTATION = 0.15;
  private readonly RECOIL_DURATION = 0.3;
  private readonly RECOVERY_SPEED = 5.0;
  private readonly FIRE_RATE = 0.1;
  private readonly WEAPON_OFFSET = vec3.fromValues(0.2, -0.15, -0.5);

  private position: vec3 = vec3.create();
  private rotation: vec3 = vec3.create();
  private lastFireTime: number = 0;
  private modelMatrix: mat4;
  private isRecoiling: boolean = false;
  private recoilTime: number = 0;
  private recoilProgress: number = 0;
  private animationOffset: vec3 = vec3.create();
  private animationRotation: number = 0;

  private bullets: BulletHelper[] = [];

  public constructor(
    private weaponObject: Object3D,
    private object3DFabric: Object3DFabric
  ) {
    this.modelMatrix = mat4.create();
  }

  public update(
    deltaTime: number,
    cameraPosition: vec3,
    cameraRotation: vec3
  ): void {
    vec3.copy(this.position, cameraPosition);
    vec3.copy(this.rotation, cameraRotation);

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

    // Update bullets
    this.bullets = this.bullets.filter((bullet) => bullet.update(deltaTime));

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

  public async fire(): Promise<void> {
    if (performance.now() * 0.001 - this.lastFireTime >= this.FIRE_RATE) {
      this.lastFireTime = performance.now() * 0.001;
      this.isRecoiling = true;
      this.recoilTime = 0;

      const bulletPos = vec3.create();
      vec3.copy(bulletPos, this.position);

      const bulletDir = vec3.fromValues(0, 0, -1);
      vec3.transformQuat(
        bulletDir,
        bulletDir,
        getRotationQuaternion(this.rotation)
      );

      const object = await this.object3DFabric.createObject(
        'bullet_' + this.bullets.length,
        'bullet'
      );

      this.bullets.push(new BulletHelper(object, bulletPos, bulletDir));
    }
  }

  public getModelMatrix(): mat4 {
    return this.modelMatrix;
  }

  public async render(viewMatrix: mat4): Promise<void> {
    const weaponViewMatrix = mat4.create();
    mat4.copy(weaponViewMatrix, viewMatrix);
    mat4.multiply(weaponViewMatrix, weaponViewMatrix, this.modelMatrix);

    await this.weaponObject.render(weaponViewMatrix);

    for (const bullet of this.bullets) {
      await bullet.render(viewMatrix);
    }
  }
}
