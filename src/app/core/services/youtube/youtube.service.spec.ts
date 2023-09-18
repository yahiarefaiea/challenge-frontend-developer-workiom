import { TestBed } from '@angular/core/testing';
import { YouTubeService } from './youtube.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { YouTubeResponse } from './youtube.service.types';
import { environment } from '../../../../environments/environment';

describe('YouTubeService', () => {
  let service: YouTubeService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [YouTubeService]
    });

    service = TestBed.inject(YouTubeService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('#getVideosByChannelId', () => {
    it('should return videos data for a specific channel', () => {
      const mockChannelId = 'UCJeH7gl6PbDVV4DTldIOPOA';
      const mockResponse: YouTubeResponse = {
        items: [
          {
            id: { videoId: 'vid123' },
            snippet: { title: 'Test Video', description: 'This is a test description' }
          }
        ]
      };

      service.getVideosByChannelId(mockChannelId).subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${service['BASE_API_URL']}${service['ENDPOINT_SEARCH']}?key=${environment.youtubeApiKey}&channelId=${mockChannelId}&order=date&part=snippet`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should handle error correctly', () => {
      const mockChannelId = 'UCJeH7gl6PbDVV4DTldIOPOA';

      service.getVideosByChannelId(mockChannelId).subscribe(
        () => {},
        (error) => {
          expect(error).toEqual('Something bad happened; please try again later.');
        }
      );

      const req = httpMock.expectOne(`${service['BASE_API_URL']}${service['ENDPOINT_SEARCH']}?key=${environment.youtubeApiKey}&channelId=${mockChannelId}&order=date&part=snippet`);
      req.error(new ErrorEvent('Network error'));
    });
  });
});
