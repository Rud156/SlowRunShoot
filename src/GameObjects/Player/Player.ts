import { Math as Maths, Geom, Scene, Physics, Input } from 'phaser';
import AssetDatabase from '../../Utils/AssetDatabase';
import { PlayerController, PlayerDirection } from './PlayerController';
import PlayerCollision from './PlayerCollision';
import PlayerSquisher from './PlayerSquisher';
import Projectile from '../Projectiles/Projectile';
import MainScene from '../../scenes/MainScene';
import { ParticleType } from '../../Managers/MainSceneParticlesManager';

class Player {
  // Jump and Fall Data
  private static readonly JumpVelocity = -200;
  private static readonly MaxFallVelocity = 300;
  private static readonly FallMultiplier = 21;

  // Movement Data
  private static readonly MaxMovementSpeed = 230;
  private static readonly MovementSpeedIncrementRate = 400;
  private static readonly MovementSpeedDecrementRate = 500;
  private static readonly PlayerRecoilForce = 1000;
  private static readonly PlayerRecoilControlTime = 0.3;

  // Projectiles
  private _projectiles: Array<Projectile>;

  private _scene: Scene;

  private _color: number;
  private _body: Physics.Arcade.Sprite;

  private _playerController: PlayerController;
  private _playerCollision: PlayerCollision;
  private _playerSquisher: PlayerSquisher;

  private _playerRecoilTime: number;

  //#region Construction

  constructor(position: Maths.Vector2, size: Maths.Vector2, color: number, scene: Scene) {
    this._color = color;
    this._scene = scene;

    this._projectiles = [];
    this._playerRecoilTime = 0;

    this.createPlayerBody(scene, position, size);
  }

  public setupInput(input: Input.InputPlugin) {
    this._playerController = new PlayerController(input);
  }

  private createPlayerBody(scene: Scene, position: Maths.Vector2, size: Maths.Vector2) {
    this._body = scene.physics.add.sprite(position.x, position.y, AssetDatabase.WhitePixelString);
    this._body.setCollideWorldBounds(true);
    this._body.setBounce(0.3);
    this._body.setMaxVelocity(Player.MaxMovementSpeed, Player.MaxFallVelocity);
    this._body.setDragX(Player.MovementSpeedDecrementRate);

    this._body.setDisplaySize(size.x, size.y);
    this._body.setTint(this._color);

    this._playerCollision = new PlayerCollision(this);
    this._playerSquisher = new PlayerSquisher();
    this._playerCollision.setPlayerSquisher(this._playerSquisher);
  }

  //#endregion

  //#region Update

  public update(deltaTime: number) {
    this._playerController.update();
    const jumped = this._playerController.PlayerJumped;

    this._playerSquisher.update(deltaTime);
    const playerScale = this._playerSquisher.PlayerScale;
    this._body.setScale(playerScale.x, playerScale.y);

    if (this._body.body.velocity.y > 0) {
      this._playerSquisher.playerFalling(this._body.body.velocity.y, Player.MaxFallVelocity, deltaTime);
    } else if (Math.abs(this._body.body.velocity.x) > 0) {
      this._playerSquisher.playerMoving(Math.abs(this._body.body.velocity.x), Player.MaxMovementSpeed, deltaTime);
    }

    if (jumped) {
      this._body.setVelocityY(Player.JumpVelocity);
      this._playerCollision.onPlayerJumped();
    }

    this.updatePlayerMovement(deltaTime);
    this.updateBetterJump();
    this.updateProjectiles(deltaTime);
  }

  //#endregion

  //#region External Functions

  public playLandEffect() {
    const mainScene = this._scene as MainScene;

    const position = this._body.body.position;
    const xPosition = position.x + this._body.displayWidth / 2;
    const yPosition = position.y + this._body.displayHeight;

    mainScene.playParticleEffect(ParticleType.LandDust, 0.1, xPosition, yPosition);
  }

  public onPlayerGrounded() {
    this._playerCollision.onGroundCollision();
  }

  public shoot(pointer: Maths.Vector2) {
    const position = this._body.body.position;
    const xPosition = position.x + this._body.displayWidth / 2;
    const yPosition = position.y + this._body.displayHeight / 2;

    const pointerVector = new Maths.Vector2(pointer.x, pointer.y);
    const directionVector = pointerVector.subtract(new Maths.Vector2(xPosition, yPosition));
    directionVector.normalize();

    const projectile = new Projectile(xPosition, yPosition, 0xf0f0f0, true, this._scene);
    projectile.launchProjectile(directionVector);

    this._projectiles.push(projectile);

    const launchAngle = Math.atan2(directionVector.y, directionVector.x);
    const xForce = -Math.cos(launchAngle) * Player.PlayerRecoilForce;
    const yForce = -Math.sin(launchAngle) * Player.PlayerRecoilForce;
    this._body.setVelocity(xForce, yForce);

    this._playerRecoilTime = Player.PlayerRecoilControlTime;
    this._playerSquisher.playerShotStarted(launchAngle);
    this._scene.cameras.main.shake(100, 0.01);
  }

  public getBody() {
    return this._body;
  }

  //#endregion

  //#region Utility Functions

  private updatePlayerMovement(deltaTime: number) {
    if (this._playerRecoilTime > 0) {
      this._playerRecoilTime -= deltaTime;

      if (this._playerRecoilTime <= 0) {
        this._playerSquisher.playerShotCompleted();
      }
      return;
    }

    const playerDirection = this._playerController.PlayerDirection;

    switch (playerDirection) {
      case PlayerDirection.None:
        {
          this._body.setAccelerationX(0);
        }
        break;

      case PlayerDirection.Left:
        {
          this._body.setAccelerationX(-Player.MovementSpeedIncrementRate);
        }
        break;

      case PlayerDirection.Right:
        {
          this._body.setAccelerationX(Player.MovementSpeedIncrementRate);
        }
        break;

      case PlayerDirection.Down:
        break;
    }
  }

  private updateBetterJump() {
    if (this._body.body.velocity.y < 0) {
      this._body.setAccelerationY(Player.FallMultiplier);
    }
  }

  private updateProjectiles(deltaTime: number) {
    this._projectiles.forEach(projectile => {
      projectile.update(deltaTime);
    });

    for (let i = this._projectiles.length - 1; i >= 0; i--) {
      if (this._projectiles[i].CurrentLifetime <= 0) {
        this._projectiles[i].destroy();
        this._projectiles.splice(i, 1);
      }
    }
  }

  //#endregion
}

export default Player;
