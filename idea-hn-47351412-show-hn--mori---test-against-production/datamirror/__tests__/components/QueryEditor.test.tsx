import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import QueryEditor from '../../components/QueryEditor';

describe('QueryEditor', () => {
  test('updates query text', () => {
    const onChangeText = jest.fn();
    const { getByPlaceholderText } = render(<QueryEditor value="" onChangeText={onChangeText} />);

    const input = getByPlaceholderText('Enter your query');
    fireEvent.changeText(input, 'SELECT * FROM users');

    expect(onChangeText).toHaveBeenCalledWith('SELECT * FROM users');
  });
});
