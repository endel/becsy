// We'll get either the dev or perf variant of becsy injected, but just take types from one since
// they're exactly the same anyway.
import type * as becsyDev from '../index';
type Becsy = {
  field: typeof becsyDev.field,
  Type: typeof becsyDev.Type,
  System: typeof becsyDev.System,
  World: typeof becsyDev.World
}


export default (becsy: Becsy): {[key: string]: () => Promise<any>} => {
  class A {
    static options = {capacity: 10000};
    @becsy.field(becsy.Type.int32) declare value: number;
  }

  class B {
    static options = {capacity: 10000};
    @becsy.field(becsy.Type.int32) declare value: number;
  }

  class C {
    static options = {capacity: 10000};
    @becsy.field(becsy.Type.int32) declare value: number;
  }

  class D {
    static options = {capacity: 10000};
    @becsy.field(becsy.Type.int32) declare value: number;
  }

  class E {
    static options = {capacity: 10000};
    @becsy.field(becsy.Type.int32) declare value: number;
  }

  const COMPS = Array.from(
    'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    () =>
      class {
        static options: any = {capacity: 10000};
        static schema: any = {
          value: becsy.Type.int32
        };
      }
  );

  class Data {
    static options = {capacity: 10000};
    @becsy.field(becsy.Type.int32) declare value: number;
  }


  class SystemA extends becsy.System {
    entities = this.query(q => q.all.with(A).write);

    execute() {
      for (const entity of this.entities.all) {
        entity.write(A).value *= 2;
      }
    }
  }

  class SystemB extends becsy.System {
    entities = this.query(q => q.all.with(B).write);

    execute() {
      for (const entity of this.entities.all) {
        entity.write(B).value *= 2;
      }
    }
  }

  class SystemC extends becsy.System {
    entities = this.query(q => q.all.with(C).write);

    execute() {
      for (const entity of this.entities.all) {
        entity.write(C).value *= 2;
      }
    }
  }

  class SystemD extends becsy.System {
    entities = this.query(q => q.all.with(D).write);

    execute() {
      for (const entity of this.entities.all) {
        entity.write(D).value *= 2;
      }
    }
  }

  class SystemE extends becsy.System {
    entities = this.query(q => q.all.with(E).write);

    execute() {
      for (const entity of this.entities.all) {
        entity.write(E).value *= 2;
      }
    }
  }

  class AddB extends becsy.System {
    entities = this.query(q => q.all.with(A).but.without(B).write);

    execute() {
      for (const entity of this.entities.all) {
        entity.add(B);
      }
    }
  }

  class RemoveB extends becsy.System {
    entities = this.query(q => q.all.with(B).write);

    execute() {
      for (const entity of this.entities.all) {
        entity.remove(B);
      }
    }
  }

  class SpawnB extends becsy.System {
    entities = this.query(q => q.all.with(A).also.using(B).write);

    execute() {
      for (const entity of this.entities.all) {
        const value = entity.read(A).value;
        this.createEntity(B, {value});
        this.createEntity(B, {value});
      }
    }
  }

  class KillB extends becsy.System {
    entities = this.query(q => q.all.with(B).write);

    execute() {
      for (const entity of this.entities.all) {
        entity.delete();
      }
    }
  }

  class SystemAB extends becsy.System {
    entities = this.query(q => q.all.with(A).write.with(B).write);

    execute() {
      for (const entity of this.entities.all) {
        const a = entity.write(A);
        const b = entity.write(B);
        const x = a.value;
        a.value = b.value;
        b.value = x;
      }
    }
  }

  class SystemCD extends becsy.System {
    entities = this.query(q => q.all.with(C).write.with(D).write);

    execute() {
      for (const entity of this.entities.all) {
        const c = entity.write(C);
        const d = entity.write(D);
        const x = c.value;
        c.value = d.value;
        d.value = x;
      }
    }
  }

  class SystemCE extends becsy.System {
    entities = this.query(q => q.all.with(C).write.with(E).write);

    execute() {
      for (const entity of this.entities.all) {
        const c = entity.write(C);
        const e = entity.write(E);
        const x = c.value;
        c.value = e.value;
        e.value = x;
      }
    }
  }

  class DataSystem extends becsy.System {
    entities = this.query(q => q.all.with(Data).write);

    execute() {
      for (const entity of this.entities.all) {
        entity.write(Data).value *= 2;
      }
    }
  }

  return {
    async packed1() {
      const count = 5000;
      const world = await becsy.World.create({
        maxEntities: count, defs: [A, B, C, D, E, SystemA], defaultComponentStorage: 'packed'
      });
      for (let i = 0; i < count; i++) world.createEntity(A, B, C, D, E);
      return world;
    },

    async packed5() {
      const count = 1000;
      const world = await becsy.World.create({
        maxEntities: count, defs: [A, B, C, D, E, SystemA, SystemB, SystemC, SystemD, SystemE],
        defaultComponentStorage: 'packed'
      });
      for (let i = 0; i < count; i++) world.createEntity(A, B, C, D, E);
      return world;
    },

    async simpleIter() {
      const count = 1000;
      const world = await becsy.World.create({
        maxEntities: count * 4, defs: [A, B, C, D, E, SystemAB, SystemCD, SystemCE],
        defaultComponentStorage: 'packed'
      });
      for (let i = 0; i < count; i++) {
        world.createEntity(A, B, {value: 1});
        world.createEntity(A, B, {value: 1}, C, {value: 2});
        world.createEntity(A, B, {value: 1}, C, {value: 2}, D, {value: 3});
        world.createEntity(A, B, {value: 1}, C, {value: 2}, E, {value: 4});
      }
      return world;
    },

    async fragIter() {
      const count = 100;
      const world = await becsy.World.create({
        maxEntities: count * COMPS.length, defs: [COMPS, Data, DataSystem],
        defaultComponentStorage: 'packed'
      });
      for (let i = 0; i < count; i++) {
        for (const Comp of COMPS) world.createEntity(Comp, Data);
      }
      return world;
    },

    async entityCycle() {
      const count = 1000;
      const world = await becsy.World.create({
        maxEntities: count * 8, maxLimboEntities: count * 6, maxLimboComponents: count * 6,
        defs: [A, B, SpawnB, KillB], defaultComponentStorage: 'packed'
      });
      for (let i = 0; i < count; i++) world.createEntity(A, {value: i});
      return world;
    },

    async addRemove() {
      const count = 1000;
      const world = await becsy.World.create({
        maxEntities: count, maxShapeChangesPerFrame: count * 3, maxLimboComponents: count * 3,
        defs: [A, B, AddB, RemoveB], defaultComponentStorage: 'packed'
      });
      for (let i = 0; i < count; i++) world.createEntity(A);
      return world;
    }
  };

};
