import { useQuery } from '@tanstack/react-query';

// Public Google Calendars for the Simi Valley to Santa Barbara region
// Uses the Google Calendar JSON API directly (no CORS proxy needed)
const PUBLIC_CALENDARS = [
  {
    id: 'conejovalleyguide@gmail.com',
    name: 'Ventura County Events'
  },
  // Add more public calendars here as they become available
  // Format: { id: 'calendar-id@gmail.com', name: 'Display Name' }
];

// Google Calendar API key (public, read-only)
const API_KEY = 'AIzaSyBNlYH01_9Hc5S1J9vuFmu2nUqBZJNAXxs';

export interface ParsedEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  endTime?: string;
  location: string;
  category: string;
  description: string;
  url?: string;
  calendarSource: string;
}

interface GoogleCalendarEvent {
  id: string;
  summary: string;
  description?: string;
  location?: string;
  start: {
    dateTime?: string;
    date?: string;
    timeZone?: string;
  };
  end: {
    dateTime?: string;
    date?: string;
    timeZone?: string;
  };
  htmlLink?: string;
}

function categorizeEvent(summary: string, description: string): string {
  const text = `${summary} ${description}`.toLowerCase();
  
  if (text.match(/music|concert|band|dj|festival|performance|sing|live entertainment/i)) {
    return 'music';
  } else if (text.match(/food|restaurant|dining|cuisine|chef|cooking|wine|beer|tasting|brew|taco|barbecue|bbq/i)) {
    return 'food';
  } else if (text.match(/art|gallery|museum|theater|theatre|film|movie|exhibition|paint|comedy|author|book|show|play/i)) {
    return 'arts';
  } else if (text.match(/sport|fitness|yoga|gym|run|bike|hike|athletic|game|tournament|defense|swim|race|marathon|triathlon/i)) {
    return 'sports';
  } else if (text.match(/workshop|seminar|class|training|learn|education|course/i)) {
    return 'workshop';
  } else if (text.match(/community|charity|volunteer|fundraiser|meeting|town hall|neighborhood|library|garden|president|fair|expo|market/i)) {
    return 'community';
  }
  
  return 'other';
}

function stripHtmlTags(html: string): string {
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

function parseGoogleEvent(event: GoogleCalendarEvent, calendarName: string): ParsedEvent | null {
  try {
    const summary = event.summary || 'Untitled Event';
    const description = event.description ? stripHtmlTags(event.description) : '';
    const location = event.location || 'Location TBA';
    
    let startDate: Date;
    let isAllDay = false;
    
    if (event.start.dateTime) {
      startDate = new Date(event.start.dateTime);
    } else if (event.start.date) {
      // All-day events: parse as local date to avoid timezone shifting
      const [year, month, day] = event.start.date.split('-').map(Number);
      startDate = new Date(year, month - 1, day);
      isAllDay = true;
    } else {
      return null;
    }
    
    // Skip past events (use start of today for all-day events)
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    if (isAllDay ? startDate < today : startDate < now) {
      return null;
    }
    
    let endDate: Date | undefined;
    if (event.end.dateTime) {
      endDate = new Date(event.end.dateTime);
    } else if (event.end.date) {
      const [year, month, day] = event.end.date.split('-').map(Number);
      endDate = new Date(year, month - 1, day);
    }
    
    const dateStr = startDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
    
    let timeStr = 'All Day';
    let endTimeStr: string | undefined = undefined;
    
    if (!isAllDay) {
      timeStr = startDate.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
      
      if (endDate) {
        endTimeStr = endDate.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        });
        timeStr = `${timeStr} - ${endTimeStr}`;
      }
    }
    
    const category = categorizeEvent(summary, description);
    
    return {
      id: event.id,
      title: summary,
      date: dateStr,
      time: timeStr,
      endTime: endTimeStr,
      location,
      category,
      description: description.substring(0, 300),
      url: event.htmlLink,
      calendarSource: calendarName
    };
  } catch (error) {
    console.warn('Error parsing Google Calendar event:', error);
    return null;
  }
}

async function fetchCalendarPage(
  calendarId: string,
  calendarName: string,
  pageToken?: string
): Promise<{ events: ParsedEvent[]; nextPageToken?: string }> {
  const now = new Date();
  const maxDate = new Date();
  maxDate.setMonth(maxDate.getMonth() + 3);
  
  const params = new URLSearchParams({
    key: API_KEY,
    timeMin: now.toISOString(),
    timeMax: maxDate.toISOString(),
    maxResults: '250',
    orderBy: 'startTime',
    singleEvents: 'true'
  });
  
  if (pageToken) {
    params.set('pageToken', pageToken);
  }
  
  const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events?${params.toString()}`;
  
  const response = await fetch(url);
  
  if (!response.ok) {
    const errorText = await response.text();
    console.warn(`Failed to fetch calendar "${calendarName}" (${response.status}):`, errorText);
    return { events: [] };
  }
  
  const data = await response.json();
  
  const events: ParsedEvent[] = [];
  if (data.items && Array.isArray(data.items)) {
    for (const event of data.items) {
      const parsedEvent = parseGoogleEvent(event, calendarName);
      if (parsedEvent) {
        events.push(parsedEvent);
      }
    }
  }
  
  return { events, nextPageToken: data.nextPageToken };
}

async function fetchGoogleCalendarEvents(): Promise<ParsedEvent[]> {
  const allEvents: ParsedEvent[] = [];
  
  for (const calendar of PUBLIC_CALENDARS) {
    try {
      let pageToken: string | undefined;
      
      do {
        const { events, nextPageToken } = await fetchCalendarPage(
          calendar.id,
          calendar.name,
          pageToken
        );
        allEvents.push(...events);
        pageToken = nextPageToken;
      } while (pageToken);
      
    } catch (error) {
      console.warn(`Error fetching calendar "${calendar.name}":`, error);
    }
  }
  
  // Remove duplicates based on title and date
  const uniqueEvents = Array.from(
    new Map(allEvents.map(event => [`${event.title}-${event.date}`, event])).values()
  );
  
  // Sort chronologically
  uniqueEvents.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  return uniqueEvents;
}

export function useGoogleCalendarEvents() {
  return useQuery({
    queryKey: ['google-calendar-events'],
    queryFn: fetchGoogleCalendarEvents,
    staleTime: 1000 * 60 * 30, // 30 minutes
    retry: 2,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 10000)
  });
}
