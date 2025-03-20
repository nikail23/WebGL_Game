import { mainProgram, Game, shadowProgram, lensFlareProgram } from './core';

if (import.meta.hot) {
  import.meta.hot.accept();
}

await mainProgram.init();
await shadowProgram.init();
await lensFlareProgram.init();

mainProgram.use();

const game = new Game();
game.start();
