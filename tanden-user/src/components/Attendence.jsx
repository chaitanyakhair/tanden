import React, { useEffect, useState } from 'react';
import { Card, Button, ButtonGroup, Modal } from 'react-bootstrap';
import toast from 'react-hot-toast';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../services/getBaseUrl';

const AttendanceCalendar = ({ attendance = [] }) => {
  const { token, user, socket } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [toMarkAttendanceDate, setToMarkAttendanceDate] = useState('');
  const [currentDate, setCurrentDate] = useState(new Date());

  const handleClose = () => setIsOpen(false);

  // Parse the attendance dates from DD/MM/YYYY format
  const parseDate = (dateStr) => {
    const [day, month, year] = dateStr.split('/');
    return new Date(year, month - 1, day);
  };

  // Convert attendance dates to Date objects
  const attendanceDates = attendance.map(date => parseDate(date));
  const startDate = attendanceDates.length > 0
    ? new Date(Math.min(...attendanceDates))
    : new Date();

  const today = new Date();

  const diffTime = Math.abs(today - startDate);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const presentDays = attendance.length;
  const absentDays = diffDays - presentDays;

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const getDateColor = (date) => {
    const currentDateTime = date.setHours(0, 0, 0, 0);
    const startDateTime = startDate.setHours(0, 0, 0, 0);
    const todayDateTime = today.setHours(0, 0, 0, 0);

    if (currentDateTime < startDateTime || currentDateTime > todayDateTime) {
      return 'bg-white';
    }

    const isAttended = attendanceDates.some(attendanceDate =>
      attendanceDate.setHours(0, 0, 0, 0) === currentDateTime
    );

    return isAttended ? 'bg-success' : 'bg-danger';
  };

  const openModel = (date) => {
    setToMarkAttendanceDate(new Date(new Date(currentDate).getFullYear(), new Date(currentDate).getMonth(), date))
    console.log()
    setIsOpen(true);
  };

  const formatDateForAPI = (date) => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const handleMarkAttendance = async () => {
    try {
      const { data } = await axios.post(`${API_URL}/api/user/mark-attendance`, {
        toMarkDate: formatDateForAPI(toMarkAttendanceDate)
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (data.success) {
        attendance.push(formatDateForAPI(toMarkAttendanceDate))
        toast.success("Attendance marked successfully");
        setIsOpen(false);
        setToMarkAttendanceDate('')
        socket.emit("attendance_marked", { date: formatDateForAPI(toMarkAttendanceDate),user:user._id })
      }
    } catch (error) {
      console.error("Error in marking attendance:", error);
      toast.error("Failed to mark attendance!");
    }
  };

  useEffect(() => {
    const addAttendance = (date) => {
      attendance.push(date.date)
    }

    socket.on("attendance_marked",addAttendance)

    return ()=>{ 
      socket.off("attendance_marked",addAttendance);
    }

  },[socket])

  const renderCalendar = () => {
    const days = [];

    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(
        <div key={`empty-${i}`} className="calendar-day empty" />
      );
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const colorClass = getDateColor(date);
      const isClickable = colorClass === 'bg-danger';

      days.push(
        <div
          onClick={() => isClickable && openModel(day)}
          key={day}
          className={`calendar-day ${colorClass} ${isClickable ? 'clickable' : ''}`}
        >
          {day}
        </div>
      );
    }

    return days;
  };

  return (
    <>
      <Card className="mx-auto" style={{ maxWidth: '28rem' }}>
        <Card.Header>
          <div className="text-center mb-3">
            <ButtonGroup>
              <Button variant="primary" className="px-3">
                Total: {diffDays}
              </Button>
              <Button variant="success" className="px-3">
                Present: {presentDays}
              </Button>
              <Button variant="danger" className="px-3">
                Absent: {absentDays}
              </Button>
            </ButtonGroup>
          </div>

          <div className="d-flex align-items-center justify-content-between">
            <Button
              variant="outline-secondary"
              size="sm"
              onClick={prevMonth}
            >
              ←
            </Button>
            <h5 className="mb-0 fw-bold">
              {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
            </h5>
            <Button
              variant="outline-secondary"
              size="sm"
              onClick={nextMonth}
            >
              →
            </Button>
          </div>
        </Card.Header>

        <Card.Body>
          <div className="calendar-grid">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="calendar-header">
                {day}
              </div>
            ))}
            {renderCalendar()}
          </div>

          <div className="d-flex justify-content-center gap-3 mt-3">
            <div className="d-flex align-items-center gap-2">
              <div className="status-dot bg-success"></div>
              <span>Present</span>
            </div>
            <div className="d-flex align-items-center gap-2">
              <div className="status-dot bg-danger"></div>
              <span>Absent</span>
            </div>
            <div className="d-flex align-items-center gap-2">
              <div className="status-dot bg-white border"></div>
              <span>Outside Range</span>
            </div>
          </div>
        </Card.Body>
      </Card>

      <Modal show={isOpen} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Mark Attendance</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you attended class on <b>{toMarkAttendanceDate && toMarkAttendanceDate.toDateString()}</b>?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleMarkAttendance}>
            Confirm
          </Button>
        </Modal.Footer>
      </Modal>

      <style jsx>{`
        .calendar-grid {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 0.25rem;
        }
        
        .calendar-header {
          height: 2rem;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.875rem;
          font-weight: 500;
          color: #6b7280;
        }
        
        .calendar-day {
          height: 2rem;
          width: 2rem;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.875rem;
          margin: 0 auto;
        }
        
        .calendar-day.empty {
          background: transparent;
        }
        
        .calendar-day.bg-success {
          background-color: var(--bs-success);
          color: white;
        }
        
        .calendar-day.bg-danger {
          background-color: var(--bs-danger);
          color: white;
        }
        
        .calendar-day.bg-white {
          background-color: white;
          color: #9ca3af;
        }
        
        .calendar-day.clickable {
          cursor: pointer;
        }
        
        .status-dot {
          width: 1rem;
          height: 1rem;
          border-radius: 50%;
        }
        
        .status-dot.border {
          border: 1px solid #dee2e6;
        }
      `}</style>
    </>
  );
};

export default AttendanceCalendar;