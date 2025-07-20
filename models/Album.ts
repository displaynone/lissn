import { Model } from '@nozbe/watermelondb'
import { date, field, readonly } from '@nozbe/watermelondb/decorators'

export class Album extends Model {
  static table = 'albums'

  @field('title') title!: string
  @field('artist_id') artistId!: string
  @field('artwork_uri') artworkUri?: string
  @field('year') year?: number
  @field('external_id') externalId?: string
  @readonly @date('created_at') createdAt!: Date
  @readonly @date('updated_at') updatedAt!: Date
}