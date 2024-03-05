import {useState, useEffect} from 'react'

import useBoundStore from "../store";

import { useForm } from 'react-hook-form'



//import IconList from '../components/IconList'
//import LoadingWrapper from '../components/LoadingWrapper'

import moment from "moment";

import { 

    initObjects,
    getIntervalsWithAppointmentCapacity,
    getTimeSlotAvailabilities,

 } from '../intervals.js'
import { Interval, IntervalSet } from '../classes.js';

/*
plan for appointment bookings:

user clicks Book Appointment to open the modal
- do a callout to backend w location_id, selected service
- clicking next moonth on the calendar will do another callout for the next month

- backend looks at location appointments with date/time = today/now up to end of the month and status = requested, status = confirmed
- get the location breaks
- get the location working plan

- now we need to look at the days, start/end times of each appointment, the breaks and workingplan to construct a sceduale that the client consumes to construct a calendar where:
    - the non-working days are unselectable
    - each day is colored:
        green: 75%-100% availability
        yellow: 25%->75% availability
        red: 0-25% availability
        X: unselectable; no availability because the appointment duration is longer then any spare time between appointments
    
*/

//const totalMinutesToHoursMinutes= totalMins => ({h: Math.floor(totalMins/60) , m: totalMins%60})

const totalMinutesToHoursMinutesString = (totalMins, is24HourFormat = false) => {

  const hours = is24HourFormat ? Math.floor(totalMins/60) 
  : 
  Math.floor(totalMins/60) === 12 ? 
    Math.floor(totalMins/60) 
    : 
    Math.floor(totalMins/60)%12

  return `${new String(hours)}:${new String(totalMins%60).padStart(2, '0')} ${Math.floor(totalMins/60) < 12 ? `AM` : `PM`}`
}

const SERVICE_TYPES = Object.freeze({
    HAIRCUT: {duration: 15, name: "HairCut"},
    PERM: {duration: 30, name: "Perm"},
    COLOURING: {duration: 45, name: "Colouring"},
})

const mock_dates = [
    {
        date: "2023-12-07",
        dotw: "Monday",
        sceduale: [
            {
                start: 0,
                end: 60,
                availability: 50,
                open_times: [10,20,30]
            },
            {
                start: 60,
                end: 120,
                availability: 90,
                open_times: [60,70,110]
            },
        ],
        day_availability: 50,

    },
    /*
    {
        date: "2023-12-08",
        dotw: "Tuesday",
        sceduale: [
            {
                start: 0,
                end: 60,
                availability: 0,
                open_times: []
            },
            {
                start: 60,
                end: 120,
                availability: 40,
                open_times: [65,105]
            },
        ],
        day_availability: 80,

    },*/
 
]

