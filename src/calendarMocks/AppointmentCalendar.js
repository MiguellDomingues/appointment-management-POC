import { useState, useCallback, useMemo, useEffect } from "react"
import { Calendar,  Views, momentLocalizer } from "react-big-calendar";
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop'
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css'

import useBoundStore from "../store";

import moment from "moment";

//import {appointments} from '../assets/mock_data.js'
import {Interval,IntervalSet } from '../classes.js'

import { 
    getTimeSlotStep,
    getMinMaxWorkingPlanTimes,
    createCloseIntervals,
    initObjects,
    createAvailabilityCalendarEvents,
    createScedualeCalendarEvents,
    splitDiffOverlappingIntervalSets
 } from '../intervals.js'


const DnDCalendar = withDragAndDrop(Calendar)
moment.locale("en-CA");
const localizer = momentLocalizer(moment);


const EVENT_TYPES = Object.freeze({
    APPOINTMENT: "APPOINTMENT",
    SHIFT: "SHIFT",
    BREAK: "BREAK",
    SUMMARY: "SUMMARY",
    AVAILABILITY: "AVAILABILITY",
})

const APPOINTMENT_STATUS = Object.freeze({
    CONFIRMED: "CONFIRMED",
    REQUESTED: "REQUESTED",
    IN_PROGRESS: "IN_PROGRESS",
    CANCELED: "CANCELED",
    COMPLETED: "COMPLETED",
})

function getEventsByResource(events, resourceId){ 
    //console.log("///resourceId", resourceId)
    return events.filter(shiftEvent=>{
        //console.log("///shiftevent resourceId////", shiftEvent.resourceId)
        return shiftEvent.resourceId.includes(resourceId) //=== resourceId
    }) 
}

function isAppointmentOverlapping(tStart, tEnd, tResourceId, eventId, appointmentEvents){

    const appointmentsByResource = 
        getEventsByResource(appointmentEvents,tResourceId) //only search for overlaps within a specific resource
            .filter(({id})=>id !== eventId) //when dropping an appointment within the same resource, remove it so it doesnt overlap with itself
    
    //duplicateEventRemoved.filter(shiftEvent=>shiftEvent.resourceId === tResourceId)

   // console.log("sStart", moment(tStart).hour(), ":", moment(tStart).minute())
   // console.log("sEnd", moment(tEnd).hour(), ":", moment(tEnd).minute())

   // console.log("checking events:")
   // eventsByResourceId.forEach(({start,end, title})=>{
      //  console.log(`${title}, ${moment(start).hour()}:${moment(start).minute()} to ${moment(end).hour()}:${moment(end).minute()}`)
  //  })

    for (const {start, end} of appointmentsByResource) 
        if( !(moment(tEnd).isSameOrBefore(start) || moment(tStart).isSameOrAfter(end)) )
            return true
        
    return false
}

function isAppointmentOverlappingWithShift(sStart, sEnd, tResourceId, shiftEvents){

    const shiftsByResource = getEventsByResource(shiftEvents,tResourceId)//events.filter(shiftEvent=>shiftEvent.resourceId === tResourceId)

    for (const {start, end} of shiftsByResource) {
        if(moment(sStart).isSameOrAfter(start) && moment(sEnd).isSameOrBefore(end))
            return true
    }

    return false
}

function createAppointmentSummaryEvents(appointments, resources){

    return resources.filter(({Id})=>Id !== "Availability").map(({Id})=>{
     return createTodayEvent(
         `appointments: ${appointments.filter(({resourceId})=>resourceId === Id).length}`, 
         EVENT_TYPES.SUMMARY,0, 0, 0, 0, Id)
    })
}

function dateToTimeString(date){return `${moment(date).hour()}:${moment(date).minute()}`}

function createConfirmMessage({title, resourceId, start}, tStart, tResourceId){
    return `Confirm moving ${title} from ${resourceId} (${dateToTimeString(start)}) to ${tResourceId} (${dateToTimeString(tStart)})`
}

