import { Math as Maths, Physics, Scene } from 'phaser';
import AssetDatabase from '../../Utils/AssetDatabase';

class Projectile {
  private static readonly ProjectileSize = 10;
  private static readonly ProjectileLifetime = 3;
  private static readonly ProjectLaunchSpeed = 500;

  private _color: number;
  private _body: Physics.Arcade.Sprite;
  private _currentLifeTime: number;

  //#region Construction

  constructor(x: number, y: number, color: number, isPlayerProjectile: boolean, scene: Scene) {
    this._color = color;
    this._currentLifeTime = Projectile.ProjectileLifetime;

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
  }

  //#endregion

  //#region External Functions

  public launchProjectile(launchVector: Maths.Vector2) {
    this._body.setVelocity(launchVector.x * Projectile.ProjectLaunchSpeed, launchVector.y * Projectile.ProjectLaunchSpeed);

    const rotation = Math.atan2(launchVector.y, launchVector.x);
    this._body.setRotation(rotation);
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
}

export default Projectile;
