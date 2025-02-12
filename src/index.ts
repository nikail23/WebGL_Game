import { mainProgram, Game, shadowProgram } from './core';

await mainProgram.init();
await shadowProgram.init();

mainProgram.use();

if (!mainProgram.isReady()) {
  console.warn('GAME: Main program is not ready! Check some locations...');
}

if (!shadowProgram.isReady()) {
  console.warn('GAME: Shadow program is not ready! Check some locations...');
}

const game = new Game();
game.start();
