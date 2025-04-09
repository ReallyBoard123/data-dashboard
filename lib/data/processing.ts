import { TimeSeriesData, TimeSeriesRecord, Region } from './types';

/**
 * Groups records by a specific field
 */
export function groupRecordsByField<T extends keyof TimeSeriesRecord>(
  records: TimeSeriesRecord[],
  field: T
): Record<string, TimeSeriesRecord[]> {
  return records.reduce((grouped, record) => {
    const key = String(record[field]);
    if (!grouped[key]) {
      grouped[key] = [];
    }
    grouped[key].push(record);
    return grouped;
  }, {} as Record<string, TimeSeriesRecord[]>);
}

/**
 * Calculates time spent by region
 */
export function calculateTimeByRegion(records: TimeSeriesRecord[]): Record<string, number> {
  return records.reduce((result, record) => {
    const { region, duration } = record;
    if (!result[region]) {
      result[region] = 0;
    }
    result[region] += duration;
    return result;
  }, {} as Record<string, number>);
}

/**
 * Calculates time spent by activity
 */
export function calculateTimeByActivity(records: TimeSeriesRecord[]): Record<string, number> {
  return records.reduce((result, record) => {
    const { activity, duration } = record;
    if (!result[activity]) {
      result[activity] = 0;
    }
    result[activity] += duration;
    return result;
  }, {} as Record<string, number>);
}

/**
 * Calculates transitions between regions
 */
export function calculateRegionTransitions(records: TimeSeriesRecord[]): Array<{
  source: string;
  target: string;
  count: number;
}> {
  const transitions: Record<string, Record<string, number>> = {};
  
  // Group records by ID to track each employee's movements
  const recordsByEmployee = groupRecordsByField(records, 'id');
  
  Object.values(recordsByEmployee).forEach(employeeRecords => {
    // Sort by start time to get chronological order
    const sortedRecords = [...employeeRecords].sort((a, b) => a.startTime - b.startTime);
    
    // Calculate transitions
    for (let i = 0; i < sortedRecords.length - 1; i++) {
      const source = sortedRecords[i].region;
      const target = sortedRecords[i + 1].region;
      
      if (source !== target) {
        if (!transitions[source]) {
          transitions[source] = {};
        }
        
        if (!transitions[source][target]) {
          transitions[source][target] = 0;
        }
        
        transitions[source][target]++;
      }
    }
  });
  
  // Convert to array format
  const result = [];
  for (const source in transitions) {
    for (const target in transitions[source]) {
      result.push({
        source,
        target,
        count: transitions[source][target]
      });
    }
  }
  
  return result;
}

/**
 * Formats time series data for timeline visualization
 */
export function formatTimelineData(records: TimeSeriesRecord[]): Array<{
  time: string;
  [key: string]: number | string;
}> {
  // Group records by time intervals (e.g., hourly)
  const timeIntervals: Record<string, Record<string, number>> = {};
  
  records.forEach(record => {
    const hour = record.startTimeFormatted.split(':')[0];
    const timeKey = `${record.date} ${hour}:00`;
    
    if (!timeIntervals[timeKey]) {
      timeIntervals[timeKey] = {};
    }
    
    if (!timeIntervals[timeKey][record.activity]) {
      timeIntervals[timeKey][record.activity] = 0;
    }
    
    timeIntervals[timeKey][record.activity] += record.duration;
  });
  
  // Convert to array format for Recharts
  return Object.entries(timeIntervals).map(([time, activities]) => {
    return {
      time,
      ...activities
    };
  }).sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());
}

/**
 * Prepares region data for heatmap visualization
 */
export function prepareRegionHeatmapData(
  records: TimeSeriesRecord[],
  regions: Region[]
): Array<{
  id: number;
  name: string;
  value: number;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}> {
  const timeByRegion = calculateTimeByRegion(records);
  
  return regions.map(region => {
    return {
      id: region.id,
      name: region.name,
      value: timeByRegion[region.name] || 0,
      x1: region.position_top_left_x,
      y1: region.position_top_left_y,
      x2: region.position_bottom_right_x,
      y2: region.position_bottom_right_y
    };
  });
}

/**
 * Extracts unique time intervals from records
 */
export function extractTimeIntervals(records: TimeSeriesRecord[]): string[] {
  const timeSet = new Set<string>();
  
  records.forEach(record => {
    const date = record.date;
    const startHour = parseInt(record.startTimeFormatted.split(':')[0]);
    const endHour = parseInt(record.endTimeFormatted.split(':')[0]);
    
    for (let hour = startHour; hour <= endHour; hour++) {
      timeSet.add(`${date} ${String(hour).padStart(2, '0')}:00`);
    }
  });
  
  return Array.from(timeSet).sort();
}