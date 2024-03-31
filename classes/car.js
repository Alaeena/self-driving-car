import Controller from './controller.js';
import Sensor from './sensor.js';
import NeuralNetwork from './network.js';
import { clamp, polysIntersect } from '../utils/index.js';
import jsonData from '../utils/data.json' with { type: 'json' };

const friction = 0.05;
const acceleration = 0.2;
const tuning = 0.03;
const maxSpeed = 3;

const config = {
  iterations: 10000, // the maximum times to iterate the training data --> number greater than 0
  errorThresh: 0.00005,
  log: true, // true to use console.log, when a function is supplied it is used --> Either true or a function
  logPeriod: 2500, // iterations between logging out --> number greater than 0
  learningRate: 0.3, // scales with delta to effect training rate --> number between 0 and 1
  timeout: 10000, // the max number of milliseconds to train for --> number greater than 0. Default --> Infinity
};

const net = new brain.NeuralNetwork(config);
// net.train([{ output: [0, 0, 0, 0], input: [0, 0, 0, 0, 0] }]);
net.fromJSON(jsonData);

class Car {
  constructor(x, y, width, height, option = 'default', useImage = false) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;

    this.useImage = useImage;
    this.option = option;

    this.speed = 0;
    this.angle = 0;
    this.damaged = false;

    this.sensor = new Sensor(this);
    this.controller = new Controller(option != 'default');

    if (option != 'default') {
      this.brain = new NeuralNetwork([this.sensor.rayCount, 6, 4]);
    } else {
      this.data = [];
      this.saved = false;
    }

    if (useImage) {
      this.img = new Image();
      this.img.src = 'car.png';

      this.mask = document.createElement('canvas');
      this.mask.width = width;
      this.mask.height = height;

      const maskCtx = this.mask.getContext('2d');
      this.img.onload = () => {
        maskCtx.fillStyle = 'blue';
        maskCtx.rect(0, 0, this.width, this.height);
        maskCtx.fill();

        maskCtx.globalCompositeOperation = 'destination-atop';
        maskCtx.drawImage(this.img, 0, 0, this.width, this.height);
      };
    }
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
    if (this.controller.forward) {
      this.speed += acceleration;
    }
    if (this.controller.backward) {
      this.speed -= acceleration;
    }
    if (this.speed > 0) {
      this.speed -= friction;
      this.speed = Math.max(0, this.speed);
    } else if (this.speed < 0) {
      this.speed += friction;
      this.speed = Math.min(0, this.speed);
    }
    if (this.speed != 0) {
      const flip = this.speed > 0 ? 1 : -1;
      if (this.controller.left) {
        this.angle += tuning * flip;
      }
      if (this.controller.right) {
        this.angle -= tuning * flip;
      }
    }
    this.speed = clamp(this.speed, -maxSpeed / 2, maxSpeed);
    this.x -= Math.sin(this.angle) * this.speed;
    this.y -= Math.cos(this.angle) * this.speed;
  }
  #assessDamage(roadBorders, traffic) {
    for (let i = 0; i < roadBorders.length; i++) {
      if (polysIntersect(this.polygon, roadBorders[i])) {
        return true;
      }
    }
    for (let i = 0; i < traffic.length; i++) {
      if (polysIntersect(this.polygon, traffic[i].polygon)) {
        return true;
      }
    }
    return false;
  }

  update(roadBorders, traffic) {
    if (!this.damaged) {
      this.#move();
      this.polygon = this.#createPolygon();
      this.damaged = this.#assessDamage(roadBorders, traffic);
    }
    this.sensor.update(roadBorders, traffic);
    const offsets = this.sensor.readings.map((s) => (s == null ? 0 : 1 - s.offset));

    if (this.option != 'default') {
      const outputs = (this.option == 'auto' && NeuralNetwork.feedForward(offsets, this.brain)) || net.run(offsets);

      this.controller.forward = Math.round(outputs[0]);
      this.controller.left = Math.round(outputs[1]);
      this.controller.right = Math.round(outputs[2]);
      this.controller.backward = Math.round(outputs[3]);
    } else {
      const values = [
        this.controller.forward ? 1 : 0,
        this.controller.left ? 1 : 0,
        this.controller.right ? 1 : 0,
        this.controller.backward ? 1 : 0,
      ];
      const saveLog = values.filter((value) => value == 0).length != values.length;
      if (saveLog && !this.damaged) {
        this.data.push({ input:offsets, output: values });
      }
    }
  }
  draw(ctx, drawSensor = false) {
    if (drawSensor) {
      this.sensor.draw(ctx);
    }
    if (this.useImage) {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(-this.angle);
      if (!this.damaged) {
        ctx.drawImage(this.mask, -this.width / 2, -this.height / 2, this.width, this.height);
        ctx.globalCompositeOperation = 'multiply';
      }
      ctx.drawImage(this.img, -this.width / 2, -this.height / 2, this.width, this.height);
      ctx.restore();
    } else {
      if (this.damaged) {
        ctx.fillStyle = 'gray';
      } else {
        ctx.fillStyle = 'black';
      }
      ctx.beginPath();
      ctx.moveTo(this.polygon[0].x, this.polygon[0].y);
      for (let i = 1; i < this.polygon.length; i++) {
        ctx.lineTo(this.polygon[i].x, this.polygon[i].y);
      }
      ctx.fill();
    }
  }
}
export default Car;
export { net };
