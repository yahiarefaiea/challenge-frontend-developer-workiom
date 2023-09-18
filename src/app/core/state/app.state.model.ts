export interface Video {
  id: string;
  title: string;
  note: string;
}

export interface AppStateModel {
  videos: Video[];
  channelId: string;
  lastSearchedChannelId?: string;
  errorMessage?: string;
}
