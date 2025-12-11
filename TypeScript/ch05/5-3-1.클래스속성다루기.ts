// 3-1. 내부에는 firstName, lastName을 저장하고
//      외부에서는 fullName이라는 하나의 속성으로 관리하는 예제

class UserName {
  private _firstName: string;
  private _lastName: string;

  constructor(firstName: string, lastName: string) {
    this._firstName = firstName;
    this._lastName = lastName;
  }

  // 읽기용 getter: `user.fullName` 형식으로 사용
  public get fullName(): string {
    return `${this._firstName} ${this._lastName}`;
  }

  // 쓰기용 setter: "이름 성" 형식의 문자열을 받아 내부를 분리
  public set fullName(value: string) {
    const parts = value.trim().split(' ');
    if (parts.length !== 2) {
      throw new Error("fullName은 '이름 성' 형식으로 입력해야 합니다.");
    }
    this._firstName = parts[0];
    this._lastName = parts[1];
  }
}

// ✅ 사용 예시
const userName = new UserName('Jimin', 'Park');
console.log(userName.fullName); // getter → "Jimin Park"

userName.fullName = 'Minji Kim'; // setter 호출
console.log(userName.fullName); // "Minji Kim"

// userName.fullName = "잘못된형식"; // ❌ 오류 발생 (예외 던짐)
