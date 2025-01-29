import { vec3 } from 'gl-matrix';
import { Object3D } from '../object';
import { UpdateStrategy } from './strategy';

const MOVE_SPEED = 5;
const SPRINT_MULTIPLIER = 1.5;
const MOUSE_SENSITIVITY = 0.002;
const MAX_PITCH = Math.PI / 2 - 0.1;
const GRAVITY = -9.8;
const JUMP_FORCE = 5;
const FLOOR_HEIGHT = 0.0;
const EYE_HEIGHT = 2.0;

export class CameraStrategy extends UpdateStrategy {
  private _keys: Set<string> = new Set();
  private _velocity: vec3 = vec3.create();
  private isGrounded: boolean = true;
  private isSprinting: boolean = false;
  private moveDirection: vec3 = vec3.create();

  public init(current: Object3D): void {
    document.addEventListener('keydown', (e) => {
      this._keys.add(e.code);
      if (e.code === 'Space' && this.isGrounded) {
        this._velocity[1] = JUMP_FORCE;
        this.isGrounded = false;
      }
      if (e.code === 'ShiftLeft') this.isSprinting = true;
    });

    document.addEventListener('keyup', (e) => {
      this._keys.delete(e.code);
      if (e.code === 'ShiftLeft') this.isSprinting = false;
    });

    document.addEventListener('mousemove', (e) => {
      if (document.pointerLockElement) {
        current.rotation[1] += e.movementX * MOUSE_SENSITIVITY;
        current.rotation[0] = Math.max(
          -MAX_PITCH,
          Math.min(
            MAX_PITCH,
            current.rotation[0] + e.movementY * MOUSE_SENSITIVITY
          )
        );
      }
    });
  }

  public update(deltaTime: number, current: Object3D): void {
    if (!this.isGrounded) {
      this._velocity[1] += GRAVITY * deltaTime;
    }

    current.position[1] += this._velocity[1] * deltaTime;

    if (current.position[1] <= FLOOR_HEIGHT + EYE_HEIGHT) {
      current.position[1] = FLOOR_HEIGHT + EYE_HEIGHT;
      this._velocity[1] = 0;
      this.isGrounded = true;
    }

    const actualSpeed = MOVE_SPEED * (this.isSprinting ? SPRINT_MULTIPLIER : 1);

    const forward = vec3.fromValues(0, 0, -1);
    const right = vec3.fromValues(1, 0, 0);
    vec3.rotateY(forward, forward, [0, 0, 0], -current.rotation[1]);
    vec3.rotateY(right, right, [0, 0, 0], -current.rotation[1]);

    vec3.zero(this.moveDirection);
    if (this._keys.has('KeyW'))
      vec3.add(this.moveDirection, this.moveDirection, forward);
    if (this._keys.has('KeyS'))
      vec3.subtract(this.moveDirection, this.moveDirection, forward);
    if (this._keys.has('KeyD'))
      vec3.add(this.moveDirection, this.moveDirection, right);
    if (this._keys.has('KeyA'))
      vec3.subtract(this.moveDirection, this.moveDirection, right);

    if (vec3.length(this.moveDirection) > 0) {
      vec3.normalize(this.moveDirection, this.moveDirection);
      vec3.scale(
        this.moveDirection,
        this.moveDirection,
        actualSpeed * deltaTime
      );
      vec3.add(current.position, current.position, this.moveDirection);
    }
  }
}
