export interface Channel {
  id: string;
  name: string;
  logo: string;
  currentProgram: string;
  nextProgram: string;
  streamUrl: string;
}

export interface Favorite {
  id: number;
  channelId: string;
}

export interface Alert {
  id: number;
  program: string;
  time: string;
  weather: boolean;
  breakingNews: boolean;
}
