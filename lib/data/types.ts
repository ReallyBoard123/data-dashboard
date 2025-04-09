// lib/data/types.ts
export interface TimeSeriesRecord {
    date: string;
    id: string;
    startTime: number;
    endTime: number;
    startTimeFormatted: string;
    endTimeFormatted: string;
    region: string;
    activity: string;
    duration: number;
  }
  
  export interface Metadata {
    totalRecords: number;
    dateRange: {
      start: string;
      end: string;
    };
    uniqueEmployees: number;
    uniqueRegions: number;
    uniqueActivities: string[];
    totalDuration: number;
  }
  
  export interface Region {
    id: number;
    name: string;
    position_bottom_right_x: number;
    position_bottom_right_y: number;
    position_top_left_x: number;
    position_top_left_y: number;
    uuid: string;
    exclude_from_eval: boolean;
    region_label_uuid: string | null;
    special_activities: any[];
  }
  
  export interface Beacon {
    id: number;
    comment: string;
    position_x: number;
    position_y: number;
    region_uuid: string;
    uuid: string;
  }
  
  export interface LayoutData {
    regions: Region[];
    beacons: Beacon[];
    height_pixel: number;
    width_pixel: number;
    uuid: string;
  }
  
  export interface TimeSeriesData {
    metadata: Metadata;
    records: TimeSeriesRecord[];
  }