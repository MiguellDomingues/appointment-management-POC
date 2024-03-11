front-end only POC for an appointment booking and management app

Built around how barber shops or nail salons operate, where each employee on a shift serves the customer for some amount of time during the entire appointment, such as 20 minutes for a haircut or 45 minutes for a manicure

2 types of users, appointers and appointees

appointers:

- configure employees, shifts, breaks and appointment types with different durations in order to create a schedule for the day
- view bookings as a requested appointment and may assign it to an available employee or reschedule to a different day 
- can view the days schedule, manage the days appointments, create appointments manually from walk-ins and telephone

appointees:

- select an appointment type from a popup form, select the desired date, time from a list of available times, and enter their name, email, and optionally, their telephone in order to request the appointment
- receive emails with updates about their appointment or any rescedualings. they click email links in order to confirm appoitment status changes, or to cancel their appointment

With some tweaking, the app can manage the scheduling of mixed appointments, where a customer may be served by an employee for some amount of time and then be put on a peice of equipment such as a tanning bed for another amount of time, freeing up the employee to serve other customers during their appointments. This is also not unlike scheduling for doctor offices and physiotherapy clincs 

libraries:
  - react-big-calendar for visualizing appointments and shifts across time spans 
  - react-data-table-component for displaying tabular data
  - zustand for state management
  - react-hook-form for input forms



