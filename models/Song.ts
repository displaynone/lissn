import { Model } from '@nozbe/watermelondb'
import { field } from '@nozbe/watermelondb/decorators'

export class Song extends Model {
  static table = 'songs'

  @field('title') title!: string
  @field('artist') artist!: string
  @field('album') album!: string
  @field('cover_path') coverPath!: string // ruta al archivo local
  @field('source_uri') sourceUri!: string // ruta original al mp3
}