function createShiftBreakEvents(workDay, getEmployeeById){

    const {shifts, breaks} = workDay
    const split = splitDiffOverlappingIntervalSets(shifts,breaks)

    //printAvailabilityEvents(split,getEmployeeById)

    const breakEvents = []

    split.forEach(intervalSet=>{
        const {missing_elements} = intervalSet

        if(missing_elements.length > 0){
            const sTime = intervalSet.startTimeToHMObject()
            const eTime = intervalSet.endTimeToHMObject()
            breakEvents.push(
                createTodayEvent("", EVENT_TYPES.BREAK, sTime.h, sTime.m, eTime.h, eTime.m, missing_elements)
            )
        }
    })

    const shiftEvents = []

    split.forEach(intervalSet=>{
        const {set} = intervalSet

        if(set.length > 0){
            const sTime = intervalSet.startTimeToHMObject()
            const eTime = intervalSet.endTimeToHMObject()
            shiftEvents.push(
                createTodayEvent("", EVENT_TYPES.SHIFT, sTime.h, sTime.m, eTime.h, eTime.m, set)
            )
        }
    })

    //for each employee resource, need to merge consecutive shift events 

    return breakEvents.concat(shiftEvents)

   
}

function createShiftEvents(workDay){

    return workDay.shifts.map(shift=>{
        const sTime = shift.startTimeToHMObject()
        const eTime = shift.endTimeToHMObject()
        return createTodayEvent("", EVENT_TYPES.SHIFT, sTime.h, sTime.m, eTime.h, eTime.m, shift.set)
    })  
}


function printAvailabilityEvents(availabilityIntervals, getEmployeeById){

   availabilityIntervals.forEach(s=>{
    const {start, end, set, missing_elements, overlap_count, remaining_capacity} = s
    console.log(`
        start: ${Interval.totalMinutesToHoursMinutesString(start)}
        end: ${Interval.totalMinutesToHoursMinutesString(end)}
        set: ${set.map(getEmployeeById).map(e=>e.name).join(",")}
        me: ${missing_elements.map(getEmployeeById).map(e=>e.name).join(",")}
        overlap_count: ${overlap_count}
        remaining_capacity: ${remaining_capacity}
        //////////////////////////////////////////////////
    `)
   })
}

//create a resource for each employee thats assigned to a shift for the day
function createResources(workDay, getEmployeeById){

     
    const shiftEmps = new Set() 
    workDay.shifts.forEach( //for every shift in the workday..
        shift=>shift.set.forEach( //for every employee in the shift..
            emp=>shiftEmps.add(emp))) //add them to a set (duplicates ignored)

    const resources = []
            
    shiftEmps.forEach( //for every employee
        (empId)=>{  //fetch their details from the store
            const {id, name: title} = getEmployeeById(empId) //realias 'name' to 'title'
            resources.push({id, title}) //normally the employee id would be the resource id     
    })



    //add a resource which combines appointments, shifts, and breaks to generate the remaining availability
    resources.push({
        id: "Availability",
        title: "Availability"
    })

    //add a resource for the appointments that were created on the form and need to be assigned
    resources.push({
        id: "Requested Appointments",
        title: "Requested Appointments"
    })

    const adjustedResources = resources.map(({ id: Id, title: Title, ...rest }) => ({
        Id,
        Title,
        ...rest
     }))

     return adjustedResources  
}

function createAvailabilitySummaryEvent(availabilityIntervals){

    const capacityPercentages = availabilityIntervals.map(({remaining_capacity,max_capacity})=>Math.trunc( (remaining_capacity/max_capacity)*100) )

    const remainingCapacity = Math.trunc( capacityPercentages.reduce((sum, val)=>sum+val, 0)/availabilityIntervals.length )

    return createTodayEvent(`remaining capacity: ${remainingCapacity}%`, EVENT_TYPES.SUMMARY,0, 0, 0, 0, "Availability")
}

function createAvailabilityEvents(workDay, appointments, getEmployeeById){

    const {shifts, breaks} = workDay

    //remove requested appointments from the availability intervals
    const appointmentIntervals = appointments
        .filter(({status})=>status !== APPOINTMENT_STATUS.REQUESTED)
            .map(({start,end,assigned_to})=>new IntervalSet(start, end, [assigned_to]))
    
    
    /*
    const appointmentIntervals = appointments.map(({start,end, status, assigned_to})=>{
        if(status === "REQUESTED")
           return new IntervalSet(start, end, [], [], 1)
        else
            return new IntervalSet(start, end, [assigned_to])
    })
    */

    const availabilityIntervals = splitDiffOverlappingIntervalSets(shifts,breaks.concat(appointmentIntervals))

    printAvailabilityEvents(availabilityIntervals, getEmployeeById)

    const availabilityEvents = availabilityIntervals.map(intervalSet=>{
        const {remaining_capacity,max_capacity} = intervalSet
        const sTime = intervalSet.startTimeToHMObject()
        const eTime = intervalSet.endTimeToHMObject()
        return createTodayEvent("", EVENT_TYPES.AVAILABILITY, sTime.h, sTime.m, eTime.h, eTime.m, "Availability", {remaining_capacity,max_capacity})
    })  

    return {availabilityEvents, availabilitySummaryEvent: createAvailabilitySummaryEvent(availabilityIntervals) }

}

