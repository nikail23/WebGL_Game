import { mat4 } from 'gl-matrix';
import { ShaderProgram } from './core/shader';
import { ShaderLoader } from './core/shaderLoader';
import { Camera } from './core/camera';
import { WeaponHelper } from './core/weapon-helper';
import { HUD } from './core/hud/hud';
import { Crosshair } from './core/hud/crosshair';
import { cube } from './models/cube';
import { floor } from './models/floor';
import { weapon } from './models/weapon';
import { bullet } from './models/bullet';
import { Object3DFabric } from './core/object-fabric';

export class Game {
  private canvas!: HTMLCanvasElement;
  private gl!: WebGLRenderingContext;
  private lastTime!: number;
  private shaderProgram!: ShaderProgram;
  private object3DFabric!: Object3DFabric;
  private weaponHelper!: WeaponHelper;
  private camera!: Camera;
  private hud!: HUD;
  private projectionMatrix!: mat4;
  private modelViewMatrix!: mat4;

  public constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
  }

  private async initGame(): Promise<void> {
    if (this.canvas) {
      this.canvas.addEventListener('click', () => {
        this.canvas.requestPointerLock();
      });

      this.canvas.addEventListener('mousedown', (e) => {
        if (e.button === 0) {
          this.weaponHelper.fire();
        }
      });

      this.lastTime = 0;
      this.projectionMatrix = mat4.create();
      this.modelViewMatrix = mat4.create();

      this.gl = this.canvas.getContext('webgl') as WebGLRenderingContext;
      if (!this.gl) {
        throw new Error('WebGL not supported');
      }

      this.hud = new HUD();
      this.hud.addElement(new Crosshair());

      const { vs, fs } = await ShaderLoader.loadShaders();
      this.shaderProgram = new ShaderProgram(this.gl, vs, fs);

      this.object3DFabric = new Object3DFabric(this.gl, this.shaderProgram);
      this.object3DFabric.createModel(cube, 'cube');
      this.object3DFabric.createModel(floor, 'floor');
      this.object3DFabric.createModel(weapon, 'weapon');
      this.object3DFabric.createModel(bullet, 'bullet');

      const weaponObject = this.object3DFabric.createObject(
        'weapon_1',
        'weapon'
      );
      this.object3DFabric.createObject('cube_1', 'cube');
      this.object3DFabric.createObject('floor_1', 'floor');

      this.weaponHelper = new WeaponHelper(weaponObject, this.object3DFabric);

      this.camera = new Camera();

      this.gl.clearColor(0.0, 0.0, 0.0, 1.0);
      this.gl.enable(this.gl.DEPTH_TEST);
      this.gl.depthFunc(this.gl.LEQUAL);
      this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
    }
  }

  public async start(): Promise<void> {
    await this.initGame();
    requestAnimationFrame(this.gameLoop.bind(this));
  }

  private gameLoop(timestamp: number): void {
    const deltaTime = timestamp - this.lastTime;
    this.lastTime = timestamp;

    this.update(deltaTime);
    this.render();

    requestAnimationFrame(this.gameLoop.bind(this));
  }

  private update(deltaTime: number): void {
    const deltaInSeconds = deltaTime * 0.001;
    this.camera.update(deltaInSeconds);
    this.weaponHelper.update(
      deltaInSeconds,
      this.camera.getPosition(),
      this.camera.getRotation()
    );
    this.hud.update(deltaInSeconds);
  }

  private async render(): Promise<void> {
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

    const fieldOfView = (45 * Math.PI) / 180;
    const aspect = this.canvas.clientWidth / this.canvas.clientHeight;
    mat4.perspective(this.projectionMatrix, fieldOfView, aspect, 0.1, 100.0);
    this.camera.getViewMatrix(this.modelViewMatrix);

    if (this.shaderProgram) {
      this.shaderProgram.use();
      const projectionLocation =
        this.shaderProgram.getUniformLocation('uProjectionMatrix');
      const modelViewLocation =
        this.shaderProgram.getUniformLocation('uModelViewMatrix');

      this.gl.uniformMatrix4fv(
        projectionLocation,
        false,
        this.projectionMatrix
      );
      this.gl.uniformMatrix4fv(modelViewLocation, false, this.modelViewMatrix);

      await this.weaponHelper.render(this.modelViewMatrix);

      const cubeViewMatrix = mat4.create();
      mat4.translate(cubeViewMatrix, cubeViewMatrix, [0, 0, 0]);
      mat4.multiply(cubeViewMatrix, this.modelViewMatrix, cubeViewMatrix);
      await this.object3DFabric.renderObject('cube_1', cubeViewMatrix);

      const floorViewMatrix = mat4.create();
      mat4.translate(floorViewMatrix, floorViewMatrix, [0, -2, 0]);
      mat4.multiply(floorViewMatrix, this.modelViewMatrix, floorViewMatrix);
      await this.object3DFabric.renderObject('floor_1', floorViewMatrix);

      this.hud.draw();
    }
  }
}
