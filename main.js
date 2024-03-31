import Trainer from './options/train.js';
import Auto from './options/auto.js';
import Test from './options/test.js';
import { net } from './classes/car.js';

const overlay = document.querySelector('.overlay');
const option1 = document.querySelector('.option.option1');
const option2 = document.querySelector('.option.option2');
option2.style.display = 'none';

const trainButton = option1.querySelector('button.train');
const testButton = option1.querySelector('button.test');
const autoButton = option1.querySelector('button.auto');

const saveButton = option2.querySelector('button.train');
const discardButton = option2.querySelector('button.test');

const saveBrainButton = document.querySelector('button.save');
const backButton = document.querySelector('button.back');
const resetButton = document.querySelector('button.reset');

const networkCanvas = document.getElementById('networkCanvas');
networkCanvas.width = 500;

const carCanvas = document.getElementById('carCanvas');
carCanvas.width = 200;
let IntervalId;
let data;
let auto;

function loadTrainOption() {
  const trainer = new Trainer(carCanvas);
  networkCanvas.style.display = 'none';

  IntervalId = setInterval(function () {
    if (trainer.canAnimate()) {
      trainer.animate();
    } else {
      clearInterval(IntervalId);
      IntervalId = null;

      data = trainer.getData();
      overlay.style.display = 'flex';
      option2.style.display = 'flex';
    }
  }, 10);
}

function loadTestOption(needCheck = true) {
  const test = new Test(carCanvas, networkCanvas);
  networkCanvas.style.display = 'none';

  IntervalId = setInterval(function () {
    if (needCheck || test.canAnimate()) {
      test.animate(10);
    } else {
      clearInterval(IntervalId);
      IntervalId = null;

      overlay.style.display = 'flex';
      option1.style.display = 'flex';
    }
  }, 10);
}
function loadAutoOption() {
  auto = new Auto(carCanvas, networkCanvas);
  networkCanvas.style.display = 'block';

  IntervalId = setInterval(function () {
    auto.animate(10);
  }, 10);
  function handleSwitch() {}
}

function cleanBeforeOption() {
  overlay.style.display = 'none';
  option1.style.display = 'none';
  option2.style.display = 'none';
  if (IntervalId) {
    clearInterval(IntervalId);
    IntervalId = null;
  }
}

// =========================== // OPTION1 EVENTS // =========================== //

trainButton.addEventListener('click', function () {
  cleanBeforeOption();
  loadTrainOption();
});
testButton.addEventListener('click', function () {
  cleanBeforeOption();
  loadTestOption(false);
});
autoButton.addEventListener('click', function () {
  cleanBeforeOption();
  loadAutoOption();
});

// =========================== // CANVAS EVENTS // =========================== //

saveBrainButton.addEventListener('click', function () {
  let jsonData = net.toJSON('save.json');
  let json = JSON.stringify(jsonData);

  var a = document.createElement('a');
  var file = new Blob([json], { type: 'text/json' });
  a.href = URL.createObjectURL(file);
  a.download = 'data.json';
  a.click();
});
backButton.addEventListener('click', function () {
  overlay.style.display = 'flex';
  option1.style.display = 'flex';
});
window.addEventListener('resize', function () {
  carCanvas.height = window.innerHeight;
  networkCanvas.height = window.innerHeight;
});
resetButton.addEventListener('click', function () {
  cleanBeforeOption();
  loadAutoOption();
});
// =========================== // OPTION2 EVENTS // =========================== //

saveButton.addEventListener('click', function () {
  option2.style.display = 'none';
  option1.style.display = 'flex';
  if (data) {
    net.train(data);
  }
});
discardButton.addEventListener('click', function () {
  option2.style.display = 'none';
  option1.style.display = 'flex';
  data = null;
});

loadTestOption();