function AppointmentBooking({onClose}){

    const {
        addAppointment,
        appointments,
        workDays,
        getBreakById,
        getShiftById,
    } = useBoundStore((state) => ({...state})) //shorthand to get all data/funcs of obj

    const { register, handleSubmit } = useForm();

    const [currentFlowIndex, setCurrentFlowIndex ] = useState(0)
    

    const [appointmentType, setAppointmentType ] = useState(null);


    const [possibleBookingDates, setPossibleBookingDates ] = useState([]);
    const [selectedDate, setSelectedDate ] = useState(null);

    
    const [dateTimeSlots, setDateTimeSlots ] = useState([]);
    const [selectedTimeSlot, setSelectedTimeSlot ] = useState(null);

    const [bookingTimes, setBookingTimes ] = useState([]);
    const [selectedBookingTime, setSelectedBookingTime ] = useState(null);

    useEffect(()=>{ //when a new date is selected, get the corresponding time slots and clear the currently selected time slot
      setDateTimeSlots( (possibleBookingDates.find( ({date})=> date === selectedDate))?.sceduale || []  )
      setSelectedTimeSlot(null)
    }, [selectedDate])

    
    useEffect(()=>{ //when a new time slot is selected, get the corresponding booking times 
      setBookingTimes( selectedTimeSlot?.open_times  )
      setSelectedBookingTime(null)
    }, [selectedTimeSlot])



    console.log("appointmentDuration",appointmentType)

    //const selectedIcon = selectedIcons[0] ?? null

   // const selectedServiceDuration = location.serviceDurations.find(sd=>sd.service === selectedIcon) ?? null

   

   // console.log("selectedServiceDuration: ", selectedServiceDuration

   //console.log("possibleBookingDates: ", possibleBookingDates)
  // console.log("dateTimeSlots: ", dateTimeSlots) // (possibleBookingDates.find( ({date})=> date === selected_date)).sceduale )
  


    const fetchPossibleBookings = (appointmentType, appointments)=>{

        const { duration } = appointmentType

        const todaysSceduale = initObjects(workDays,getBreakById, getShiftById)[0]

        const {shifts, breaks} = todaysSceduale

        console.log("raw apts: ", appointments)

        const _appointments = appointments.map(({start,end, status, assigned_to})=>{
            if(status === "REQUESTED")
                return new IntervalSet(start, end, [], [], 1)
            else
                return new IntervalSet(start, end, [assigned_to])
        })

        //console.log(shifts, breaks, _appointments)

        const a = getIntervalsWithAppointmentCapacity(shifts, breaks.concat(_appointments))

        console.log(duration)

        const timeslots = [
            new Interval("08:00","10:00"),
            new Interval("10:00","12:00"),
            new Interval("12:00","14:00"),
            new Interval("14:00","17:00")
        ]

        const b = getTimeSlotAvailabilities(a, duration, timeslots)

        console.log(b)

        mock_dates[0].sceduale = timeslots.map((ts,idx)=>{
            return {
                start: ts.start,
                end: ts.end,
                open_times: b[idx],
                availability: 50,

            }
        })

        setPossibleBookingDates(mock_dates)
        setSelectedDate(null)
    }

    function bookAppointment(selectedBookingTime, appointmentType, customerName, customerEmail){
    //console.log("booking appointment: ",selectedBookingTime )
        addAppointment({
            date: moment()._d,
            start: selectedBookingTime,
            end: selectedBookingTime+appointmentType.duration,
            customer_id: customerName,
            customer_email:customerEmail, 
            service_id: "",
            status: "REQUESTED",
            assigned_to: ""
        })
        onClose()

    }

    function nextFlow(){
        setCurrentFlowIndex(currentFlowIndex=>currentFlowIndex+1)
    }

    const previousFlow = () => setCurrentFlowIndex(currentFlowIndex=>currentFlowIndex-1)
    
    const flows = [
      {
        cmp: <>
            <div>
            <h2>Selecting Service Duration</h2>
             <button onClick={e=>setAppointmentType(SERVICE_TYPES.HAIRCUT)}>Haircut (15)</button>  
             <button onClick={e=>setAppointmentType(SERVICE_TYPES.PERM)}>Perm (30)</button>  
             <button onClick={e=>setAppointmentType(SERVICE_TYPES.COLOURING)}>Coloring (45)</button>  
            </div>
        </>,

        onNext: ()=>{
          fetchPossibleBookings(appointmentType,appointments)
          return true
        },

        canNext: !!appointmentType

      },
      {
        
        cmp: <>
          <div className="appointment_selection_layout">

            <div className="appointment_selection_top_layout">
              <div className="appointment_selection_top_content">
                <div>appointment selection for {appointmentType?.name}</div>
                <div>duration: {appointmentType?.duration} minutes</div>
                <div>Availability Legend:</div>
                <div className="appointment_selection_top_legend">
                  <div>Very High</div>
                  <div style={{backgroundColor: getCSSColorByAvailability(80)}}>&emsp;</div>
                  <div>High</div>
                  <div style={{backgroundColor: getCSSColorByAvailability(70)}}>&emsp;</div>
                  <div>Medium</div>
                  <div style={{backgroundColor: getCSSColorByAvailability(45)}}>&emsp;</div>
                  <div>Low</div>
                  <div style={{backgroundColor: getCSSColorByAvailability(20)}}>&emsp;</div>
                </div>
                
              </div>
            </div>

           
            <div className="appointment_selection_middle_layout">

              <div className="appointment_selection_middle_content">
                <BookingDates 
                  possibleBookingSlots={possibleBookingDates} 
                  selectedDate={selectedDate} 
                  selectDate={(selected_date) => setSelectedDate(selected_date)}/>
              </div>

              <div className="appointment_selection_middle_content">
                <DateTimeSlots 
                  timeSlots={dateTimeSlots} 
                  selectedTimeSlot={selectedTimeSlot} 
                  selectTimeSlot={(timeSlot)=>setSelectedTimeSlot(timeSlot)}/>
              </div>

              <div className="appointment_selection_middle_content">
                <AvailableBookingTimes 
                  availableTimes={bookingTimes} 
                  selectedTime={selectedBookingTime} 
                  selectTime={(time)=>setSelectedBookingTime(time)} />
              </div>

            </div>

            <div className="appointment_selection_bottom_layout">
              <div className="appointment_selection_bottom_content">
                {selectedDate && selectedBookingTime ? 
                <>
                  booking appointment on: {selectedDate} {totalMinutesToHoursMinutesString(selectedBookingTime)} 
                </>:<></>}
              </div>
            </div>

          </div>

        </>,
        onPrevious:()=>{
            setAppointmentType(null)
            return true
        },
        canNext: !!selectedBookingTime//selectedTimeSlot  <button onClick={()=>{bookAppointment()}}>CONFIRM</button>
      },
      {
        cmp: <>
          appointment confirmation
          booking appointment on: {selectedDate} {totalMinutesToHoursMinutesString(selectedBookingTime)} 
          <form onSubmit={handleSubmit( ({customerName, customerEmail}) => bookAppointment(selectedBookingTime, appointmentType, customerName, customerEmail))}>
                <input {...register("customerName")} placeholder="Name" />
                <input {...register("customerEmail")} placeholder="Email" />
                <input type="submit" />
                
            </form>
        </>,

        //canNext: true
      },
    ]

    function wrapper(callbackProp, callbackFlow){
        callbackProp = callbackProp ?? ( ()=>true )
        return ()=>{
            if(callbackProp()) callbackFlow()
        }       
    }

    
    const currentFlowCmp = flows[currentFlowIndex].cmp ?? <></>
    const currentFlowOnNexthandler = wrapper( flows[currentFlowIndex].onNext, nextFlow )
    const currentFlowOnPreviousHandler = wrapper( flows[currentFlowIndex].onPrevious, previousFlow )   
    const currentFlowOnCanNext = flows[currentFlowIndex].canNext

    return(<div className='appointment_picker_body'>
      
      {currentFlowCmp}
      <div className='flow_buttons_container'>
       <div className='flow_buttons'>
          <button disabled={currentFlowIndex === 0} onClick={currentFlowOnPreviousHandler}>Back</button>  
          <button disabled={ (currentFlowIndex === flows.length-1) || !currentFlowOnCanNext } onClick={currentFlowOnNexthandler}>Next</button>
        </div>
      </div>
  
    </div>)
}

