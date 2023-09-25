import { State, Action, StateContext } from '@ngxs/store';
import { Injectable } from '@angular/core';
import { tap, catchError } from 'rxjs/operators';
import { YouTubeService } from '../services/youtube/youtube.service';
import {
  FetchVideos,
  ResetPageToken,
  UpdateVideoOrder,
  UpdateVideoNote,
  SetError
} from './app.actions';
import { Video, AppStateModel } from './app.state.model';
import { mapToVideos, findChannel } from './app.utils';

@State<AppStateModel>({
  name: 'app',
  defaults: {
    channels: []
  }
})

@Injectable()
export class AppState {

  constructor(private youtubeService: YouTubeService) {}

  @Action(FetchVideos)
  fetchVideos(ctx: StateContext<AppStateModel>, action: FetchVideos) {
    return this.youtubeService.getVideosByChannelId(action.channelId, action.nextPageToken).pipe(
      tap(response => {
        const currentState = ctx.getState();
        const channel = findChannel(currentState.channels, action.channelId);
        const videos = channel ? [...channel.videos, ...mapToVideos(response.items)] : mapToVideos(response.items);
        const updatedChannels = channel
          ? currentState.channels.map(c => c.channelId === action.channelId ? {...c, videos} : c)
          : [...currentState.channels, { channelId: action.channelId, videos }];

        ctx.patchState({ channels: updatedChannels, lastSearchedChannelId: action.channelId, nextPageToken: response.nextPageToken });
      }),
      catchError(err => {
        ctx.dispatch(new SetError(err.message));
        return [];
      })
    );
  }

  @Action(ResetPageToken)
  resetPageToken(ctx: StateContext<AppStateModel>) {
    ctx.patchState({ nextPageToken: null });
  }

  @Action(UpdateVideoOrder)
  updateVideoOrder(ctx: StateContext<AppStateModel>, action: UpdateVideoOrder) {
    const currentChannels = [...ctx.getState().channels];
    const channel = findChannel(currentChannels, action.channelId);

    if (channel) {
      channel.videos = action.videos;
      ctx.patchState({ channels: currentChannels });
    }
  }

  @Action(UpdateVideoNote)
  updateNote(ctx: StateContext<AppStateModel>, action: UpdateVideoNote) {
    const currentChannels = [...ctx.getState().channels];
    const lastSearchedChannelId = ctx.getState().lastSearchedChannelId;

    if (!lastSearchedChannelId) {
      console.error('No last searched channel id found');
      return;
    }

    const channel = findChannel(currentChannels, lastSearchedChannelId);

    if (channel) {
      const videoToUpdate = channel.videos.find((video: Video) => video.id === action.videoId);
      if (videoToUpdate) {
        videoToUpdate.note = action.note;
        ctx.patchState({ channels: currentChannels });
      }
    }
  }
}
