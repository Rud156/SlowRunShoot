import { Math as Maths, Physics, Scene } from 'phaser';
import AssetDatabase from '../../Utils/AssetDatabase';
import MainScene from '../../scenes/MainScene';
import { ParticleType } from '../../Managers/MainSceneParticlesManager';

class Projectile {
  private static readonly ProjectileSize = 10;
  private static readonly ProjectileLifetime = 3;
  private static readonly ProjectLaunchSpeed = 500;
  private static readonly ProjectileTrailTime = 0.1;

  private _color: number;
  private _body: Physics.Arcade.Sprite;
  private _currentLifeTime: number;
  private _currentTrailLifeTime: number;

  private _rotation: number;

  private _scene: Scene;

  //#region Construction

  constructor(x: number, y: number, color: number, isPlayerProjectile: boolean, scene: Scene) {
    this._color = color;
    this._currentLifeTime = Projectile.ProjectileLifetime;
    this._scene = scene;

    this.createProjectile(scene, x, y, isPlayerProjectile);
  }

  private createProjectile(scene: Scene, x: number, y: number, isPlayerProjectile: boolean) {
    this._body = scene.physics.add.sprite(x, y, AssetDatabase.WhitePixelString);
    this._body.setBounce(0);

    // @ts-ignore
    this._body.body.setAllowGravity(false);

    this._body.setDisplaySize(Projectile.ProjectileSize, Projectile.ProjectileSize);
    this._body.setTint(this._color);
    this._body.setData({
      isPlayerProjectile,
    });
  }

  //#endregion

  //#region Update

  public update(deltaTime: number) {
    this._currentLifeTime -= deltaTime;

    this.updateBulletTrail(deltaTime);
  }

  //#endregion

  //#region External Functions

  public launchProjectile(launchVector: Maths.Vector2) {
    this._body.setVelocity(
      launchVector.x * Projectile.ProjectLaunchSpeed,
      launchVector.y * Projectile.ProjectLaunchSpeed
    );

    this._rotation = Math.atan2(launchVector.y, launchVector.x);
    this._body.setRotation(this._rotation);

    this._currentTrailLifeTime = 0;
  }

  public get IsPlayerProjectile() {
    return this._body.getData('isPlayerProjectile');
  }

  public get CurrentLifetime() {
    return this._currentLifeTime;
  }

  public destroy() {
    this._body.destroy();
  }

  //#endregion

  //#region Utility Functions

  private updateBulletTrail(deltaTime: number) {
    this._currentTrailLifeTime -= deltaTime;

    if (this._currentTrailLifeTime <= 0) {
      const mainScene = this._scene as MainScene;

      const position = this._body.getCenter();
      const xPosition = position.x;
      const yPosition = position.y;

      mainScene.playParticleEffect(ParticleType.BulletTrail, 0.1, xPosition, yPosition);

      this._currentTrailLifeTime = Projectile.ProjectileTrailTime;
    }
  }

  //#endregion
}

export default Projectile;
