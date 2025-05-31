// TimetableTable.jsx
import React from 'react';

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const dayMap = { Mon: 'Monday', Tue: 'Tuesday', Wed: 'Wednesday', Thu: 'Thursday', Fri: 'Friday' };
const slots = ['Slot 1', 'Slot 2', 'Slot 3', 'Slot 4', 'Slot 5', 'Slot 6', 'Slot 7', 'Slot 8', 'Slot 9'];

const TimetableTable = ({ data }) => {
  const cellMap = {};
  data.forEach(entry => {
    const dayFull = dayMap[entry.day];              // Map "Mon" → "Monday"
    const slotLabel = `Slot ${entry.slot}`;         // Map "9" → "Slot 9"
    if (dayFull && slots.includes(slotLabel)) {
      const key = `${dayFull}-${slotLabel}`;
      let details = '';
if (entry.faculty_name && entry.program_name) {
  details = ` (${entry.faculty_name}+${entry.program_name})`;
} else if (entry.faculty_name) {
  details = ` (${entry.faculty_name})`;
} else if (entry.program_name) {
  details = ` (${entry.program_name})`;
}

cellMap[key] = `${entry.subject_name}${details}`;

    }
  });

  return (
    <table className="table table-bordered text-center">
      <thead>
        <tr>
          <th>Day / Slot</th>
          {slots.map(slot => <th key={slot}>{slot}</th>)}
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
