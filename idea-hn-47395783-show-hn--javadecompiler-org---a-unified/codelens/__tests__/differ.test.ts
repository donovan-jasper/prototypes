import { diffFiles, matchFiles } from '../lib/comparison/differ';

describe('Code Differ', () => {
  it('should identify added lines', () => {
    const oldCode = 'line1\nline2';
    const newCode = 'line1\nline2\nline3';
    const diff = diffFiles(oldCode, newCode);
    expect(diff.additions).toHaveLength(1);
  });

  it('should identify removed lines', () => {
    const oldCode = 'line1\nline2\nline3';
    const newCode = 'line1\nline3';
    const diff = diffFiles(oldCode, newCode);
    expect(diff.removals).toHaveLength(1);
  });

  it('should match files by path similarity', () => {
    const files1 = ['com/app/MainActivity.java'];
    const files2 = ['com/app/MainActivity.java', 'com/app/NewActivity.java'];
    const matches = matchFiles(files1, files2);
    expect(matches).toHaveLength(1);
  });
});
