import { Database } from '@nozbe/watermelondb'
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite'

import { Album, Artist, Genre, Playlist, PlaylistSong, Song } from '@/models'
import { mySchema } from './schema'

const adapter = new SQLiteAdapter({
  schema: mySchema,
  dbName: 'lissn',
  jsi: false,
  onSetUpError: error => {
    console.error('❌ Error initializing WatermelonDB:', error)
  },
})

export const database = new Database({
  adapter,
  modelClasses: [Artist, Album, Genre, Song, Playlist, PlaylistSong],
})
