// components/charts/region-utilization.tsx
'use client';

import * as React from 'react';
import { useDataStore } from '@/store/useDataStore';
import { useI18nStore } from '@/store/useI18nStore';
import { calculateTimeByRegion } from '@/lib/data/processing';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDuration } from '@/lib/utils';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function RegionUtilization() {
  const { filteredRecords } = useDataStore();
  const { locale } = useI18nStore();
  
  const regionData = React.useMemo(() => {
    const timeByRegion = calculateTimeByRegion(filteredRecords);
    
    return Object.entries(timeByRegion)
      .map(([name, value]) => ({
        name,
        value,
        localizedName: locale === 'en'
          ? name
          : name === 'bedroom'
            ? 'Schlafzimmer'
            : name === 'living_room'
              ? 'Wohnzimmer'
              : name === 'kitchen'
                ? 'Küche'
                : name === 'bath'
                  ? 'Bad'
                  : name === 'guest_bedroom'
                    ? 'Gästezimmer'
                    : name === 'floor'
                      ? 'Flur'
                      : name === 'storage'
                        ? 'Abstellraum'
                        : name === 'Out of System'
                          ? 'Außerhalb'
                          : name
      }))
      .sort((a, b) => b.value - a.value);
  }, [filteredRecords, locale]);
  
  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background p-2 rounded-md border shadow-sm">
          <p className="font-medium">{payload[0].payload.localizedName}</p>
          <p className="text-sm">{formatDuration(payload[0].value, locale)}</p>
          <p className="text-xs text-muted-foreground">
            {Math.round(payload[0].value / regionData.reduce((sum, item) => sum + item.value, 0) * 100)}%
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
          {locale === 'en' ? 'Region Utilization' : 'Regionsnutzung'}
        </CardTitle>
        <CardDescription>
          {locale === 'en' 
            ? 'Time spent in each region' 
            : 'In jeder Region verbrachte Zeit'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={regionData}
              layout="vertical"
              margin={{
                top: 20,
                right: 30,
                left: 100,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
              <XAxis 
                type="number"
                tickFormatter={(value) => formatDuration(value, locale)}
              />
              <YAxis 
                dataKey="localizedName" 
                type="category" 
                tick={{ fontSize: 12 }}
                width={100}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}