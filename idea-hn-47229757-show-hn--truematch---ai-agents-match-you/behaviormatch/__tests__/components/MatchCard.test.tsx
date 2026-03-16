import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import MatchCard from '../../components/MatchCard';
import { useMatches } from '../../hooks/useMatches';

jest.mock('../../hooks/useMatches');

describe('MatchCard', () => {
  const mockMatch = {
    id: 'match1',
    matchedUser: {
      name: 'Test User',
      age: 25,
    },
    compatibilityScore: 85,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render match card', () => {
    useMatches.mockReturnValue({
      acceptMatch: jest.fn(),
      passMatch: jest.fn(),
    });

    const { getByText } = render(<MatchCard match={mockMatch} />);

    expect(getByText('Test User')).toBeTruthy();
    expect(getByText('25')).toBeTruthy();
    expect(getByText('85')).toBeTruthy();
    expect(getByText('Pass')).toBeTruthy();
    expect(getByText('Accept')).toBeTruthy();
  });

  it('should call passMatch when Pass button is pressed', () => {
    const passMatchMock = jest.fn();
    useMatches.mockReturnValue({
      acceptMatch: jest.fn(),
      passMatch: passMatchMock,
    });

    const { getByText } = render(<MatchCard match={mockMatch} />);

    fireEvent.press(getByText('Pass'));

    expect(passMatchMock).toHaveBeenCalledWith('match1');
  });

  it('should call acceptMatch when Accept button is pressed', () => {
    const acceptMatchMock = jest.fn();
    useMatches.mockReturnValue({
      acceptMatch: acceptMatchMock,
      passMatch: jest.fn(),
    });

    const { getByText } = render(<MatchCard match={mockMatch} />);

    fireEvent.press(getByText('Accept'));

    expect(acceptMatchMock).toHaveBeenCalledWith('match1');
  });
});
