class Control {
  constructor(useBrain) {
    this.forward = false;
    this.left = false;
    this.right = false;
    this.backward = false;

    if (!useBrain) {
      this.#addKeyboardListeners();
    }
  }

  #addKeyboardListeners() {
    document.onkeydown = (event) => {
      switch (event.key) {
        case ('ArrowLeft', 'a'):
          this.left = true;
          break;
        case ('ArrowRight', 'd'):
          this.right = true;
          break;
        case ('ArrowUp', 'w'):
          this.forward = true;
          break;
        case ('ArrowDown', 's'):
          this.backward = true;
          break;
      }
    };
    document.onkeyup = (event) => {
      switch (event.key) {
        case ('ArrowLeft', 'a'):
          this.left = false;
          break;
        case ('ArrowRight', 'd'):
          this.right = false;
          break;
        case ('ArrowUp', 'w'):
          this.forward = false;
          break;
        case ('ArrowDown', 's'):
          this.backward = false;
          break;
      }
    };
  }
}

export default Control;
