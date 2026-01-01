import { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import type { Post, CalendarEvent } from '../types';
import { getPlatformColor } from '../utils/csvExport';

interface CalendarProps {
  posts: Post[];
  onEventDrop: (postId: string, newDate: Date) => void;
  onEventClick: (post: Post) => void;
  onDateClick: (date: Date) => void;
}

const Calendar = ({
  posts,
  onEventDrop,
  onEventClick,
  onDateClick,
}: CalendarProps) => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);

  useEffect(() => {
    const calendarEvents: CalendarEvent[] = posts
      .filter(post => post.scheduledTime || post.publishedTime)
      .map(post => {
        const eventDate = post.scheduledTime || post.publishedTime;
        return {
          id: post._id,
          title: `${getPlatformIcon(post.platform)} ${post.title}`,
          start: new Date(eventDate!),
          backgroundColor: getPlatformColor(post.platform),
          borderColor: getPlatformColor(post.platform),
          extendedProps: {
            post,
            status: post.status,
            platform: post.platform,
          },
        };
      });

    setEvents(calendarEvents);
  }, [posts]);

  const getPlatformIcon = (platform: string): string => {
    const icons: Record<string, string> = {
      Twitter: '🐦',
      LinkedIn: '💼',
      Facebook: '👥',
      Instagram: '📸',
    };
    return icons[platform] || '📱';
  };

  const handleEventDrop = async (info: any) => {
    try {
      await onEventDrop(info.event.id, info.event.start);
    } catch (error) {
      info.revert();
      alert('Failed to reschedule. The change has been reverted.');
    }
  };

  const handleEventClick = (info: any) => {
    onEventClick(info.event.extendedProps.post);
  };

  const handleDateClick = (info: any) => {
    const clickedDate = new Date(info.date);
    const now = new Date();

    if (clickedDate.toDateString() === now.toDateString()) {
      clickedDate.setHours(now.getHours(), 0, 0, 0);
    } else {
      clickedDate.setHours(9, 0, 0, 0);
    }

    onDateClick(clickedDate);
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      {/* HEADER */}
      <div className="mb-4">
        <h2 className="text-xl font-semibold">📅 Content Calendar</h2>
        <p className="text-sm text-gray-500">
          Drag and drop posts to reschedule
        </p>
      </div>

      {/* CALENDAR */}
      <div className="rounded-lg border border-gray-200 p-2">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay',
          }}
          events={events}
          editable
          droppable
          eventDrop={handleEventDrop}
          eventClick={handleEventClick}
          dateClick={handleDateClick}
          height="auto"
          nowIndicator
          weekends
          dayMaxEvents={3}
          slotMinTime="06:00:00"
          slotMaxTime="23:00:00"
          slotDuration="01:00:00"
        />
      </div>

      {/* LEGEND */}
      <div className="mt-5">
        <h4 className="text-sm font-semibold mb-2">Platform Legend</h4>
        <div className="flex flex-wrap gap-4 text-sm">
          {['Twitter', 'LinkedIn', 'Facebook', 'Instagram'].map(p => (
            <div key={p} className="flex items-center gap-2">
              <span
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: getPlatformColor(p) }}
              />
              <span>{getPlatformIcon(p)} {p}</span>
            </div>
          ))}
        </div>
      </div>

      {/* HELP */}
      <div className="mt-5 rounded-lg border border-gray-100 bg-gray-50 p-4 text-sm">
        <p className="font-medium mb-1">💡 Tips</p>
        <ul className="list-disc list-inside space-y-1 text-gray-600">
          <li>Click on a date to create a new post</li>
          <li>Drag events to reschedule</li>
          <li>Click an event to edit details</li>
          <li>Switch between month, week, and day views</li>
        </ul>
      </div>
    </div>
  );
};

export default Calendar;
