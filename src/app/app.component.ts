import { Component, OnDestroy } from '@angular/core';
import Muuri from 'muuri';
import { Store } from '@ngxs/store';
import { Video } from './core/state/app.state.model';
import { FetchVideos, UpdateVideoOrder } from './core/state/app.actions';
import { Subscription } from 'rxjs';

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
    const videos$ = this.store.select(state => state.app.videos).subscribe(videos => {
      this.videos = videos;
    }, err => {
      this.error = 'Failed to fetch videos';
    });

    this.subscription.add(videos$);
  }

  ngAfterViewInit() {
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

  handleReorder(oldIndex: number, newIndex: number) {
    const movedVideo = this.videos.splice(oldIndex, 1)[0];
    this.videos.splice(newIndex, 0, movedVideo);
    this.store.dispatch(new UpdateVideoOrder(this.videos));
  }

  onSearch(): void {
    if (this.channelId !== this.store.selectSnapshot(state => state.app.lastSearchedChannelId)) {
      this.store.dispatch(new FetchVideos(this.channelId));
    }
  }

  onRefresh(): void {
    const currentChannelId = this.store.selectSnapshot(state => state.app.lastSearchedChannelId);
    if (currentChannelId) {
      this.store.dispatch(new FetchVideos(currentChannelId));
    }
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
