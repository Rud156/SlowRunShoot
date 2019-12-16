import { Math, Geom, GameObjects, Scene, Physics } from 'phaser';
import AssetDatabase from '../../Utils/AssetDatabase';

class StaticBlocks {
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

    this.createStaticBody(scene);
  }

  private createStaticBody(scene: Scene) {
    this._body = scene.physics.add.staticSprite(this._position.x, this._position.y, AssetDatabase.WhitePixelString);
    this._body.setSize(this._shape.width, this._shape.height);
    this._body.setDisplaySize(this._shape.width, this._shape.height);
    this._body.setTint(0x00ff00);
  }

  //#endregion

  //#region External Functions

  public getBody() {
    return this._body;
  }

  //#endregion
}

export default StaticBlocks;
