//
//any = 타입 시스템 완전 무시 (위험)
//unknown = 타입은 모르지만, 사용 전에 반드시 검사 (안전)

export class AppError extends Error {
  //public / private / protected / readonly가 붙은 생성자 파라미터
  // → 자동으로 클래스 필드 생성
  // 아무것도 안 붙은 파라미터
  // → 그냥 지역 변수 (constructor scope)

  constructor(
    // 자동으로 클래스 필드 생성
    public statusCode: number,
    public code: string,
    message: string, // 지역변수
    public details?: unknown,
  ) {
    //this.message : Error 부모의 public 필드
    super(message);
    this.name = 'AppError';
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: unknown) {
    super(400, 'VALIDATION_ERROR', message, details);
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string, id?: string) {
    const chid: string = id ?? ''; //Nullish 병합연산자
    super(404, 'NOT_FOUND', `${resource}${chid}을(를) 찾을 수 없습니다`, {
      resource,
      id,
    });
    this.name = 'NotFoundError';
  }
}
export class ConflictError extends AppError {
  constructor(message: string, details?: unknown) {
    super(409, 'CONFLICT', message, details);
    this.name = 'ConflictError';
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = '인증이 필요합니다') {
    super(401, 'UNAUTHORIZED', message);
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = '접근 권한이 없습니다') {
    super(403, 'FORBIDDEN', message);
    this.name = 'ForbiddenError';
  }
}

export class InternalServerError extends AppError {
  constructor(message: string = '서버 오류가 발생했습니다', details?: unknown) {
    super(500, 'INTERNAL_SERVER_ERROR', message, details);
    this.name = 'InternalServerError';
  }
}
