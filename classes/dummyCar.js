import { polysIntersect } from '../utils/index.js';

const maxSpeed = 1.5;

class DummyCar {
  constructor(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;

    this.speed = maxSpeed;
    this.angle = 0;
    this.damaged = false;
  }
  #createPolygon() {
    const points = [];
    const rad = Math.hypot(this.width, this.height) / 2;
    const alpha = Math.atan2(this.width, this.height);
    points.push({
      x: this.x - Math.sin(this.angle - alpha) * rad,
      y: this.y - Math.cos(this.angle - alpha) * rad,
    });
    points.push({
      x: this.x - Math.sin(this.angle + alpha) * rad,
      y: this.y - Math.cos(this.angle + alpha) * rad,
    });
    points.push({
      x: this.x - Math.sin(Math.PI + this.angle - alpha) * rad,
      y: this.y - Math.cos(Math.PI + this.angle - alpha) * rad,
    });
    points.push({
      x: this.x - Math.sin(Math.PI + this.angle + alpha) * rad,
      y: this.y - Math.cos(Math.PI + this.angle + alpha) * rad,
    });
    return points;
  }
  #move() {
    this.y -= this.speed;
  }
  // #assessDamage(roadBorders) {
  //   for (let i = 0; i < roadBorders.length; i++) {
  //     if (polysIntersect(this.polygon, roadBorders[i])) {
  //       return true;
  //     }
  //   }
  //   return false;
  // }
  update(roadBorders) {
    if (!this.damaged) {
      this.#move();
      this.polygon = this.#createPolygon();
      // this.damaged = this.#assessDamage(roadBorders);
    }
  }
  draw(ctx) {
    ctx.fillStyle = 'red';
    ctx.beginPath();
    ctx.moveTo(this.polygon[0].x, this.polygon[0].y);
    for (let i = 1; i < this.polygon.length; i++) {
      ctx.lineTo(this.polygon[i].x, this.polygon[i].y);
    }
    ctx.fill();
  }
}
export default DummyCar;
