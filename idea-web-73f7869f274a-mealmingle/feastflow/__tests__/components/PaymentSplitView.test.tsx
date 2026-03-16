import React from 'react';
import { render } from '@testing-library/react-native';
import PaymentSplitView from '../../components/PaymentSplitView';

describe('PaymentSplitView', () => {
  it('should render payment split details', () => {
    const mockSplit = {
      total: 25,
      perPerson: 12.5,
      participants: [
        { id: 1, name: 'Participant 1', amount: 12.5 },
        { id: 2, name: 'Participant 2', amount: 12.5 },
      ],
    };

    const { getByText } = render(<PaymentSplitView split={mockSplit} />);

    expect(getByText('Total: $25.00')).toBeTruthy();
    expect(getByText('Per Person: $12.50')).toBeTruthy();
    expect(getByText('Participant 1')).toBeTruthy();
    expect(getByText('Participant 2')).toBeTruthy();
  });
});
