import { useSeoMeta } from '@unhead/react';
import { useState } from 'react';
import { Calendar, MapPin, Filter } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useGoogleCalendarEvents } from '@/hooks/useGoogleCalendarEvents';

const categories = [
  { value: 'all', label: 'All Events' },
  { value: 'community', label: 'Community' },
  { value: 'sports', label: 'Sports' },
  { value: 'arts', label: 'Arts & Culture' },
  { value: 'workshop', label: 'Workshops' },
  { value: 'food', label: 'Food & Dining' },
  { value: 'music', label: 'Music' },
  { value: 'other', label: 'Other' }
];

const categoryColors: Record<string, string> = {
  community: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  sports: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  arts: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  workshop: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  food: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  music: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
  other: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
};

const Index = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const { data: events, isLoading, error } = useGoogleCalendarEvents();

  useSeoMeta({
    title: 'Simi Valley to Santa Barbara Events - Discover Local Happenings',
    description: 'Find and explore upcoming events from Simi Valley to Santa Barbara. Community gatherings, concerts, sports, arts, and more.',
  });

  const filteredEvents = selectedCategory === 'all' 
    ? events || []
    : (events || []).filter(event => event.category === selectedCategory);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Hero Section */}
      <div className="relative isolate overflow-hidden bg-white border-b">
        <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
          <div className="mx-auto max-w-2xl lg:mx-0 lg:max-w-xl">
            <h1 className="text-4xl font-bold tracking-tight text-black sm:text-6xl">
              Discover Southern California
            </h1>
            <p className="mt-6 text-lg leading-8 text-black">
              Explore amazing events from Simi Valley to Santa Barbara. From community gatherings to concerts, 
              workshops to festivals—discover what's happening in your area.
            </p>
            <div className="mt-10 flex items-center gap-x-6">
              <Button 
                size="lg" 
                variant="default" 
                className="bg-blue-600 text-white hover:bg-blue-700"
                onClick={() => document.getElementById('events')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Browse Events
              </Button>
              <a href="#events" className="text-sm font-semibold leading-6 text-black hover:text-gray-700">
                Learn more <span aria-hidden="true">→</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Section */}
      <div id="events" className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <Filter className="h-5 w-5 text-muted-foreground" />
              <h2 className="text-2xl font-semibold">Upcoming Events</h2>
            </div>
            {events && events.length > 0 && (
              <p className="text-sm text-muted-foreground">
                Showing {filteredEvents.length} of {events.length} events
              </p>
            )}
          </div>
          
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Button
                key={category.value}
                variant={selectedCategory === category.value ? 'default' : 'outline'}
                onClick={() => setSelectedCategory(category.value)}
                className="rounded-full"
              >
                {category.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-6 w-3/4" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-5/6" />
                    </div>
                    <Skeleton className="h-6 w-20" />
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-4 w-36" />
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="mt-8">
            <Card className="border-dashed border-red-300 dark:border-red-800">
              <CardContent className="py-12 px-8 text-center">
                <div className="max-w-sm mx-auto space-y-4">
                  <p className="text-red-600 dark:text-red-400 font-semibold">
                    Failed to load events
                  </p>
                  <p className="text-sm text-muted-foreground">
                    There was an error fetching events. Please try again later.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Events Grid */}
        {!isLoading && !error && events && (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredEvents.map((event) => (
              <Card key={event.id} className="hover:shadow-lg transition-shadow duration-200 flex flex-col">
                <CardHeader className="flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <CardTitle className="text-xl line-clamp-2">{event.title}</CardTitle>
                      <CardDescription className="mt-2 line-clamp-3">
                        {event.description}
                      </CardDescription>
                    </div>
                    <Badge className={categoryColors[event.category]}>
                      {event.category}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4 flex-shrink-0" />
                    <span>{event.date}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4 flex-shrink-0" />
                    <span>{event.time}</span>
                  </div>
                  <div className="flex items-start gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4 flex-shrink-0 mt-0.5" />
                    <span className="line-clamp-2">{event.location}</span>
                  </div>
                  {event.calendarSource && (
                    <div className="pt-2 border-t">
                      <p className="text-xs text-muted-foreground">
                        Source: {event.calendarSource}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && filteredEvents.length === 0 && events && events.length > 0 && (
          <div className="mt-8">
            <Card className="border-dashed">
              <CardContent className="py-12 px-8 text-center">
                <div className="max-w-sm mx-auto space-y-6">
                  <p className="text-muted-foreground">
                    No events found in this category. Try selecting a different category.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* No Events Found */}
        {!isLoading && !error && events && events.length === 0 && (
          <div className="mt-8">
            <Card className="border-dashed">
              <CardContent className="py-12 px-8 text-center">
                <div className="max-w-sm mx-auto space-y-6">
                  <p className="text-muted-foreground">
                    No upcoming events found. Check back soon!
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="mt-20 border-t bg-slate-50 dark:bg-gray-900">
        <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <h3 className="text-sm font-semibold mb-4">About</h3>
              <p className="text-sm text-muted-foreground">
                Your source for discovering events from Simi Valley to Santa Barbara.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold mb-4">Coverage Area</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Simi Valley & Thousand Oaks</li>
                <li>Ventura County</li>
                <li>Santa Barbara County</li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold mb-4">Categories</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Community Events</li>
                <li>Music & Arts</li>
                <li>Sports & Workshops</li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold mb-4">Connect</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Powered by community calendars
              </p>
              <a 
                href="https://shakespeare.diy" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Vibed with Shakespeare
              </a>
            </div>
          </div>
          <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
            © 2026 Simi Valley to Santa Barbara Events. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
