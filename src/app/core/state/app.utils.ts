import { YouTubeResponseItem } from '../services/youtube/youtube.service.types';
import { Video, Channel } from './app.state.model';

export function mapToVideos(items: YouTubeResponseItem[]): Video[] {
  return items.map(item => ({
    id: item.id.videoId,
    title: item.snippet.title,
    note: ''
  }));
}

export function findChannel(channels: Channel[], channelId: string): Channel | undefined {
  return channels.find(channel => channel.channelId === channelId);
}
