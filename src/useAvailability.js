import moment from "moment";
import { momentLocalizer } from "react-big-calendar";
import {useState, useMemo, useEffect, useCallback } from 'react'

import useBoundStore from "./store";

//import { workdays, breaks, shifts, getShiftById,getBreakById,getEmployeeById  } from "./assets/data"

import { 
    getTimeSlotStep,
    getMinMaxWorkingPlanTimes,
    createCloseIntervals,
    initObjects,
    createAvailabilityCalendarEvents,
    createScedualeCalendarEvents
 } from './intervals.js'

import Week from "react-big-calendar/lib/Week";
import PropTypes from "prop-types";
import React from "react";
import TimeGrid from "react-big-calendar/lib/TimeGrid";

moment.locale("en-CA");
const localizer = momentLocalizer(moment);

function useAvailability(dataArr = [], checkBox){

    const {
        workDays,
        getBreakById,
        getShiftById,
        getEmployeeById,
    } = useBoundStore((state) => ({...state})) //shorthand to get all data/funcs of obj

    ////////////////////////states
    //const [locationId, setLocationId] = useState(null)

    //const [workingPlanObjects, setworkingPlanObjects] = useState(()=>initObjects(workdays, getBreakById, getShiftById))

    const workingPlanObjects = useMemo( ()=>initObjects(workDays, getBreakById, getShiftById), [workDays])

    const [serviceDurations, setServiceDurations] = useState([])
    //const [breaks, setWorkingBreaks] = useState([])

    const [selectedEvent, setSelectedEvent] = useState(null)

   // console.log("///selected event hook: ", selectedEvent)
    

   // console.log("dataArr: ", dataArr)
   // console.log("workingPlan ", workingPlan)
   // console.log("serviceDurations ", serviceDurations)
   // console.log("breaks ", breaks)

    //const workingPlanObjects = useMemo( ()=>initObjects(workingPlan), [workingPlan])

    const minMaxInterval = useMemo( ()=>getMinMaxWorkingPlanTimes(workingPlanObjects), [workingPlanObjects])

   // console.log("minMaxInterval: ", minMaxInterval )
   
    //const closeIntervals =  useMemo( ()=> createCloseIntervals(workingPlanObjects,startMin,endMax), [workingPlanObjects,startMin,endMax])

    const closeIntervals =  useMemo( ()=> createCloseIntervals(workingPlanObjects,minMaxInterval), [workingPlanObjects,minMaxInterval])
    //console.log("closeIntervals: ", closeIntervals )
    const timeStep       = useMemo( ()=>getTimeSlotStep(minMaxInterval), [minMaxInterval])

    const shiftIntervals =  useMemo( ()=>createAvailabilityCalendarEvents(workingPlanObjects, "shifts"), [workingPlanObjects])

    const breakIntervals =  useMemo( ()=>createAvailabilityCalendarEvents(workingPlanObjects, "breaks"), [workingPlanObjects])

    const scedualeIntervals =  useMemo( ()=>createScedualeCalendarEvents(workingPlanObjects,getEmployeeById), [workingPlanObjects])

    ////////////////////////on load and refetches, retreive the availability props from data///////////////
    useEffect( () => {}, []);

    
    ///////////////////////////////////////////////////////////////////////////////////////////////////////
  
    //this fires for every event on each click
    const eventPropGetter = (event, start, end, isSelected) => {

        function getColorFromPercentage(percentage){
            if(percentage > 75) return "green"
            if(percentage > 50) return "orange"
            if(percentage > 25) return "orangered"
            if(percentage > 0) return "red"
            return "black"
        }



        //console.log(isSelected)

        if(event.type === 'sceduale'){
            //console.log("**********eventPropGetter event", event)
            //console.log("**********eventPropGetter event", event)
            const {employee_ids,missing_employee_ids} = event

            const avail_count = employee_ids.split(",").length
            const unavail_count = missing_employee_ids ? missing_employee_ids.split(",").length : 0

            console.log("employee_ids", avail_count)
            console.log("missing_employee_ids", unavail_count)

            const percentage = (avail_count/(avail_count+unavail_count)) * 100

            console.log("percentage", percentage)

            return {
                className: //RBC_shift_interval_override  
                    `
                    ${(event.type && selectedEvent && event.key === selectedEvent.key) ? ` RBC_selected_interval_override` : ``}`,
                style: {
                    backgroundColor: getColorFromPercentage(Math.round(percentage))//"rgb(0, 255, 128)",
                }
            }
        } 

        return { //override some CSS for the event containers
            className: `RBC_events_override 
              ${event.type === 'shifts' ? ` RBC_shift_interval_override ` :
                event.type === 'breaks' ? ` RBC_break_interval_override ` : ` RBC_close_interval_override `}
                ${(event.type && selectedEvent && event.key === selectedEvent.key) && ` RBC_selected_interval_override`}`
        }

    }
    
    /*({ //override some CSS for the event containers
        className: `RBC_events_override 
          ${event.type === 'shifts' ? ` RBC_shift_interval_override ` :
            event.type === 'breaks' ? ` RBC_break_interval_override ` : ` RBC_close_interval_override `}`
    })*/

    const formats = { 
        eventTimeRangeFormat: (event, culture, localizer) => "",                        //removes the start/end time strings from each event
        dayFormat: (date, culture, localizer) =>localizer.format(date, 'ddd', culture), //change the day columns to only display the day of the week
    }



    const onSelectEvent = (event) => {

        //when a break/shift event is clicked, copy its props and store the weekdays it appears
        if(event.type){

            setSelectedEvent({
                ...event,
                week_days:  breakIntervals.concat(shiftIntervals)
                                .filter(e=>e.key === event.key)
                                    .map(e=>e.start.toString().split(" ")[0])
            })
        }

    }//console.log("clicked event. employees: ", event.employees, event.isBreak, event)

    const startMin = minMaxInterval.startTimeToHMObject()//Interval.totalMinutesToHoursMinutesObject(minMaxInterval.start)
    const endMax = minMaxInterval.endTimeToHMObject()//Interval.totalMinutesToHoursMinutesObject(minMaxInterval.end)

    //console.log("timestep: ", timeStep)

    const getEventsByType = (events, event_type) => {
        return event_type !== "breaks_shifts" ? events.filter(e=>e.type === event_type) : events
    } 

    //const intervals = breakIntervals.concat(shiftIntervals)
    
    /*checkBox === "breaks" ? 
        breakIntervals : checkBox === "shifts" ? 
            shiftIntervals : breakIntervals.concat(shiftIntervals)*/

    return {
        selectedEvent: selectedEvent,
        calendarProps: {
            min: new Date("2023", 10, 20, startMin.h, startMin.m, 0, 0),
            max: new Date("2023", 10, 20, endMax.h, endMax.m, 0, 0),
            
            formats:            formats,
            localizer:          localizer,
            defaultDate:        new Date("2023", 10, 20, 0, 0, 0, 0),
            defaultView:        "work_week",//"day",
            events:             checkBox !== "sceduale" ? getEventsByType(breakIntervals.concat(shiftIntervals), checkBox) : scedualeIntervals,//scedualeIntervals,//,
            step:               timeStep,//5,
            toolbar:            false,
            views:              {work_week: MyWorkWeek},//["day", "agenda", "work_week", "month"],////["day", "agenda", "work_week", "month"],//{work_week: MyWorkWeek}, //views={["day", "agenda", "work_week", "month"]}
            eventPropGetter:    eventPropGetter,
            backgroundEvents:   closeIntervals,//intervals,//scedualeIntervals,//intervals,//breakIntervals.concat(shiftIntervals),//breakIntervals,//shiftIntervals,//
            timeslots:1, //this makes the calendar take up a ton of space
            //style={}
            onSelectEvent:      onSelectEvent,//(event) => console.log("clicked event. employees: ", event.employees, event.isBreak, event),
            onSelectSlot:       (event)=>console.log("clicked Slot", event)   
        },
        
        workingPlanListProps: {
           // workingPlan,
           // updateWorkingPlanDay: (...props) => updateWorkingPlan(...props, locationId),//updateWorkingPlan, //re-alias callout names to match cmp prop names
           // loading: loadingUpdateWorkingPlan
        },
        breakListProps: {
            //breaks,
           // deleteWorkingBreak: (...props) => deleteBreak(...props, locationId), //inject the location_id into the callouts
           // addWorkingBreak:    (...props) => postBreak(...props, locationId),   //this avoids having to pass the id into the cmps
           // loading: loadingpostBreak || loadingdeleteBreak
        },
        serviceDurationListProps: {
           // serviceDurations, 
           // loading: loadingupdateServiceDuration,
          //  updateServiceDuration,
        }
    }

}

