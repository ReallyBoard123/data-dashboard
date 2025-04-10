export interface TimeSeriesMetadata {
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

export interface TimeSeriesData {
  metadata: TimeSeriesMetadata;
  records: TimeSeriesRecord[];
}

export interface Beacon {
  comment: string;
  id: number;
  position_x: number;
  position_y: number;
  region_uuid: string;
  uuid: string;
}

export interface Region {
  exclude_from_eval: boolean;
  id: number;
  name: string;
  position_bottom_right_x: number;
  position_bottom_right_y: number;
  position_top_left_x: number;
  position_top_left_y: number;
  region_label_uuid: string | null;
  special_activities: string[];
  uuid: string;
}

export interface LayoutData {
  address: string;
  beacons: Beacon[];
  building: string;
  description: string;
  dynamic_beacons: any[];
  height_pixel: number;
  lat: number;
  lng: number;
  name: string;
  region_labels: any[];
  regions: Region[];
  uuid: string;
  width_pixel: number;
}