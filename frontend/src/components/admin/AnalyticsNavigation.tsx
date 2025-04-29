import React from 'react';
import AnalyticsNav from './AnalyticsNav';

/**
 * AnalyticsNavigation component
 * This is a wrapper around AnalyticsNav for backward compatibility
 */
const AnalyticsNavigation: React.FC = () => {
  // Use the new AnalyticsNav component for consistency
  return <AnalyticsNav />;

};

export default AnalyticsNavigation;
