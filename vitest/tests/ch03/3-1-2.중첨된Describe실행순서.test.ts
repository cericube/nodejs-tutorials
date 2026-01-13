import { describe, beforeEach, it } from 'vitest';

describe('outer', () => {
  beforeEach(() => console.log('outer beforeEach'));

  describe('inner', () => {
    beforeEach(() => console.log('inner beforeEach'));

    it('test', () => {
      console.log('test case body');
    });
  });
});
