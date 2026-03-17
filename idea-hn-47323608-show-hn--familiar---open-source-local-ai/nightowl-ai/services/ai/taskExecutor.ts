import { Task } from '@/types';
import { ImageClassifier } from './imageClassifier';
import { TextProcessor } from './textProcessor';
import { BatteryMonitor } from '../background/batteryMonitor';
import { FileManager } from '../storage/fileManager';
import { Database } from '../storage/database';

export class TaskExecutor {
  private imageClassifier: ImageClassifier;
  private textProcessor: TextProcessor;
  private batteryMonitor: BatteryMonitor;
  private fileManager: FileManager;
  private database: Database;
  private activeTasks: Map<string, { cancel: () => void }> = new Map();

  constructor(
    imageClassifier: ImageClassifier,
    textProcessor: TextProcessor,
    batteryMonitor: BatteryMonitor,
    fileManager: FileManager,
    database: Database
  ) {
    this.imageClassifier = imageClassifier;
    this.textProcessor = textProcessor;
    this.batteryMonitor = batteryMonitor;
    this.fileManager = fileManager;
    this.database = database;
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
    // Scan for photos
    const photos = await this.fileManager.scanPhotos();

    if (cancelToken.isCancelled) {
      throw new Error('Task cancelled');
    }

    // Categorize photos
    const categorized = await this.fileManager.categorizeFiles(photos);

    if (cancelToken.isCancelled) {
      throw new Error('Task cancelled');
    }

    // Organize photos into folders
    let filesProcessed = 0;
    for (const photo of categorized.photos) {
      if (cancelToken.isCancelled) {
        throw new Error('Task cancelled');
      }

      // Move photo to appropriate folder
      const destination = `${this.fileManager.getOrganizedFolder()}/${photo.category}`;
      await this.fileManager.moveFile(photo.uri, destination);

      // Update progress
      filesProcessed++;
      const progress = (filesProcessed / photos.length) * 100;
      await this.database.updateTaskProgress(task.id, progress, filesProcessed);

      // Check battery level periodically
      if (filesProcessed % 10 === 0) {
        const batteryLevel = await Battery.getBatteryLevelAsync();
        if (batteryLevel * 100 < 15) { // Pause if battery is below 15%
          throw new Error('Battery level too low');
        }
      }
    }

    return {
      ...task,
      status: 'completed',
      filesProcessed,
      completedAt: Date.now()
    };
  }

  private async executeDocumentProcessing(task: Task, cancelToken: { isCancelled: boolean }): Promise<Task> {
    // Scan for documents
    const documents = await this.fileManager.scanDocuments();

    if (cancelToken.isCancelled) {
      throw new Error('Task cancelled');
    }

    // Process documents
    let filesProcessed = 0;
    for (const document of documents) {
      if (cancelToken.isCancelled) {
        throw new Error('Task cancelled');
      }

      // Perform OCR on document
      const text = await this.textProcessor.performOCR(document.uri);

      // Summarize text
      const summary = await this.textProcessor.summarizeText(text);

      // Save processed content to database
      await this.database.saveProcessedContent({
        id: document.id,
        fileId: document.id,
        content: text,
        summary
      });

      // Update progress
      filesProcessed++;
      const progress = (filesProcessed / documents.length) * 100;
      await this.database.updateTaskProgress(task.id, progress, filesProcessed);

      // Check battery level periodically
      if (filesProcessed % 5 === 0) {
        const batteryLevel = await Battery.getBatteryLevelAsync();
        if (batteryLevel * 100 < 15) { // Pause if battery is below 15%
          throw new Error('Battery level too low');
        }
      }
    }

    return {
      ...task,
      status: 'completed',
      filesProcessed,
      completedAt: Date.now()
    };
  }
}
