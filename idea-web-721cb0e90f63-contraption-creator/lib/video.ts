import { Video } from 'expo-av';
import * as MediaLibrary from 'expo-media-library';
import { RefObject } from 'react';
import { captureRef } from 'react-native-view-shot';

interface RecordingState {
  isRecording: boolean;
  startTime: number | null;
  duration: number;
  recording?: Video.Recording;
}

export class VideoRecorder {
  private canvasRef: RefObject<any>;
  private onRecordingStateChange: (state: RecordingState) => void;
  private recordingState: RecordingState = {
    isRecording: false,
    startTime: null,
    duration: 0,
  };
  private intervalId: NodeJS.Timeout | null = null;

  constructor(
    canvasRef: RefObject<any>,
    onRecordingStateChange: (state: RecordingState) => void
  ) {
    this.canvasRef = canvasRef;
    this.onRecordingStateChange = onRecordingStateChange;
  }

  async startRecording(maxDuration: number = 15000): Promise<void> {
    const { status } = await MediaLibrary.requestPermissionsAsync();
    if (status !== 'granted') {
      throw new Error('Camera roll permissions are required to save videos');
    }

    const recording = new Video.Recording();
    await recording.prepareToRecordAsync();
    recording.setOnRecordingStatusUpdate((status) => {
      if (status.isRecording) {
        this.recordingState = {
          ...this.recordingState,
          isRecording: true,
          startTime: Date.now(),
        };
        this.startTimer();
      } else if (status.isDoneRecording) {
        this.stopRecording();
      }
    });

    await recording.startAsync();
    this.recordingState = {
      ...this.recordingState,
      recording,
    };
    this.onRecordingStateChange(this.recordingState);
  }

  private startTimer(): void {
    if (this.intervalId) clearInterval(this.intervalId);

    this.intervalId = setInterval(() => {
      if (this.recordingState.startTime) {
        const elapsed = Date.now() - this.recordingState.startTime;
        this.recordingState = {
          ...this.recordingState,
          duration: elapsed,
        };
        this.onRecordingStateChange(this.recordingState);
      }
    }, 100);
  }

  async stopRecording(): Promise<string | null> {
    if (!this.recordingState.recording) return null;

    try {
      await this.recordingState.recording.stopAndUnloadAsync();
      const uri = this.recordingState.recording.getURI();

      if (uri) {
        // Capture canvas as image for thumbnail
        const thumbnailUri = await captureRef(this.canvasRef, {
          format: 'jpg',
          quality: 0.8,
        });

        // Save to media library
        await MediaLibrary.saveToLibraryAsync(uri);
        if (thumbnailUri) {
          await MediaLibrary.saveToLibraryAsync(thumbnailUri);
        }

        return uri;
      }
    } catch (error) {
      console.error('Error saving video:', error);
    } finally {
      if (this.intervalId) {
        clearInterval(this.intervalId);
        this.intervalId = null;
      }
      this.recordingState = {
        isRecording: false,
        startTime: null,
        duration: 0,
      };
      this.onRecordingStateChange(this.recordingState);
    }

    return null;
  }

  getRecordingState(): RecordingState {
    return this.recordingState;
  }
}
