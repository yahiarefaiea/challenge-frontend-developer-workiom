import { Component, OnInit, OnDestroy, ElementRef } from '@angular/core';
import Muuri from 'muuri';
import { Store } from '@ngxs/store';
import { Video, AppStateModel } from './core/state/app.state.model';
import {
  FetchVideos,
  UpdateVideoOrder,
  ResetLastSearchedChannelId,
  ClearError
} from './core/state/app.actions';
import { findChannel } from './core/state/app.utils';
import { Subscription } from 'rxjs';
import { isEqual } from 'lodash';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.sass']
})
export class AppComponent implements OnInit, OnDestroy {
  channelId: string = '';
  videos: Video[] = [];
  muuriGrid: any;
  dragStartIndex: number | null = null;
  error: string | null = null;
  private subscription: Subscription = new Subscription();

  constructor(private store: Store, private el: ElementRef) {
    const videos$ = this.store.select((state: { app: AppStateModel }) => {
      const currentChannelId = state.app.lastSearchedChannelId;
      const currentChannel = currentChannelId ? findChannel(state.app.channels, currentChannelId) : undefined;
      return currentChannel ? currentChannel.videos : [];
    }).subscribe(videos => {
      if (!isEqual(videos, this.videos)) {
        this.videos = videos;
      }
    });

    const channelId$ = this.store.select((state: { app: AppStateModel }) => state.app.lastSearchedChannelId)
      .subscribe(lastSearchedChannelId => {
        if (lastSearchedChannelId) {
          this.channelId = lastSearchedChannelId;
        } else {
          this.channelId = '';
        }
      });

    const error$ = this.store.select((state: { app: AppStateModel }) => state.app.errorMessage)
      .subscribe(errorMessage => {
        if (errorMessage) {
          console.error('An error occurred:', errorMessage);
          this.error = errorMessage;
        }
      });

    this.subscription.add(videos$);
    this.subscription.add(channelId$);
    this.subscription.add(error$);
  }

  ngOnInit() {
    this.clearError();
    // this.store.dispatch(new ResetLastSearchedChannelId());
  }

  ngAfterViewInit() {
    if (this.videos.length !== 0) {
      this.initializeMuuriGrid();
    }
  }

  // ngDoCheck() {
  //   if (!isEqual(this.previousVideos, this.videos)) {
  //     console.log('Videos changed!');
  //     this.previousVideos = [...this.videos];
  //     this.syncMuuriGrid();
  //   }
  // }

  // private syncMuuriGrid(): void {
  //   if (!this.muuriGrid) {
  //     this.initializeMuuriGrid();
  //   } else {
  //     this.ngZone.runOutsideAngular(() => {
  //       const newItems = Array.from(this.el.nativeElement.querySelectorAll('.muuri-item:not([data-muuri-added])'));
  //       if (newItems.length > 0) {
  //         newItems.forEach((item: any) => item.setAttribute('data-muuri-added', 'true'));
  //         this.muuriGrid.add(newItems);
  //       }

  //       this.muuriGrid.refreshItems().layout(true);
  //       // this.muuriGrid.refreshItems().layout().synchronize();
  //       this.cdRef.detectChanges();
  //     });
  //   }
  // }

  private initializeMuuriGrid(): void {
    const element = this.el.nativeElement;
    const muuriGridElement = element.querySelector('.muuri-grid')

    // if (this.muuriGrid) {
    //   this.muuriGrid.destroy();
    // }

    // this.muuriGrid = new Muuri(muuriGridElement, {
    //   items: '.muuri-item',
    //   dragEnabled: true,
    //   dragSort: () => {
    //     return [this.muuriGrid];
    //   }
    // })
    // .on('dragStart', (item) => {
    //   this.dragStartIndex = this.muuriGrid.getItems().indexOf(item);
    // })
    // .on('dragEnd', (item) => {
    //   if (this.dragStartIndex !== null) {
    //     const oldIndex = this.dragStartIndex;
    //     const newIndex = this.muuriGrid.getItems().indexOf(item);
    //     this.handleReorder(oldIndex, newIndex);
    //   }
    //   this.dragStartIndex = null;
    // });
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
    if (!channelId) {
      return;
    }

    const channels = this.store.selectSnapshot(state => state.app.channels);
    const channel = findChannel(channels, channelId);
    const nextPageToken = channel ? channel.nextPageToken : null;

    this.store.dispatch(new FetchVideos(channelId, nextPageToken));
  }

  handleSearch(): void {
    if (this.disableSearch) {
      return;
    }

    this.clearError();
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

  clearError(): void {
    this.store.dispatch(new ClearError());
    this.error = null;
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    this.store.dispatch(new ResetLastSearchedChannelId());
    this.clearError();
    if (this.muuriGrid) {
      this.muuriGrid.destroy();
    }
  }
}
