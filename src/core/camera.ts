import { mat4, vec3 } from 'gl-matrix';

export class Camera {
  private position: vec3 = vec3.fromValues(0, 2, 6);
  private rotation: vec3 = vec3.fromValues(0, 0, 0);
  private velocity: vec3 = vec3.create();

  private readonly MOVE_SPEED = 5;
  private readonly SPRINT_MULTIPLIER = 1.5;
  private readonly MOUSE_SENSITIVITY = 0.002;
  private readonly MAX_PITCH = Math.PI / 2 - 0.1;
  private readonly GRAVITY = -9.8;
  private readonly JUMP_FORCE = 5;
  private readonly FLOOR_HEIGHT = 0.0;
  private readonly EYE_HEIGHT = 2.0;

  private isGrounded: boolean = true;
  private isSprinting: boolean = false;
  private moveDirection: vec3 = vec3.create();
  private keys: Set<string> = new Set();

  public constructor() {
    this.setupControls();
  }

  public update(deltaTime: number): void {
    if (!this.isGrounded) {
      this.velocity[1] += this.GRAVITY * deltaTime;
    }

    this.position[1] += this.velocity[1] * deltaTime;

    if (this.position[1] <= this.FLOOR_HEIGHT + this.EYE_HEIGHT) {
      this.position[1] = this.FLOOR_HEIGHT + this.EYE_HEIGHT;
      this.velocity[1] = 0;
      this.isGrounded = true;
    }

    const actualSpeed =
      this.MOVE_SPEED * (this.isSprinting ? this.SPRINT_MULTIPLIER : 1);

    const forward = vec3.fromValues(0, 0, -1);
    const right = vec3.fromValues(1, 0, 0);
    vec3.rotateY(forward, forward, [0, 0, 0], -this.rotation[1]);
    vec3.rotateY(right, right, [0, 0, 0], -this.rotation[1]);

    vec3.zero(this.moveDirection);
    if (this.keys.has('KeyW'))
      vec3.add(this.moveDirection, this.moveDirection, forward);
    if (this.keys.has('KeyS'))
      vec3.subtract(this.moveDirection, this.moveDirection, forward);
    if (this.keys.has('KeyD'))
      vec3.add(this.moveDirection, this.moveDirection, right);
    if (this.keys.has('KeyA'))
      vec3.subtract(this.moveDirection, this.moveDirection, right);

    if (vec3.length(this.moveDirection) > 0) {
      vec3.normalize(this.moveDirection, this.moveDirection);
      vec3.scale(
        this.moveDirection,
        this.moveDirection,
        actualSpeed * deltaTime
      );
      vec3.add(this.position, this.position, this.moveDirection);
    }
  }

  private setupControls(): void {
    document.addEventListener('keydown', (e) => {
      this.keys.add(e.code);
      if (e.code === 'Space' && this.isGrounded) {
        this.velocity[1] = this.JUMP_FORCE;
        this.isGrounded = false;
      }
      if (e.code === 'ShiftLeft') this.isSprinting = true;
    });

    document.addEventListener('keyup', (e) => {
      this.keys.delete(e.code);
      if (e.code === 'ShiftLeft') this.isSprinting = false;
    });

    document.addEventListener('mousemove', (e) => {
      if (document.pointerLockElement) {
        this.rotation[1] += e.movementX * this.MOUSE_SENSITIVITY;
        this.rotation[0] = Math.max(
          -this.MAX_PITCH,
          Math.min(
            this.MAX_PITCH,
            this.rotation[0] + e.movementY * this.MOUSE_SENSITIVITY
          )
        );
      }
    });
  }

  public getViewMatrix(viewMatrix: mat4): void {
    mat4.identity(viewMatrix);
    mat4.rotate(viewMatrix, viewMatrix, this.rotation[0], [1, 0, 0]);
    mat4.rotate(viewMatrix, viewMatrix, this.rotation[1], [0, 1, 0]);
    mat4.translate(
      viewMatrix,
      viewMatrix,
      vec3.negate(vec3.create(), this.position)
    );
  }

  public getPosition(): vec3 {
    return this.position;
  }

  public getRotation(): vec3 {
    return this.rotation;
  }
}
