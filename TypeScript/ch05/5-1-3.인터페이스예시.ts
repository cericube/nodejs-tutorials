// 1-3. 인터페이스를 통해 "행동" 규약을 정의하고, 클래스로 구현하는 예제

// 이동 가능한 객체
interface Drivable {
  drive(distance: number): void;
}

// 충전 가능한 객체
interface Chargeable {
  charge(amount: number): void;
}

// Drivable + Chargeable 을 동시에 구현하는 전기차
class ElectricCar implements Drivable, Chargeable {
  private battery: number = 100; // 배터리 잔량 (%)
  private odometer: number = 0; // 총 주행 거리 (km)

  drive(distance: number): void {
    if (this.battery <= 0) {
      console.log('배터리가 없어 운행할 수 없습니다.');
      return;
    }

    this.odometer += distance;
    this.battery -= distance * 0.5; // 단순 계산: 1km 주행에 0.5% 소모
    if (this.battery < 0) this.battery = 0;

    console.log(
      `${distance}km 주행 완료 (총 주행 거리: ${this.odometer}km, 배터리: ${this.battery.toFixed(
        1,
      )}%)`,
    );
  }

  charge(amount: number): void {
    this.battery += amount;
    if (this.battery > 100) this.battery = 100;
    console.log(`충전 완료: 현재 배터리 ${this.battery.toFixed(1)}%`);
  }
}

// ✅ 사용 예시
const tesla = new ElectricCar();
tesla.drive(50);
tesla.drive(80);
tesla.charge(30);
tesla.drive(40);

// 🚨 인터페이스 규약 위반 예 (컴파일 에러 예시)
// class Bike implements Drivable {
//   // drive를 구현하지 않으면 오류
// }