function getColorFromPercentage(percentage){
    if(percentage > 75) return "green"
    if(percentage > 50) return "orange"
    if(percentage > 25) return "orangered"
    if(percentage > 0) return "red"
    return "black"
}



function AppointmentCalendar(){

    const {
        workDays, 
        appointments, 
        patchAppointment, 
        getAppointmentById, 
        addAppointment,
        removeAppointment,
        getBreakById,
        getShiftById,
        getEmployeeById,
    } = useBoundStore((state) => ({...state})) //shorthand to get all data/funcs of obj

    console.log("/////////////appointments/////////////////",appointments)

   // const [ appointmentEvents, setAppointmentEvents ] = useState(()=>createAppointmentEvents(appointments)) 

    const  appointmentEvents = useMemo(()=>createAppointmentEvents(appointments,removeAppointment), [appointments])

    const [ selectedAppointment, setSelectedAppointment ] = useState(false)

    const [timestep, setTimeStep] = useState(15)

    const [view, setView] = useState(Views.DAY)

    const [debug, setDebug] = useState("")

    const todaysSceduale = useMemo(()=> initObjects(workDays,getBreakById, getShiftById)[0], [workDays])

    const { 
        resources, 
        shiftsBreaksEvents } = useMemo(
        ()=>{
            return {
                resources:   createResources(todaysSceduale,getEmployeeById),
                shiftsBreaksEvents: createShiftBreakEvents(todaysSceduale,getEmployeeById)
            }
        }
    , [todaysSceduale])

    //console.log("resources",resources)


    const {
        availabilityEvents,
        availabilitySummaryEvent
    } = useMemo(()=>createAvailabilityEvents( todaysSceduale, appointments,getEmployeeById), [todaysSceduale,appointments])


    const appointmentSummaryEvents = useMemo(()=>createAppointmentSummaryEvents(appointmentEvents,resources), [appointmentEvents,resources])//


    //console.log("resources", resources)
   // console.log("_shiftEvents", shiftEvents)

    function incrementTS(){setTimeStep((timestep)=>timestep+5)}
    function decrementTS(){setTimeStep((timestep)=>timestep-5)}

  
    //when clicking on an appointment
    const onSelectEvent = useCallback (
        (event) => {

            if(event.type === EVENT_TYPES.APPOINTMENT){
                setSelectedAppointment((prev)=>{
                    return prev?.id === event.id ? null : event
                })
            } 
        }
    ,[setSelectedAppointment])
  
   // const onSelectSlot = (slotInfo) => {
  //    console.log(slotInfo)  
  //  }
  
    const eventPropGetter = useCallback(//start, end, isSelected
      (event) =>{  //event, start, end, isSelected

     //  console.log(args)
    
        //const [event,start,end,isSelected] = args
  
       // console.log("isSelected:",isSelected ) //doesnt work on resource events for some reason

        const {type, id} = event

        if(type === EVENT_TYPES.AVAILABILITY){
            const {remaining_capacity,max_capacity} = event.data 
            const percentage = Math.trunc(  (remaining_capacity/max_capacity )*100  )
            return {           
                style: {
                  backgroundColor: getColorFromPercentage(percentage),
                 // color: 'black'
                },
            }
        }

        if(type === EVENT_TYPES.SHIFT){
            return {
               
                style: {
                  backgroundColor: 'green',
                 // color: 'black'
                },
            }
        }

        if(type === EVENT_TYPES.BREAK){
            return {
               
                style: {
                  backgroundColor: 'yellow',
                 // color: 'black'
                },
            }
        }

        if(type === EVENT_TYPES.SUMMARY){
            return {
                style: {
                  //backgroundColor: 'white',
                 // color: 'black'
                },
            }
        }

        if(type === EVENT_TYPES.APPOINTMENT){//selectedAppointment && selectedAppointment.id === id
            return {
                className: `${selectedAppointment?.id === id && `RBC_selected_interval_override`}`,
                style: {
                  backgroundColor: 'chocolate',
                },
            }
        }

    },[selectedAppointment])

   // console.log("view events: ", appointmentEvents)
   // console.log("view: ", view)


    const formats = {
      dayFormat: (date, culture, localizer) => "bbbb", //edit the dates on week/day headings

      //edit the start/end times on events
      //note that `event` only contains start/end times
      eventTimeRangeFormat: (event, culture, localizer) => "",
      /*
      eventTimeRangeFormat: (event, culture, localizer) => { 
        const {start,end, type} = event
        console.log("event", event)
        if(type === EVENT_TYPES.AVAILABILITY) return ""
        return localizer.format(start, 'hh:mm a', culture) +
        ' - ' +
        localizer.format(end, 'hh:mm a', culture)
    },*/
     // dayHeaderFormat: (date, culture, localizer) => `Appointments for ${date}`, //edit the date on the Day view
        //localizer.format(date, 'ddd MM/DD', culture),
    }

    //this function is fired every frame while an appointment is dragged around the calendar
    const onSelecting = useCallback( 
        ({start, end, resourceId})=>{

            if(resourceId === "Requested Appointments")
                return true
       
            setDebug(`onSelecting: ${moment(end).hour()} ${moment(end).minute() } `)
    
            if( !isAppointmentOverlappingWithShift(start, end, resourceId, shiftsBreaksEvents) ||   //if the selection doesnt start within a shift or doesnt end within a shift, 
                isAppointmentOverlapping(start, end, resourceId, null, appointmentEvents) || //or is overlapping another appointment
                moment(end).hour() === 0 && moment(end).minute() === 0){ //or is a Summary event
                    return false
            }
            return true
        }
    ,[appointmentEvents,shiftsBreaksEvents])

    //this function is fired every frame while a user holds down lmb over a shift
    //releasing lmb prompts for appointment creation
    const onSelectSlot = useCallback(     
        ({start, end, resourceId, action})=>{
        
            //setDebug(`onSelectSlot: ${start} ${end} ${resourceId} ${action}`)

            //selecting an allDay slot can not trigger appointment creation
            if(moment(end).hour() === 0 && moment(end).minute() === 0) return
            //single/double clicks within the same slot should not trigger creation, only mouse hold and drag
            if(action !== "select") return 

            if (confirm(`create new appointment?`)) {
                //recheck this to make sure the correct start/end times are added
                //noticed sometimes that the start/end times dont match whats seen on the calendar
                addAppointment({
                    date: moment()._d,
                    start:  moment(start).format("k:mm") ,
                    end:  moment(end).format("k:mm") ,
                    customer_id: "new customer", //get this from a popup modal
                    customer_email:"...", 
                    service_id: "",//id of the service; includes name and duration
                    //when adding appointments to an employee lane, status = confirmed, assigned_to = emp id
                    //when adding appointments to the requested apts lane, status = requested, assigned_to = ""
                    status: resourceId === "Requested Appointments" ? APPOINTMENT_STATUS.REQUESTED :  APPOINTMENT_STATUS.CONFIRMED,  //APPOINTMENT_STATUS.CONFIRMED,
                    assigned_to: resourceId === "Requested Appointments" ? "" : resourceId,//resourceId //REQUESTED apts are assigned to nobody
                })
                /*
                setAppointmentEvents((prev) => {
                
                    const newAppointment = 
                        createTodayEvent(
                            "New Appointment", 
                            EVENT_TYPES.APPOINTMENT, 
                            moment(start).hour(), 
                            moment(start).minute(),
                            moment(end).hour(), 
                            moment(end).minute(), 
                            resourceId)

                    setSelectedAppointment(newAppointment)

                    return [...prev, newAppointment]
                }) */
            }      
        }
    ,[])

   
    const resourceAccessorStoryArgs = {
      min: new Date(2024, 1, 19, 8 , 0, 0, 0),  // should be based on the dotw open/close times
      max: new Date(2024, 1, 19, 17, 0, 0, 0, 0),
      scrollToTime: Date.now(),
       // min: new Date(2015, 3, 4, 8 , 0, 0, 0),
       // max: new Date(2015, 3, 4, 17, 0, 0, 0, 0),
      defaultDate: Date.now(),//new Date(2015, 3, 4),//new Date(2024, 1, 18),
      defaultView: view, //Views.MONTH,
      toolbar: true,
      views: [Views.MONTH, Views.DAY],
      backgroundEvents: shiftsBreaksEvents,//shiftEvents,
      events: appointmentEvents.concat(appointmentSummaryEvents).concat(availabilityEvents).concat([availabilitySummaryEvent]),//appointmentDayEvents,///
      step: timestep,
      localizer: localizer,
      formats: formats,

      resourceIdAccessor: 'Id',
      resources: resources,
      resourceTitleAccessor: 'Title',

      onSelectEvent: onSelectEvent,


      onSelecting:  onSelecting,
      onSelectSlot: onSelectSlot,
      selectable: true,//false,


      eventPropGetter: eventPropGetter,
           //tooltipAccessor: (event)=>{
      //  return JSON.stringify(event)
        //event.title
     // },
  
     messages: { //configure text on buttons, etc https://jquense.github.io/react-big-calendar/examples/?path=/docs/props--messages
        day: 'Todays Appointments',
        //showMore: (total, remainingEvents, events) => {  return `go to days appointments`},
      },

      onShowMore: (events, date)=>{
           // console.log("bbbbbbbbbbbbbb")
            setView(Views.DAY)
      },

      onView: (newView) => setView(newView), //can put conditional logic here to initate state for new view, etc

    }

    //triggered when dropping a dragged appointment into a resource 
    const onEventDrop = useCallback(
        ({event,start,end,resourceId, isAllDay}) => {

            if(isAllDay) return //allDay slots can not contain appointment events

            //appointments can be dropped onto: 
            //'Requested Appointment' resource 
            //a shift event within another resource that doesnt overlap another appointment
            if( resourceId !== 'Requested Appointments' && 
                !isAppointmentOverlappingWithShift(start, end, resourceId, shiftsBreaksEvents)){
                //!isAppointmentOverlapping(start, end, resourceId, null, _shiftEvents)){
                window.alert("no valid shift") 
                return
            }

            if( resourceId !== 'Requested Appointments' &&
                isAppointmentOverlapping(start, end, resourceId, event.id, appointmentEvents)){
                window.alert("appointment overlaps another appointment") 
                return
            }

            if (confirm(createConfirmMessage(event, start, resourceId))) {

                const apt = getAppointmentById(event.data.id)

                patchAppointment({
                    ...apt, 
                    start: moment(start).format("k:mm") ,
                    end: moment(end).format("k:mm"),
                    assigned_to: resourceId === "Requested Appointments" ? "" : resourceId,
                    status:   resourceId === "Requested Appointments" ? APPOINTMENT_STATUS.REQUESTED :  APPOINTMENT_STATUS.CONFIRMED           
                })

                /*

                 console.log("old apt: ",apt)

                const a = {
                    ...apt, 
                    start: moment(start).format("k:mm") ,
                    end: moment(end).format("k:mm"),
                    assigned_to: resourceId === "Requested Appointments" ? "" : resourceId,
                    status:   resourceId === "Requested Appointments" ? APPOINTMENT_STATUS.REQUESTED :  APPOINTMENT_STATUS.CONFIRMED           
                }

                console.log("new apt: ",a)

                setAppointmentEvents((prev) => {

                    console.log(" UPDATING APT ",event)
                    //console.log("apt object:",getAppointmentById(event.data.id))
                   // console.log("start/end:", start, ", ", end)
                    //console.log("resourceId:", resourceId)
                    console.log("start:", moment(start).format("k:mm") )
                    console.log("end:", moment(end).format("k:mm") )


                    const existing = prev.find((ev) => ev.id === event.id) ?? {} //find the event that was just dropped
                    const filtered = prev.filter((ev) => ev.id !== event.id) //get the other events

                    setSelectedAppointment({ ...existing, start, end, resourceId })
                    //copy the other events, update the event object with a new start/end time and resourceID
                    return [...filtered, { ...existing, start, end, resourceId }]
                })
                */  

            } 
       
      },[appointmentEvents,shiftsBreaksEvents]) //,setAppointmentEvents


    const dndArgs = {
        resizable: false,
        draggableAccessor:(event) => event.isDraggable,       
        onEventDrop: onEventDrop,
        onDragStart:({event}) => {
            //setDebug(`onDragStart start: ${event.start} end:${event.end} rId:${event.resourceId}`)
           // console.log("//dragging event: ", event)
        },
    }

    
    //style={{ height: 700 } this is what makes the inside part of the calendar scrollable
    //without scrolling the calendars container
    return (
        <>

            <div style={{ height: 700 }}> 
            <DnDCalendar
                {...resourceAccessorStoryArgs}
                {...dndArgs}
            
            
                />
            </div>

        <div>
            adjust timestep:
            <button disabled={timestep <= 5} onClick={decrementTS}>+</button>
            <button onClick={incrementTS}>-</button>
            {timestep}
        </div>
        <div>{debug}</div>
        {selectedAppointment && 
            <div>
                <div>Selected Appointment:</div>
                <div>Title:  {selectedAppointment.title}</div>
                <div>Start:  {dateToTimeString(selectedAppointment.start)}</div>
                <div>End:    {dateToTimeString(selectedAppointment.end)}</div>
            </div>
        }
    </>)
  }

