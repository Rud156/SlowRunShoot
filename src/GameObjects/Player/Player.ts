import { Math as Maths, Scene, Physics, Input } from 'phaser';
import AssetDatabase from '../../Utils/AssetDatabase';
import { PlayerController } from './PlayerController';
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
  private static readonly UnControlledVelocity = 10000;
  private static readonly MaxMovementSpeed = 350;
  private static readonly MovementSpeedIncrementRate = 400;
  private static readonly MovementSpeedDecrementRate = 500;
  private static readonly PlayerRecoilVelocity = 300;
  private static readonly PlayerRecoilControlTime = 0.3;
  private static readonly PlayerTimeBetweenShot = 0.3;
  private static readonly PlayerDashVelocity = 500;
  private static readonly PlayerDashControlTime = 0.3;
  private static readonly PlayerDashEffectTime = 0.03;

  // Projectiles
  private _projectiles: Array<Projectile>;

  private _scene: Scene;

  private _color: number;
  private _body: Physics.Arcade.Sprite;

  private _playerController: PlayerController;
  private _playerCollision: PlayerCollision;
  private _playerSquisher: PlayerSquisher;

  private _playerCriticalMovementState: PlayerCriticalMovementState;
  private _playerUnControlTime: number;

  private _lastShotTime: number;
  private _playerDashEffectTime: number;

  //#region Construction

  constructor(position: Maths.Vector2, size: Maths.Vector2, color: number, scene: Scene) {
    this._color = color;
    this._scene = scene;

    this._projectiles = [];
    this._playerUnControlTime = 0;
    this._playerCriticalMovementState = PlayerCriticalMovementState.None;
    this._lastShotTime = 0;
    this._playerDashEffectTime = 0;

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

    this._playerCollision = new PlayerCollision(this, scene);
    this._playerSquisher = new PlayerSquisher();
    this._playerCollision.setPlayerSquisher(this._playerSquisher);
  }

  //#endregion

  //#region Update

  public update(deltaTime: number) {
    this._playerController.update();

    this._playerSquisher.update(deltaTime);
    const playerScale = this._playerSquisher.PlayerScale;
    this._body.setScale(playerScale.x, playerScale.y);

    if (this._body.body.velocity.y > 0) {
      this._playerSquisher.playerFalling(this._body.body.velocity.y, Player.MaxFallVelocity, deltaTime);
    } else if (Math.abs(this._body.body.velocity.x) > 0) {
      this._playerSquisher.playerMoving(Math.abs(this._body.body.velocity.x), Player.MaxMovementSpeed, deltaTime);
    }

    const jumped = this._playerController.PlayerJumped;
    if (jumped) {
      this._body.setVelocityY(Player.JumpVelocity);
      this._playerCollision.onPlayerJumped();
    }

    const bottomPosition = this._body.getBottomCenter();
    this._playerCollision.setColliderPosition(bottomPosition.x, bottomPosition.y);
    const centerPosition = this._body.getCenter();
    this._playerCollision.setSelfColliderPosition(centerPosition.x, centerPosition.y);

    this.checkAndActivatePlayerDash();
    this.updatePlayerShooting(deltaTime);
    this.updateDashEffect(deltaTime);

    this.updatePlayerUnControlTime(deltaTime);

    this.updatePlayerMovement(deltaTime);
    this.updateBetterJump();

    this.updateProjectiles(deltaTime);
  }

  //#endregion

  //#region External Functions

  public playLandEffect() {
    const mainScene = this._scene as MainScene;

    const position = this._body.getBottomCenter();
    mainScene.playParticleEffect(ParticleType.LandDust, 0.1, position.x, position.y);
  }

  public shoot(pointer: Maths.Vector2) {
    if (this._lastShotTime > 0) {
      return;
    }

    const position = this._body.getCenter();
    const pointerVector = new Maths.Vector2(pointer.x, pointer.y);
    const directionVector = pointerVector.subtract(new Maths.Vector2(position.x, position.y));
    directionVector.normalize();

    const projectile = new Projectile(position.x, position.y, 0xf0f0f0, true, this._scene);
    projectile.launchProjectile(directionVector);

    this._projectiles.push(projectile);
    this._lastShotTime = Player.PlayerTimeBetweenShot;

    this._playerCriticalMovementState = PlayerCriticalMovementState.Shoot;

    const launchAngle = Math.atan2(directionVector.y, directionVector.x);
    const xVelocity = -Math.cos(launchAngle) * Player.PlayerRecoilVelocity;
    const yVelocity = -Math.sin(launchAngle) * Player.PlayerRecoilVelocity;
    this._body.setVelocity(xVelocity, yVelocity);

    this._playerUnControlTime = Player.PlayerRecoilControlTime;
    this._body.setMaxVelocity(Player.UnControlledVelocity, Player.UnControlledVelocity);
    this._playerSquisher.playerForceSquish(Math.cos(launchAngle), Math.sin(launchAngle));
    this._scene.cameras.main.shake(100, 0.01);
  }

  public onGroundCollision() {
    this._playerCollision.onGroundCollision();
  }

  public onSelfCollision() {
    this._playerCollision.onPlayerSelfCollisionUpdate();
  }

  public getCollisionCollider() {
    return this._playerCollision.getCollider();
  }

  public getSelfCollisionCollider() {
    return this._playerCollision.getSelfCollider();
  }

  public getBody() {
    return this._body;
  }

  //#endregion

  //#region Utility Functions

  private updatePlayerUnControlTime(deltaTime: number) {
    if (this._playerUnControlTime > 0) {
      this._playerUnControlTime -= deltaTime;

      if (this._playerUnControlTime <= 0) {
        if (this._playerCriticalMovementState !== PlayerCriticalMovementState.None) {
          this._playerSquisher.playerForceSquishComplete();
        }

        this._body.setMaxVelocity(Player.MaxMovementSpeed, Player.MaxFallVelocity);
        this._playerCriticalMovementState = PlayerCriticalMovementState.None;
      }
    }
  }

  private updatePlayerMovement(deltaTime: number) {
    if (this._playerCriticalMovementState !== PlayerCriticalMovementState.None) {
      return;
    }

    const playerDirection = this._playerController.PlayerDirection;

    switch (playerDirection.xValue) {
      case 0:
        this._body.setAccelerationX(0);
        break;

      case -1:
        this._body.setAccelerationX(-Player.MovementSpeedIncrementRate);
        break;

      case 1:
        this._body.setAccelerationX(Player.MovementSpeedIncrementRate);
        break;
    }
  }

  private updatePlayerShooting(deltaTime: number) {
    if (this._lastShotTime > 0) {
      this._lastShotTime -= deltaTime;
    }
  }

  private checkAndActivatePlayerDash() {
    if (
      this._playerCriticalMovementState !== PlayerCriticalMovementState.None ||
      !this._playerController.PlayerDashed
    ) {
      return;
    }

    const playerDirection = this._playerController.PlayerDirection;
    const xVelocity = playerDirection.xValue * Player.PlayerDashVelocity;
    const yVelocity = playerDirection.yValue * Player.PlayerDashVelocity;
    this._body.setMaxVelocity(Player.UnControlledVelocity, Player.UnControlledVelocity);
    this._body.setVelocity(xVelocity, yVelocity);

    this._playerUnControlTime = Player.PlayerDashControlTime;
    this._playerCriticalMovementState = PlayerCriticalMovementState.Dash;
    this._scene.cameras.main.shake(100, 0.01);

    const mainScene = this._scene as MainScene;
    const position = this._body.getCenter();
    mainScene.playParticleEffect(ParticleType.StarSpiral, 0.3, position.x, position.y);
  }

  private updateDashEffect(deltaTime: number) {
    if (this._playerCriticalMovementState === PlayerCriticalMovementState.Dash) {
      this._playerDashEffectTime -= deltaTime;

      if (this._playerDashEffectTime <= 0) {
        this._playerDashEffectTime = Player.PlayerDashEffectTime;

        const mainScene = this._scene as MainScene;
        const position = this._body.getCenter();
        mainScene.playParticleEffect(ParticleType.Dash, 0.1, position.x, position.y);
      }
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

enum PlayerCriticalMovementState {
  Dash,
  Shoot,
  None,
}

export default Player;
