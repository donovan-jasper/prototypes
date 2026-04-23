import { render, fireEvent, waitFor } from '@testing-library/react-native';
import PostComposer from '../PostComposer';
import { refinePost } from '@/lib/ai';
import { publishPost as publishToThreads } from '@/lib/threads';
import { publishToBluesky } from '@/lib/bluesky';
import { saveScheduledPost } from '@/lib/db';

// Mock the AI and social API functions
jest.mock('@/lib/ai', () => ({
  refinePost: jest.fn(),
}));

jest.mock('@/lib/threads', () => ({
  publishPost: jest.fn(),
}));

jest.mock('@/lib/bluesky', () => ({
  publishToBluesky: jest.fn(),
}));

jest.mock('@/lib/db', () => ({
  saveScheduledPost: jest.fn(),
}));

describe('PostComposer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render correctly', () => {
    const { getByPlaceholderText, getByText } = render(<PostComposer />);
    expect(getByPlaceholderText('What do you want to post?')).toBeTruthy();
    expect(getByText('✨ Enhance with AI')).toBeTruthy();
    expect(getByText('Post Now')).toBeTruthy();
    expect(getByText('Schedule')).toBeTruthy();
  });

  it('should show character count', () => {
    const { getByPlaceholderText, getByText } = render(<PostComposer />);
    const input = getByPlaceholderText('What do you want to post?');

    fireEvent.changeText(input, 'Hello');
    expect(getByText('5/500')).toBeTruthy();

    fireEvent.changeText(input, 'This is a longer message that exceeds the character limit');
    expect(getByText('500/500')).toBeTruthy();
  });

  it('should refine text when user taps enhance button', async () => {
    const mockRefinedText = 'This is an enhanced post with better tone and hashtags #example #socialmedia';
    (refinePost as jest.Mock).mockResolvedValue(mockRefinedText);

    const { getByPlaceholderText, getByText, queryByText } = render(<PostComposer />);
    const input = getByPlaceholderText('What do you want to post?');

    fireEvent.changeText(input, 'just made a new thing check it out');
    fireEvent.press(getByText('✨ Enhance with AI'));

    await waitFor(() => {
      expect(refinePost).toHaveBeenCalledWith('just made a new thing check it out', 'friendly');
      expect(input.props.value).toBe(mockRefinedText);
      expect(queryByText('AI Suggested:')).toBeTruthy();
      expect(queryByText(mockRefinedText)).toBeTruthy();
    });
  });

  it('should show error when AI enhancement fails', async () => {
    const mockError = new Error('API error');
    (refinePost as jest.Mock).mockRejectedValue(mockError);

    const { getByPlaceholderText, getByText, queryByText } = render(<PostComposer />);
    const input = getByPlaceholderText('What do you want to post?');

    fireEvent.changeText(input, 'test post');
    fireEvent.press(getByText('✨ Enhance with AI'));

    await waitFor(() => {
      expect(queryByText('Enhancement Failed')).toBeTruthy();
    });
  });

  it('should post to selected platform when Post Now is pressed', async () => {
    (publishToThreads as jest.Mock).mockResolvedValue({});
    (publishToBluesky as jest.Mock).mockResolvedValue({});

    const { getByPlaceholderText, getByText } = render(<PostComposer />);
    const input = getByPlaceholderText('What do you want to post?');

    fireEvent.changeText(input, 'Test post content');
    fireEvent.press(getByText('Post Now'));

    await waitFor(() => {
      expect(publishToThreads).toHaveBeenCalledWith('Test post content');
      expect(publishToBluesky).toHaveBeenCalledWith('Test post content');
    });
  });

  it('should schedule post when Schedule is pressed', async () => {
    (saveScheduledPost as jest.Mock).mockResolvedValue({});

    const { getByPlaceholderText, getByText } = render(<PostComposer />);
    const input = getByPlaceholderText('What do you want to post?');

    fireEvent.changeText(input, 'Scheduled post');
    fireEvent.press(getByText('Schedule'));

    await waitFor(() => {
      expect(saveScheduledPost).toHaveBeenCalledWith({
        content: 'Scheduled post',
        platform: 'both',
        scheduledFor: expect.any(Date),
      });
    });
  });

  it('should disable buttons when content is empty', () => {
    const { getByText } = render(<PostComposer />);

    const enhanceButton = getByText('✨ Enhance with AI');
    const postButton = getByText('Post Now');
    const scheduleButton = getByText('Schedule');

    expect(enhanceButton.props.disabled).toBe(true);
    expect(postButton.props.disabled).toBe(true);
    expect(scheduleButton.props.disabled).toBe(true);
  });

  it('should show loading indicators during operations', async () => {
    (refinePost as jest.Mock).mockImplementation(() => new Promise(resolve => setTimeout(() => resolve('Enhanced'), 100)));

    const { getByPlaceholderText, getByText, getByTestId } = render(<PostComposer />);
    const input = getByPlaceholderText('What do you want to post?');

    fireEvent.changeText(input, 'test');
    fireEvent.press(getByText('✨ Enhance with AI'));

    expect(getByText('✨ Enhance with AI')).toBeTruthy();
    await waitFor(() => {
      expect(getByText('Enhanced')).toBeTruthy();
    });
  });

  it('should clear content and AI response after successful post', async () => {
    (publishToThreads as jest.Mock).mockResolvedValue({});
    (publishToBluesky as jest.Mock).mockResolvedValue({});

    const { getByPlaceholderText, getByText, queryByText } = render(<PostComposer />);
    const input = getByPlaceholderText('What do you want to post?');

    fireEvent.changeText(input, 'Test post');
    fireEvent.press(getByText('✨ Enhance with AI'));

    await waitFor(() => {
      expect(queryByText('AI Suggested:')).toBeTruthy();
    });

    fireEvent.press(getByText('Post Now'));

    await waitFor(() => {
      expect(input.props.value).toBe('');
      expect(queryByText('AI Suggested:')).toBeNull();
    });
  });

  it('should clear content and AI response after successful schedule', async () => {
    (saveScheduledPost as jest.Mock).mockResolvedValue({});

    const { getByPlaceholderText, getByText, queryByText } = render(<PostComposer />);
    const input = getByPlaceholderText('What do you want to post?');

    fireEvent.changeText(input, 'Test post');
    fireEvent.press(getByText('✨ Enhance with AI'));

    await waitFor(() => {
      expect(queryByText('AI Suggested:')).toBeTruthy();
    });

    fireEvent.press(getByText('Schedule'));

    await waitFor(() => {
      expect(input.props.value).toBe('');
      expect(queryByText('AI Suggested:')).toBeNull();
    });
  });
});
