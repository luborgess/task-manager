import React from 'react';
import WeeklyLaundryCalendar from '../laundry-weekly-view';

const LaundryPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="container mx-auto">
        <WeeklyLaundryCalendar currentUser="lucas" />
      </div>
    </div>
  );
};

export default LaundryPage;
