import { TimeSeriesRecord } from './types';

/**
 * Calculates the total time spent in each region from a set of records
 */
export function calculateTimeByRegion(records: TimeSeriesRecord[]): Record<string, number> {
  const timeByRegion: Record<string, number> = {};

  records.forEach(record => {
    const { region, duration } = record;
    if (!timeByRegion[region]) {
      timeByRegion[region] = 0;
    }
    timeByRegion[region] += duration;
  });

  return timeByRegion;
}

/**
 * Calculates the total time spent in each activity from a set of records
 */
export function calculateTimeByActivity(records: TimeSeriesRecord[]): Record<string, number> {
  const timeByActivity: Record<string, number> = {};

  records.forEach(record => {
    const { activity, duration } = record;
    if (!timeByActivity[activity]) {
      timeByActivity[activity] = 0;
    }
    timeByActivity[activity] += duration;
  });

  return timeByActivity;
}

/**
 * Calculates the total time spent by each employee
 */
export function calculateTimeByEmployee(records: TimeSeriesRecord[]): Record<string, number> {
  const timeByEmployee: Record<string, number> = {};

  records.forEach(record => {
    const { id, duration } = record;
    if (!timeByEmployee[id]) {
      timeByEmployee[id] = 0;
    }
    timeByEmployee[id] += duration;
  });

  return timeByEmployee;
}

/**
 * Formats records into a timeline data structure for visualization
 */
export function formatTimelineData(records: TimeSeriesRecord[]): any[] {
  if (records.length === 0) return [];
  
  // Group records by timestamp (hourly by default)
  const timePoints = new Map<string, Record<string, number | string>>();
  
  records.forEach(record => {
    // Create time points for each hour within the record duration
    const startHour = Math.floor(record.startTime / 3600) * 3600;
    const endHour = Math.ceil(record.endTime / 3600) * 3600;
    
    for (let timePoint = startHour; timePoint < endHour; timePoint += 3600) {
      // Calculate how much of this record falls within this hour
      const hourStart = Math.max(record.startTime, timePoint);
      const hourEnd = Math.min(record.endTime, timePoint + 3600);
      const durationInHour = Math.max(0, hourEnd - hourStart);
      
      // Skip if no duration in this hour
      if (durationInHour <= 0) continue;
      
      // Format timestamp for the data point
      const date = new Date(record.date);
      date.setHours(Math.floor(timePoint / 3600));
      date.setMinutes(0);
      date.setSeconds(0);
      const timeKey = date.toISOString();
      
      // Create or update the time point
      if (!timePoints.has(timeKey)) {
        timePoints.set(timeKey, { time: timeKey });
      }
      
      const dataPoint = timePoints.get(timeKey)!;
      if (!dataPoint[record.activity]) {
        dataPoint[record.activity] = 0;
      }
      
      dataPoint[record.activity] = (dataPoint[record.activity] as number) + durationInHour;
    }
  });
  
  // Convert map to array and sort by time
  return Array.from(timePoints.values())
    .sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());
}