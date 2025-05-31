import React from 'react';

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

const dayMap = {
  Mon: 'Monday',
  Tue: 'Tuesday',
  Wed: 'Wednesday',
  Thu: 'Thursday',
  Fri: 'Friday'
};

const slotMap = {
  1: '9:30–10:15',
  2: '10:15–11:00',
  3: '11:15–12:00',
  4: '12:00–12:45',
  5: '1:45–2:30',
  6: '2:30–3:15',
  7: '3:15–4:00'
};

const slots = Object.keys(slotMap); // ['1', '2', ..., '7']

const TimetableTable = ({ data }) => {
  const cellMap = {};
  data.forEach(entry => {
    const day = dayMap[entry.day] || entry.day; // Map short day to full name
    const slot = entry.slot.toString(); // Ensure slot is string
    const key = `${day}-${slot}`;
    cellMap[key] = `${entry.subject_name} (${entry.faculty_name})`;
  });

  return (
    <table className="table table-bordered text-center">
      <thead className="thead-light">
        <tr>
          <th>Day / Time</th>
          {slots.map(slot => (
            <th key={slot}>{slotMap[slot]}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {days.map(day => (
          <tr key={day}>
            <td><strong>{day}</strong></td>
            {slots.map(slot => {
              const content = cellMap[`${day}-${slot}`] || '-';
              return <td key={slot}>{content}</td>;
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default TimetableTable;
