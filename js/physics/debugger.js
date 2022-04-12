import { DisplayObject, Graphics } from 'black-engine';
import PhysicsOption from './physics-options';

export default class Debugger extends DisplayObject {

  constructor(world) {
    super();

    this._s = PhysicsOption.worldScale;
    this._world = world;
    this._graphicsPool = [];

    this.isActive = true;
  }

  update() {
    if (this.isActive === false) {
      return;
    }

    this.cleanGraphics();

    for (let body = this._world.getBodyList(); body; body = body.getNext()) {
      for (let fixture = body.getFixtureList(); fixture; fixture = fixture.getNext()) {
        this.switchDrawer(fixture, body);
      }
    }
  }

  cleanGraphics() {
    this._graphicsPool.forEach(gr => gr.clear());
  }

  switchDrawer(fixture, body) {
    const type = fixture.getType();
    const shape = fixture.getShape();

    if (type == 'polygon' || type === 'chain') {
      this.drawPolygon(shape, body);
    } else if (type == 'circle') {
      this.drawCircle(shape, body);
    } else if (type === 'edge') {
      this.drawEdge(shape, body);
    }
  }

  drawEdge(shape, body) {
    if(!body.gr){
      const gr = body.gr = new Graphics();
      this.add(gr);
      this._graphicsPool.push(gr);
    }

    const s = this._s;
    const pos = body.getPosition();
    const angle = body.getAngle();

    const gr = body.gr;
    gr.clear();
    gr.beginPath();
    gr.lineStyle(2, 0xff0000);

    gr.moveTo(shape.m_vertex1.x * s, shape.m_vertex1.y * s);
    gr.lineTo(shape.m_vertex2.x * s, shape.m_vertex2.y * s);

    this.applyTransformation(gr, pos, angle);

    gr.stroke();
  }

  drawPolygon(shape, body) {
    if(!body.gr){
      const gr = body.gr = new Graphics();
      this.add(gr);
      this._graphicsPool.push(gr);
    }

    const vertices = shape.m_vertices;
    const pos = body.getPosition();
    const angle = body.getAngle();
    const s = this._s;

    if (!vertices.length) {
      return;
    }

    const gr = body.gr;
    gr.clear();
    gr.beginPath();
    gr.lineStyle(2, 0xff0000);
    
    for (let i = 0; i < vertices.length - 1; i++) {
      const verc = shape.getVertex(i);
      const vercNext = shape.getVertex(i + 1);
      
      gr.moveTo((verc.x) * s, (verc.y) * s);
      gr.lineTo((vercNext.x) * s, (vercNext.y) * s);
    }
    
    const first = shape.getVertex(0);
    gr.lineTo((first.x) * s, (first.y) * s);
    
    this.applyTransformation(gr, pos, angle);

    gr.stroke();
    gr.closePath();
  }

  drawCircle(shape, body) {
    if(!body.gr){
      const gr = body.gr = new Graphics();
      this.add(gr);
      this._graphicsPool.push(gr);
    }

    const s = this._s;

    const pos = body.getPosition();
    const angle = body.getAngle();
    const radius = shape.m_radius * s;

    const gr = body.gr;

    gr.clear();
    gr.beginPath();
    gr.lineStyle(2, 0xff0000);

    gr.moveTo(0, 0);
    gr.arc(0, 0, radius, 0, Math.PI * 2);

    this.applyTransformation(gr, pos, angle);
    gr.stroke();
  }

  applyTransformation(gr, pos, angle) {
    const s = this._s;

    gr.rotation = angle;
    gr.x = pos.x * s;
    gr.y = pos.y * s;
  }
}