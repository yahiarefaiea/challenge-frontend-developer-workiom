export interface Video {
  id: string;
  title: string;
  note: string;
}

export interface Channel {
  channelId: string;
  videos: Video[];
  nextPageToken?: string | null;
}

export interface AppStateModel {
  channels: Channel[];
  lastSearchedChannelId?: string;
  errorMessage: string | null;
}
