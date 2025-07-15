import { Database } from '@nozbe/watermelondb'
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite'

import { Song } from '@/models/Song'
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
  modelClasses: [Song],
})
