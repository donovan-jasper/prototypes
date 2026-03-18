export interface Theme {
  background: string;
  text: string;
}

export interface FocusMode {
  id: string;
  name: string;
  color: string;
}

export interface Widget {
  id: string;
  name: string;
  type: string;
  x: number;
  y: number;
}

export interface AppInfo {
  name: string;
  packageName: string;
}
