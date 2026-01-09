// 3-3. 내부에는 섭씨(celsius)만 저장하고,
//      화씨 단위(fahrenheit)는 getter/setter로 계산해서 제공

class AdvancedTemperature {
  private _celsius: number = 0;

  public get celsius(): number {
    return this._celsius;
  }

  public set celsius(value: number) {
    if (value < -273.15) {
      throw new Error('절대영도 이하의 온도는 설정할 수 없습니다.');
    }
    this._celsius = value;
  }

  // 화씨 = (섭씨 * 9/5) + 32
  public get fahrenheit(): number {
    return (this._celsius * 9) / 5 + 32;
  }

  // 화씨로 설정해도 내부에는 섭씨로 저장
  public set fahrenheit(value: number) {
    const celsius = ((value - 32) * 5) / 9;
    this.celsius = celsius; // 유효성 검사를 재사용
  }
}

// ✅ 사용 예시
const t = new AdvancedTemperature();
t.celsius = 25;
console.log('섭씨:', t.celsius); // 25
console.log('화씨:', t.fahrenheit); // 77

t.fahrenheit = 32; // 화씨 32도 설정 → 섭씨 0도
console.log('섭씨:', t.celsius); // 0
console.log('화씨:', t.fahrenheit); // 32
