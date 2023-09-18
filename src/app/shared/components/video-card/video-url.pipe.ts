import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

/**
 * Pipe to sanitize and trust video URLs from YouTube.
 * This prevents Angular from identifying them as unsafe.
 */
@Pipe({
  name: 'safeVideoUrl'
})
export class SafeVideoUrlPipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}

  transform(url: string): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }
}
