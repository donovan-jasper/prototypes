export interface Screen {
  id: string;
  projectId: string;
  name: string;
  order: number;
  layout: Record<string, any>;
}
