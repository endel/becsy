import type {ComponentType} from './component';

class ComponentStats {
  _numEntities = 0;
  maxEntities = 0;
  capacity = 0;

  get numEntities(): number {
    return this._numEntities;
  }

  set numEntities(value: number) {
    this._numEntities = value;
    if (value > this.maxEntities) this.maxEntities = value;
  }

  toString(): string {
    /* eslint-disable max-len */
    return `${this.numEntities.toLocaleString()} of ${this.maxEntities.toLocaleString()} peak (capacity ${this.capacity.toLocaleString()})`;
    /* eslint-enable max-len */
  }
}

export class Stats {
  frames = 0;
  _numEntities = 0;
  maxEntities = 0;
  _maxLimboEntities = 0;
  _maxLimboComponents = 0;
  _maxRefChangesPerFrame = 0;
  _maxShapeChangesPerFrame = 0;
  _maxWritesPerFrame = 0;
  components: {[typeName: string]: ComponentStats} = Object.create(null);

  get numEntities(): number {
    return this._numEntities;
  }

  set numEntities(value: number) {
    this._numEntities = value;
    if (value > this.maxEntities) this.maxEntities = value;
  }

  get maxLimboEntities(): number {
    return this._maxLimboEntities;
  }

  set maxLimboEntities(value: number) {
    if (value > this._maxLimboEntities) this._maxLimboEntities = value;
  }

  get maxLimboComponents(): number {
    return this._maxLimboComponents;
  }

  set maxLimboComponents(value: number) {
    if (value > this._maxLimboComponents) this._maxLimboComponents = value;
  }

  get maxRefChangesPerFrame(): number {
    return this._maxRefChangesPerFrame;
  }

  set maxRefChangesPerFrame(value: number) {
    if (value > this._maxRefChangesPerFrame) this._maxRefChangesPerFrame = value;
  }

  get maxShapeChangesPerFrame(): number {
    return this._maxShapeChangesPerFrame;
  }

  set maxShapeChangesPerFrame(value: number) {
    if (value > this._maxShapeChangesPerFrame) this._maxShapeChangesPerFrame = value;
  }

  get maxWritesPerFrame(): number {
    return this._maxWritesPerFrame;
  }

  set maxWritesPerFrame(value: number) {
    if (value > this._maxWritesPerFrame) this._maxWritesPerFrame = value;
  }

  for(type: ComponentType<any>): ComponentStats {
    return this.components[type.name] = this.components[type.name] ?? new ComponentStats();
  }

  toString(): string {
    /* eslint-disable max-len */
    return `World stats:
  frames: ${this.frames.toLocaleString()}
  entities: ${this.numEntities.toLocaleString()} of ${this.maxEntities.toLocaleString()} max (${this.maxLimboEntities.toLocaleString()} limbo max)
  refs: ${this.maxRefChangesPerFrame.toLocaleString()} ref changes/frame max
  logs: ${this.maxShapeChangesPerFrame.toLocaleString()} shape changes/frame max, ${this.maxWritesPerFrame.toLocaleString()} writes/frame max`;
    /* eslint-enable max-len */
  }
}
