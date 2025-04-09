'use client';

import * as React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { formatTimelineData } from '@/lib/data/processing';
import { useDataStore } from '@/store/useDataStore';
import { useI18nStore } from '@/store/useI18nStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatDuration } from '@/lib/utils';


const activityColors: Record<string, string> = {
  'Stand': '#8884d8',
  'Walk': '#82ca9d',
  'Handle Center': '#ffc658',
  'Handle Up': '#ff8042',
  'Handle Down': '#0088fe'
};

export function ActivityTimeline() {
  const [timeGrouping, setTimeGrouping] = React.useState<'hour' | 'day'>('hour');
  const { filteredRecords } = useDataStore();
  const { locale } = useI18nStore();
  
  const timelineData = React.useMemo(() => {
    return formatTimelineData(filteredRecords);
  }, [filteredRecords]);
  
  // Get unique activities for creating chart areas
  const activities = React.useMemo(() => {
    const uniqueActivities = new Set<string>();
    timelineData.forEach(dataPoint => {
      Object.keys(dataPoint).forEach(key => {
        if (key !== 'time') {
          uniqueActivities.add(key);
        }
      });
    });
    return Array.from(uniqueActivities);
  }, [timelineData]);
  
  // Format X-axis tick values
  const formatXAxis = (tickItem: string) => {
    const date = new Date(tickItem);
    
    if (timeGrouping === 'hour') {
      return date.toLocaleTimeString(locale === 'en' ? 'en-US' : 'de-DE', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } else {
      return date.toLocaleDateString(locale === 'en' ? 'en-US' : 'de-DE', {
        month: 'short',
        day: 'numeric'
      });
    }
  };
  
  // Format tooltip values
  const formatTooltipValue = (value: number) => {
    return formatDuration(value, locale);
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex flex-row justify-between items-center">
          <div>
            <CardTitle>
              {locale === 'en' ? 'Activity Timeline' : 'Aktivitätszeitverlauf'}
            </CardTitle>
            <CardDescription>
              {locale === 'en' 
                ? 'Distribution of activities over time' 
                : 'Verteilung der Aktivitäten über die Zeit'}
            </CardDescription>
          </div>
          <Select
            value={timeGrouping}
            onValueChange={(value: 'hour' | 'day') => setTimeGrouping(value)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder={locale === 'en' ? 'Time Grouping' : 'Zeitgruppierung'} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="hour">
                {locale === 'en' ? 'Hourly' : 'Stündlich'}
              </SelectItem>
              <SelectItem value="day">
                {locale === 'en' ? 'Daily' : 'Täglich'}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={timelineData}
              margin={{
                top: 10,
                right: 30,
                left: 0,
                bottom: 0,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="time" 
                tickFormatter={formatXAxis}
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                tickFormatter={formatTooltipValue}
                tick={{ fontSize: 12 }}
              />
              <Tooltip 
                formatter={formatTooltipValue}
                labelFormatter={(label) => {
                  const date = new Date(label);
                  return date.toLocaleString(locale === 'en' ? 'en-US' : 'de-DE', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  });
                }}
              />
              <Legend />
              {activities.map((activity, index) => (
                <Area
                  key={activity}
                  type="monotone"
                  dataKey={activity}
                  stackId="1"
                  fill={activityColors[activity] || `hsl(${index * 30}, 70%, 50%)`}
                  stroke={activityColors[activity] || `hsl(${index * 30}, 70%, 50%)`}
                  name={
                    locale === 'en' 
                      ? activity 
                      : activity === 'Stand' 
                        ? 'Stehen'
                        : activity === 'Walk'
                          ? 'Gehen'
                          : activity === 'Handle Center'
                            ? 'Griff Mitte'
                            : activity === 'Handle Up'
                              ? 'Griff Oben'
                              : activity === 'Handle Down'
                                ? 'Griff Unten'
                                : activity
                  }
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}