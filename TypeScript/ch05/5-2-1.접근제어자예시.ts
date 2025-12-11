// 2-1. 접근 제어자를 모두 사용하는 은행 계좌 예제

class BankAccount {
  public ownerName: string; // 어디서든 접근 가능
  protected accountNumber: string; // 자식 클래스에서 접근 가능
  private balance: number; // 외부에서 직접 접근 불가

  constructor(ownerName: string, accountNumber: string, initialBalance: number) {
    this.ownerName = ownerName;
    this.accountNumber = accountNumber;
    this.balance = initialBalance;
  }

  // private 필드에 접근하기 위한 public 메서드
  public getBalance(): number {
    return this.balance;
  }

  public deposit(amount: number): void {
    if (amount <= 0) {
      console.log('입금액은 0보다 커야 합니다.');
      return;
    }
    this.balance += amount;
    console.log(
      `${amount.toLocaleString()}원 입금 완료. 현재 잔액: ${this.balance.toLocaleString()}원`,
    );
  }

  public withdraw(amount: number): void {
    if (amount <= 0) {
      console.log('출금액은 0보다 커야 합니다.');
      return;
    }
    if (amount > this.balance) {
      console.log('잔액이 부족합니다.');
      return;
    }
    this.balance -= amount;
    console.log(
      `${amount.toLocaleString()}원 출금 완료. 현재 잔액: ${this.balance.toLocaleString()}원`,
    );
  }
}

const account = new BankAccount('김철수', '123-456-7890', 1_000_000);

console.log(account.ownerName); // ✅ public: 접근 가능
// console.log(account.accountNumber); // ❌ protected: 외부에서 접근 불가 (컴파일 에러)
// console.log(account.balance);       // ❌ private: 외부에서 접근 불가 (컴파일 에러)

account.deposit(500_000);
account.withdraw(200_000);
console.log('잔액 조회:', account.getBalance());

//////////////////////////////////////////////////////////////
// 2-2. BankAccount를 상속받아 protected 필드를 사용하는 예제
class SafeBankAccount extends BankAccount {
  // 부모의 protected accountNumber에 접근 가능
  public printMaskedAccount(): void {
    // 계좌번호 일부만 보여주기 (마스킹 처리)
    const masked = this.accountNumber.replace(/.(?=.{4})/g, '*');
    console.log(`계좌번호(마스킹): ${masked}`);
  }
}

const safeAccount = new SafeBankAccount('이영희', '987-654-3210', 3_000_000);
safeAccount.printMaskedAccount();

// console.log(safeAccount.accountNumber); // ❌ 여전히 외부에서 직접 접근은 불가
