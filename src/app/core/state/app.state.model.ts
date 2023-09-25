export interface Video {
  id: string;
  title: string;
  note: string;
}

export interface Channel {
  channelId: string;
  videos: Video[];
}

export interface AppStateModel {
  channels: Channel[];
  lastSearchedChannelId?: string;
  nextPageToken?: string | null;
  errorMessage?: string;
}
