// user.js - 혼합 사용
export default class User {
  constructor(name, email) {
    this.name = name;
    this.email = email;
  }
}

export const USER_ROLES = {
  ADMIN: 'admin',
  USER: 'user',
  GUEST: 'guest',
};

export function validateEmail(email) {
  return email.includes('@');
}
