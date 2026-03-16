import { startRecording, stopRecording } from '../lib/video';

describe('Video Export', () => {
  it('starts recording', async () => {
    const recording = await startRecording();
    expect(recording).toBeDefined();
    expect(recording.isRecording).toBe(true);
  });

  it('stops recording and returns URI', async () => {
    const recording = await startRecording();
    const uri = await stopRecording(recording);
    expect(uri).toMatch(/\.mp4$/);
  });
});
