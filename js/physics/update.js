import { MessageDispatcher } from "black-engine";
// import ObjectsType from "../game-objects/objects.type";
import PhysicsOption from "./physics-options";

class Update {
  constructor(world, pl) {
    this.events = new MessageDispatcher();
    this.world = world;
    this.pl = pl;
  }

  update() {
    if (PhysicsOption.PAUSED === true) {
      return;
    }

    const world = this.world;
    world.step(1 / 60);
    world.clearForces();

    for (let b = world.getBodyList(); b; b = b.getNext()) {
      if (b.getUserData()) {
        this.updateTransform(b);
      }
    }
  }

   updateTransform(b) {
    const worldScale = PhysicsOption.worldScale;
    const bodyPosition = b.getPosition();
    const bodyAngle = b.getAngle();
    const obj = b.getUserData();


    obj.x = bodyPosition.x * worldScale;
    obj.y = bodyPosition.y * worldScale;
    obj.rotation = bodyAngle;
  }
}

export default Update;
