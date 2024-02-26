import { useState, useCallback, useMemo, useEffect } from "react"
import { Calendar,  Views, momentLocalizer } from "react-big-calendar";
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop'
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css'

import useBoundStore from "../store";

import moment from "moment";

import { 
    getTimeSlotStep,
    getMinMaxWorkingPlanTimes,
    createCloseIntervals,
    initObjects,
    createAvailabilityCalendarEvents,
    createScedualeCalendarEvents
 } from '../intervals.js'


const DnDCalendar = withDragAndDrop(Calendar)
moment.locale("en-CA");
const localizer = momentLocalizer(moment);


const EVENT_TYPES = Object.freeze({
    APPOINTMENT: "APPOINTMENT",
    SHIFT: "SHIFT",
    SUMMARY: "SUMMARY"
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

function createResourceSummaryEvents(appointments, resources){

    return resources.map(({Id})=>{
     return createTodayEvent(
         `appointments: ${appointments.filter(({resourceId})=>resourceId === Id).length}`, 
         EVENT_TYPES.SUMMARY,0, 0, 0, 0, Id)
    })
 
}

function dateToTimeString(date){return `${moment(date).hour()}:${moment(date).minute()}`}

function createConfirmMessage({title, resourceId, start}, tStart, tResourceId){
    return `Confirm moving ${title} from ${resourceId} (${dateToTimeString(start)}) to ${tResourceId} (${dateToTimeString(tStart)})`
}

//function createShiftEvents


function AppointmentCalendar(){

    const {
        shifts, breaks, employees, workDays,
        getBreakById,
        getShiftById,
        getEmployeeById,
    } = useBoundStore((state) => ({...state})) //shorthand to get all data/funcs of obj
    
    const { _resources, _shiftEvents } = useMemo(
        ()=>{

            const todaysSceduale = initObjects(workDays,getBreakById, getShiftById)[0]

            const emps = []
            const shifts = []
            
            todaysSceduale.shifts.forEach(shift=>{

                const sTime = shift.startTimeToHMObject()
                const eTime = shift.endTimeToHMObject()

                shifts.push(createTodayEvent("", EVENT_TYPES.SHIFT, sTime.h, sTime.m, eTime.h, eTime.m, shift.set))

                shift.set.forEach(emp=>{
                    //console.log(emp)
                    emps.push(emp)
                })
            })

            const resources = []
            
            new Set(emps).forEach(
                (empId)=>{
                    const {id, name: title} = getEmployeeById(empId)
                    resources.push({id, title}) //normally the employee id would be the resource id
                    //resources.push({id: title, title}) //make the id of the resource the title for now         
            })
            
            resources.push({
                id: "Requested Appointments",
                title: "Requested Appointments"
            })

            const adjustedResources = resources.map(({ id: Id, title: Title, ...rest }) => ({
                Id,
                Title,
                ...rest
             }))

           
            return {_resources: adjustedResources, _shiftEvents: shifts}

        }
    , [workDays])

    console.log("_resources", _resources)
    console.log("_shiftEvents", _shiftEvents)


    const [ appointmentEvents, setAppointmentEvents ] = useState(appointmentDayEvents)

    const [ selectedAppointment, setSelectedAppointment ] = useState(false)

    const summaryEvents = useMemo(()=>createResourceSummaryEvents(appointmentEvents,_resources), [appointmentEvents,_resources])//


    const [timestep, setTimeStep] = useState(15)

    const [view, setView] = useState(Views.DAY)

    //const [test, setTest] = useState(0)

    const [debug, setDebug] = useState("")

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

        if(type === EVENT_TYPES.SHIFT){
            return {
               
                style: {
                  backgroundColor: 'green',
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
                className: `${selectedAppointment && selectedAppointment.id === id && `RBC_selected_interval_override`}`,
                style: {
                  backgroundColor: 'chocolate',
                },
            }
        }

        
        
        /*
        return {
        ...(isSelected && {
          style: {
            backgroundColor: 'red',
          },
        }),
        ...(moment(start).hour() < 12 && {
          style: {
            backgroundColor: 'green',
          },
        }),
        ...(event.title.includes('Meeting') && {
          style: {
            backgroundColor: 'blue',
          },
        }),*/

    },[selectedAppointment])

    console.log("view events: ", appointmentEvents)
   // console.log("view: ", view)


    const formats = {
      dayFormat: (date, culture, localizer) => "bbbb", //edit the dates on week/day headings
      //eventTimeRangeFormat: (event, culture, localizer) => "",
     // dayHeaderFormat: (date, culture, localizer) => `Appointments for ${date}`, //edit the date on the Day view
        //localizer.format(date, 'ddd MM/DD', culture),
    }

    //this function is fired every frame while an appointment is dragged around the calendar
    const onSelecting = useCallback( 
        ({start, end, resourceId})=>{
       
            setDebug(`onSelecting: ${moment(end).hour()} ${moment(end).minute() } `)
    
            //or is overlapping another appointment, stop selecting
            if(!isAppointmentOverlappingWithShift(start, end, resourceId, _shiftEvents) ||   //if the selection doesnt start within a shift or doesnt end within a shift, 
                isAppointmentOverlapping(start, end, resourceId, null, appointmentEvents) ||
                moment(end).hour() === 0 && moment(end).minute() === 0){
                return false
            }
            return true
        }
    ,[appointmentEvents,_shiftEvents])

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
                })  
            }      
        }
    ,[])

   
    const resourceAccessorStoryArgs = {
      min: new Date(2024, 1, 19, 8 , 0, 0, 0),
      max: new Date(2024, 1, 19, 17, 0, 0, 0, 0),
      scrollToTime: Date.now(),
       // min: new Date(2015, 3, 4, 8 , 0, 0, 0),
       // max: new Date(2015, 3, 4, 17, 0, 0, 0, 0),
      defaultDate: Date.now(),//new Date(2015, 3, 4),//new Date(2024, 1, 18),
      defaultView: view, //Views.MONTH,
      toolbar: true,
      views: [Views.MONTH, Views.DAY],
      backgroundEvents: _shiftEvents,//shiftEvents,
      events: appointmentEvents.concat(summaryEvents),//appointmentDayEvents,///
      step: timestep,
      localizer: localizer,
      formats: formats,
      resourceIdAccessor: 'Id',
      resources: _resources,//resources,//adjustedResources,
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
                !isAppointmentOverlappingWithShift(start, end, resourceId, _shiftEvents)){
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
                setAppointmentEvents((prev) => {
                    const existing = prev.find((ev) => ev.id === event.id) ?? {} //find the event that was just dropped
                    const filtered = prev.filter((ev) => ev.id !== event.id) //get the other events

                    setSelectedAppointment({ ...existing, start, end, resourceId })
                    //copy the other events, update the event object with a new start/end time and resourceID
                    return [...filtered, { ...existing, start, end, resourceId }]
                })          
            } 
       
      },[appointmentEvents,_shiftEvents,setAppointmentEvents])





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
//SHIFT
const shiftEvents = [
    createTodayEvent("", EVENT_TYPES.SHIFT, 8, 0, 17, 0, ['Pam','John']),
    createTodayEvent("", EVENT_TYPES.SHIFT, 8, 0, 12, 0, ['Gina']),
    createTodayEvent("", EVENT_TYPES.SHIFT, 13, 0, 17, 0, ['Gina']),
]

 const appointmentDayEvents = [

    createTodayEvent("Bobs Haircut", EVENT_TYPES.APPOINTMENT, 8, 40, 9, 5, '3C4XnbQJLbTZ6GRAAwx1F'),
    createTodayEvent("Jacks Haircut", EVENT_TYPES.APPOINTMENT, 10, 0, 10, 15, 'VDwZ7TXS5cbWKDbGJG8vD'),
    createTodayEvent("Joes Haircut", EVENT_TYPES.APPOINTMENT, 11, 15, 12, 0, 'ayHDCRR5fL0Hr7w3pRHFP'),
    createTodayEvent("Marys Hair Colouring", EVENT_TYPES.APPOINTMENT, 12, 30, 12, 55, '3C4XnbQJLbTZ6GRAAwx1F'),

    createTodayEvent("Zoeys Peticure", EVENT_TYPES.APPOINTMENT, 9, 10, 9, 25, 'c444AUe057uwxV4cxoNyT'),
    createTodayEvent("Susans Manicure", EVENT_TYPES.APPOINTMENT, 10, 15, 10, 35, 'ayHDCRR5fL0Hr7w3pRHFP'),
    createTodayEvent("Judys Hair Removal", EVENT_TYPES.APPOINTMENT, 10, 20, 10, 55, 'VDwZ7TXS5cbWKDbGJG8vD'),

    //can pass components to event title
    createTodayEvent( "Pending", EVENT_TYPES.APPOINTMENT, 11, 15, 11, 30, 'Requested Appointments'),

 ]



 /*
   <div className="event_container">
            <div>
                Assign to:
                <select>
                    <option key={""} value={"aaa"}>{"aaa"}</option>
                    <option key={""} value={"bbb"}>{"bbb"}</option>
                    <option key={""} value={"ccc"}>{"ccc"}</option>
                </select>
            </div>
        </div>
 */

        /*
     function testing(){
        //get the workday for today
        //normally this would check todays date, get the dotw from the dates day, and fetch the dotw from that
        //just use monday for testing  
        const todaysSceduale = initObjects(workDays,getBreakById, getShiftById)[0]
        console.log(todaysSceduale)

        //create resource events from shift employees

                const emps = []
                const shifts = []
                
                todaysSceduale.shifts.forEach(shift=>{
        
                    const sTime = shift.startTimeToHMObject()
                    const eTime = shift.endTimeToHMObject()
        
                    shifts.push(createTodayEvent("", EVENT_TYPES.SHIFT, sTime.h, sTime.m, eTime.h, eTime.m, shift.set))
        
        
                    shift.set.forEach(emp=>{
                        //console.log(emp)
                        emps.push(emp)
                    })
                })
        
                console.log(emps)
        //getEmployeeById
                const resources = []
                
                new Set(emps).forEach(
                    (empId)=>{
                        const {id, name: title} = getEmployeeById(empId)
                         resources.push({id, title}) //normally the employee id would be the resource id
                        //resources.push({id: title, title}) //make the id of the resource the title for now         
                    })
                
                //.map( ({id, name}) =>({id, title: name}))
                resources.push({
                    id: "Requested Appointments",
                    title: "Requested Appointments"
                })
                console.log(resources)
                console.log("converted: ",shifts)
                console.log("static: ",shiftEvents)
        
        
        
                
        
        
        
            }
        
            //testing()


    const [ resources, setResources ] = useState( ()=>{
        const emplist = [

            {
                id: 'Pam',
                title: 'Pam',
                data: {str: "im id c"}
            },
        
            {
                id: 'Gina',
                title: 'Gina',
                data: {str: "im id a"}
            },
        
            {
                id: 'John',
                title: 'John',
                data: {str: "im id a"}
            },
        
            {
                id: 'George',
                title: 'George',
                data: {str: "im id a"}
            },
        
            {
                id: 'Requested Appointments',
                title: 'Requested Appointments',
                data: {str: "im id a"}
            },
        ]
        const adjustedResources = emplist.map(({ id: Id, title: Title, ...rest }) => ({
            Id,
            Title,
            ...rest
          }))
        return adjustedResources
    } )
    */

 export const emplist = [

    {
        id: 'Pam',
        title: 'Pam',
        data: {str: "im id c"}
    },

    {
        id: 'Gina',
        title: 'Gina',
        data: {str: "im id a"}
    },

    {
        id: 'John',
        title: 'John',
        data: {str: "im id a"}
    },

    {
        id: 'George',
        title: 'George',
        data: {str: "im id a"}
    },

    {
        id: 'Requested Appointments',
        title: 'Pending Appointments',
        data: {str: "im id a"}
    },
]

function createDateToday(hour, minute){
    return new Date(new Date().getFullYear(),new Date().getUTCMonth(),new Date().getUTCDate(),hour,minute,0,0)
}

export function createTodayEvent(title, type, startH, startM, endH, endM, rId){

    const start = createDateToday(startH,startM)//new Date(new Date().getFullYear(),new Date().getUTCMonth(),new Date().getUTCDate(),startH,startM,0,0)
    const end = createDateToday(endH,endM)//new Date(new Date().getFullYear(),new Date().getUTCMonth(),new Date().getUTCDate(),endH,endM,0,0)

    const allDay = type === EVENT_TYPES.SUMMARY ? true : false
    const isDraggable = type === EVENT_TYPES.APPOINTMENT ? true : false

    return {
        title, 
        resourceId: rId, //can add an event to multiple resources
        type,
        id: idCounter++,
        start,// new Date(2024, 1, 19, startH, startM, 0, 0), 
        end,// new Date(2024, 1, 19, endH, endM, 0, 0), 
        data: {A: "a", B: "b"},
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