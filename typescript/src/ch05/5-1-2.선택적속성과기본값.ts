// 선택적 속성(age?)과 기본값(country)을 가진 사용자 프로필 예제

class UserProfile {
  nickname: string;
  //tsconfig.json
  // "exactOptionalPropertyTypes": true 로 설정한 경우
  // age?: number는 “프로퍼티가 없거나, 있을 경우에는 무조건 number” 라는 뜻이 됩니다.
  // 값이 undefined일 수 있다”가 아니라,아예 프로퍼티가 존재하지 않을 수 있다”**는 의미가 됩니다.
  // age?: number; 로 하면 this.age = age에서 오류가 납니다.
  age: number | undefined; //옵셔널(?) 대신 명시적으로 union 사용
  country: string = 'Korea'; // 기본값

  constructor(nickname: string, age?: number) {
    this.nickname = nickname;
    this.age = age; //이제 number | undefined → number | undefined
  }

  getDescription(): string {
    // age가 undefined일 수 있으므로 조건 처리
    const agePart = this.age !== undefined ? `${this.age}세` : '나이 비공개';
    return `${this.nickname} (${agePart}, ${this.country})`;
  }
}

// 사용 예시
const userA = new UserProfile('dev_kim', 29);
const userB = new UserProfile('anonymous'); // age 생략

console.log(userA.getDescription()); // dev_kim (29세, Korea)
console.log(userB.getDescription()); // anonymous (나이 비공개, Korea)

////////////////////////////////////////////////////
// 옵셔녈을 사용할 경우 아래와 같이 다른 방법으로 구현 가능
////////////////////////////////////////////////////
// class UserProfile {
//   nickname: string;
//   age?: number;                 // optional property (값은 number)
//   country: string = "Korea";

//   constructor(nickname: string, age?: number) {
//     this.nickname = nickname;

//     // ✅ age가 정의된 경우에만 프로퍼티를 세팅
//     if (age !== undefined) {
//       this.age = age;           // 이때 this.age 타입은 number이고, age는 number로 좁혀짐
//     }
//   }

//   getDescription(): string {
//     const agePart = this.age !== undefined ? `${this.age}세` : "나이 비공개";
//     return `${this.nickname} (${agePart}, ${this.country})`;
//   }
// }
