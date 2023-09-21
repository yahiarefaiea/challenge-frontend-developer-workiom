export interface YouTubeResponseItem {
  id: {
    videoId: string;
  };
  snippet: {
    title: string;
    description: string;
  };
}

export interface YouTubeResponse {
  items: YouTubeResponseItem[];
  nextPageToken?: string;
}
