import React from 'react';
import { render } from '@testing-library/react-native';
import IssueList from '../src/components/IssueList';
import PRReview from '../src/components/PRReview';

test('renders IssueList component', () => {
  const issues = [
    { id: '1', title: 'Issue 1', state: 'open' },
    { id: '2', title: 'Issue 2', state: 'closed' },
  ];
  const { getByText } = render(<IssueList issues={issues} />);
  expect(getByText('Issue 1')).toBeTruthy();
  expect(getByText('Issue 2')).toBeTruthy();
});

test('renders PRReview component', () => {
  const onApprove = jest.fn();
  const onReject = jest.fn();
  const { getByText } = render(
    <PRReview prTitle="Fix login bug" onApprove={onApprove} onReject={onReject} />
  );
  expect(getByText('Fix login bug')).toBeTruthy();
  expect(getByText('Approve')).toBeTruthy();
  expect(getByText('Reject')).toBeTruthy();
});
