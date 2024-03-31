import Car from '../classes/car.js';
import DummyCar from '../classes/dummyCar.js';
import Visualizer from '../classes/visualizer.js';
import Road from '../classes/road.js';

class Auto {
  constructor(carCanvas, networkCanvas) {
    this.carCanvas = carCanvas;
    this.networkCanvas = networkCanvas;
    this.time = 0;

    this.networkCtx = networkCanvas.getContext('2d');
    this.carCtx = carCanvas.getContext('2d');
    this.road = new Road(carCanvas.width / 2, carCanvas.width * 0.9);

    this.sorted = [];
    this.carList = this.#generateCars(100);
    this.bestCar = this.carList[0];
    this.traffic = [
      new DummyCar(this.road.getLaneCenter(1), 100, 30, 50),
      new DummyCar(this.road.getLaneCenter(0), -100, 30, 50),
      new DummyCar(this.road.getLaneCenter(2), -100, 30, 50),
      new DummyCar(this.road.getLaneCenter(0), -300, 30, 50),
      new DummyCar(this.road.getLaneCenter(1), -300, 30, 50),
      new DummyCar(this.road.getLaneCenter(1), -500, 30, 50),
      new DummyCar(this.road.getLaneCenter(2), -500, 30, 50),
      new DummyCar(this.road.getLaneCenter(0), -700, 30, 50),
      new DummyCar(this.road.getLaneCenter(2), -700, 30, 50),
    ];
  }
  #generateCars(N) {
    const cars = [];
    for (let i = 1; i <= N; i++) {
      cars.push(new Car(this.road.getLaneCenter(1), 500, 30, 50, 'auto'));
    }
    return cars;
  }
  canAnimate() {
    const filter = this.carList.filter((item) => !item.damaged && item.y < 300);
    return this.time < 10;
  }
  animate(time) {
    this.time += time / 1000;
    this.bestCar = this.carList.find((item) => item.y == Math.min(...this.carList.map((item) => item.y)));
    this.carCanvas.height = window.innerHeight;
    this.networkCanvas.height = window.innerHeight;

    this.traffic.forEach((item) => item.update(this.road.borders));
    this.carList.forEach((item) => item.update(this.road.borders, this.traffic));

    this.carCtx.save();
    this.carCtx.translate(0, -this.bestCar.y + this.carCanvas.height * 0.7);

    this.road.draw(this.carCtx);
    this.traffic.forEach((item) => item.draw(this.carCtx));

    this.carCtx.globalAlpha = 0.1;
    this.carList.forEach((item) => item.draw(this.carCtx));
    this.carCtx.globalAlpha = 1;
    this.bestCar.draw(this.carCtx, true);

    this.carCtx.restore();

    this.networkCtx.lineDashOffset = -time / 50;
    Visualizer.drawNetwork(this.networkCtx, this.bestCar.brain);
  }
}

export default Auto;
