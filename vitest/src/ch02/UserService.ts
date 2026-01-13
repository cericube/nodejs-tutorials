export interface User {
  id: string;
  email: string;
  name: string;
}

export class UserService {
  private users: Map<string, User> = new Map();

  /**
   * 새로운 사용자를 생성합니다.
   * @param email 사용자 이메일
   * @param name 사용자 이름
   * @throws Error 잘못된 이메일 형식이나 이름이 비어있을 경우
   */
  createUser(email: string, name: string): User {
    // 1. 유효성 검사: 이름 (Name is required)
    if (!name || name.trim() === '') {
      throw new Error('Name is required');
    }

    // 2. 유효성 검사: 이메일 형식 (간단한 regex 사용)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error('Invalid email format');
    }

    // 3. 사용자 객체 생성 및 ID 할당 (랜덤 문자열)
    const newUser: User = {
      id: Math.random().toString(36).substring(2, 11),
      email,
      name,
    };

    // 4. 저장소(Map)에 저장
    this.users.set(newUser.id, newUser);

    return newUser;
  }

  /**
   * ID로 사용자를 조회합니다.
   * @param id 사용자 ID
   * @returns User 객체 또는 null
   */
  findById(id: string): User | null {
    return this.users.get(id) || null;
  }
}
