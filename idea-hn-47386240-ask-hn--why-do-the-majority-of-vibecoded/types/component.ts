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

export interface ComponentTemplate {
  type: string;
  defaultProps: Record<string, any>;
  category: string;
  description: string;
  icon?: string;
}
