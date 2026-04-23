import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import QueryBuilder from '../components/QueryBuilder';

describe('QueryBuilder', () => {
  const mockOnQueryChange = jest.fn();
  const tables = ['sales', 'customers', 'orders', 'products'];

  it('renders correctly', () => {
    const { getByText } = render(
      <QueryBuilder tables={tables} onQueryChange={mockOnQueryChange} />
    );
    expect(getByText('Query Builder')).toBeTruthy();
  });

  it('allows table selection', () => {
    const { getByText } = render(
      <QueryBuilder tables={tables} onQueryChange={mockOnQueryChange} />
    );

    fireEvent.press(getByText('sales'));
    expect(getByText('sales')).toBeTruthy();
  });

  it('allows column selection', () => {
    const { getByText } = render(
      <QueryBuilder tables={tables} onQueryChange={mockOnQueryChange} />
    );

    fireEvent.press(getByText('sales'));
    fireEvent.press(getByText('amount'));
    expect(getByText('amount')).toBeTruthy();
  });

  it('builds a query with selected columns', () => {
    const { getByText } = render(
      <QueryBuilder tables={tables} onQueryChange={mockOnQueryChange} />
    );

    fireEvent.press(getByText('sales'));
    fireEvent.press(getByText('amount'));
    fireEvent.press(getByText('date'));
    fireEvent.press(getByText('Build Query'));

    expect(mockOnQueryChange).toHaveBeenCalledWith('SELECT amount, date FROM sales;');
  });

  it('allows adding filters', () => {
    const { getByText } = render(
      <QueryBuilder tables={tables} onQueryChange={mockOnQueryChange} />
    );

    fireEvent.press(getByText('sales'));
    fireEvent.press(getByText('Add Filter'));
    expect(getByText('Field:')).toBeTruthy();
  });
});
