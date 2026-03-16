import React from 'react';
import { render } from '@testing-library/react-native';
import SnapshotCard from '../../components/SnapshotCard';

describe('SnapshotCard', () => {
  test('renders snapshot information', () => {
    const snapshot = {
      id: '1',
      name: 'Test Snapshot',
      source_connection: 'test-db',
      created_at: '2023-01-01T00:00:00Z',
      row_count: 100,
    };

    const { getByText } = render(<SnapshotCard snapshot={snapshot} />);

    expect(getByText('Test Snapshot')).toBeTruthy();
    expect(getByText('Source: test-db')).toBeTruthy();
    expect(getByText('Rows: 100')).toBeTruthy();
  });
});
