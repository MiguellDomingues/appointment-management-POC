front-end only POC for an appointment booking and management app

Built around how barber shops or nail salons operate, where each employee on a shift serves the customer for some amount of time such as 10 minutes for a buzzcut or 45 minutes for a manicure

2 types of users, appointers and appointees

- appointers configure employees, shifts, breaks and appointment types with different durations in order to create a schedule for the day
- appointees select an appointment type from a popup form, select the desired date,time from a list of available times, and enter their name, email, and optionally, their telephone
- appointers receive the booking as a requested appointment and assign it to an available employee or reschedule to a different day
- appointers can view the days schedule, manage the days appointments, create appointments manually from walk-ins and telephone
- appointees receive emails with updates about their appointment, any rescedualings. they click email links in order to confirm appoitment status changes, or to cancel their appointment 

It can also manage the scheduling of mixed appointments, where a customer may be served by an employee for some amount of time,and then be put on a peice of equipment such as a tanning bed for another amount of time, freeing up the employee to serve other customers. With some tweaking, it could even manage scheduling for hospitals and physiotherapy clincs. 

libraries:
  - react-big-calendar for visualizing appointments and shifts across time spans 
  - react-data-table-component for displaying tabular data
  - zustand for state management
  - react-hook-form for input forms



