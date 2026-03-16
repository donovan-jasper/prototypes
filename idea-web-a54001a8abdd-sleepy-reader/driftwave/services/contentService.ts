import { databaseService } from './databaseService';

class ContentService {
  private contentLibrary: any[] = [];

  async initialize(): Promise<void> {
    await databaseService.initialize();

    // Load content library from database
    this.contentLibrary = await databaseService.getContentLibrary();

    // If empty, initialize with default content
    if (this.contentLibrary.length === 0) {
      const defaultContent = [
        {
          id: 'story-1',
          title: 'Ocean Waves',
          duration: 15,
          isPremium: false,
          type: 'story',
        },
        {
          id: 'story-2',
          title: 'Whispering Forest',
          duration: 12,
          isPremium: false,
          type: 'story',
        },
        {
          id: 'story-3',
          title: 'Starlight Journey',
          duration: 18,
          isPremium: true,
          type: 'story',
        },
        {
          id: 'soundscape-1',
          title: 'Rain on Roof',
          duration: 30,
          isPremium: false,
          type: 'soundscape',
        },
        {
          id: 'soundscape-2',
          title: 'Ocean Waves',
          duration: 30,
          isPremium: false,
          type: 'soundscape',
        },
        {
          id: 'soundscape-3',
          title: 'White Noise',
          duration: 30,
          isPremium: true,
          type: 'soundscape',
        },
      ];

      await databaseService.saveContentLibrary(defaultContent);
      this.contentLibrary = defaultContent;
    }
  }

  getContentById(id: string): any | undefined {
    return this.contentLibrary.find((content) => content.id === id);
  }

  getContentByType(type: string): any[] {
    return this.contentLibrary.filter((content) => content.type === type);
  }

  getAllContent(): any[] {
    return this.contentLibrary;
  }
}

export const contentService = new ContentService();
