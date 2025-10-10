import React, { useEffect, useState } from 'react';
import { createLiveRegionAria } from '../utils/accessibility';
import { ScreenReaderOnly } from './ScreenReaderOnly';

export interface AnnouncementProps {
  message: string;
  priority?: 'polite' | 'assertive';
  atomic?: boolean;
  clearAfter?: number; // milliseconds
}

/**
 * Component for announcing messages to screen readers
 * Uses ARIA live regions to communicate dynamic content changes
 */
export function Announcement({ 
  message, 
  priority = 'polite', 
  atomic = true,
  clearAfter = 5000 
}: AnnouncementProps) {
  const [currentMessage, setCurrentMessage] = useState(message);

  useEffect(() => {
    setCurrentMessage(message);

    if (clearAfter > 0) {
      const timer = setTimeout(() => {
        setCurrentMessage('');
      }, clearAfter);

      return () => clearTimeout(timer);
    }
  }, [message, clearAfter]);

  const ariaProps = createLiveRegionAria(priority, atomic);

  return (
    <ScreenReaderOnly {...ariaProps}>
      {currentMessage}
    </ScreenReaderOnly>
  );
}

export default Announcement;