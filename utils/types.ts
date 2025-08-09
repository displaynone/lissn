export type IconProps = {
  size?: number;
  color?: string;
};

export interface SongMeta {
  title: string;
  artist?: { name?: string | null } | null;
  coverPath?: string | null;
}