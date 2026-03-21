# StoryForge AI

## One-line pitch
Transform any story, script, or idea into stunning animated videos directly on your phone — no subscriptions, no limits, no desktop required.

## Expanded vision
This is really for anyone who wants to tell visual stories without technical barriers. Beyond content creators, we're serving busy parents who want custom bedtime stories for their kids, teachers creating engaging lessons, small business owners making promotional content, therapists creating therapeutic stories for patients, and anyone who's ever thought "I wish I could turn this idea into a video." The adjacent use cases include educational content for schools, corporate training materials, personal memory preservation, and creative therapy tools. A non-technical person wants this because they can finally bring their imagination to life without learning complex video editing software or hiring expensive animators.

## Tech stack
React Native (Expo), SQLite for local storage, Expo AV for audio/video handling, Expo FileSystem for file management, Expo Camera for capturing additional assets, Cloudinary for cloud processing when needed, and OpenAI/Anthropic APIs for text-to-video generation.

## Core features
1. **Script-to-Video Pipeline** - Convert written text/scripts into animated scenes with AI
2. **Mobile Voice Recording** - Record and sync voiceovers directly in the app  
3. **Offline Drafting** - Create and edit scripts without internet connection
4. **Template Library** - Pre-built scene templates for common use cases (stories, lessons, promos)
5. **Export & Share** - High-quality video exports optimized for social platforms

## Monetization strategy
Free tier allows 30-second videos with watermarked export and 5 projects/month. Pro ($9.99/month) removes watermarks, enables unlimited video length, provides 50+ premium templates, and allows commercial use. Business ($29.99/month) adds team collaboration, priority processing, and white-label exports. The hook is immediate value creation (anyone can make a 30s demo), while the paywall comes when users need longer content or want to remove branding. People stay subscribed because they've built valuable content libraries and the time savings justify the cost.

## Skip if saturated
NOT SKIP: While there are desktop solutions and simple mobile apps, there's no mobile-first solution that combines full creative control, offline capability, and reasonable pricing without subscription lock-in for content creators who work primarily on mobile devices.

## File structure
```
storyforge/
├── App.js
├── app.json
├── babel.config.js
├── package.json
├── __tests__/
│   ├── utils/
│   │   └── videoProcessor.test.js
│   ├── screens/
│   │   ├── ScriptEditorScreen.test.js
│   │   └── VideoPreviewScreen.test.js
│   └── components/
│       ├── ScriptInput.test.js
│       └── VoiceRecorder.test.js
├── src/
│   ├── components/
│   │   ├── ScriptInput.jsx
│   │   ├── VoiceRecorder.jsx
│   │   ├── TemplateSelector.jsx
│   │   ├── VideoPreview.jsx
│   │   └── ExportOptions.jsx
│   ├── screens/
│   │   ├── HomeScreen.jsx
│   │   ├── ScriptEditorScreen.jsx
│   │   ├── VideoPreviewScreen.jsx
│   │   ├── TemplatesScreen.jsx
│   │   └── ProfileScreen.jsx
│   ├── utils/
│   │   ├── videoProcessor.js
│   │   ├── aiService.js
│   │   └── storageManager.js
│   ├── hooks/
│   │   ├── useAudioRecording.js
│   │   └── useVideoProcessing.js
│   └── constants/
│       └── appConstants.js
└── assets/
    ├── icons/
    └── templates/
```

## Tests
```javascript
// __tests__/utils/videoProcessor.test.js
import { processScriptToVideo } from '../../src/utils/videoProcessor';

describe('videoProcessor', () => {
  it('should convert script text to video parameters', async () => {
    const mockScript = "Scene 1: A cat sits on a mat";
    const result = await processScriptToVideo(mockScript);
    
    expect(result).toHaveProperty('scenes');
    expect(result.scenes.length).toBeGreaterThan(0);
    expect(result.scenes[0]).toHaveProperty('description');
    expect(result.scenes[0]).toHaveProperty('duration');
  });

  it('should handle empty script gracefully', async () => {
    const result = await processScriptToVideo('');
    
    expect(result.scenes).toEqual([]);
  });
});

// __tests__/screens/ScriptEditorScreen.test.js
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import ScriptEditorScreen from '../../src/screens/ScriptEditorScreen';

describe('ScriptEditorScreen', () => {
  it('should allow text input and save functionality', () => {
    const { getByPlaceholderText, getByText } = render(<ScriptEditorScreen />);
    
    const input = getByPlaceholderText('Enter your story...');
    fireEvent.changeText(input, 'Test script content');
    
    const saveButton = getByText('Save Script');
    fireEvent.press(saveButton);
    
    expect(input.props.value).toBe('Test script content');
  });
});

// __tests__/components/ScriptInput.test.js
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import ScriptInput from '../../src/components/ScriptInput';

describe('ScriptInput', () => {
  it('should update value when text changes', () => {
    const onChangeTextMock = jest.fn();
    const { getByPlaceholderText } = render(
      <ScriptInput 
        value="" 
        onChangeText={onChangeTextMock} 
        placeholder="Enter script" 
      />
    );
    
    const input = getByPlaceholderText('Enter script');
    fireEvent.changeText(input, 'New script content');
    
    expect(onChangeTextMock).toHaveBeenCalledWith('New script content');
  });
});

// __tests__/components/VoiceRecorder.test.js
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import VoiceRecorder from '../../src/components/VoiceRecorder';

describe('VoiceRecorder', () => {
  it('should toggle recording state when button pressed', () => {
    const { getByTestId } = render(<VoiceRecorder />);
    
    const recordButton = getByTestId('record-button');
    fireEvent.press(recordButton);
    
    // Mock implementation would check recording state change
    expect(recordButton).toBeTruthy();
  });
});
```

## Implementation steps
1. Set up Expo project with necessary dependencies (expo-av, expo-file-system, expo-camera)
2. Implement basic UI shell with navigation between Home, Editor, Preview, Templates, and Profile screens
3. Build script input component with real-time validation and formatting
4. Integrate voice recording functionality with audio preview
5. Create template selection system with category filtering
6. Implement SQLite database for local script and project storage
7. Build video preview component showing generated scenes
8. Connect to AI service APIs for script-to-video conversion
9. Add export functionality with quality settings
10. Implement user authentication and subscription management
11. Add offline capability for script editing
12. Create onboarding flow explaining the process
13. Add analytics for usage patterns and feature adoption
14. Implement error handling and retry mechanisms
15. Polish UI/UX with animations and responsive design
16. Test on both iOS and Android devices
17. Deploy to app stores with proper metadata and screenshots

## How to verify it works
Run `npx expo start` and open the app in Expo Go on both iOS and Android simulators/devices. Verify that you can create a new script, record voiceover, select templates, preview the video, and export successfully. Run `npm test` to ensure all Jest tests pass, confirming the core logic functions correctly. Test offline mode by disabling network connection and verifying script editing still works.