import { State, Action, StateContext } from '@ngxs/store';
import { Injectable } from '@angular/core';
import { tap, catchError } from 'rxjs/operators';
import { YouTubeService } from '../services/youtube/youtube.service';
import { YouTubeResponseItem } from '../services/youtube/youtube.service.types';
import { Video, AppStateModel } from './app.state.model';
import {
  FetchVideos,
  UpdateVideoOrder,
  UpdateVideoNote,
  SetError
} from './app.actions';

@State<AppStateModel>({
  name: 'app',
  defaults: {
    videos: [],
    channelId: ''
  }
})

@Injectable()
export class AppState {

  constructor(private youtubeService: YouTubeService) {}

  @Action(FetchVideos)
  fetchVideos(ctx: StateContext<AppStateModel>, action: FetchVideos) {
    return this.youtubeService.getVideosByChannelId(action.channelId).pipe(
      tap((response: { items: YouTubeResponseItem[] }) => {
        const currentState = ctx.getState();

        // Map the new data from YouTube
        const fetchedVideos: Video[] = response.items.map(item => ({
          id: item.id.videoId,
          title: item.snippet.title,
          note: ''
        }));

        // Merge the fetched videos with existing ones, preserving notes and order
        const mergedVideos = fetchedVideos.map(fetchedVideo => {
          const existingVideo = currentState.videos.find(video => video.id === fetchedVideo.id);
          return existingVideo || fetchedVideo;
        });

        // Add any videos that were in the state but not in the fetched data (if needed)
        currentState.videos.forEach(video => {
          if (!fetchedVideos.some(fv => fv.id === video.id)) {
            mergedVideos.push(video);
          }
        });

        ctx.patchState({
          videos: mergedVideos,
          channelId: action.channelId,
          lastSearchedChannelId: action.channelId
        });
      }),
      catchError(err => {
        console.error('Failed to fetch videos:', err);
        ctx.dispatch(new SetError(err.message));
        return [];
      })
    );
  }

  @Action(UpdateVideoOrder)
  updateVideoOrder(ctx: StateContext<AppStateModel>, action: UpdateVideoOrder) {
    ctx.patchState({ videos: action.videos });
  }

  @Action(UpdateVideoNote)
  updateNote(ctx: StateContext<AppStateModel>, action: UpdateVideoNote) {
    const updatedVideos = ctx.getState().videos.map(video =>
      video.id === action.videoId ? {...video, note: action.note} : video
    );

    ctx.patchState({ videos: updatedVideos });
  }
}
