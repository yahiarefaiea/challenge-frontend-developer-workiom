import { Component, OnDestroy } from '@angular/core';
import Muuri from 'muuri';
import { Store } from '@ngxs/store';
import { Video, AppStateModel } from './core/state/app.state.model';
import {
  FetchVideos,
  ResetPageToken,
  UpdateVideoOrder
} from './core/state/app.actions';
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
      const currentChannel = state.app.channels.find(channel => channel.channelId === currentChannelId);
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

  fetchVideos(channelId: string): void {
    const nextPageToken = this.store.selectSnapshot(state => state.app.nextPageToken);
    this.store.dispatch(new FetchVideos(channelId, nextPageToken));
    const currentChannel = this.store.selectSnapshot((state: { app: AppStateModel }) => state.app.channels)
      .find(channel => channel.channelId === channelId);
    this.videos = currentChannel ? currentChannel.videos : [];
  }

  handleSearch(): void {
    this.store.dispatch(new ResetPageToken());
    this.fetchVideos(this.channelId);
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
