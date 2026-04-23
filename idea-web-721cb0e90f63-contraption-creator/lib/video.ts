import { Video } from 'expo-av';
import * as MediaLibrary from 'expo-media-library';
import { RefObject } from 'react';
import { captureRef } from 'react-native-view-shot';
import { Platform } from 'react-native';

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
  private frameCaptureInterval: NodeJS.Timeout | null = null;
  private frames: string[] = [];
  private maxDuration: number = 15000; // 15 seconds max
  private video: Video | null = null;

  constructor(
    canvasRef: RefObject<any>,
    onRecordingStateChange: (state: RecordingState) => void
  ) {
    this.canvasRef = canvasRef;
    this.onRecordingStateChange = onRecordingStateChange;
    this.video = new Video();
  }

  async startRecording(): Promise<void> {
    // Reset previous recording if any
    if (this.recordingState.recording) {
      await this.stopRecording();
    }

    this.frames = [];
    this.recordingState = {
      isRecording: true,
      startTime: Date.now(),
      duration: 0,
    };

    // Start actual video recording using expo-av
    try {
      const recording = new Video.Recording();
      await recording.prepareToRecordAsync();
      await recording.startAsync();
      this.recordingState.recording = recording;
    } catch (error) {
      console.error('Error starting video recording:', error);
      throw error;
    }

    // Start timer
    this.startTimer();

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

        // Stop if max duration reached
        if (elapsed >= this.maxDuration) {
          this.stopRecording();
        } else {
          this.onRecordingStateChange(this.recordingState);
        }
      }
    }, 100);
  }

  async stopRecording(): Promise<string | null> {
    if (!this.recordingState.isRecording) return null;

    try {
      // Stop timer
      if (this.intervalId) {
        clearInterval(this.intervalId);
        this.intervalId = null;
      }

      // Stop actual video recording
      if (this.recordingState.recording) {
        const videoUri = await this.recordingState.recording.stopAndUnloadAsync();
        const asset = await MediaLibrary.saveToLibraryAsync(videoUri);

        // Add watermark for free users
        // In a real implementation, you would use expo-gl or another video processing library
        // to add the watermark before saving to the camera roll

        return asset.localUri || videoUri;
      }
    } catch (error) {
      console.error('Error saving video:', error);
    } finally {
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
