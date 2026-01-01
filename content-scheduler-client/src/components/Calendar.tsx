import { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import type{ Post, CalendarEvent } from '../types';
import { getPlatformColor } from '../utils/csvExport';
 
interface CalendarProps {
  posts: Post[];
  onEventDrop: (postId: string, newDate: Date) => void;
  onEventClick: (post: Post) => void;
  onDateClick: (date: Date) => void;
}

const Calendar = ({ posts, onEventDrop, onEventClick, onDateClick }: CalendarProps) => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);

  useEffect(() => {
    // Convert posts to calendar events
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
            platform: post.platform
          }
        };
      });
    
    setEvents(calendarEvents);
  }, [posts]);

  const getPlatformIcon = (platform: string): string => {
    const icons: Record<string, string> = {
      'Twitter': '🐦',
      'LinkedIn': '💼',
      'Facebook': '👥',
      'Instagram': '📸'
    };
    return icons[platform] || '📱';
  };

  const handleEventDrop = async (info: any) => {
    try {
      const postId = info.event.id;
      const newDate = info.event.start;
      
      // Call the parent handler
      await onEventDrop(postId, newDate);
      
      console.log('✅ Event rescheduled successfully');
    } catch (error) {
      // Revert the event to its original position on error
      info.revert();
      console.error('❌ Failed to reschedule event:', error);
      alert('Failed to reschedule. The change has been reverted.');
    }
  };

  const handleEventClick = (info: any) => {
    const post = info.event.extendedProps.post;
    onEventClick(post);
  };

  const handleDateClick = (info: any) => {
    const clickedDate = new Date(info.date);
    // Set time to current hour if date is today, otherwise 9 AM
    const now = new Date();
    if (clickedDate.toDateString() === now.toDateString()) {
      clickedDate.setHours(now.getHours(), 0, 0, 0);
    } else {
      clickedDate.setHours(9, 0, 0, 0);
    }
    onDateClick(clickedDate);
  };

  const handleEventResize = async (info: any) => {
    // Handle event duration changes if needed
    console.log('Event resized:', info);
  };

  return (
    <div className="calendar-container">
      <div className="calendar-header">
        <h2>📅 Content Calendar</h2>
        <p className="calendar-subtitle">Drag and drop posts to reschedule</p>
      </div>

      <div className="calendar-wrapper">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
          }}
          events={events}
          editable={true}
          droppable={true}
          eventDrop={handleEventDrop}
          eventClick={handleEventClick}
          dateClick={handleDateClick}
          eventResize={handleEventResize}
          height="auto"
          eventTimeFormat={{
            hour: '2-digit',
            minute: '2-digit',
            meridiem: 'short'
          }}
          slotMinTime="06:00:00"
          slotMaxTime="23:00:00"
          slotDuration="01:00:00"
          expandRows={true}
          nowIndicator={true}
          weekends={true}
          dayMaxEvents={3}
          moreLinkText="more"
          eventDisplay="block"
          displayEventTime={true}
          displayEventEnd={false}
          eventConstraint={{
            start: '06:00',
            end: '23:00'
          }}
        />
      </div>

      <div className="calendar-legend">
        <h4>Platform Legend:</h4>
        <div className="legend-items">
          <div className="legend-item">
            <span className="legend-color" style={{ backgroundColor: getPlatformColor('Twitter') }}></span>
            <span>🐦 Twitter</span>
          </div>
          <div className="legend-item">
            <span className="legend-color" style={{ backgroundColor: getPlatformColor('LinkedIn') }}></span>
            <span>💼 LinkedIn</span>
          </div>
          <div className="legend-item">
            <span className="legend-color" style={{ backgroundColor: getPlatformColor('Facebook') }}></span>
            <span>👥 Facebook</span>
          </div>
          <div className="legend-item">
            <span className="legend-color" style={{ backgroundColor: getPlatformColor('Instagram') }}></span>
            <span>📸 Instagram</span>
          </div>
        </div>
      </div>

      <div className="calendar-help">
        <p>💡 <strong>Tips:</strong></p>
        <ul>
          <li>Click on any date to create a new post</li>
          <li>Drag and drop events to reschedule them</li>
          <li>Click on an event to view or edit details</li>
          <li>Switch between month, week, and day views</li>
        </ul>
      </div>
    </div>
  );
};

export default Calendar;