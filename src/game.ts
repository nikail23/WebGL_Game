import { mat4 } from "gl-matrix";
import { ShaderProgram } from "./core/shader";
import { Cube } from "./models/cube";
import { BufferManager } from "./core/bufferManager";
import { ShaderLoader } from "./core/shaderLoader";

export class Game {
  private canvas!: HTMLCanvasElement;
  private gl!: WebGLRenderingContext;
  private lastTime!: number;
  private shaderProgram!: ShaderProgram;
  private bufferManager!: BufferManager;
  private cube = new Cube();
  private projectionMatrix!: mat4;
  private modelViewMatrix!: mat4;

  constructor(canvas: HTMLCanvasElement) {
    this.initGame(canvas);
  }

  private async initGame(canvas: HTMLCanvasElement): Promise<void> {
    this.canvas = canvas;
    this.lastTime = 0;
    this.projectionMatrix = mat4.create();
    this.modelViewMatrix = mat4.create();

    this.gl = canvas.getContext("webgl") as WebGLRenderingContext;
    if (!this.gl) {
      throw new Error("WebGL not supported");
    }
    const { vs, fs } = await ShaderLoader.loadShaders();
    this.shaderProgram = new ShaderProgram(this.gl, vs, fs);
    this.initWebGL();
    this.bufferManager = new BufferManager(this.gl);
    this.bufferManager.initBuffers(
      this.cube.positions,
      this.cube.colors,
      this.cube.indices
    );
  }

  private initWebGL() {
    this.gl.clearColor(0.0, 0.0, 0.0, 1.0);
    this.gl.enable(this.gl.DEPTH_TEST);
    this.gl.depthFunc(this.gl.LEQUAL);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
  }

  start() {
    requestAnimationFrame(this.gameLoop.bind(this));
  }

  private gameLoop(timestamp: number) {
    const deltaTime = timestamp - this.lastTime;
    this.lastTime = timestamp;

    this.update(deltaTime);
    this.render();

    requestAnimationFrame(this.gameLoop.bind(this));
  }

  private update(deltaTime: number) {
    // Будет обновлять состояние игры
  }

  private render() {
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

    const fieldOfView = (45 * Math.PI) / 180;
    const aspect = this.canvas.clientWidth / this.canvas.clientHeight;
    mat4.perspective(this.projectionMatrix, fieldOfView, aspect, 0.1, 100.0);

    mat4.identity(this.modelViewMatrix);
    mat4.translate(
      this.modelViewMatrix,
      this.modelViewMatrix,
      [0.0, 0.0, -6.0]
    );

    if (this.shaderProgram) {
      this.shaderProgram.use();

      const projectionLocation =
        this.shaderProgram.getUniformLocation("uProjectionMatrix");
      const modelViewLocation =
        this.shaderProgram.getUniformLocation("uModelViewMatrix");

      this.gl.uniformMatrix4fv(
        projectionLocation,
        false,
        this.projectionMatrix
      );
      this.gl.uniformMatrix4fv(modelViewLocation, false, this.modelViewMatrix);

      this.bufferManager.bindBuffers(this.shaderProgram);

      this.gl.drawElements(this.gl.TRIANGLES, 36, this.gl.UNSIGNED_SHORT, 0);
    }
  }
}
