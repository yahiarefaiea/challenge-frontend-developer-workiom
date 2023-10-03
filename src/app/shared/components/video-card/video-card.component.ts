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
  noteIsVisible: boolean = false;
  videoUrl: string = '';
  thumbnailUrl: string = '';

  constructor(private store: Store, private el: ElementRef) {}

  ngOnInit(): void {
    this.videoUrl = 'https://www.youtube.com/embed/' + this.video.id;
    this.thumbnailUrl = `https://img.youtube.com/vi/${this.video.id}/0.jpg`;
  }

  toggleVideo(): void {
    if(!this.noteIsVisible) {
      this.showVideo = !this.showVideo;
    }
  }

  showOverlay(): void {
    const element = this.el.nativeElement.querySelector('.video-card');
    const overlayElement = element.querySelector('.overlay');
    gsap.to(overlayElement, { ease, duration, top: -14, right: -14, bottom: -14, left: -14, opacity: 1 });
  }

  hideOverlay(): void {
    const element = this.el.nativeElement.querySelector('.video-card');
    const overlayElement = element.querySelector('.overlay');
    gsap.to(overlayElement, { ease, duration, top: 14, right: 14, bottom: 14, left: 14, opacity: 0 });
  }

  showNote(): void {
    this.noteIsVisible = true;
    this.showVideo = false;

    const element = this.el.nativeElement.querySelector('.video-card');
    const cardHeight = element.clientHeight;
    const aspectRatio = 16 / 9;
    const thumbnailNewSize = 56;

    const videoContainerElement = element.querySelector('.video-container');
    const thumbnailContainerElement = videoContainerElement.querySelector('.thumbnail-container');
    const thumbnailElement = thumbnailContainerElement.querySelector('img');

    const metaDataElement = element.querySelector('.meta-data');
    const titleElement = metaDataElement.querySelector('h3');
    const channelElement = metaDataElement.querySelector('span');

    const noteControlElement = element.querySelector('.note-control');
    const writeNoteLinkElement = noteControlElement.querySelector('.link');
    const arrowIconElement = writeNoteLinkElement.querySelector('.arrow-icon');
    const writeNoteTextareaElement = noteControlElement.querySelector('textarea');

    const overlayElement = element.querySelector('.overlay');

    // timeline
    const tl: gsap.core.Timeline = gsap.timeline({
      defaults: { ease, duration }
    });

    // arrow-icon
    tl.to(arrowIconElement, {
      ease: 'power4.in',
      duration: duration/8,
      marginLeft: 0
    });
    tl.to(arrowIconElement, {
      ease: 'power4.in',
      duration: duration/2,
      delay: duration/8*7,
      x: 1200/4
    });

    const delay = duration/8 + duration/8*7 + duration/4;

    // overlay
    tl.to(overlayElement, {
      top: 0,
      right: 'auto',
      bottom: 'auto',
      left: 0,
      width: thumbnailNewSize,
      height: thumbnailNewSize,
      borderRadius: 14
    }, delay);

    // note-control
    tl.to(writeNoteLinkElement, {
      x: 14,
      y: 7 - 1,
      opacity: 0
    }, delay);
    tl.to(writeNoteTextareaElement, {
      x: 0,
      paddingTop: 21,
      paddingBottom: 21,
      paddingLeft: 28,
      paddingRight: 28,
      opacity: 1
    }, delay);
    tl.to(noteControlElement, {
      height: cardHeight - thumbnailNewSize - 14,
      padding: 14,
      boxShadow: '0 0 7px 0 rgba(51, 51, 51, 0.14)'
    }, delay);
    tl.fromTo(noteControlElement, {
      backgroundColor: 'transparent'
    }, {
      backgroundColor: '#fff'
    }, delay);

    // video-container
    tl.to(videoContainerElement, {
      width: thumbnailNewSize,
      height: thumbnailNewSize
    }, delay);
    tl.to(thumbnailContainerElement, {
      height: '100%',
      paddingBottom: 0
    }, delay);
    tl.to(thumbnailElement, {
      height: '100%',
      width: `${aspectRatio * 100}%`,
      left: '50%',
      x: '-50%'
    }, delay);

    // meta-data
    tl.to(metaDataElement, {
      marginTop: -thumbnailNewSize,
      paddingTop: 7,
      paddingBottom: 7 + 14,
      paddingLeft: thumbnailNewSize + 14
    }, delay);
    tl.to(titleElement, {
      lineHeight: '28px',
      height: 28,
      marginBottom: 0,
      fontSize: '12.5px',
      autoRound: false
    }, delay);
    tl.to(channelElement, {
      fontSize: '11px',
      autoRound: false
    }, delay);
  }

  onNoteChange(videoId: string, newNote: string): void {
    this.store.dispatch(new UpdateVideoNote(videoId, newNote));
  }
}
