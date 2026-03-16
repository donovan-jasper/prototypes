import { Task } from '@/types';
import { ImageClassifier } from './imageClassifier';
import { TextProcessor } from './textProcessor';
import { BatteryMonitor } from '../background/batteryMonitor';

export class TaskExecutor {
  private imageClassifier: ImageClassifier;
  private textProcessor: TextProcessor;
  private batteryMonitor: BatteryMonitor;
  private activeTasks: Map<string, { cancel: () => void }> = new Map();

  constructor(imageClassifier: ImageClassifier, textProcessor: TextProcessor, batteryMonitor: BatteryMonitor) {
    this.imageClassifier = imageClassifier;
    this.textProcessor = textProcessor;
    this.batteryMonitor = batteryMonitor;
  }

  async execute(task: Task): Promise<Task> {
    const cancelToken = { isCancelled: false };
    this.activeTasks.set(task.id, {
      cancel: () => { cancelToken.isCancelled = true; }
    });

    try {
      let result: Task;

      switch (task.type) {
        case 'organize_photos':
          result = await this.executePhotoOrganization(task, cancelToken);
          break;
        case 'process_documents':
          result = await this.executeDocumentProcessing(task, cancelToken);
          break;
        default:
          throw new Error(`Unknown task type: ${task.type}`);
      }

      this.activeTasks.delete(task.id);
      return result;
    } catch (error) {
      this.activeTasks.delete(task.id);
      throw error;
    }
  }

  cancel(taskId: string): void {
    const task = this.activeTasks.get(taskId);
    if (task) {
      task.cancel();
    }
  }

  private async executePhotoOrganization(task: Task, cancelToken: { isCancelled: boolean }): Promise<Task> {
    // Implement photo organization logic
    // This is a simplified version
    const result = { ...task, status: 'completed', filesProcessed: 42 };
    return result;
  }

  private async executeDocumentProcessing(task: Task, cancelToken: { isCancelled: boolean }): Promise<Task> {
    // Implement document processing logic
    // This is a simplified version
    const result = { ...task, status: 'completed', filesProcessed: 5 };
    return result;
  }
}
