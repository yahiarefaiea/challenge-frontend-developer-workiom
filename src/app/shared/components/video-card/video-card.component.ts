import { Component, OnInit, Input } from '@angular/core';
import { Store } from '@ngxs/store';
import { UpdateVideoNote } from 'src/app/core/state/app.actions';
import { Video } from 'src/app/core/state/app.state.model';

@Component({
  selector: 'app-video-card',
  templateUrl: './video-card.component.html',
  styleUrls: ['./video-card.component.sass']
})
export class VideoCardComponent implements OnInit {
  @Input() index!: number;
  @Input() video: Video = {
    id: '',
    title: '',
    note: ''
  };

  showVideo: boolean = false;
  videoUrl: string = '';
  thumbnailUrl: string = '';

  constructor(private store: Store) {}

  ngOnInit(): void {
    this.videoUrl = 'https://www.youtube.com/embed/' + this.video.id;
    this.thumbnailUrl = `https://img.youtube.com/vi/${this.video.id}/0.jpg`;
  }

  toggleVideo(): void {
    this.showVideo = !this.showVideo;
  }

  onNoteChange(videoId: string, newNote: string): void {
    this.store.dispatch(new UpdateVideoNote(videoId, newNote));
  }
}
