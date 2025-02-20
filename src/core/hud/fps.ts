import { HUDElement } from './hud-element';

export class FpsCounter implements HUDElement {
  private fps: number = 0;
  private accumulator: number = 0;
  private frameCount: number = 0;
  private position = { x: 10, y: 30 };

  public update(deltaTime: number): boolean {
    this.accumulator += deltaTime;
    this.frameCount++;

    if (this.accumulator >= 1) {
      this.fps = this.frameCount;
      this.frameCount = 0;
      this.accumulator -= 1;
    }
    return true;
  }

  public draw(ctx: CanvasRenderingContext2D): void {
    ctx.font = '16px Arial';
    ctx.fillStyle = 'white';
    ctx.fillText(`FPS: ${this.fps}`, this.position.x, this.position.y);
  }
}
