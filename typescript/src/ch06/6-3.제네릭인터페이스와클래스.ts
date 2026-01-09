/**
 * 3-1. 제네릭 인터페이스: Container<T>
 * T 타입의 값을 담는 컨테이너
 */
interface Container<T> {
  value: T;
  isLocked: boolean;
}

// string을 담는 컨테이너
const stringBox: Container<string> = {
  value: 'TypeScript is awesome',
  isLocked: false,
};

console.log(stringBox.value.toUpperCase()); // 정상 동작

// 커스텀 타입 User를 담는 컨테이너
interface User {
  id: number;
  name: string;
}

const userBox: Container<User> = {
  value: { id: 1, name: 'Alice' },
  isLocked: true,
};

console.log(userBox.value.name); // "Alice"

/**
 * 3-2. 서버 응답 형태를 표현하는 제네릭 인터페이스 예제
 */
interface ApiResponse<T> {
  data: T;
  status: number;
  message?: string;
}

interface Product {
  id: number;
  title: string;
}

const productResponse: ApiResponse<Product> = {
  data: { id: 1, title: 'Keyboard' },
  status: 200,
  message: 'OK',
};

console.log(productResponse.data.title); // "Keyboard"

/**
 * 3-3. 제네릭 클래스: 간단한 큐(Queue) 구현
 */
class SimpleQueue<T> {
  private items: T[] = [];

  // 큐에 요소 추가
  enqueue(item: T) {
    this.items.push(item);
  }

  // 큐에서 요소 제거(가장 먼저 들어온 것)
  dequeue(): T | undefined {
    return this.items.shift();
  }

  // 현재 요소 개수
  size(): number {
    return this.items.length;
  }

  // 큐가 비었는지 여부
  isEmpty(): boolean {
    return this.items.length === 0;
  }
}

// number 전용 큐
const numberQueue = new SimpleQueue<number>();
numberQueue.enqueue(10);
numberQueue.enqueue(20);

console.log(numberQueue.dequeue()); // 10
console.log(numberQueue.size()); // 1

// string 전용 큐
const stringQueue = new SimpleQueue<string>();
stringQueue.enqueue('A');
stringQueue.enqueue('B');

console.log(stringQueue.dequeue()); // "A"

// 아래 코드는 컴파일 오류 (numberQueue는 number만 허용)
// numberQueue.enqueue("hello");
// ❌ Argument of type 'string' is not assignable to parameter of type 'number'.

/**
 * 3-4. 제네릭 클래스를 활용한 "리포지토리" 스타일 예제
 * (간단한 메모리 기반 저장소)
 */
class InMemoryRepository<T> {
  private items: T[] = [];

  add(item: T) {
    this.items.push(item);
  }

  getAll(): T[] {
    return this.items;
  }
}

// User 타입만 관리하는 레포지토리
const userRepo = new InMemoryRepository<User>();
userRepo.add({ id: 1, name: 'Alice' });
userRepo.add({ id: 2, name: 'Bob' });

console.log(userRepo.getAll());

/**
 * 3-5. 제네릭 인터페이스 + 클래스 조합 예제
 */
interface KeyValuePair<K, V> {
  key: K;
  value: V;
}

class KeyValueStore<K, V> {
  private items: KeyValuePair<K, V>[] = [];

  set(key: K, value: V) {
    this.items.push({ key, value });
  }

  find(key: K): V | undefined {
    const pair = this.items.find((item) => item.key === key);
    return pair?.value;
  }
}

const stringNumberStore = new KeyValueStore<string, number>();
stringNumberStore.set('apple', 10);
stringNumberStore.set('banana', 20);

console.log(stringNumberStore.find('apple')); // 10
console.log(stringNumberStore.find('orange')); // undefined
