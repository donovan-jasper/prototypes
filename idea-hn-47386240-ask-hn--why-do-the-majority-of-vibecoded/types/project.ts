export interface Project {
  id: string;
  name: string;
  description?: string;
  appType?: string;
  createdAt: number;
  updatedAt: number;
}

export interface Screen {
  id: string;
  projectId: string;
  name: string;
  order: number;
  layout: Record<string, any>;
}

export interface Component {
  id: string;
  screenId: string;
  type: string;
  props: Record<string, any>;
  position: {
    x: number;
    y: number;
  };
  order: number;
}
