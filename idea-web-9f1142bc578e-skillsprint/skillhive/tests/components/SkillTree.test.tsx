import React from 'react';
import { render } from '@testing-library/react-native';
import SkillTree from '../../app/components/SkillTree';

describe('SkillTree', () => {
  it('renders correctly', () => {
    const skills = [
      { id: '1', name: 'Beginner', x: 50, y: 50, unlocked: true },
      { id: '2', name: 'Intermediate', x: 150, y: 150, unlocked: false },
    ];
    const connections = [{ from: '1', to: '2' }];

    const { getByText } = render(<SkillTree skills={skills} connections={connections} />);
    expect(getByText('Beginner')).toBeTruthy();
    expect(getByText('Intermediate')).toBeTruthy();
  });
});
