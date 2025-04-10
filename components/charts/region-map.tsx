'use client';

import * as React from 'react';
import { useDataStore } from '@/store/useDataStore';
import { useI18nStore } from '@/store/useI18nStore';
import { calculateTimeByRegion } from '@/lib/data/processing';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { IconPlayerPause, IconPlayerPlay } from '@tabler/icons-react';
import { formatDuration } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

// Color scale for heatmap
const getHeatmapColor = (value: number, max: number): string => {
  // Normalize value to 0-1 range
  const normalizedValue = Math.min(value / max, 1);
  
  // Color spectrum from cool to hot (blue -> green -> yellow -> red)
  const h = (1 - normalizedValue) * 240; // 240 is blue, 0 is red
  const s = 100;
  const l = 50;
  
  return `hsl(${h}, ${s}%, ${l}%)`;
};

export function RegionMap() {
  const { filteredRecords, layoutData } = useDataStore();
  const { locale } = useI18nStore();
  const [currentTime, setCurrentTime] = React.useState<number | null>(null);
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [playbackSpeed, setPlaybackSpeed] = React.useState(1); // seconds per step
  const animationRef = React.useRef<number | null>(null);
  
  // Extract time points (timestamps) from records for slider
  const timePoints = React.useMemo(() => {
    if (!filteredRecords.length) return [];
    
    const times = filteredRecords.flatMap(record => [record.startTime, record.endTime]);
    return Array.from(new Set(times)).sort((a, b) => a - b);
  }, [filteredRecords]);
  
  // Initialize current time to first time point
  React.useEffect(() => {
    if (timePoints.length > 0 && currentTime === null) {
      setCurrentTime(timePoints[0]);
    }
  }, [timePoints, currentTime]);
  
  // Calculate region occupancy at current time
  const regionOccupancy = React.useMemo(() => {
    if (currentTime === null || !filteredRecords.length) return {};
    
    // Filter records that are active at current time
    const activeRecords = filteredRecords.filter(
      record => record.startTime <= currentTime && record.endTime >= currentTime
    );
    
    return calculateTimeByRegion(activeRecords);
  }, [filteredRecords, currentTime]);
  
  // Find max occupancy for color scaling
  const maxOccupancy = React.useMemo(() => {
    if (!regionOccupancy) return 1;
    return Math.max(1, ...Object.values(regionOccupancy));
  }, [regionOccupancy]);
  
  // Animation logic
  React.useEffect(() => {
    if (!isPlaying || currentTime === null || timePoints.length === 0) return;
    
    const animate = () => {
      setCurrentTime(prevTime => {
        if (prevTime === null) return timePoints[0];
        
        // Find current index
        const currentIndex = timePoints.findIndex(t => t >= prevTime);
        
        // Move to next time point
        const nextIndex = (currentIndex + 1) % timePoints.length;
        
        // If we reached the end, stop playing
        if (nextIndex === 0) {
          setIsPlaying(false);
          return timePoints[0];
        }
        
        return timePoints[nextIndex];
      });
      
      animationRef.current = requestAnimationFrame(animate);
    };
    
    const timeoutId = setTimeout(() => {
      animationRef.current = requestAnimationFrame(animate);
    }, 1000 / playbackSpeed);
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      clearTimeout(timeoutId);
    };
  }, [isPlaying, currentTime, timePoints, playbackSpeed]);
  
  // Format time for display
  const formatTime = (timestamp: number) => {
    const hours = Math.floor(timestamp / 3600);
    const minutes = Math.floor((timestamp % 3600) / 60);
    const seconds = Math.floor(timestamp % 60);
    
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };
  
  // Get current date from records
  const currentDate = React.useMemo(() => {
    if (!filteredRecords.length || currentTime === null) return '';
    
    // Find a record that spans the current time
    const record = filteredRecords.find(
      r => r.startTime <= currentTime && r.endTime >= currentTime
    );
    
    return record?.date || '';
  }, [filteredRecords, currentTime]);
  
  if (!layoutData) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>
            {locale === 'en' ? 'Region Map' : 'Regionskarte'}
          </CardTitle>
          <CardDescription>
            {locale === 'en' ? 'Layout data not available' : 'Layoutdaten nicht verfügbar'}
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }
  
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex flex-row justify-between items-center">
          <div>
            <CardTitle>
              {locale === 'en' ? 'Region Map' : 'Regionskarte'}
            </CardTitle>
            <CardDescription>
              {locale === 'en' 
                ? `Occupancy at ${currentDate} ${currentTime !== null ? formatTime(currentTime) : ''}` 
                : `Belegung am ${currentDate} ${currentTime !== null ? formatTime(currentTime) : ''}`}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setIsPlaying(!isPlaying)}
            >
              {isPlaying ? <IconPlayerPause size={16} /> : <IconPlayerPlay size={16} />}
            </Button>
            <Select
              value={playbackSpeed.toString()}
              onValueChange={(value) => setPlaybackSpeed(Number(value))}
            >
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder={locale === 'en' ? 'Speed' : 'Geschwindigkeit'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0.5">0.5x</SelectItem>
                <SelectItem value="1">1x</SelectItem>
                <SelectItem value="2">2x</SelectItem>
                <SelectItem value="5">5x</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          <div className="relative h-[400px] w-full border rounded-md overflow-hidden">
            <svg
              viewBox={`0 0 ${layoutData.width_pixel} ${layoutData.height_pixel}`}
              className="w-full h-full"
            >
              {/* Draw regions */}
              {layoutData.regions.map((region) => {
                const width = region.position_bottom_right_x - region.position_top_left_x;
                const height = region.position_bottom_right_y - region.position_top_left_y;
                const occupancy = regionOccupancy[region.name] || 0;
                
                return (
                  <g key={region.uuid}>
                    <rect
                      x={region.position_top_left_x * layoutData.width_pixel}
                      y={region.position_top_left_y * layoutData.height_pixel}
                      width={width * layoutData.width_pixel}
                      height={height * layoutData.height_pixel}
                      fill={getHeatmapColor(occupancy, maxOccupancy)}
                      strokeWidth="1"
                      stroke="#666"
                      opacity={0.8}
                    />
                    <text
                      x={(region.position_top_left_x + width / 2) * layoutData.width_pixel}
                      y={(region.position_top_left_y + height / 2) * layoutData.height_pixel}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill="#000"
                      fontSize="12"
                      fontWeight="bold"
                    >
                      {region.name}
                    </text>
                  </g>
                );
              })}
              
              {/* Draw beacons */}
              {layoutData.beacons.map((beacon) => (
                <circle
                  key={beacon.uuid}
                  cx={beacon.position_x * layoutData.width_pixel}
                  cy={beacon.position_y * layoutData.height_pixel}
                  r="5"
                  fill="#000"
                />
              ))}
              
              {/* Draw employees at current time if active */}
              {currentTime !== null && filteredRecords
                .filter(record => record.startTime <= currentTime && record.endTime >= currentTime)
                .map((record, index) => {
                  // Find region for this record
                  const region = layoutData.regions.find(r => r.name === record.region);
                  if (!region) return null;
                  
                  // Calculate center position of region
                  const centerX = (region.position_top_left_x + (region.position_bottom_right_x - region.position_top_left_x) / 2) * layoutData.width_pixel;
                  const centerY = (region.position_top_left_y + (region.position_bottom_right_y - region.position_top_left_y) / 2) * layoutData.height_pixel;
                  
                  return (
                    <g key={`${record.id}-${index}`}>
                      <circle
                        cx={centerX}
                        cy={centerY}
                        r="8"
                        fill="red"
                        opacity="0.8"
                      />
                      <text
                        x={centerX}
                        y={centerY}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fill="white"
                        fontSize="10"
                        fontWeight="bold"
                      >
                        {record.id.split('-')[1]}
                      </text>
                    </g>
                  );
                })
              }
            </svg>
          </div>
          
          {/* Timeline slider */}
          {timePoints.length > 0 && currentTime !== null && (
            <div className="flex flex-col gap-2">
              <Slider
                value={[timePoints.indexOf(currentTime)]}
                max={timePoints.length - 1}
                step={1}
                onValueChange={(values) => {
                  const index = values[0];
                  setCurrentTime(timePoints[index]);
                }}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{formatTime(timePoints[0])}</span>
                <span>{formatTime(timePoints[Math.floor(timePoints.length / 2)])}</span>
                <span>{formatTime(timePoints[timePoints.length - 1])}</span>
              </div>
            </div>
          )}
          
          {/* Legend */}
          <div className="flex items-center gap-4 mt-2">
            <span className="text-sm font-medium">
              {locale === 'en' ? 'Occupancy' : 'Belegung'}:
            </span>
            <div className="flex h-2 flex-1 rounded-full overflow-hidden">
              {Array.from({ length: 10 }).map((_, i) => (
                <div
                  key={i}
                  className="flex-1"
                  style={{
                    backgroundColor: getHeatmapColor(i * maxOccupancy / 9, maxOccupancy),
                  }}
                />
              ))}
            </div>
            <div className="flex gap-2 text-xs">
              <span>0</span>
              <span>{formatDuration(maxOccupancy, locale)}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}