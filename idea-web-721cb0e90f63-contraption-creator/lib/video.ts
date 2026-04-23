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

  constructor(
    canvasRef: RefObject<any>,
    onRecordingStateChange: (state: RecordingState) => void
  ) {
    this.canvasRef = canvasRef;
    this.onRecordingStateChange = onRecordingStateChange;
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

    // Start frame capture at 30fps
    this.frameCaptureInterval = setInterval(async () => {
      if (this.canvasRef.current) {
        try {
          const uri = await captureRef(this.canvasRef, {
            format: 'jpg',
            quality: 0.8,
            result: 'tmpfile',
          });
          this.frames.push(uri);
        } catch (error) {
          console.error('Error capturing frame:', error);
        }
      }
    }, 1000 / 30); // 30fps

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
      // Stop frame capture
      if (this.frameCaptureInterval) {
        clearInterval(this.frameCaptureInterval);
        this.frameCaptureInterval = null;
      }

      // Stop timer
      if (this.intervalId) {
        clearInterval(this.intervalId);
        this.intervalId = null;
      }

      // Process frames to create video
      if (this.frames.length > 0) {
        // In a real implementation, you would use a video processing library
        // to combine the frames into a video file. For this prototype, we'll
        // just save the last frame as a JPEG and return its URI.

        const lastFrameUri = this.frames[this.frames.length - 1];

        // Save to media library
        const asset = await MediaLibrary.saveToLibraryAsync(lastFrameUri);

        // Clean up temporary files
        for (const frame of this.frames) {
          // In a real implementation, you would delete the temporary files
          // Here we just keep them for the prototype
        }

        return asset.localUri || lastFrameUri;
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
