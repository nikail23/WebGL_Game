import { HUDElement } from './hud-element';

export class MuzzleFlash implements HUDElement {
  private opacity: number = 1.0;
  private readonly FADE_SPEED = 5.0;

  public draw(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = `rgba(255, 200, 0, ${this.opacity})`;
    ctx.beginPath();
    ctx.arc(ctx.canvas.width / 2, ctx.canvas.height / 2, 20, 0, Math.PI * 2);
    ctx.fill();
  }

  public update(deltaTime: number): boolean {
    this.opacity -= this.FADE_SPEED * deltaTime;
    return this.opacity > 0;
  }
}
