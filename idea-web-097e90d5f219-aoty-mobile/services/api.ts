import { Artist, Album } from './database';

export interface SearchArtistResult extends Artist {}

export const searchArtists = async (query: string): Promise<SearchArtistResult[]> => {
  await new Promise(resolve => setTimeout(resolve, 500));

  const mockArtists: SearchArtistResult[] = [
    {
      id: 'artist-1',
      name: 'Radiohead',
      imageUrl: 'https://i.scdn.co/image/ab6761610000e5eba03696716c9ee605006047fd',
      followedAt: 0,
    },
    {
      id: 'artist-2',
      name: 'Kendrick Lamar',
      imageUrl: 'https://i.scdn.co/image/ab6761610000e5eb437b9e2a82505b3d93ff1022',
      followedAt: 0,
    },
    {
      id: 'artist-3',
      name: 'Taylor Swift',
      imageUrl: 'https://i.scdn.co/image/ab6761610000e5ebe672b5f553298dcdccb0e676',
      followedAt: 0,
    },
    {
      id: 'artist-4',
      name: 'The Beatles',
      imageUrl: 'https://i.scdn.co/image/ab6761610000e5ebe9348cc01ff5d55971b22433',
      followedAt: 0,
    },
    {
      id: 'artist-5',
      name: 'Billie Eilish',
      imageUrl: 'https://i.scdn.co/image/ab6761610000e5ebb0c4f96e5e3c2e052f0e8c8c',
      followedAt: 0,
    },
    {
      id: 'artist-6',
      name: 'Pink Floyd',
      imageUrl: 'https://i.scdn.co/image/ab6761610000e5eb5a00969a4698c3132a15fbb0',
      followedAt: 0,
    },
    {
      id: 'artist-7',
      name: 'Daft Punk',
      imageUrl: 'https://i.scdn.co/image/ab6761610000e5eba7bfd7835b5c1eee0c95fa6e',
      followedAt: 0,
    },
    {
      id: 'artist-8',
      name: 'Arctic Monkeys',
      imageUrl: 'https://i.scdn.co/image/ab6761610000e5eb7da39dea0a72f581535fb11f',
      followedAt: 0,
    },
  ];

  const lowerQuery = query.toLowerCase();
  return mockArtists.filter(artist => 
    artist.name.toLowerCase().includes(lowerQuery)
  );
};

export const fetchArtistAlbums = async (artistId: string): Promise<Album[]> => {
  await new Promise(resolve => setTimeout(resolve, 300));

  const mockAlbums: Record<string, Album[]> = {
    'artist-1': [
      {
        id: 'album-1',
        title: 'OK Computer',
        artistId: 'artist-1',
        coverUrl: 'https://i.scdn.co/image/ab67616d0000b273c8b444df094279e70d0ed856',
        releaseDate: '1997-05-21',
        consensusScore: 96,
      },
      {
        id: 'album-2',
        title: 'Kid A',
        artistId: 'artist-1',
        coverUrl: 'https://i.scdn.co/image/ab67616d0000b2736c7112082b63bf7e9c2b4c4f',
        releaseDate: '2000-10-02',
        consensusScore: 94,
      },
    ],
    'artist-2': [
      {
        id: 'album-3',
        title: 'To Pimp a Butterfly',
        artistId: 'artist-2',
        coverUrl: 'https://i.scdn.co/image/ab67616d0000b273cdb645498cd3d8a2db4d05e1',
        releaseDate: '2015-03-15',
        consensusScore: 96,
      },
      {
        id: 'album-4',
        title: 'DAMN.',
        artistId: 'artist-2',
        coverUrl: 'https://i.scdn.co/image/ab67616d0000b2738b52c6b9bc4e43d873869699',
        releaseDate: '2017-04-14',
        consensusScore: 95,
      },
    ],
    'artist-3': [
      {
        id: 'album-5',
        title: '1989',
        artistId: 'artist-3',
        coverUrl: 'https://i.scdn.co/image/ab67616d0000b273904445d70d04eb24d6bb79ac',
        releaseDate: '2014-10-27',
        consensusScore: 88,
      },
      {
        id: 'album-6',
        title: 'Folklore',
        artistId: 'artist-3',
        coverUrl: 'https://i.scdn.co/image/ab67616d0000b273295b680f3c2c2b5c2f5e5c5e',
        releaseDate: '2020-07-24',
        consensusScore: 92,
      },
    ],
    'artist-4': [
      {
        id: 'album-7',
        title: 'Abbey Road',
        artistId: 'artist-4',
        coverUrl: 'https://i.scdn.co/image/ab67616d0000b273dc30583ba717007b00cceb25',
        releaseDate: '1969-09-26',
        consensusScore: 98,
      },
    ],
    'artist-5': [
      {
        id: 'album-8',
        title: 'When We All Fall Asleep, Where Do We Go?',
        artistId: 'artist-5',
        coverUrl: 'https://i.scdn.co/image/ab67616d0000b27350a3147b4edd7701a876c6ce',
        releaseDate: '2019-03-29',
        consensusScore: 84,
      },
    ],
    'artist-6': [
      {
        id: 'album-9',
        title: 'The Dark Side of the Moon',
        artistId: 'artist-6',
        coverUrl: 'https://i.scdn.co/image/ab67616d0000b273ea7caaff71dea1051d49b2fe',
        releaseDate: '1973-03-01',
        consensusScore: 97,
      },
    ],
    'artist-7': [
      {
        id: 'album-10',
        title: 'Random Access Memories',
        artistId: 'artist-7',
        coverUrl: 'https://i.scdn.co/image/ab67616d0000b273b33d46dfa2635a47eebf63b2',
        releaseDate: '2013-05-17',
        consensusScore: 87,
      },
    ],
    'artist-8': [
      {
        id: 'album-11',
        title: 'AM',
        artistId: 'artist-8',
        coverUrl: 'https://i.scdn.co/image/ab67616d0000b27328933b808bfb4cbbd0385400',
        releaseDate: '2013-09-09',
        consensusScore: 81,
      },
    ],
  };

  return mockAlbums[artistId] || [];
};
