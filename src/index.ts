import { Game } from './game';

const canvas = document.querySelector<HTMLCanvasElement>('#game');
if (canvas) {
  const game = new Game(canvas);
  game.start();
}
