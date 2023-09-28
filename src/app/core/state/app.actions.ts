import { Video } from './app.state.model';

export class FetchVideos {
  static readonly type = '[App] FetchVideos';
  constructor(public channelId: string, public nextPageToken?: string) {}
}

export class UpdateVideoOrder {
  static readonly type = '[App] UpdateVideoOrder';
  constructor(public channelId: string, public videos: Video[]) {}
}

export class UpdateVideoNote {
  static readonly type = '[App] UpdateVideoNote';
  constructor(public videoId: string, public note: string) {}
}

export class SetError {
  static readonly type = '[App] SetError';
  constructor(public errorMessage: string) {}
}

export class ClearError {
  static readonly type = '[App] Clear Error';
}
