import { HUD } from '../hud/hud';
import { Crosshair } from '../hud/crosshair';
import { aspect, canvas, gl } from '../webgl';
import { Scene } from './scene/scene';
import { FpsCounter } from '../hud/fps';
import { vec3 } from 'gl-matrix';
import { SceneObjectEnum } from './scene';

export class Game {
  private lastTime: number;
  private hud: HUD;
  private scene: Scene;

  constructor() {
    this.scene = new Scene();
    this.lastTime = 0;
    this.hud = new HUD();
    this.hud.addElement(new Crosshair());
    this.hud.addElement(new FpsCounter());
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

  private async initScene(): Promise<void> {
    this.scene.init({
      meshes: [
        {
          name: 'cube',
          objUrl: 'assets/models/cube/cube.obj',
          textureUrl: 'assets/models/cube/cube.jpg',
        },
        {
          name: 'floor',
          objUrl: 'assets/models/floor/room_floor.obj',
          textureUrl: 'assets/models/floor/room_floor.jpg',
        },
        {
          name: 'light',
          objUrl: 'assets/models/light/light.obj',
          textureUrl: 'assets/models/light/light.jpg',
        },
      ],
      objects: [
        {
          type: SceneObjectEnum.PHYSICAL_OBJECT,
          position: vec3.fromValues(2, -1, 2),
          rotation: vec3.fromValues(0, 0, 0),
          scale: vec3.fromValues(1, 1, 1),
          textureScale: 1,
          model: 'cube',
        },
        {
          type: SceneObjectEnum.PHYSICAL_OBJECT,
          position: vec3.fromValues(-2, -1, 2),
          rotation: vec3.fromValues(0, 0, 0),
          scale: vec3.fromValues(1, 1, 1),
          textureScale: 1,
          model: 'cube',
        },
        {
          type: SceneObjectEnum.PHYSICAL_OBJECT,
          position: vec3.fromValues(2, -1, -2),
          rotation: vec3.fromValues(0, 0, 0),
          scale: vec3.fromValues(1, 1, 1),
          textureScale: 1,
          model: 'cube',
        },
        {
          type: SceneObjectEnum.PHYSICAL_OBJECT,
          position: vec3.fromValues(-2, -1, -2),
          rotation: vec3.fromValues(0, 0, 0),
          scale: vec3.fromValues(1, 1, 1),
          textureScale: 1,
          model: 'cube',
        },
        {
          type: SceneObjectEnum.PHYSICAL_OBJECT,
          position: vec3.fromValues(0, 1, 0),
          rotation: vec3.fromValues(0, 0, 0),
          scale: vec3.fromValues(0.001, 0.001, 0.001),
          textureScale: 1,
          model: 'light',
        },
        {
          type: SceneObjectEnum.PHYSICAL_OBJECT,
          position: vec3.fromValues(0, -2, 0),
          rotation: vec3.fromValues(0, 0, 0),
          scale: vec3.fromValues(100, 1, 100),
          textureScale: 100,
          model: 'floor',
        },
        {
          type: SceneObjectEnum.LIGHT,
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
        {
          type: SceneObjectEnum.CAMERA,
          position: vec3.fromValues(0, 2, 6),
          rotation: vec3.fromValues(0, 0, 0),
          fov: (45 * Math.PI) / 180,
          aspect,
          near: 0.1,
          far: 100,
        },
      ],
      shadows: {
        enabled: true,
        width: 4096,
        height: 4096,
      },
    });
  }

  private async initGame(): Promise<void> {
    await this.initWebGL();
    this.initListeners();
    await this.initScene();
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
