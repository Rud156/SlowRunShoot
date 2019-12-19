import { Scene, Math as Maths, GameObjects } from 'phaser';

import GameConstants from '../Utils/GameConstants';
import Player from '../GameObjects/Player/Player';
import StaticBlock from '../GameObjects/World/StaticBlock';
import AssetDatabase from '../Utils/AssetDatabase';
import { MainSceneParticlesManager, ParticleType } from '../Managers/MainSceneParticlesManager';

class MainScene extends Scene {
  private static _instance: MainScene;

  private _player: Player;
  private _ground: StaticBlock;
  private _cursor: GameObjects.Sprite;

  private _particleManager: MainSceneParticlesManager;

  //#region Construction

  constructor() {
    super({ key: GameConstants.MainSceneName });
    MainScene._instance = this;
  }

  preload() {
    // Load Particles
    this.load.atlas(AssetDatabase.ShapesString, AssetDatabase.ShapesPng, AssetDatabase.ShapesJson);
    this.load.text(AssetDatabase.DashString, AssetDatabase.Dash);
    this.load.text(AssetDatabase.LandDustString, AssetDatabase.LandDust);
    this.load.text(AssetDatabase.StarSpiralString, AssetDatabase.StarSpiral);
    this.load.text(AssetDatabase.BulletTrailString, AssetDatabase.BulletTrail);

    // Load Images
    this.load.image(AssetDatabase.WhitePixelString, AssetDatabase.WhitePixel);
    this.load.image(AssetDatabase.BlueCursorString, AssetDatabase.BlueCursor);
  }

  create() {
    this.createPlayer();
    this.createGround();

    this.setupColliders();
    this.setupOtherSceneItems();
  }

  private createPlayer() {
    this._player = new Player(new Maths.Vector2(400, 300), new Maths.Vector2(50, 50), 0xff0000, this);
    this._player.setupInput(this.input);
  }

  private createGround() {
    const groundHeight = 20;
    this._ground = new StaticBlock(
      new Maths.Vector2(GameConstants.Width / 2, GameConstants.Height - groundHeight / 2),
      new Maths.Vector2(GameConstants.Width, groundHeight),
      0x00ff00,
      this
    );
  }

  private setupColliders() {
    this.physics.add.collider(this._player.getBody(), this._ground.getBody(), () => {
      this._player.onPlayerGrounded();
    });
  }

  private setupOtherSceneItems() {
    this.cameras.main.setBounds(0, 0, GameConstants.Width, GameConstants.Height);

    this._cursor = this.add.sprite(0, 0, AssetDatabase.BlueCursorString);
    this._particleManager = new MainSceneParticlesManager(this);

    this.input.on('pointermove', pointer => {
      this.updateCursorPosition(pointer);
    });
    this.input.on('pointerup', pointer => {
      this.handleMouseClick(pointer);
    });
  }

  //#endregion

  //#region Update

  update(time: number, delta: number) {
    const deltaTime = delta / 1000.0;

    this._particleManager.update(deltaTime);
    this._player.update(deltaTime);
  }

  //#endregion

  //#region External Functions

  public playParticleEffect(effectType: ParticleType, lifeTime: number, xPosition: number, yPosition: number) {
    // Only for special effects
    switch (effectType) {
      case ParticleType.BulletTrail:
        break;

      case ParticleType.Dash:
        break;

      case ParticleType.LandDust:
        {
          this.cameras.main.flash();
          this.cameras.main.shake(200, 0.01);
        }
        break;

      case ParticleType.StarSpiral:
        break;
    }

    this._particleManager.playEffectAtPosition(effectType, lifeTime, xPosition, yPosition);
  }

  //#endregion

  //#region Utility Functions

  private updateCursorPosition(pointer: Maths.Vector2) {
    this._cursor.setPosition(pointer.x, pointer.y);
  }

  private handleMouseClick(pointer: Maths.Vector2) {
    this._player.shoot(pointer);
  }

  //#endregion

  //#region Instance

  public static get Instance() {
    return MainScene._instance;
  }

  //#endregion
}

export default MainScene;
