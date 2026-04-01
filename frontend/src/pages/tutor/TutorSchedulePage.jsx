import { useEffect, useState } from "react";
import api from "../../services/api";
import toast from "react-hot-toast";

const TutorSchedulePage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        const res = await api.get("/bookings");
        // Only show confirmed and ongoing sessions
        const filteredBookings = (res.data.bookings || []).filter(
          (b) => b.status === "confirmed" || b.status === "ongoing"
        );
        setBookings(filteredBookings);
      } catch (err) {
        toast.error("Failed to load schedule");
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
    const interval = setInterval(fetchBookings, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  // Time slots from 9 AM to 9 PM
  const timeSlots = [
    "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00",
    "16:00", "17:00", "18:00", "19:00", "20:00", "21:00"
  ];

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const dayShorts = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  // Get current week dates
  const getCurrentWeekDates = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Get Monday of this week
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
    const monday = new Date(today.setDate(diff));
    
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      date.setHours(0, 0, 0, 0);
      dates.push(date);
    }
    return dates;
  };

  const weekDates = getCurrentWeekDates();
  
  console.log("Week Dates:", weekDates.map(d => d.toLocaleDateString("en-IN")));
  console.log("Bookings:", bookings.map(b => ({ date: b.date, sessionTime: b.sessionTime, status: b.status })));

  const formatTime = (time) => {
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 === 0 ? 12 : hour % 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const getSessionForSlot = (dayIndex, timeSlot) => {
    const slotDate = new Date(weekDates[dayIndex]);
    slotDate.setHours(0, 0, 0, 0);

    const session = bookings.find((booking) => {
      if (!booking.date || !booking.sessionTime) return false;
      
      const bookingDate = new Date(booking.date);
      bookingDate.setHours(0, 0, 0, 0);

      // Ensure time is in HH:MM format (24-hour)
      let bookingTime = booking.sessionTime;
      if (bookingTime && typeof bookingTime === "string") {
        const parts = bookingTime.split(":");
        if (parts[0].length === 1) {
          bookingTime = `0${parts[0]}:${parts[1]}`;
        }
      }

      const isDateMatch = bookingDate.getTime() === slotDate.getTime();
      const isTimeMatch = bookingTime === timeSlot;
      
      if (isDateMatch && isTimeMatch) {
        console.log(`Found session: ${bookingDate.toLocaleDateString("en-IN")} ${bookingTime}`);
      }

      return isDateMatch && isTimeMatch;
    });
    
    return session;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <p className="text-gray-600 text-lg">Loading schedule...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Weekly Schedule</h1>
        <p className="text-gray-600 text-sm mt-1">
          Your tutoring sessions for {new Date().toLocaleDateString("en-IN", { month: "long", year: "numeric" })}
        </p>
      </div>

      {/* Schedule Grid */}
      <div className="bg-white rounded-lg shadow-md overflow-x-auto">
        <div className="min-w-full">
          {/* Header Row - Days */}
          <div className="grid gap-0 bg-gray-50 border-b border-gray-200" style={{
            gridTemplateColumns: "80px repeat(7, 1fr)"
          }}>
            <div className="p-4 border-r border-gray-200"></div>
            {dayShorts.map((day, idx) => (
              <div
                key={day}
                className="p-4 text-center border-r border-gray-200 last:border-r-0"
              >
                <p className="font-semibold text-gray-900">{day}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {weekDates[idx].toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                </p>
              </div>
            ))}
          </div>

          {/* Time Slots */}
          {timeSlots.map((timeSlot) => (
            <div
              key={timeSlot}
              className="grid gap-0 border-b border-gray-200 hover:bg-blue-50 transition-colors"
              style={{
                gridTemplateColumns: "80px repeat(7, 1fr)"
              }}
            >
              {/* Time Column */}
              <div className="p-4 bg-gray-50 border-r border-gray-200 font-semibold text-gray-700 text-center">
                <span className="text-sm">{formatTime(timeSlot)}</span>
              </div>

              {/* Day Cells */}
              {days.map((day, dayIndex) => {
                const session = getSessionForSlot(dayIndex, timeSlot);
                return (
                  <div
                    key={`${day}-${timeSlot}`}
                    className={`p-4 border-r border-gray-200 last:border-r-0 flex items-center justify-center text-center transition-all ${
                      session
                        ? "bg-indigo-50 border-l-4 border-l-indigo-600"
                        : "bg-white hover:bg-gray-50"
                    }`}
                  >
                    {session && (
                      <div className="inline-block px-3 py-1 bg-indigo-600 text-white text-xs font-semibold rounded">
                        Session
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <p className="text-sm font-semibold text-gray-900 mb-2">Legend:</p>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-indigo-50 border-l-4 border-l-indigo-600 rounded"></div>
            <span className="text-sm text-gray-700">Scheduled Session</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-white border border-gray-200 rounded"></div>
            <span className="text-sm text-gray-700">Available Time</span>
          </div>
        </div>
      </div>

      {/* Info */}
      {bookings.length === 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
          <p className="text-sm text-yellow-800">
            No sessions scheduled for this week. Students will be able to book available time slots.
          </p>
        </div>
      )}
    </div>
  );
};

export default TutorSchedulePage;
