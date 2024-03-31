import Car from '../classes/car.js';
import DummyCar from '../classes/dummyCar.js';
import Road from '../classes/road.js';

class Trainer {
  constructor(carCanvas) {
    carCanvas.width = 200;
    this.carCanvas = carCanvas;

    this.ctx = carCanvas.getContext('2d');
    this.road = new Road(carCanvas.width / 2, carCanvas.width * 0.9);
    this.car = new Car(this.road.getLaneCenter(1), 500, 30, 50);
    this.lastCreate = 300;
    this.traffic = [];
  }
  getData() {
    return this.car.data;
  }
  canAnimate() {
    return !this.car.damaged;
  }
  createTraffic() {
    const y = Math.round(this.car.y / 100) * 100;
    const createType = [[1], [0, 1], [0, 2]];

    if ((y % 200 == 0) & (this.car.y < this.lastCreate)) {
      const newY = y - 300;
      const index = Math.round(Math.random() * (createType.length - 1));
      const option = createType[index];

      this.lastCreate = newY;
      option.forEach((value) => {
        this.traffic.push(new DummyCar(this.road.getLaneCenter(value), newY, 30, 50));
      });
    }
  }
  animate() {
    this.createTraffic();
    this.carCanvas.height = window.innerHeight;

    this.traffic.forEach((item) => item.update(this.road.borders));
    this.car.update(this.road.borders, this.traffic);

    this.ctx.save();
    this.ctx.translate(0, -this.car.y + this.carCanvas.height * 0.7);

    this.road.draw(this.ctx);
    this.traffic.forEach((item) => item.draw(this.ctx));
    this.car.draw(this.ctx, true);

    this.ctx.restore();
  }
}

function animate() {
  if (car.damaged) {
    console.log(car.data);
  } else {
    requestAnimationFrame(animate);
  }
}

export default Trainer;
