import { Model } from '@nozbe/watermelondb'
import { date, field, readonly } from '@nozbe/watermelondb/decorators'

export class Artist extends Model {
  static table = 'artists'

  @field('name') name!: string
  @field('artwork_uri') artworkUri?: string
  @field('external_id') externalId?: string
  @readonly @date('created_at') createdAt!: Date
  @readonly @date('updated_at') updatedAt!: Date
}