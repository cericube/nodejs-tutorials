// 4-1. 기본 Employee 클래스를 상속하는 Developer, Manager 예제

class EmployeeBase {
  constructor(
    public name: string,
    protected baseSalary: number,
  ) {}

  // 공통 동작
  work(): void {
    console.log(`${this.name}이(가) 회사에서 일하고 있습니다.`);
  }

  // 공통 급여 계산 메서드
  getMonthlySalary(): number {
    return this.baseSalary;
  }
}

class Developer extends EmployeeBase {
  constructor(
    name: string,
    baseSalary: number,
    public mainLanguage: string,
  ) {
    super(name, baseSalary);
  }

  // 메서드 오버라이딩
  work(): void {
    console.log(`${this.name}이(가) ${this.mainLanguage}로 기능을 개발하고 있습니다.`);
  }
}

class Manager extends EmployeeBase {
  constructor(
    name: string,
    baseSalary: number,
    private teamSize: number,
  ) {
    super(name, baseSalary);
  }

  // 메서드 오버라이딩
  work(): void {
    console.log(`${this.name}이(가) ${this.teamSize}명의 팀을 관리하고 있습니다.`);
  }

  // 추가 규칙: 팀원의 수에 따라 관리 수당
  getMonthlySalary(): number {
    const bonus = this.teamSize * 100_000;
    return this.baseSalary + bonus;
  }
}

// ✅ 다형성(polymorphism) 예시
const employees: EmployeeBase[] = [
  new Developer('개발자A', 4_000_000, 'TypeScript'),
  new Manager('매니저B', 5_000_000, 5),
];

for (const e of employees) {
  e.work(); // 각 클래스에 맞는 구현이 호출됨
  console.log('월 급여:', e.getMonthlySalary().toLocaleString(), '원');
}
