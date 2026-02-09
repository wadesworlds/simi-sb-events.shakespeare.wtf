import { useQuery } from '@tanstack/react-query';

// Known public Google Calendars for the region
const PUBLIC_CALENDARS = [
  {
    id: 'conejovalleyguide@gmail.com',
    name: 'Ventura County Events'
  },
  // Add more public calendars here as we find them
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
  
  if (text.match(/music|concert|band|DJ|festival|performance|sing/i)) {
    return 'music';
  } else if (text.match(/food|restaurant|dining|cuisine|chef|cooking|wine|beer|tasting|brew/i)) {
    return 'food';
  } else if (text.match(/art|gallery|museum|theater|theatre|film|movie|exhibition|paint|comedy|author|book/i)) {
    return 'arts';
  } else if (text.match(/sport|fitness|yoga|gym|run|bike|hike|athletic|game|tournament|defense/i)) {
    return 'sports';
  } else if (text.match(/workshop|seminar|class|training|learn|education|course/i)) {
    return 'workshop';
  } else if (text.match(/community|charity|volunteer|fundraiser|meeting|town hall|neighborhood|library|garden|president/i)) {
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
    
    // Get start date/time
    let startDate: Date;
    let isAllDay = false;
    
    if (event.start.dateTime) {
      startDate = new Date(event.start.dateTime);
    } else if (event.start.date) {
      startDate = new Date(event.start.date);
      isAllDay = true;
    } else {
      return null;
    }
    
    // Skip past events
    if (startDate < new Date()) {
      return null;
    }
    
    // Get end date/time
    let endDate: Date | undefined;
    if (event.end.dateTime) {
      endDate = new Date(event.end.dateTime);
    } else if (event.end.date) {
      endDate = new Date(event.end.date);
    }
    
    // Format date
    const dateStr = startDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
    
    // Format time
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

async function fetchGoogleCalendarEvents(): Promise<ParsedEvent[]> {
  const allEvents: ParsedEvent[] = [];
  
  for (const calendar of PUBLIC_CALENDARS) {
    try {
      // Get current date and max date (3 months from now)
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
      
      const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendar.id)}/events?${params.toString()}`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        console.warn(`Failed to fetch calendar ${calendar.name}:`, response.statusText);
        continue;
      }
      
      const data = await response.json();
      
      if (data.items && Array.isArray(data.items)) {
        for (const event of data.items) {
          const parsedEvent = parseGoogleEvent(event, calendar.name);
          if (parsedEvent) {
            allEvents.push(parsedEvent);
          }
        }
      }
    } catch (error) {
      console.warn(`Error fetching calendar ${calendar.name}:`, error);
    }
  }
  
  // Remove duplicates based on title and date
  const uniqueEvents = Array.from(
    new Map(allEvents.map(event => [`${event.title}-${event.date}`, event])).values()
  );
  
  // Sort by date
  uniqueEvents.sort((a, b) => {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    return dateA.getTime() - dateB.getTime();
  });
  
  return uniqueEvents;
}

export function useGoogleCalendarEvents() {
  return useQuery({
    queryKey: ['google-calendar-events'],
    queryFn: fetchGoogleCalendarEvents,
    staleTime: 1000 * 60 * 30, // 30 minutes
    retry: 2
  });
}