export default AppointmentCalendar

let idCounter = 0

//creating events from the mock_data file
function createAppointmentEvents(appointments,removeAppointment){
    return appointments.map(appointment=>{

        const { start, end, customer_id, status, assigned_to, id } = appointment
    
        //status = REQUESTED appointments are assigned the 'Requested Appointments' resource, otherwise the resource is whomever employee its assigned to
        const resource = status === "REQUESTED" ? 'Requested Appointments' : assigned_to
    
        const i = new Interval(start,end)

        const eventTitleWrapper = <>
            <div onClick={e=>{
                e.stopPropagation()
                if (confirm(`Delete Appointment ${id}`)) 
                    removeAppointment(id)          
            }} 
            className="cancel_panel_btn">X</div>    
            {customer_id}s haircut            
        </>

        return createTodayEvent(
            eventTitleWrapper,
            //`${customer_id}s haircut`,
            EVENT_TYPES.APPOINTMENT,
            i.startTimeToHMObject().h,
            i.startTimeToHMObject().m,
            i.endTimeToHMObject().h,
            i.endTimeToHMObject().m,
            resource,
            {id}
        )
    })
}

function createDateToday(hour, minute){
    return new Date(new Date().getFullYear(),new Date().getUTCMonth(),new Date().getUTCDate(),hour,minute,0,0)
}

