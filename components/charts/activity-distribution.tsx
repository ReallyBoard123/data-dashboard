// components/charts/activity-distribution.tsx
'use client';

import * as React from 'react';
import { useDataStore } from '@/store/useDataStore';
import { useI18nStore } from '@/store/useI18nStore';
import { calculateTimeByActivity } from '@/lib/data/processing';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDuration } from '@/lib/utils';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export function ActivityDistribution() {
  const { filteredRecords } = useDataStore();
  const { locale } = useI18nStore();
  
  const activityData = React.useMemo(() => {
    const timeByActivity = calculateTimeByActivity(filteredRecords);
    
    return Object.entries(timeByActivity).map(([name, value], index) => ({
      name,
      value,
      color: COLORS[index % COLORS.length],
      localizedName: locale === 'en'
        ? name
        : name === 'Stand'
          ? 'Stehen'
          : name === 'Walk'
            ? 'Gehen'
            : name === 'Handle Center'
              ? 'Griff Mitte'
              : name === 'Handle Up'
                ? 'Griff Oben'
                : name === 'Handle Down'
                  ? 'Griff Unten'
                  : name
    }));
  }, [filteredRecords, locale]);
  
  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background p-2 rounded-md border shadow-sm">
          <p className="font-medium">{payload[0].payload.localizedName}</p>
          <p className="text-sm">{formatDuration(payload[0].value, locale)}</p>
          <p className="text-xs text-muted-foreground">
            {Math.round(payload[0].value / activityData.reduce((sum, item) => sum + item.value, 0) * 100)}%
          </p>
        </div>
      );
    }
    
    return null;
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>
          {locale === 'en' ? 'Activity Distribution' : 'Aktivitätsverteilung'}
        </CardTitle>
        <CardDescription>
          {locale === 'en' 
            ? 'Percentage of time spent on each activity' 
            : 'Prozentsatz der Zeit, die für jede Aktivität aufgewendet wird'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={activityData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={120}
                paddingAngle={2}
                dataKey="value"
                nameKey="localizedName"
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                labelLine={false}
              >
                {activityData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}