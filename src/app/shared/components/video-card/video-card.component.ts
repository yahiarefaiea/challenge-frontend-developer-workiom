import { Component, OnInit, Input, ElementRef } from '@angular/core';
import { Store } from '@ngxs/store';
import { gsap } from 'gsap';
import { UpdateVideoNote } from 'src/app/core/state/app.actions';
import { Video } from 'src/app/core/state/app.state.model';

const ease = 'power4.inOut'
const duration = 0.5

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

  constructor(private store: Store, private el: ElementRef) {}

  ngOnInit(): void {
    this.videoUrl = 'https://www.youtube.com/embed/' + this.video.id;
    this.thumbnailUrl = `https://img.youtube.com/vi/${this.video.id}/0.jpg`;
  }

  toggleVideo(): void {
    this.showVideo = !this.showVideo;
  }

  showOverlay(): void {
    const element = this.el.nativeElement;
    const backgroundElement = element.querySelector('.video-card > .overlay');
    gsap.to(backgroundElement, { ease, duration, top: -14, right: -14, bottom: -14, left: -14, opacity: 1 });
  }

  hideOverlay(): void {
    const element = this.el.nativeElement;
    const backgroundElement = element.querySelector('.video-card > .overlay');
    gsap.to(backgroundElement, { ease, duration, top: 14, right: 14, bottom: 14, left: 14, opacity: 0 });
  }

  onNoteChange(videoId: string, newNote: string): void {
    this.store.dispatch(new UpdateVideoNote(videoId, newNote));
  }
}
