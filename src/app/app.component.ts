import { Component, OnDestroy } from '@angular/core';
import Muuri from 'muuri';
import { Store } from '@ngxs/store';
import { Video, AppStateModel } from './core/state/app.state.model';
import {
  FetchVideos,
  ResetPageToken,
  UpdateVideoOrder
} from './core/state/app.actions';
import { findChannel } from './core/state/app.utils';
import { Subscription } from 'rxjs';
import { isEqual } from 'lodash';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.sass']
})
export class AppComponent implements OnDestroy {
  channelId: string = '';
  videos: Video[] = [];
  muuriGrid: any;
  dragStartIndex: number | null = null;
  error: string | null = null;
  private subscription: Subscription = new Subscription();

  constructor(private store: Store) {
    const videos$ = this.store.select((state: { app: AppStateModel }) => {
      const currentChannelId = state.app.lastSearchedChannelId;
      const currentChannel = currentChannelId ? findChannel(state.app.channels, currentChannelId) : undefined;
      return currentChannel ? currentChannel.videos : [];
    }).subscribe(videos => {
      if (!isEqual(videos, this.videos)) {
        this.videos = videos;
        this.initializeMuuriGrid();
      }
    }, err => {
      this.error = 'Failed to fetch videos';
    });

    this.subscription.add(videos$);
  }

  ngAfterViewInit() {
    this.initializeMuuriGrid();
  }

  private initializeMuuriGrid(): void {
    if (this.muuriGrid) {
      this.muuriGrid.destroy();
    }

    this.muuriGrid = new Muuri('.muuri-grid', {
      items: '.muuri-item',
      dragEnabled: true,
      dragSort: () => {
        return [this.muuriGrid];
      }
    })
    .on('dragStart', (item) => {
      this.dragStartIndex = this.muuriGrid.getItems().indexOf(item);
    })
    .on('dragEnd', (item) => {
      if (this.dragStartIndex !== null) {
        const oldIndex = this.dragStartIndex;
        const newIndex = this.muuriGrid.getItems().indexOf(item);
        this.handleReorder(oldIndex, newIndex);
      }
      this.dragStartIndex = null;
    });
  }

  private getLastSearchedChannelId(): string {
    return this.store.selectSnapshot(state => state.app.lastSearchedChannelId);
  }

  get disableSearch(): boolean {
    const lastSearchedChannelId = this.getLastSearchedChannelId();
    return !this.channelId || this.channelId === lastSearchedChannelId;
  }

  get hideVideos(): boolean {
    const lastSearchedChannelId = this.getLastSearchedChannelId();
    return !lastSearchedChannelId || !this.videos.length;
  }

  private fetchVideos(channelId: string): void {
    this.error = null;

    if (!channelId) {
      this.error = 'Channel ID is required';
      return;
    }

    const nextPageToken = this.store.selectSnapshot(state => state.app.nextPageToken);
    this.store.dispatch(new FetchVideos(channelId, nextPageToken));
  }

  handleSearch(): void {
    if (this.disableSearch) {
      return;
    }

    this.store.dispatch(new ResetPageToken());
    this.fetchVideos(this.channelId);
  }

  handleLoadMore(): void {
    const lastSearchedChannelId = this.getLastSearchedChannelId();

    if (this.hideVideos) {
      return;
    }

    this.fetchVideos(lastSearchedChannelId);
  }

  handleReorder(oldIndex: number, newIndex: number) {
    const movedVideo = this.videos.splice(oldIndex, 1)[0];
    this.videos.splice(newIndex, 0, movedVideo);
    this.store.dispatch(new UpdateVideoOrder(this.channelId, this.videos));
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    if (this.muuriGrid) {
      this.muuriGrid.destroy();
    }
  }
}
