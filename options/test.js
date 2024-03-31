import Car from '../classes/car.js';
import DummyCar from '../classes/dummyCar.js';
import Visualizer from '../classes/visualizer.js';
import Road from '../classes/road.js';

class Test {
  constructor(carCanvas, networkCanvas) {
    this.carCanvas = carCanvas;
    this.networkCanvas = networkCanvas;

    this.networkCtx = networkCanvas.getContext('2d');
    this.carCtx = carCanvas.getContext('2d');
    this.road = new Road(carCanvas.width / 2, carCanvas.width * 0.9);

    this.bestCar = new Car(this.road.getLaneCenter(1), 500, 30, 50, 'test');
    this.traffic = [
      new DummyCar(this.road.getLaneCenter(0), 300, 30, 50),
      new DummyCar(this.road.getLaneCenter(1), 300, 30, 50),
      new DummyCar(this.road.getLaneCenter(0), 100, 30, 50),
      new DummyCar(this.road.getLaneCenter(2), 100, 30, 50),
    ];
    this.createTraffic();
  }
  canAnimate() {
    return !this.bestCar.damaged;
  }

  createTraffic() {
    const createType = [
      { offset: 100, lane: 0 },
      { offset: 100, lane: 1 },
      { offset: 300, lane: 0 },
      { offset: 300, lane: 2 },
      { offset: 500, lane: 0 },
      { offset: 500, lane: 2 },
      { offset: 700, lane: 1 },
      { offset: 700, lane: 0 },
      { offset: 900, lane: 2 },
      { offset: 900, lane: 0 },
    ];
    for (let i = 0; i >= -20000; i -= 1000) {
      createType.forEach(({ offset, lane }) => {
        this.traffic.push(new DummyCar(this.road.getLaneCenter(lane), i - offset, 30, 50));
      });
    }
  }
  animate(time) {
    this.carCanvas.height = window.innerHeight;
    this.networkCanvas.height = window.innerHeight;

    this.traffic.forEach((item) => item.update(this.road.borders));
    this.bestCar.update(this.road.borders, this.traffic);

    this.carCtx.save();
    this.carCtx.translate(0, -this.bestCar.y + this.carCanvas.height * 0.7);

    this.road.draw(this.carCtx);
    this.traffic.forEach((item) => item.draw(this.carCtx));
    this.bestCar.draw(this.carCtx, true);

    this.carCtx.restore();
    this.networkCtx.lineDashOffset = -time / 50;
    Visualizer.drawNetwork(this.networkCtx, this.bestCar.brain);
  }
}

export default Test;
