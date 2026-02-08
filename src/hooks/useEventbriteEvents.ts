import { useQuery } from '@tanstack/react-query';

const EVENTBRITE_TOKEN = '5YBJDMIDVDAEVZC4YCS6';
const CORS_PROXY = 'https://proxy.shakespeare.diy/?url=';

interface EventbriteVenue {
  address?: {
    city?: string;
    region?: string;
    address_1?: string;
    address_2?: string;
  };
  name?: string;
}

interface EventbriteEvent {
  id: string;
  name: {
    text: string;
  };
  description?: {
    text: string;
  };
  start: {
    local: string;
    timezone: string;
  };
  end: {
    local: string;
    timezone: string;
  };
  url: string;
  logo?: {
    url: string;
  };
  venue?: EventbriteVenue;
  category?: {
    name: string;
  };
  subcategory?: {
    name: string;
  };
  is_free?: boolean;
}

interface EventbriteResponse {
  events: EventbriteEvent[];
  pagination: {
    page_count: number;
    page_number: number;
    page_size: number;
  };
}

export interface ParsedEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  endTime?: string;
  location: string;
  category: string;
  description: string;
  url: string;
  imageUrl?: string;
  isFree?: boolean;
}

// Cities in the region from Simi Valley to Santa Barbara
const REGION_CITIES = [
  'Simi Valley',
  'Thousand Oaks',
  'Moorpark',
  'Camarillo',
  'Oxnard',
  'Ventura',
  'Ojai',
  'Santa Paula',
  'Fillmore',
  'Carpinteria',
  'Santa Barbara',
  'Goleta',
  'Montecito'
];

function parseEventbriteEvent(event: EventbriteEvent): ParsedEvent {
  const startDate = new Date(event.start.local);
  const endDate = new Date(event.end.local);
  
  // Format date
  const dateStr = startDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
  
  // Format time
  const timeStr = startDate.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
  
  const endTimeStr = endDate.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
  
  // Get location
  let location = 'Online Event';
  if (event.venue?.name) {
    location = event.venue.name;
    if (event.venue.address?.city) {
      location += `, ${event.venue.address.city}`;
    }
  }
  
  // Determine category
  let category = 'other';
  const categoryName = event.category?.name?.toLowerCase() || '';
  const subcategoryName = event.subcategory?.name?.toLowerCase() || '';
  
  if (categoryName.includes('music') || subcategoryName.includes('music')) {
    category = 'music';
  } else if (categoryName.includes('food') || subcategoryName.includes('food')) {
    category = 'food';
  } else if (categoryName.includes('art') || categoryName.includes('culture') || subcategoryName.includes('art')) {
    category = 'arts';
  } else if (categoryName.includes('sport') || categoryName.includes('fitness') || subcategoryName.includes('sport')) {
    category = 'sports';
  } else if (categoryName.includes('business') || categoryName.includes('seminar') || categoryName.includes('workshop')) {
    category = 'workshop';
  } else if (categoryName.includes('community') || categoryName.includes('charity') || categoryName.includes('fundraiser')) {
    category = 'community';
  }
  
  return {
    id: event.id,
    title: event.name.text,
    date: dateStr,
    time: `${timeStr} - ${endTimeStr}`,
    endTime: endTimeStr,
    location,
    category,
    description: event.description?.text || event.name.text,
    url: event.url,
    imageUrl: event.logo?.url,
    isFree: event.is_free
  };
}

async function fetchEventbriteEvents(): Promise<ParsedEvent[]> {
  const allEvents: ParsedEvent[] = [];
  
  // Search for events in each city
  for (const city of REGION_CITIES) {
    try {
      const searchParams = new URLSearchParams({
        'location.address': city,
        'location.within': '15mi',
        'expand': 'venue,category,subcategory',
        'page_size': '50',
        'sort_by': 'date'
      });
      
      const url = `https://www.eventbriteapi.com/v3/events/search/?${searchParams.toString()}`;
      const proxiedUrl = `${CORS_PROXY}${encodeURIComponent(url)}`;
      
      const response = await fetch(proxiedUrl, {
        headers: {
          'Authorization': `Bearer ${EVENTBRITE_TOKEN}`
        }
      });
      
      if (!response.ok) {
        console.warn(`Failed to fetch events for ${city}:`, response.statusText);
        continue;
      }
      
      const data: EventbriteResponse = await response.json();
      
      if (data.events && data.events.length > 0) {
        const parsedEvents = data.events.map(parseEventbriteEvent);
        allEvents.push(...parsedEvents);
      }
    } catch (error) {
      console.warn(`Error fetching events for ${city}:`, error);
    }
  }
  
  // Remove duplicates based on event ID
  const uniqueEvents = Array.from(
    new Map(allEvents.map(event => [event.id, event])).values()
  );
  
  // Sort by date
  uniqueEvents.sort((a, b) => {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    return dateA.getTime() - dateB.getTime();
  });
  
  return uniqueEvents;
}

export function useEventbriteEvents() {
  return useQuery({
    queryKey: ['eventbrite-events'],
    queryFn: fetchEventbriteEvents,
    staleTime: 1000 * 60 * 30, // 30 minutes
    retry: 2
  });
}
