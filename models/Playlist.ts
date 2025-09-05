import { Model } from '@nozbe/watermelondb';
import { date, field, readonly } from '@nozbe/watermelondb/decorators';

export const PLAYLIST_PLAYING_NOW_NAME = 'playing_now';

export class Playlist extends Model {
  static table = 'playlists'

  @field('name') name!: string
  @field('description') description!: string
  @field('cover_uri') coverUri?: string
  @field('is_system') isSystem!: boolean
  @readonly @date('created_at') createdAt!: Date
  @readonly @date('updated_at') updatedAt!: Date
}