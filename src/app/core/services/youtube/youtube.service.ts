import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { YouTubeResponseItem, YouTubeResponse } from './youtube.service.types';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class YouTubeService {

  private readonly API_KEY = environment.youtubeApiKey;
  private readonly BASE_API_URL = 'https://www.googleapis.com/youtube/v3/';
  private readonly ENDPOINT_SEARCH = 'search';

  constructor(private http: HttpClient) {}

  getVideosByChannelId(channelId: string): Observable<YouTubeResponse> {
    const url = `${this.BASE_API_URL}${this.ENDPOINT_SEARCH}?key=${this.API_KEY}&channelId=${channelId}&order=date&part=snippet`;
    return this.http.get<YouTubeResponse>(url).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse) {
    console.error('An error occurred:', error);
    return throwError('Something bad happened; please try again later.');
  }
}
