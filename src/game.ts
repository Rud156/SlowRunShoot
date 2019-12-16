import 'phaser';
import { Types } from 'phaser';
import MainScene from './scenes/MainScene';
import GameConstants from './Utils/GameConstants';

// main game configuration
const config: Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: GameConstants.Width,
  height: GameConstants.Height,
  parent: 'game',
  scene: [MainScene],
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 300 },
      debug: true,
      debugStaticBodyColor: 0xff0000,
    },
  },
  input: {
    gamepad: true,
  },
};

// Game Class
export class Game extends Phaser.Game {
  constructor(config: Types.Core.GameConfig) {
    super(config);
  }
}

// when the page is loaded, create our game instance
window.addEventListener('load', () => {
  const game = new Game(config);
});
