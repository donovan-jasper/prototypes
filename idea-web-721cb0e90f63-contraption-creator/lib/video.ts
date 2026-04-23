import { Video } from 'expo-av';
import * as MediaLibrary from 'expo-media-library';
import { RefObject } from 'react';
import { captureRef } from 'react-native-view-shot';
import { Platform } from 'react-native';
import { Image } from 'react-native';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';

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
  private frameRate: number = 30; // frames per second
  private isPremium: boolean;

  constructor(
    canvasRef: RefObject<any>,
    onRecordingStateChange: (state: RecordingState) => void,
    isPremium: boolean
  ) {
    this.canvasRef = canvasRef;
    this.onRecordingStateChange = onRecordingStateChange;
    this.video = new Video();
    this.isPremium = isPremium;
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

    // Start capturing frames
    this.startFrameCapture();

    // Start timer
    this.startTimer();

    this.onRecordingStateChange(this.recordingState);
  }

  private startFrameCapture(): void {
    if (this.frameCaptureInterval) clearInterval(this.frameCaptureInterval);

    this.frameCaptureInterval = setInterval(async () => {
      if (this.canvasRef.current && this.recordingState.isRecording) {
        try {
          const frame = await captureRef(this.canvasRef, {
            format: 'jpg',
            quality: 0.8,
          });
          this.frames.push(frame);
        } catch (error) {
          console.error('Error capturing frame:', error);
        }
      }
    }, 1000 / this.frameRate);
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

      if (this.frames.length > 0) {
        // Process frames into video
        const videoUri = await this.createVideoFromFrames();

        // Save to media library
        const asset = await MediaLibrary.saveToLibraryAsync(videoUri);

        return asset.localUri || videoUri;
      }
    } catch (error) {
      console.error('Error saving video:', error);
      throw error;
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

  private async createVideoFromFrames(): Promise<string> {
    // In a real implementation, you would use a proper video encoding library
    // This is a simplified version that just combines frames with watermark

    // For demo purposes, we'll just take the first frame and add watermark
    const firstFrame = this.frames[0];

    if (!firstFrame) {
      throw new Error('No frames captured');
    }

    // Add watermark if not premium
    if (!this.isPremium) {
      const watermarkImage = await Image.resolveAssetSource(require('../assets/watermark.png'));
      const watermarkUri = watermarkImage.uri;

      const manipResult = await manipulateAsync(
        firstFrame,
        [
          {
            resize: { width: 300, height: 300 }
          },
          {
            overlay: {
              uri: watermarkUri,
              width: 100,
              height: 50,
              position: { x: 10, y: 10 }
            }
          }
        ],
        { compress: 0.8, format: SaveFormat.JPEG }
      );

      return manipResult.uri;
    }

    return firstFrame;
  }

  getRecordingState(): RecordingState {
    return this.recordingState;
  }
}
