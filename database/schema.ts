import { appSchema, tableSchema } from '@nozbe/watermelondb'

export const mySchema = appSchema({
  version: 1,
  tables: [
    tableSchema({
      name: 'songs',
      columns: [
        { name: 'title', type: 'string' },
        { name: 'artist', type: 'string' },
        { name: 'album', type: 'string' },
        { name: 'cover_path', type: 'string' },
        { name: 'source_uri', type: 'string' },
      ],
    }),
  ],
})