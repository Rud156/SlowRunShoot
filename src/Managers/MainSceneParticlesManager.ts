import { GameObjects, Scene } from 'phaser';
import AssetDatabase from '../Utils/AssetDatabase';

export class MainSceneParticlesManager {
  private static readonly ParticleStopDestroyTime = 1;

  private _particleEffects: Array<IParticleEffectData>;
  private _scene: Scene;

  //#region Construction

  constructor(scene: Scene) {
    this._scene = scene;
    this._particleEffects = [];
  }

  //#endregion

  //#region Update

  public update(deltaTime: number) {
    for (let i = this._particleEffects.length - 1; i >= 0; i--) {
      const effect = this._particleEffects[i];

      if (effect.isDead) {
        effect.deadLifeTimeLeft -= deltaTime;

        if (effect.deadLifeTimeLeft <= 0) {
          effect.particleManager.destroy();
          this._particleEffects.splice(i, 1);
        }
      } else {
        effect.lifeTime -= deltaTime;

        if (effect.lifeTime <= 0) {
          effect.isDead = true;

          const length = effect.particleManager.emitters.getAll().length;
          for (let j = 0; j < length; j++) {
            effect.particleManager.emitters.getAt(j).stop();
          }
        }
      }
    }
  }

  //#endregion

  //#region External Functions

  public playEffectAtPosition(effectType: ParticleType, lifeTime: number, xPosition: number, yPosition: number) {
    const particle = this.getParticle(effectType);
    const length = particle.emitters.getAll().length;
    for (let i = 0; i < length; i++) {
      particle.emitters.getAt(i).setPosition(xPosition, yPosition);
    }

    const effect: IParticleEffectData = {
      isDead: false,
      deadLifeTimeLeft: MainSceneParticlesManager.ParticleStopDestroyTime,
      lifeTime,
      xPosition,
      yPosition,
      particleManager: particle,
    };

    this._particleEffects.push(effect);
  }

  //#endregion

  //#region Utility Functions

  private getParticle(effectType: ParticleType) {
    switch (effectType) {
      case ParticleType.BulletTrail:
        return this._scene.add.particles(
          AssetDatabase.ShapesString,
          new Function(`return ${this._scene.cache.text.get(AssetDatabase.BulletTrailString)}`)()
        );

      case ParticleType.Dash:
        return this._scene.add.particles(
          AssetDatabase.ShapesString,
          new Function(`return ${this._scene.cache.text.get(AssetDatabase.DashString)}`)()
        );

      case ParticleType.LandDust:
        return this._scene.add.particles(
          AssetDatabase.ShapesString,
          new Function(`return ${this._scene.cache.text.get(AssetDatabase.LandDustString)}`)()
        );

      case ParticleType.StarSpiral:
        return this._scene.add.particles(
          AssetDatabase.ShapesString,
          new Function(`return ${this._scene.cache.text.get(AssetDatabase.StarSpiralString)}`)()
        );
    }
  }

  //#endregion
}

export enum ParticleType {
  LandDust,
  Dash,
  StarSpiral,
  BulletTrail,
}

interface IParticleEffectData {
  lifeTime: number;

  isDead: boolean;
  deadLifeTimeLeft: number;

  xPosition: number;
  yPosition: number;

  particleManager: GameObjects.Particles.ParticleEmitterManager;
}
