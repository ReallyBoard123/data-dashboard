'use client';

import * as React from 'react';
import { useDataStore } from '@/store/useDataStore';
import { useI18nStore } from '@/store/useI18nStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { IconRefresh } from '@tabler/icons-react';


export function FilterPanel() {
  const { 
    timeSeriesData, 
    dateRange, 
    selectedEmployees, 
    selectedRegions, 
    selectedActivities,
    setDateRange,
    setSelectedEmployees,
    setSelectedRegions,
    setSelectedActivities,
    resetFilters
  } = useDataStore();
  const { locale } = useI18nStore();
  
  // Extract unique employees, regions, and activities
  const uniqueEmployees = React.useMemo(() => {
    if (!timeSeriesData) return [];
    return Array.from(new Set(timeSeriesData.records.map(r => r.id)));
  }, [timeSeriesData]);
  
  const uniqueRegions = React.useMemo(() => {
    if (!timeSeriesData) return [];
    return Array.from(new Set(timeSeriesData.records.map(r => r.region)));
  }, [timeSeriesData]);
  
  const uniqueActivities = React.useMemo(() => {
    if (!timeSeriesData) return [];
    return Array.from(new Set(timeSeriesData.records.map(r => r.activity)));
  }, [timeSeriesData]);
  
  // Handle checkbox changes
  const handleEmployeeChange = (employee: string, checked: boolean) => {
    if (checked) {
      setSelectedEmployees([...selectedEmployees, employee]);
    } else {
      setSelectedEmployees(selectedEmployees.filter(e => e !== employee));
    }
  };
  
  const handleRegionChange = (region: string, checked: boolean) => {
    if (checked) {
      setSelectedRegions([...selectedRegions, region]);
    } else {
      setSelectedRegions(selectedRegions.filter(r => r !== region));
    }
  };
  
  const handleActivityChange = (activity: string, checked: boolean) => {
    if (checked) {
      setSelectedActivities([...selectedActivities, activity]);
    } else {
      setSelectedActivities(selectedActivities.filter(a => a !== activity));
    }
  };
  
  if (!timeSeriesData) {
    return null;
  }
  
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>
            {locale === 'en' ? 'Filters' : 'Filter'}
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={resetFilters}>
            <IconRefresh className="h-4 w-4 mr-1" />
            {locale === 'en' ? 'Reset' : 'Zurücksetzen'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Date Range */}
          <div>
            <h3 className="text-sm font-medium mb-2">
              {locale === 'en' ? 'Date Range' : 'Datumsbereich'}
            </h3>
            <DateRangePicker
              from={dateRange?.[0] ? new Date(dateRange[0]) : undefined}
              to={dateRange?.[1] ? new Date(dateRange[1]) : undefined}
              onSelect={(range) => {
                if (range?.from && range?.to) {
                  setDateRange([
                    range.from.toISOString().split('T')[0],
                    range.to.toISOString().split('T')[0]
                  ]);
                }
              }}
            />
          </div>
          
          {/* Employees */}
          <div>
            <h3 className="text-sm font-medium mb-2">
              {locale === 'en' ? 'Employees' : 'Mitarbeiter'}
            </h3>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {uniqueEmployees.map(employee => (
                <div key={employee} className="flex items-center space-x-2">
                  <Checkbox
                    id={`employee-${employee}`}
                    checked={selectedEmployees.includes(employee)}
                    onCheckedChange={(checked) => 
                      handleEmployeeChange(employee, checked === true)
                    }
                  />
                  <Label htmlFor={`employee-${employee}`}>{employee}</Label>
                </div>
              ))}
            </div>
          </div>
          
          {/* Regions */}
          <div>
            <h3 className="text-sm font-medium mb-2">
              {locale === 'en' ? 'Regions' : 'Regionen'}
            </h3>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {uniqueRegions.map(region => (
                <div key={region} className="flex items-center space-x-2">
                  <Checkbox
                    id={`region-${region}`}
                    checked={selectedRegions.includes(region)}
                    onCheckedChange={(checked) => 
                      handleRegionChange(region, checked === true)
                    }
                  />
                  <Label htmlFor={`region-${region}`}>
                    {locale === 'en' 
                      ? region
                      : region === 'bedroom' 
                        ? 'Schlafzimmer'
                        : region === 'living_room'
                          ? 'Wohnzimmer'
                          : region === 'kitchen'
                            ? 'Küche'
                            : region === 'bath'
                              ? 'Bad'
                              : region === 'guest_bedroom'
                                ? 'Gästezimmer'
                                : region === 'floor'
                                  ? 'Flur'
                                  : region === 'storage'
                                    ? 'Abstellraum'
                                    : region === 'Out of System'
                                      ? 'Außerhalb'
                                      : region
                    }
                  </Label>
                </div>
              ))}
            </div>
          </div>
          
          {/* Activities */}
          <div>
            <h3 className="text-sm font-medium mb-2">
              {locale === 'en' ? 'Activities' : 'Aktivitäten'}
            </h3>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {uniqueActivities.map(activity => (
                <div key={activity} className="flex items-center space-x-2">
                  <Checkbox
                    id={`activity-${activity}`}
                    checked={selectedActivities.includes(activity)}
                    onCheckedChange={(checked) => 
                      handleActivityChange(activity, checked === true)
                    }
                  />
                  <Label htmlFor={`activity-${activity}`}>
                    {locale === 'en' 
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
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}