export default AppointmentBooking;

const getCSSColorByAvailability = (availability) =>
  availability === 0 ? null :
  availability < 25 ? "orangered" :
  availability < 50 ? "yellow" :
  availability < 75 ? "yellowgreen" : "green"

    
  

function BookingDates({possibleBookingSlots, selectedDate, selectDate}){


  possibleBookingSlots = possibleBookingSlots ?? []
  selectDate = selectDate ?? (()=>{})

  return(<>
    {possibleBookingSlots.map( (pbs, idx)=>
      <button
        style={{
          backgroundColor: getCSSColorByAvailability(pbs.day_availability), 
          border: pbs.date === selectedDate && "5px solid black" 
        }}
        disabled={pbs.day_availability === 0} 
        onClick={e=>selectDate(pbs.date)} 
        key={idx}>
          {`${pbs.date} ${pbs.dotw}`}
      </button>)}
  </>)

}

function DateTimeSlots({timeSlots, selectedTimeSlot, selectTimeSlot}){

  timeSlots = timeSlots ?? []
  selectTimeSlot = selectTimeSlot ?? (()=>{})

  return(<>
    {timeSlots.filter(ts=>ts.availability !== 0) //remove 0 availability time slots
      .map( (ts, idx)=>
        <span
          style={{
            backgroundColor: getCSSColorByAvailability(ts.availability),
            border: ts.start === selectedTimeSlot?.start && "5px solid black" 
          }} 
          onClick={e=>selectTimeSlot(ts)} 
          key={idx}>
          {`${totalMinutesToHoursMinutesString(ts.start)} to ${totalMinutesToHoursMinutesString(ts.end)} `}<br/>{ts.desc}     
        </span> 
    )}
  </>)

}

