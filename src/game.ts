import { mat4, vec4 } from 'gl-matrix';
import { ShaderProgram } from './core/shader';
import { ShaderLoader } from './core/shaderLoader';
import { Camera } from './core/camera';
import { WeaponHelper } from './core/weapon-helper';
import { HUD } from './core/hud/hud';
import { Crosshair } from './core/hud/crosshair';
import { Object3DFabric } from './core/object-fabric';
import { aspectRatio, canvas, fov, gl } from './gl';

export class Game {
  private lastTime: number;
  private shaderProgram: ShaderProgram;
  private object3DFabric: Object3DFabric;
  private weaponHelper: WeaponHelper;
  private camera: Camera;
  private hud: HUD;
  private projectionMatrix: mat4;
  private modelViewMatrix: mat4;

  private async initWebGL(): Promise<void> {
    const { vs, fs } = await ShaderLoader.loadShaders();
    this.shaderProgram = new ShaderProgram(vs, fs);
    this.shaderProgram.use();

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  }

  private async initModels(): Promise<void> {
    this.object3DFabric = new Object3DFabric(gl, this.shaderProgram);
    await this.object3DFabric.createModel(
      'assets/models/cube/cube.obj',
      vec4.create(),
      'cube'
    );
    await this.object3DFabric.createModel(
      'assets/models/floor/room_floor.obj',
      vec4.create(),
      'floor'
    );
  }

  private initScene(): void {
    this.object3DFabric.createObject('cube_1', 'cube');
    this.object3DFabric.createObject('floor_1', 'floor');

    this.projectionMatrix = mat4.create();
    this.modelViewMatrix = mat4.create();

    this.camera = new Camera();

    this.lastTime = 0;
  }

  private initListeners(): void {
    canvas.addEventListener('click', () => {
      canvas.requestPointerLock();
    });

    // this.canvas.addEventListener('mousedown', (e) => {
    //   if (e.button === 0) {
    //     this.weaponHelper.fire();
    //   }
    // });
  }

  private initHUD(): void {
    this.hud = new HUD();
    this.hud.addElement(new Crosshair());
  }

  private async initGame(): Promise<void> {
    await this.initWebGL();
    await this.initModels();
    this.initScene();
    this.initHUD();
    this.initListeners();

    // this.weaponHelper = new WeaponHelper(weaponObject, this.object3DFabric);
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
    // this.weaponHelper.update(
    //   deltaInSeconds,
    //   this.camera.getPosition(),
    //   this.camera.getRotation()
    // );
    this.hud.update(deltaInSeconds);
  }

  private async render(): Promise<void> {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    mat4.perspective(this.projectionMatrix, fov, aspectRatio, 0.1, 100.0);

    this.camera.getViewMatrix(this.modelViewMatrix);

    if (this.shaderProgram) {
      const projectionLocation =
        this.shaderProgram.getUniformLocation('uProjectionMatrix');
      const modelViewLocation =
        this.shaderProgram.getUniformLocation('uModelViewMatrix');

      gl.uniformMatrix4fv(projectionLocation, false, this.projectionMatrix);
      gl.uniformMatrix4fv(modelViewLocation, false, this.modelViewMatrix);

      // await this.weaponHelper.render(this.modelViewMatrix);

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
