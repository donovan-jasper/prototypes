export interface Project {
  id: string;
  name: string;
  description: string;
  appType: string;
  createdAt: number;
  updatedAt: number;
}

export interface Screen {
  id: string;
  projectId: string;
  name: string;
  order: number;
  layout: string; // JSON string
}

export interface Component {
  id: string;
  screenId: string;
  type: string;
  props: string; // JSON string
  position: string; // JSON string
  order: number;
}
