import { getDatabase, Project } from '../database/db';

export interface CreateProjectInput {
  name: string;
  target: string;
  language: string;
  code?: string;
}

export class ProjectManager {
  private db = getDatabase();

  async initialize(): Promise<void> {
    // Database is already initialized in getDatabase()
    return Promise.resolve();
  }

  async createProject(input: CreateProjectInput): Promise<Project> {
    const now = Date.now();
    const code = input.code || this.getDefaultCode(input.language);

    const result = this.db.runSync(
      'INSERT INTO projects (name, target, language, code, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
      [input.name, input.target, input.language, code, now, now]
    );

    return {
      id: result.lastInsertRowId,
      name: input.name,
      target: input.target,
      language: input.language,
      code,
      created_at: now,
      updated_at: now,
    };
  }

  async listProjects(): Promise<Project[]> {
    const projects = this.db.getAllSync<Project>(
      'SELECT * FROM projects ORDER BY updated_at DESC'
    );
    return projects;
  }

  async getProject(id: number): Promise<Project | null> {
    const project = this.db.getFirstSync<Project>(
      'SELECT * FROM projects WHERE id = ?',
      [id]
    );
    return project || null;
  }

  async updateProject(id: number, updates: Partial<Project>): Promise<void> {
    const now = Date.now();
    const fields: string[] = [];
    const values: any[] = [];

    if (updates.name !== undefined) {
      fields.push('name = ?');
      values.push(updates.name);
    }
    if (updates.target !== undefined) {
      fields.push('target = ?');
      values.push(updates.target);
    }
    if (updates.language !== undefined) {
      fields.push('language = ?');
      values.push(updates.language);
    }
    if (updates.code !== undefined) {
      fields.push('code = ?');
      values.push(updates.code);
    }

    fields.push('updated_at = ?');
    values.push(now);
    values.push(id);

    this.db.runSync(
      `UPDATE projects SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
  }

  async deleteProject(id: number): Promise<void> {
    this.db.runSync('DELETE FROM projects WHERE id = ?', [id]);
  }

  async clearAll(): Promise<void> {
    this.db.runSync('DELETE FROM projects');
  }

  private getDefaultCode(language: string): string {
    switch (language) {
      case 'c':
        return '#include <stdio.h>\n\nint main() {\n    printf("Hello, World!\\n");\n    return 0;\n}\n';
      case 'cpp':
        return '#include <iostream>\n\nint main() {\n    std::cout << "Hello, World!" << std::endl;\n    return 0;\n}\n';
      case 'asm':
        return '; Assembly code\nLD A, 0\nRET\n';
      default:
        return '';
    }
  }
}
