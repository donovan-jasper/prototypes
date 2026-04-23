import { Task, TaskType } from '@/types';
import { FileManager } from '../storage/fileManager';
import { ImageClassifier } from './imageClassifier';
import { TextProcessor } from './textProcessor';
import { ModelLoader } from './modelLoader';

interface TaskExecutionResult {
  status: 'completed' | 'failed' | 'cancelled';
  filesProcessed?: number;
  error?: string;
}

export class TaskExecutor {
  private activeTasks: Map<string, AbortController> = new Map();
  private fileManager: FileManager;
  private imageClassifier: ImageClassifier;
  private textProcessor: TextProcessor;
  private modelLoader: ModelLoader;
  private modelsInitialized: boolean = false;

  constructor() {
    // As per prompt, TaskExecutor is instantiated without arguments,
    // so it must manage its own dependencies.
    this.modelLoader = new ModelLoader();
    this.fileManager = new FileManager();
    this.imageClassifier = new ImageClassifier(this.modelLoader);
    this.textProcessor = new TextProcessor(this.modelLoader);

    // Load models asynchronously, but don't block constructor
    this.initModels().catch(console.error);
  }

  private async initModels() {
    if (this.modelsInitialized) return;
    console.log('TaskExecutor: Initializing AI models...');
    try {
      await this.imageClassifier.loadModel();
      await this.textProcessor.loadModel();
      this.modelsInitialized = true;
      console.log('TaskExecutor: AI models initialized successfully.');
    } catch (error) {
      console.error('TaskExecutor: Failed to initialize AI models:', error);
      this.modelsInitialized = false; // Keep false if initialization failed
    }
  }

  async execute(task: Task): Promise<TaskExecutionResult> {
    if (!this.modelsInitialized) {
      console.warn('TaskExecutor: Models not initialized, attempting to re-initialize.');
      await this.initModels();
      if (!this.modelsInitialized) {
        return { status: 'failed', error: 'AI models failed to initialize.' };
      }
    }

    const abortController = new AbortController();
    this.activeTasks.set(task.id, abortController);
    const signal = abortController.signal;

    try {
      if (signal.aborted) {
        throw new Error('Task cancelled');
      }

      let filesProcessed = 0;
      console.log(`TaskExecutor: Executing task ${task.id} of type ${task.type}`);

      switch (task.type) {
        case TaskType.ORGANIZE_PHOTOS:
          // Simulate photo organization
          // In a real scenario, this would involve:
          // 1. Scanning photos using fileManager.scanPhotos()
          // 2. Classifying each photo using imageClassifier.classify()
          // 3. Detecting duplicates using fileManager.findDuplicates()
          // 4. Moving/deleting files using fileManager.moveFile()/deleteFile()
          await new Promise(resolve => setTimeout(resolve, 3000)); // Simulate work
          if (signal.aborted) throw new Error('Task cancelled');
          filesProcessed = Math.floor(Math.random() * 50) + 10; // Simulate processing 10-59 files
          console.log(`TaskExecutor: Organized ${filesProcessed} photos for task ${task.id}`);
          break;
        case TaskType.PROCESS_DOCUMENTS:
          // Simulate document processing
          // In a real scenario, this would involve:
          // 1. Scanning documents using fileManager.scanDocuments()
          // 2. Performing OCR using textProcessor.ocr()
          // 3. Summarizing using textProcessor.summarize()
          // 4. Extracting entities using textProcessor.extractEntities()
          await new Promise(resolve => setTimeout(resolve, 5000)); // Simulate work
          if (signal.aborted) throw new Error('Task cancelled');
          filesProcessed = Math.floor(Math.random() * 10) + 1; // Simulate processing 1-10 documents
          console.log(`TaskExecutor: Processed ${filesProcessed} documents for task ${task.id}`);
          break;
        case TaskType.TRANSCRIBE_AUDIO:
          // Simulate audio transcription
          await new Promise(resolve => setTimeout(resolve, 7000)); // Simulate work
          if (signal.aborted) throw new Error('Task cancelled');
          filesProcessed = Math.floor(Math.random() * 5) + 1; // Simulate processing 1-5 audio files
          console.log(`TaskExecutor: Transcribed ${filesProcessed} audio files for task ${task.id}`);
          break;
        default:
          throw new Error(`Unknown task type: ${task.type}`);
      }

      this.activeTasks.delete(task.id);
      return { status: 'completed', filesProcessed };
    } catch (error) {
      this.activeTasks.delete(task.id);
      console.error(`TaskExecutor: Task ${task.id} failed or cancelled:`, error);
      return { status: 'failed', error: (error as Error).message };
    }
  }

  cancel(taskId: string): void {
    const controller = this.activeTasks.get(taskId);
    if (controller) {
      controller.abort();
      this.activeTasks.delete(taskId);
      console.log(`TaskExecutor: Task ${taskId} cancelled.`);
    }
  }
}
