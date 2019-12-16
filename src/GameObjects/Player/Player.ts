import { Math, Geom, GameObjects, Scene, Physics } from 'phaser';
import AssetDatabase from '../../Utils/AssetDatabase';

class Player {
  private _color: number;
  private _position: Math.Vector2;

  private _shape: Geom.Rectangle;
  private _body: Physics.Arcade.Sprite;

  //#region Construction

  constructor(position: Math.Vector2, size: Math.Vector2, color: number, scene: Scene) {
    this._color = color;
    this._position = position;

    this._shape = new Geom.Rectangle();
    this._shape.width = size.x;
    this._shape.height = size.y;
    this._shape.x = position.x - size.x / 2;
    this._shape.y = position.y - size.y / 2;

    this.createPlayerBody(scene);
  }

  private createPlayerBody(scene: Scene) {
    this._body = scene.physics.add.sprite(this._position.x, this._position.y, AssetDatabase.WhitePixelString);
    this._body.setCollideWorldBounds(true);
    this._body.setBounce(0.2);

    this._body.setDisplaySize(this._shape.width, this._shape.height);
    this._body.setTint(0xff0000);
  }

  //#endregion

  //#region Update

  public update(deltaTime: number) {
    const position = this._body.body.center;
    this._shape.x = position.x - this._shape.width / 2;
    this._shape.y = position.y - this._shape.height / 2;
  }

  //#endregion

  //#region External Functions

  public getBody() {
    return this._body;
  }

  //#endregion
}

export default Player;