export default useAvailability

///////////////////////////////visual scedualer/////////////////////////////////////
  
function getAvailabilityPropsFromData(dataArr = []){
    return {
        locationId: dataArr[0] ? dataArr[0].id : null,
        workingPlan: dataArr[0] ? dataArr[0].workingPlan : defaultWorkingPlan,
        breaks: dataArr[0] ? dataArr[0].breaks : [],
        serviceDurations: dataArr[0] ? dataArr[0].serviceDurations : [],
    }
}

const workWeekRange = (date, options) =>([
    new Date("2023", 10, 20, 0, 0 , 0, 0),
    new Date("2023", 10, 21, 0, 0 , 0, 0),
    new Date("2023", 10, 22, 0, 0 , 0, 0),
    new Date("2023", 10, 23, 0, 0 , 0, 0),
    new Date("2023", 10, 24, 0, 0 , 0, 0),
    new Date("2023", 10, 25, 0, 0 , 0, 0),
    new Date("2023", 10, 26, 0, 0 , 0, 0),
])

  //override default work week so it shows all 7 days of the week monday->sunday
  class MyWorkWeek extends React.Component {
    render() {
      let { date, ...props } = this.props;
      let range = workWeekRange(date, this.props);
      return <TimeGrid {...props} range={range} eventOffset={15} />;
    }
  }
  
  MyWorkWeek.propTypes = {
    date: PropTypes.instanceOf(Date).isRequired
  };
  
  MyWorkWeek.defaultProps = TimeGrid.defaultProps;
  
  MyWorkWeek.range = workWeekRange;
  
  MyWorkWeek.navigate = Week.navigate;
  
  MyWorkWeek.title = (date, { localizer }) => {
    let [start, ...rest] = workWeekRange(date, { localizer });
    return localizer.format({ start, end: rest.pop() }, "dayRangeHeaderFormat");
  };
  