import moment from "moment";
import { momentLocalizer } from "react-big-calendar";
import {useState, useMemo, useEffect } from 'react'

import { workdays, breaks, shifts, getShiftById,getBreakById } from "./assets/data"

import { 
    getTimeSlotStep,
    getMinMaxWorkingPlanTimes_obj_test,
    createCloseIntervals_obj_test,
    initObjects,
    createCalendarEvents_test,
 } from './intervals.js'

import Week from "react-big-calendar/lib/Week";
import PropTypes from "prop-types";
import React from "react";
import TimeGrid from "react-big-calendar/lib/TimeGrid";

moment.locale("en-CA");
const localizer = momentLocalizer(moment);

const defaultWorkingPlan = [
    {
        day: "Monday",
        start: "",
        end:   "",
    },
    {
        day: "Tuesday",
        start: "",
        end:   "",
    },
    {
        day: "Wednesday",
        start: "",
        end:   "",
    },
    {
        day: "Thursday",
        start: "",
        end:   "",
    },
    {
        day: "Friday",
        start: "",
        end:   ""
    },
    {
        day: "Saturday",
        start: "",
        end:   ""
    },
    {
        day: "Sunday",
        start: "",
        end:   ""
    },
]
  
function useAvailability(dataArr = []){

    ////////////////////////states
    const [locationId, setLocationId] = useState(null)
    const [workingPlan, setWorkingPlan] = useState([...workdays])
    const [serviceDurations, setServiceDurations] = useState([])
    //const [breaks, setWorkingBreaks] = useState([])

   // console.log("dataArr: ", dataArr)
   // console.log("workingPlan ", workingPlan)
   // console.log("serviceDurations ", serviceDurations)
   // console.log("breaks ", breaks)

    const workingPlanObjects = useMemo( ()=>initObjects(workingPlan), [workingPlan])

    const {startMin, endMax} = useMemo( ()=>getMinMaxWorkingPlanTimes_obj_test(workingPlanObjects), [workingPlanObjects])
   
    const closeIntervals =  useMemo( ()=> createCloseIntervals_obj_test(workingPlanObjects,startMin,endMax), [workingPlanObjects,startMin,endMax])

    const timeStep       = useMemo( ()=>getTimeSlotStep(startMin,endMax), [startMin,endMax])

    const shiftIntervals =  useMemo( ()=>createCalendarEvents_test(workingPlanObjects, "shifts"), [workingPlanObjects])

    const breakIntervals =  useMemo( ()=>createCalendarEvents_test(workingPlanObjects, "breaks"), [workingPlanObjects])

    ////////////////////////on load and refetches, retreive the availability props from data///////////////
    useEffect( () => {}, []);

    ///////////////////////////////////////////////////////////////////////////////////////////////////////
  
    const eventPropGetter = (event, start, end, isSelected) => ({ //override some CSS for the event containers
        className: `RBC_events_override 
          ${event.type === 'shifts' ? ` RBC_shift_interval_override ` :
            event.type === 'breaks' ? ` RBC_break_interval_override ` : ` RBC_close_interval_override `}`
    })

    const formats = { 
        eventTimeRangeFormat: (event, culture, localizer) => "",                        //removes the start/end time strings from each event
        dayFormat: (date, culture, localizer) =>localizer.format(date, 'ddd', culture), //change the day columns to only display the day of the week
    }

    return {
        calendarProps: {
            min: new Date("2023", 10, 20, startMin.h, startMin.m, 0, 0),
            max: new Date("2023", 10, 20, endMax.h, endMax.m, 0, 0),
            
            formats:            formats,
            localizer:          localizer,
            defaultDate:        new Date("2023", 10, 20, 0, 0, 0, 0),
            defaultView:        "work_week",
            events:             closeIntervals,
            step:               timeStep,
            toolbar:            false,
            views:              {work_week: MyWorkWeek},
            eventPropGetter:    eventPropGetter,
            backgroundEvents:   breakIntervals.concat(shiftIntervals),//allIntervals,//breakIntervals,
            timeslots:1, //this makes the calendar take up a ton of space
            //style={}
            onSelectEvent:      (event) => console.log("clicked event. employees: ", event.employees, event.isBreak, event),
            onSelectSlot:       (event)=>console.log("clicked Slot", event)   
        },
        
        workingPlanListProps: {
            workingPlan,
           // updateWorkingPlanDay: (...props) => updateWorkingPlan(...props, locationId),//updateWorkingPlan, //re-alias callout names to match cmp prop names
           // loading: loadingUpdateWorkingPlan
        },
        breakListProps: {
            breaks,
           // deleteWorkingBreak: (...props) => deleteBreak(...props, locationId), //inject the location_id into the callouts
           // addWorkingBreak:    (...props) => postBreak(...props, locationId),   //this avoids having to pass the id into the cmps
           // loading: loadingpostBreak || loadingdeleteBreak
        },
        serviceDurationListProps: {
            serviceDurations, 
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
  