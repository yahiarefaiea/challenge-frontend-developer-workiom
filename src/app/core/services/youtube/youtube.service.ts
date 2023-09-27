import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { YouTubeResponse } from './youtube.service.types';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

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
      .set('maxResults', '8');

    if (pageToken) {
      params = params.set('pageToken', pageToken);
    }

    return this.http.get<YouTubeResponse>(`${this.BASE_API_URL}${this.ENDPOINT_SEARCH}`, { params })
      .pipe(
        map(response => {
          if (response?.items.length === 0) {
            const errorResponse = new HttpErrorResponse({
              status: 404,
              statusText: 'No Content',
              error: 'No videos were found for this channel or the channel does not exist..'
            });
            throw errorResponse;
          }
          return response;
        }),
        catchError(this.handleError)
      );
  }

  private handleError(error: HttpErrorResponse) {
    if (error.status === 404) {
      return throwError(error.error);
    }

    console.error('An error occurred:', error);
    return throwError('Something bad happened; please try again later.');
  }
}
