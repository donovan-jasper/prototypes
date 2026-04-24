export interface Attribution {
  model: string;
  prompt: string;
  timestamp: string;
  attributionId: string;
  styleInfluences?: string[];
  trainingDataSources?: string[];
}

export interface Generation {
  id: number;
  prompt: string;
  imageUri: string;
  attribution: Attribution;
  timestamp: Date;
  ethicalScore: number;
}

export interface User {
  premiumStatus: boolean;
  generationCount: number;
  totalScore: number;
  balance?: number;
}

export interface Artist {
  id: number;
  name: string;
  style: string;
  bio: string;
  profileImage: string;
  followers: number;
  createdAt: string;
}

export interface ArtistWork {
  id: number;
  artistId: number;
  imageUrl: string;
  description?: string;
  createdAt: string;
}

export interface Tip {
  id: number;
  artistId: number;
  amount: number;
  fee: number;
  timestamp: string;
}
