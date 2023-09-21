import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { YouTubeResponseItem, YouTubeResponse } from './youtube.service.types';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class YouTubeService {
  private readonly BASE_API_URL = 'https://www.googleapis.com/youtube/v3/';
  private readonly ENDPOINT_SEARCH = 'search';

  constructor(private http: HttpClient) {}

  getVideosByChannelId(channelId: string, pageToken: string = ''): Observable<YouTubeResponse> {
    let params = new HttpParams()
      .set('key', environment.youtubeApiKey)
      .set('channelId', channelId)
      .set('order', 'date')
      .set('part', 'snippet')
      .set('maxResults', '50');

    if (pageToken) {
      params = params.set('pageToken', pageToken);
    }

    return this.http.get<YouTubeResponse>(`${this.BASE_API_URL}${this.ENDPOINT_SEARCH}`, { params })
      .pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse) {
    console.error('An error occurred:', error);

    if (error.status === 404) {
      return throwError('Not found. Please check your channel ID.');
    }

    return throwError('Something bad happened; please try again later.');
  }
}
