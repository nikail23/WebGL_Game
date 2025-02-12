import { vec3, vec4 } from 'gl-matrix';
import { HUD } from '../hud/hud';
import { Crosshair } from '../hud/crosshair';
import { aspect, canvas, gl } from '../webgl';
import { Scene } from './scene/scene';
import { Model3D } from './model';

export class Game {
  private lastTime: number;
  private hud: HUD;
  private scene: Scene;

  constructor() {
    this.scene = new Scene({
      camera: {
        position: vec3.fromValues(0, 2, 6),
        rotation: vec3.fromValues(0, 0, 0),
        fov: (45 * Math.PI) / 180,
        aspect,
        near: 0.1,
        far: 100,
      },
      models: [
        new Model3D(
          'cube',
          'assets/models/cube/cube.obj',
          'assets/models/cube/cube.jpg',
          vec4.fromValues(0.5, 0.5, 0.5, 1)
        ),
        new Model3D(
          'floor',
          'assets/models/floor/room_floor.obj',
          'assets/models/floor/room_floor.jpg',
          vec4.fromValues(0.5, 0.5, 0.5, 1)
        ),
      ],
      objects: [
        {
          position: vec3.fromValues(2, -1, 2),
          rotation: vec3.fromValues(0, 0, 0),
          scale: vec3.fromValues(1, 1, 1),
          model: 'cube',
        },
        {
          position: vec3.fromValues(-2, -1, 2),
          rotation: vec3.fromValues(0, 0, 0),
          scale: vec3.fromValues(1, 1, 1),
          model: 'cube',
        },
        {
          position: vec3.fromValues(2, -1, -2),
          rotation: vec3.fromValues(0, 0, 0),
          scale: vec3.fromValues(1, 1, 1),
          model: 'cube',
        },
        {
          position: vec3.fromValues(-2, -1, -2),
          rotation: vec3.fromValues(0, 0, 0),
          scale: vec3.fromValues(1, 1, 1),
          model: 'cube',
        },
        {
          position: vec3.fromValues(0, -2, 0),
          rotation: vec3.fromValues(0, 0, 0),
          scale: vec3.fromValues(100, 1, 100),
          model: 'floor',
        },
      ],
      light: {
        color: vec3.fromValues(1, 1, 1),
        shininess: 32,
        ambient: 0.2,
        position: vec3.fromValues(0, 2, -5),
        lookAt: vec3.fromValues(0, 0, 0),
        fovy: Math.PI / 1.5,
        aspect: 1,
        near: 0.1,
        far: 100,
      },
      shadows: {
        enabled: true,
        width: 1024,
        height: 1024,
      },
    });

    this.lastTime = 0;

    this.hud = new HUD();
    this.hud.addElement(new Crosshair());
  }

  private async initWebGL(): Promise<void> {
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  }

  private initListeners(): void {
    canvas.addEventListener('click', () => {
      canvas.requestPointerLock();
    });
  }

  private async initGame(): Promise<void> {
    await this.initWebGL();
    this.initListeners();
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
    this.scene.update(deltaInSeconds);
    this.hud.update(deltaInSeconds);
  }

  private async render(): Promise<void> {
    await this.scene.render();

    this.hud.draw();
  }
}
