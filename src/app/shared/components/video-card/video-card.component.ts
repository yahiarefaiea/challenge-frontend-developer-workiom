import { Component, OnInit, Input } from '@angular/core';
import { Store } from '@ngxs/store';
import { UpdateVideoNote } from '../../../core/state/app.actions';
import { Video } from '../../../core/state/app.state.model';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

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
  safeUrl!: SafeResourceUrl;
  thumbnailUrl: string = '';

  constructor(private store: Store, private sanitizer: DomSanitizer) {}

  ngOnInit(): void {
    this.safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl('https://www.youtube.com/embed/' + this.video.id);
    this.thumbnailUrl = `https://img.youtube.com/vi/${this.video.id}/0.jpg`;
  }

  toggleVideo(): void {
    this.showVideo = !this.showVideo;
  }

  onNoteChange(videoId: string, newNote: string): void {
    this.store.dispatch(new UpdateVideoNote(videoId, newNote));
  }
}
