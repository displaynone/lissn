import { Model } from '@nozbe/watermelondb'
import { date, field, readonly } from '@nozbe/watermelondb/decorators'

export class PlaylistSong extends Model {
  static table = 'playlist_songs'

  @field('playlist_id') playlistId!: string
  @field('song_id') songId!: string
  @field('position') position!: number
  @readonly @date('created_at') createdAt!: Date
}