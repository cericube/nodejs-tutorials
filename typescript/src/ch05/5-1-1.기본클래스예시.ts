// 책(Book)을 표현하는 간단한 클래스 예제

class Book {
  // 1) 속성에 타입 지정
  title: string;
  author: string;
  pages: number;
  isPublished: boolean;

  // 2) 생성자 매개변수에도 타입 지정
  constructor(title: string, author: string, pages: number, isPublished: boolean) {
    this.title = title;
    this.author = author;
    this.pages = pages;
    this.isPublished = isPublished;
  }

  // 3) 반환 타입이 있는 메서드
  getSummary(): string {
    return `${this.title} - ${this.author} (${this.pages}쪽) / 출간 여부: ${
      this.isPublished ? '출간됨' : '미출간'
    }`;
  }

  // 4) 반환 타입이 void인 메서드
  publish(): void {
    this.isPublished = true;
    console.log(`"${this.title}"가 출간 상태로 변경되었습니다.`);
  }
}

// ✅ 사용 예시
const book1 = new Book('타입스크립트 완벽 가이드', '홍길동', 350, false);
console.log(book1.getSummary()); // 메서드 호출

book1.publish(); // 상태 변경
console.log(book1.getSummary());

// 🚨 잘못된 타입 할당 예시 (컴파일 에러)
// book1.pages = "많이"; // Type 'string' is not assignable to type 'number'.
