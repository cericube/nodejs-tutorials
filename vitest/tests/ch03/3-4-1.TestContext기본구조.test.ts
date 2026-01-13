import { describe, it, expect } from 'vitest';

describe('Test Context 기본 구조', () => {
  //
  // 1. Context 기본 구조.
  it('Context 기본 구조 테스트', ({ task }) => {
    // console.log(`실행 중인 테스트:{task.name}`);
    console.log(task);
    expect(task.name).toBe('Context 기본 구조 테스트');
    expect(task.type).toBe('test');
  });
});
