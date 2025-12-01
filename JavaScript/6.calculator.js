// calculator.js - Default export
export default class Calculator {
  constructor() {
    this.result = 0;
  }

  add(num) {
    this.result += num;
    return this;
  }

  multiply(num) {
    this.result *= num;
    return this;
  }

  getResult() {
    return this.result;
  }
}
