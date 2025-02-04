import {component, ComponentType, field, Query, System, SystemType, Type, World} from '../src';


@component class A {
  @field(Type.uint8) declare value: number;
}

@component class B {
  @field(Type.uint8) declare value: number;
}


class IncrementAddedA extends System {
  entities = this.query(q => q.added.with(A).write);
  execute() {
    for (const entity of this.entities.added) entity.write(A).value += 1;
  }
}

class IncrementBWithRemovedA extends System {
  entities = this.query(q => q.removed.with(A).read.and.with(B).write);
  execute() {
    for (const entity of this.entities.removed) entity.write(B).value += 1;
  }
}

class IncrementBWithChangedA extends System {
  entities = this.query(q => q.changed.with(A).read.track.and.with(B).write);
  execute() {
    for (const entity of this.entities.changed) entity.write(B).value += 1;
  }
}

class CreateA extends System {
  entities = this.query(q => q.with(A).write);

  execute() {
    this.createEntity(A);
  }
}

class RemoveA extends System {
  entities = this.query(q => q.all.with(A).write);
  execute() {
    for (const entity of this.entities.all) entity.remove(A);
  }
}


let total: {[key: string]: number} = {a: 0, b: 0};

class Count extends System {
  private readonly items: {[key: string]: {type: ComponentType<any>, query: Query}} = {
    a: {type: A, query: this.query(q => q.all.with(A))},
    b: {type: B, query: this.query(q => q.all.with(B))},
  };

  execute() {
    total = {a: 0, b: 0};
    for (const key in this.items) {
      for (const entity of this.items[key].query.all) {
        total[key] += entity.read(this.items[key].type).value;
      }
    }
  }
}

async function createWorld(...systems: SystemType<System>[]): Promise<World> {
  return World.create({
    maxEntities: 100, defaultComponentStorage: 'sparse', defs: [systems, Count]
  });
}


describe('added queries', () => {

  test('finds entities added before world executes', async() => {
    const world = await createWorld(IncrementAddedA);
    world.createEntity(A);
    world.createEntity(A, B);
    world.createEntity(B);
    await world.execute();
    await world.execute();
    await world.execute();
    expect(total.a).toBe(2);
    expect(total.b).toBe(0);
  });

  test('finds entities added during frame', async() => {
    const world = await createWorld(CreateA, IncrementAddedA);
    await world.execute();
    await world.execute();
    await world.execute();
    expect(total.a).toBe(3);
    expect(total.b).toBe(0);
  });

  test('finds entities added during previous frame', async() => {
    const world = await createWorld(IncrementAddedA, CreateA);
    await world.execute();
    await world.execute();
    await world.execute();
    expect(total.a).toBe(2);
    expect(total.b).toBe(0);
  });

});


describe('removed queries', () => {
  test('finds removed entities', async() => {
    const world = await createWorld(IncrementBWithRemovedA, RemoveA);
    world.createEntity(A);
    world.createEntity(A, B);
    world.createEntity(A, B);
    world.createEntity(B);
    await world.execute();
    await world.execute();
    await world.execute();
    expect(total.a).toBe(0);
    expect(total.b).toBe(2);
  });
});


describe('changed queries', () => {

  test('find changed entities', async() => {
    const world = await createWorld(IncrementBWithChangedA, IncrementAddedA);
    world.createEntity(A);
    world.createEntity(A, B);
    world.createEntity(B);
    await world.execute();
    await world.execute();
    await world.execute();
    expect(total.a).toBe(2);
    expect(total.b).toBe(1);
  });

});