function AvailableBookingTimes({availableTimes, selectedTime, selectTime}){

    console.log("selectedTime: ", selectedTime)

  availableTimes = availableTimes ?? []
  selectTime = selectTime ?? (()=>{})

  return(<>
    {availableTimes.map( (time, idx)=>
      <div
        style={{
          border: time === selectedTime && "5px solid black" 
        }} 
        onClick={e=>selectTime(time)} 
        key={idx}>
          {totalMinutesToHoursMinutesString(time)}
      </div>
    )}
  </>)

}

/*
function AppointmentPicker({
  _possibleBookingDates,
  _selectedDate,
  selectedIcon
}){


  const [possibleBookingDates, setPossibleBookingDates ] = useState(_possibleBookingDates);
  const [selectedDate, setSelectedDate ] = useState(_selectedDate);

  const [dateTimeSlots, setDateTimeSlots ] = useState([]);
  const [selectedTimeSlot, setSelectedTimeSlot ] = useState(null);

  const [bookingTimes, setBookingTimes ] = useState([]);
  const [selectedBookingTime, setSelectedBookingTime ] = useState(null);

  return( <div className="appointment_selection_layout">

  <div className="appointment_selection_top_layout">
    <div className="appointment_selection_top_content">
      <div>appointment selection for {getIconByKey(selectedIcon)}</div>
      <div>Availability Legend:</div>
      <div className="appointment_selection_top_legend">
        <div>Very High</div>
        <div style={{backgroundColor: getCSSColorByAvailability(80)}}>&emsp;</div>
        <div>High</div>
        <div style={{backgroundColor: getCSSColorByAvailability(70)}}>&emsp;</div>
        <div>Medium</div>
        <div style={{backgroundColor: getCSSColorByAvailability(45)}}>&emsp;</div>
        <div>Low</div>
        <div style={{backgroundColor: getCSSColorByAvailability(20)}}>&emsp;</div>
      </div>
      
    </div>
  </div>

  <div className="appointment_selection_middle_layout">

    <div className="appointment_selection_middle_content">
      <BookingDates 
        possibleBookingSlots={possibleBookingDates} 
        selectedDate={selectedDate} 
        selectDate={(selected_date) => setSelectedDate(selected_date)}/>
    </div>

    <div className="appointment_selection_middle_content">
      <DateTimeSlots 
        timeSlots={dateTimeSlots} 
        selectedTimeSlot={selectedTimeSlot} 
        selectTimeSlot={(timeSlot)=>setSelectedTimeSlot(timeSlot)}/>
    </div>

    <div className="appointment_selection_middle_content">
      <AvailableBookingTimes 
        availableTimes={bookingTimes} 
        selectedTime={selectedBookingTime} 
        selectTime={(time)=>setSelectedBookingTime(time)} />
    </div>

  </div>

  <div className="appointment_selection_bottom_layout">
    <div className="appointment_selection_bottom_content">
      {selectedDate && selectedBookingTime ? 
      <>
        booking appointment on: {selectedDate} {totalMinutesToHoursMinutesString(selectedBookingTime)} 
      </>:<></>}
    </div>
  </div>

</div>)

}
*/





















/*
function Flows(){
  const [currentFlowIndex, setCurrentFlowIndex ] = useState(0)

  return(<div className='auth_body'>
      
      {currentFlowCmp}
      <button disabled={currentFlowIndex === 0} onClick={previousFlow}>Back</button>  
      <button disabled={currentFlowIndex === flows.length-1} onClick={e=>nextFlow(currentFlowOnNexthandler)}>Next</button>
  
    </div>)
}

  function ServicePicker( {location = {id: null, icons: [], serviceDurations: [{id: null}]} }){

    const services = location.icons ?? []
    const locationId = location.id ?? ""

    const {selectedIcons, toggleIconSingle } = useIcons();

    const selectedServiceDurationId = (location.serviceDurations.find(sd=>sd.service === selectedIcons[0]))?.id ?? null

    return (<>
      services
      <IconList iconSize={26} icons={services} selectedIcons={selectedIcons} toggleIcon={toggleIconSingle}/>   
    </>)
  }

  */