export function createTodayEvent(title, type, startH, startM, endH, endM, rId, data = null){

    const start = createDateToday(startH,startM)
    const end = createDateToday(endH,endM)

    const allDay = type === EVENT_TYPES.SUMMARY ? true : false
    const isDraggable = type === EVENT_TYPES.APPOINTMENT ? true : false

    return {
        title, 
        resourceId: rId, //can add an event to multiple resources
        type,
        id: idCounter++,
        start,// new Date(2024, 1, 19, startH, startM, 0, 0), 
        end,// new Date(2024, 1, 19, endH, endM, 0, 0), 
        data: data,
        allDay,
        isDraggable,
    }
}

export function createTommorowEvent(title, type, startH, startM, endH, endM, rId){

    const start = new Date(new Date().getFullYear(),new Date().getUTCMonth(),new Date().getUTCDate()+1,startH,startM,0,0)
    const end = new Date(new Date().getFullYear(),new Date().getUTCMonth(),new Date().getUTCDate()+1,endH,endM,0,0)

    return {
        title, 
        resourceId: rId,
        type,
        id: idCounter++,
        start,// new Date(2024, 1, 20, startH, startM, 0, 0), 
        end,// new Date(2024, 1, 20, endH, endM, 0, 0), 
        data: {A: "a", B: "b"}
    }
}

 /*

<div onClick={e=>{
                    e.preventDefault()
                    console.log("clicked")}
                    }>
                    aaaaaaa
                </div>

 <select>
    <option key={""} value={"aaa"}>{"aaa"}</option>
    <option key={""} value={"bbb"}>{"bbb"}</option>
    <option key={""} value={"ccc"}>{"ccc"}</option>
</select>
 */

/*inserting a custom component into the TimeGutter (the empty top-left box)
const Test = ({timestep, decrementTS, incrementTS}) => {
//disabled={timestep <= 5}
//<button  onClick={decrementTS}>+</button>
//<button onClick={incrementTS}>-</button>
    return(<div>
        {timestep}
            <button disabled={timestep <= 5} onClick={decrementTS}>+</button>
            <button onClick={incrementTS}>-</button>
        {timestep}
    </div>)
}

const TimeGutter = ({data}) => <p>{data}</p>

const Wrapped = (data, Cmp) =>{
    return <Cmp key={"345334"} data={data}/>
}

components: {
        timeGutterHeader: Wrapped("aaa", TimeGutter),
      },


      

*/