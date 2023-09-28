import { State, Action, StateContext } from '@ngxs/store';
import { Injectable } from '@angular/core';
import { tap, catchError } from 'rxjs/operators';
import * as _ from 'lodash';
import { YouTubeService } from 'src/app/core/services/youtube/youtube.service';
import {
  FetchVideos,
  ResetPageToken,
  UpdateVideoOrder,
  UpdateVideoNote,
  SetError,
  ClearError
} from './app.actions';
import { Video, AppStateModel } from './app.state.model';
import { mapToVideos, findChannel } from './app.utils';

@State<AppStateModel>({
  name: 'app',
  defaults: {
    channels: [],
    errorMessage: null
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

        const newVideos = mapToVideos(response.items);
        const allVideos = channel ? [...channel.videos, ...newVideos] : newVideos;
        const uniqueVideos = _.uniqBy(allVideos, 'id');

        const updatedChannels = channel
          ? currentState.channels.map(c => c.channelId === action.channelId ? {...c, videos: uniqueVideos} : c)
          : [...currentState.channels, { channelId: action.channelId, videos: uniqueVideos }];

        ctx.patchState({
          channels: updatedChannels,
          lastSearchedChannelId: action.channelId,
          nextPageToken: response.nextPageToken
        });
      }),
      catchError(err => {
        ctx.dispatch(new SetError(err.error));
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

  @Action(SetError)
  setError(ctx: StateContext<AppStateModel>, action: SetError) {
    ctx.patchState({
      errorMessage: action.errorMessage
    });
  }

  @Action(ClearError)
  clearError(ctx: StateContext<AppStateModel>) {
    ctx.patchState({
      errorMessage: null
    });
  }
}
