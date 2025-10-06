import { appSchema, tableSchema } from '@nozbe/watermelondb'

export const mySchema = appSchema({
  version: 3,
  tables: [
    tableSchema({
      name: 'artists',
      columns: [
        { name: 'name', type: 'string' },
        { name: 'artwork_uri', type: 'string', isOptional: true },
        { name: 'external_id', type: 'string', isOptional: true, isIndexed: true },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ],
    }),
    tableSchema({
      name: 'albums',
      columns: [
        { name: 'title', type: 'string' },
        { name: 'artist_id', type: 'string' },
        { name: 'artwork_uri', type: 'string', isOptional: true },
        { name: 'year', type: 'number', isOptional: true },
        { name: 'external_id', type: 'string', isOptional: true },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ],
    }),
    tableSchema({
      name: 'genres',
      columns: [
        { name: 'name', type: 'string' },
        { name: 'external_id', type: 'string', isOptional: true },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ],
    }),
    tableSchema({
      name: 'songs',
      columns: [
        { name: 'title', type: 'string' },
        { name: 'artist_id', type: 'string' },
        { name: 'album_id', type: 'string' },
        { name: 'genre_id', type: 'string', isOptional: true },
        { name: 'cover_path', type: 'string', isOptional: true },
        { name: 'source_uri', type: 'string' },
        { name: 'duration', type: 'number', isOptional: true },
        { name: 'track_number', type: 'number', isOptional: true },
        { name: 'external_id', type: 'string', isOptional: true },
        { name: 'file_size', type: 'number', isOptional: true },
        { name: 'is_favorite', type: 'boolean' },
        { name: 'play_count', type: 'number' },
        { name: 'last_played_at', type: 'number', isOptional: true },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ],
    }),
    tableSchema({
      name: 'playlists',
      columns: [
        { name: 'name', type: 'string' },
        { name: 'description', type: 'string', isOptional: true },
        { name: 'cover_uri', type: 'string', isOptional: true },
        { name: 'is_system', type: 'boolean' },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ],
    }),
    tableSchema({
      name: 'playlist_songs',
      columns: [
        { name: 'playlist_id', type: 'string' },
        { name: 'song_id', type: 'string' },
        { name: 'position', type: 'number' },
        { name: 'created_at', type: 'number' },
      ],
    }),
    tableSchema({
      name: 'settings',
      columns: [
        { name: 'key', type: 'string', isIndexed: true },
        { name: 'value', type: 'string' },
      ],
    }),
  ],
})