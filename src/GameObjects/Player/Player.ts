import { Math as Maths, Geom, Scene, Physics, Input } from 'phaser';
import AssetDatabase from '../../Utils/AssetDatabase';
import { PlayerController, PlayerDirection } from './PlayerController';
import PlayerCollision from './PlayerCollision';
import PlayerSquisher from './PlayerSquisher';

class Player {
  // Jump and Fall Data
  private JumpVelocity = -200;
  private MaxFallVelocity = 300;
  private FallMultiplier = 21;

  // Movement Data
  private MaxMovementSpeed = 230;
  private MovementSpeedIncrementRate = 400;
  private MovementSpeedDecrementRate = 500;

  private _color: number;
  private _position: Maths.Vector2;

  private _shape: Geom.Rectangle;
  private _body: Physics.Arcade.Sprite;

  private _playerController: PlayerController;
  private _playerCollision: PlayerCollision;
  private _playerSquisher: PlayerSquisher;

  //#region Construction

  constructor(position: Maths.Vector2, size: Maths.Vector2, color: number, scene: Scene) {
    this._color = color;
    this._position = position;

    this._shape = new Geom.Rectangle();
    this._shape.width = size.x;
    this._shape.height = size.y;
    this._shape.x = position.x - size.x / 2;
    this._shape.y = position.y - size.y / 2;

    this.createPlayerBody(scene);
  }

  public setupInput(input: Input.InputPlugin) {
    this._playerController = new PlayerController(input);
  }

  private createPlayerBody(scene: Scene) {
    this._body = scene.physics.add.sprite(this._position.x, this._position.y, AssetDatabase.WhitePixelString);
    this._body.setCollideWorldBounds(true);
    this._body.setBounce(0.3);
    this._body.setMaxVelocity(this.MaxMovementSpeed, this.MaxFallVelocity);
    this._body.setDragX(this.MovementSpeedDecrementRate);

    this._body.setDisplaySize(this._shape.width, this._shape.height);
    this._body.setTint(this._color);

    this._playerCollision = new PlayerCollision();
    this._playerSquisher = new PlayerSquisher();
    this._playerCollision.setPlayerSquisher(this._playerSquisher);
  }

  //#endregion

  //#region Update

  public update(deltaTime: number) {
    const position = this._body.body.center;
    this._shape.x = position.x - this._shape.width / 2;
    this._shape.y = position.y - this._shape.height / 2;

    this._playerController.update();
    const playerDirection = this._playerController.PlayerDirection;
    const jumped = this._playerController.PlayerJumped;

    this._playerSquisher.update(deltaTime);
    const playerScale = this._playerSquisher.PlayerScale;
    this._body.setScale(playerScale.x, playerScale.y);

    if (this._body.body.velocity.y > 0) {
      this._playerSquisher.playerFalling(this._body.body.velocity.y, this.MaxFallVelocity, deltaTime);
    } else if (Math.abs(this._body.body.velocity.x) > 0) {
      this._playerSquisher.playerMoving(Math.abs(this._body.body.velocity.x), this.MaxMovementSpeed, deltaTime);
    }

    switch (playerDirection) {
      case PlayerDirection.None:
        {
          this._body.setAccelerationX(0);
        }
        break;

      case PlayerDirection.Left:
        {
          this._body.setAccelerationX(-this.MovementSpeedIncrementRate);
        }
        break;

      case PlayerDirection.Right:
        {
          this._body.setAccelerationX(this.MovementSpeedIncrementRate);
        }
        break;

      case PlayerDirection.Down:
        break;
    }

    if (jumped) {
      this._body.setVelocityY(this.JumpVelocity);
      this._playerCollision.onPlayerJumped();
    }
  }

  //#endregion

  //#region External Functions

  public onPlayerGrounded() {
    this._playerCollision.onGroundCollision();
  }

  public getBody() {
    return this._body;
  }

  //#endregion

  //#region Utility Functions

  private updateBetterJump() {
    if (this._body.body.velocity.y < 0) {
      this._body.setAccelerationY(this.FallMultiplier);
    }
  }

  //#endregion
}

export default Player;
