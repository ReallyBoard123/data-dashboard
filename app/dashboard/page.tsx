'use client';

import * as React from 'react';
import { AppSidebar } from '@/components/app-sidebar';
import { SiteHeader } from '@/components/site-header';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { ActivityTimeline } from '@/components/charts/activity-timeline';
import { RegionMap } from '@/components/charts/region-map';
import { ActivityDistribution } from '@/components/charts/activity-distribution';
import { RegionUtilization } from '@/components/charts/region-utilization';
import { FilterPanel } from '@/components/filter-panel';
import { useDataStore } from '@/store/useDataStore';
import { useI18nStore } from '@/store/useI18nStore';
import { TimeSeriesData } from '@/lib/data/types';
import { LayoutData } from '@/lib/data/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { IconUpload, IconFilter } from '@tabler/icons-react';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';

// Import sample data for initial load
import sampleTimeSeriesData from '@/data/sample_data.json';
import sampleLayoutData from '@/data/process_metadata.json';

export default function DashboardPage() {
  const { setTimeSeriesData, setLayoutData, isLoading } = useDataStore();
  const { locale } = useI18nStore();
  const [isFilterOpen, setIsFilterOpen] = React.useState(false);
  
  // Load sample data on component mount
  React.useEffect(() => {
    setTimeSeriesData(sampleTimeSeriesData as unknown as TimeSeriesData);
    setLayoutData(sampleLayoutData.layout as unknown as LayoutData);
  }, [setTimeSeriesData, setLayoutData]);
  
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        
        // Check if it's time series data or layout data
        if (json.metadata && json.records) {
          setTimeSeriesData(json as TimeSeriesData);
        } else if (json.layout) {
          setLayoutData(json.layout as LayoutData);
        }
      } catch (error) {
        console.error('Error parsing JSON:', error);
      }
    };
    reader.readAsText(file);
  };
  
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex justify-between items-center px-4 py-2 lg:px-6">
              <h1 className="text-2xl font-bold">
                {locale === 'en' ? 'Time Series Visualization' : 'Zeitreihen-Visualisierung'}
              </h1>
              <div className="flex gap-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline">
                      <IconUpload className="mr-2 h-4 w-4" />
                      {locale === 'en' ? 'Upload Data' : 'Daten hochladen'}
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>
                        {locale === 'en' ? 'Upload Data Files' : 'Datendateien hochladen'}
                      </DialogTitle>
                      <DialogDescription>
                        {locale === 'en' 
                          ? 'Upload a JSON file with time series data or layout information.' 
                          : 'Laden Sie eine JSON-Datei mit Zeitreihendaten oder Layoutinformationen hoch.'}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="flex flex-col items-center gap-4">
                        <input
                          type="file"
                          accept=".json"
                          className="cursor-pointer"
                          onChange={handleFileUpload}
                        />
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
                <Button 
                  variant="outline" 
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                >
                  <IconFilter className="mr-2 h-4 w-4" />
                  {locale === 'en' ? 'Filters' : 'Filter'}
                </Button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 px-4 lg:px-6">
              {isFilterOpen && (
                <div className="md:col-span-1">
                  <FilterPanel />
                </div>
              )}
              <div className={`${isFilterOpen ? 'md:col-span-3' : 'md:col-span-4'} flex flex-col gap-4`}>
                <Tabs defaultValue="timeline" className="w-full">
                  <TabsList>
                    <TabsTrigger value="timeline">
                      {locale === 'en' ? 'Timeline' : 'Zeitverlauf'}
                    </TabsTrigger>
                    <TabsTrigger value="regions">
                      {locale === 'en' ? 'Regions' : 'Regionen'}
                    </TabsTrigger>
                    <TabsTrigger value="activities">
                      {locale === 'en' ? 'Activities' : 'Aktivitäten'}
                    </TabsTrigger>
                    <TabsTrigger value="employees">
                      {locale === 'en' ? 'Employees' : 'Mitarbeiter'}
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="timeline" className="mt-4 space-y-4">
                    <ActivityTimeline />
                  </TabsContent>
                  
                  <TabsContent value="regions" className="mt-4 space-y-4">
                    <RegionMap />
                    <RegionUtilization />
                  </TabsContent>
                  
                  <TabsContent value="activities" className="mt-4 space-y-4">
                    <ActivityDistribution />
                  </TabsContent>
                  
                  <TabsContent value="employees" className="mt-4 space-y-4">
                    <div className="h-[400px] flex items-center justify-center border rounded-md">
                      {locale === 'en' 
                        ? 'Employee visualization coming soon' 
                        : 'Mitarbeiter-Visualisierung kommt bald'}
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}