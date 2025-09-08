// src/types.ts
export interface Station {
  stationuuid: string;
  name: string;
  url: string;
  url_resolved?: string;
  codec?: string;     // "MP3" | "AAC" | "AAC+" | ...
  bitrate?: number;
  country?: string;
  favicon?: string;
  homepage?: string;
  tags?: string;
  is_https?: boolean;
}