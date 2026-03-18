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
  layout: object; // Changed from string to object
}

export interface Component {
  id: string;
  screenId: string;
  type: string;
  props: object; // Changed from string to object
  position: object; // Changed from string to object
  order: number;
}
