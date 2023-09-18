import { Component, OnDestroy } from '@angular/core';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
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

  onDrop(event: CdkDragDrop<string[]>): void {
    moveItemInArray(this.videos, event.previousIndex, event.currentIndex);
    this.store.dispatch(new UpdateVideoOrder(this.videos));
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
