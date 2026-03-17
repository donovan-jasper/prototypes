import { describe, it, expect } from 'vitest';
import { getRandomProblems, getProblemsByDomain, getProblemsByDifficulty } from './problems.js';
import allProblems from './problems.js';

describe('Problems Data', () => {
  it('should have at least 30 problems', () => {
    expect(allProblems.length).toBeGreaterThanOrEqual(30);
  });

  it('should have problems in all 4 domains', () => {
    const domains = new Set(allProblems.map(p => p.domain));
    expect(domains.has('logic')).toBe(true);
    expect(domains.has('math')).toBe(true);
    expect(domains.has('verbal')).toBe(true);
    expect(domains.has('strategy')).toBe(true);
  });

  it('should have problems in all 3 difficulty levels', () => {
    const difficulties = new Set(allProblems.map(p => p.difficulty));
    expect(difficulties.has('easy')).toBe(true);
    expect(difficulties.has('medium')).toBe(true);
    expect(difficulties.has('hard')).toBe(true);
  });

  it('should have valid problem structure', () => {
    allProblems.forEach(problem => {
      expect(problem).toHaveProperty('question');
      expect(problem).toHaveProperty('options');
      expect(problem).toHaveProperty('correctAnswer');
      expect(problem).toHaveProperty('domain');
      expect(problem).toHaveProperty('difficulty');
      expect(problem.options).toHaveLength(4);
      expect(problem.correctAnswer).toBeGreaterThanOrEqual(0);
      expect(problem.correctAnswer).toBeLessThan(4);
    });
  });
});

describe('getRandomProblems', () => {
  it('should return requested number of problems', () => {
    const problems = getRandomProblems(5);
    expect(problems).toHaveLength(5);
  });

  it('should filter by difficulty when specified', () => {
    const easyProblems = getRandomProblems(5, 'easy');
    expect(easyProblems.every(p => p.difficulty === 'easy')).toBe(true);
  });

  it('should return all problems when count exceeds available', () => {
    const problems = getRandomProblems(1000);
    expect(problems.length).toBeLessThanOrEqual(allProblems.length);
  });

  it('should return different problems on multiple calls', () => {
    const set1 = getRandomProblems(10);
    const set2 = getRandomProblems(10);
    const same = set1.every((p, i) => p === set2[i]);
    expect(same).toBe(false);
  });
});

describe('getProblemsByDomain', () => {
  it('should return problems from specified domain', () => {
    const logicProblems = getProblemsByDomain('logic', 5);
    expect(logicProblems.every(p => p.domain === 'logic')).toBe(true);
  });

  it('should return requested count', () => {
    const mathProblems = getProblemsByDomain('math', 3);
    expect(mathProblems).toHaveLength(3);
  });
});

describe('getProblemsByDifficulty', () => {
  it('should return all problems of specified difficulty', () => {
    const hardProblems = getProblemsByDifficulty('hard');
    expect(hardProblems.every(p => p.difficulty === 'hard')).toBe(true);
  });

  it('should return multiple problems', () => {
    const mediumProblems = getProblemsByDifficulty('medium');
    expect(mediumProblems.length).toBeGreaterThan(0);
  });
});
