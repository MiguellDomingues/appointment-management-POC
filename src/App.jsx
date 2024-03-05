
import useAvailability from './useAvailability';
import PropTypes from 'prop-types';

import { Calendar,  Views, momentLocalizer } from "react-big-calendar";
import moment from "moment";
//import { momentLocalizer } from "react-big-calendar";

import AppointmentBooking from './calendarMocks/AppointmentBooking'
import ModalWrapper from './ModalWrapper'

import TestingRBC from './calendarMocks/TestingRBC'

import TestingRBCEmpView from './calendarMocks/TestingRBCEmpView'

import AppointmentCalendar from './calendarMocks/AppointmentCalendar'


moment.locale("en-CA");
const localizer = momentLocalizer(moment);

import { useState, useCallback } from 'react'

import useBoundStore from "./store";

import "react-big-calendar/lib/css/react-big-calendar.css";

import './App.css'

import TestingPage from "./TestingPage"

import {employees, shifts, breaks, workdays, services,getEmployeeById } from "./assets/data"

function getPage(body){
  switch(body){
    case "availability":
      return <AvailabilityPage/> 
    //case "config": 
     // return <ConfigurationPage/>
    case "testingDT":
      return <TestingPage/>
    case "appointment_picker":
      return <AppointmentPicker/>
      /*
    case "testingRBC":
      return <TestingRBC/>
    case "testingEmpView":
      return <TestingRBCEmpView/>
      */
    case "appointmentcalendar":
        return <AppointmentCalendar/>
    default:
      return <></>
  }
}

//<span onClick={e=>setBody("config")}>Configuration</span>
//  <span onClick={e=>setBody("testingRBC")}>TestingRBC</span>
//<span onClick={e=>setBody("testingEmpView")}>TestingRBCEmpView</span>
// <span onClick={e=>setBody("appointmentcalendar")}>Todays Scedule - Summary</span>
function App() {

  const [body, setBody] = useState("availability")

  return (<>
    <div className="header">
      
      <span onClick={e=>setBody("availability")}>Availability</span>
      <span onClick={e=>setBody("testingDT")}>TestingDT</span>
      <span onClick={e=>setBody("appointmentcalendar")}>Todays Scedule - By Resource</span>
      <span onClick={e=>setBody("appointment_picker")}>Select Appointment</span>

    </div>
    <div className="body">
      {getPage(body)} 
    </div>
  </> )
}

//body === "availability" ? <AvailabilityPage/> : (body === "config" ? <ConfigurationPage/> : <TestingPage/>)

/*
 return (<>
    <div className="horizontal_layout">
      <TableLayOut data={employees} title={"employees"}/>
      <TableLayOut data={shifts} title={"shifts"}/>
      <TableLayOut data={breaks} title={"breaks"}/>
      <TableLayOut data={workdays} title={"workdays"}/>
      <TableLayOut data={services} title={"services"}/>
    </div>
    <div className="calendar_container">
      <Calendar {...calendarProps}/> 
    </div>
  </> )
*/

export default App

function AppointmentPicker(){

  const [open,setOpen] = useState(false)

  return <>
    <button onClick={()=>setOpen(true)}>Make Appointment</button>
    <ModalWrapper isOpen={open} close={()=>setOpen(false)}>              
          <AppointmentBooking onClose={()=>setOpen(false)}/>                         
      </ModalWrapper>   
  </>
}

function TableLayOut({data, title}){

  if(data.length < 1)
    return (<>No Data Available On {title}</>)

  const columnNames = Object.keys(data[0])

  return(<div>
    <table className="table_border">
     <caption>{title}</caption>
      <tbody>
      {columnNames.map((key, idx)=><th key={idx}>{key}</th>)}    
      </tbody>
      {data.map((e, idx)=>
        <tr className="table_row" key={idx}>
          {Object.keys(e).map((key, idx)=><td key={idx}>{e[key]}</td>)}   
        </tr>)}
    </table> 
  </div>)
}

function ConfigurationPage(){
  return (<>
    <div className="horizontal_layout">
      <TableLayOut data={employees} title={"employees"}/>
      <TableLayOut data={shifts} title={"shifts"}/>
      <TableLayOut data={breaks} title={"breaks"}/>
      <TableLayOut data={workdays} title={"workdays"}/>
      <TableLayOut data={services} title={"services"}/>
    </div>
  </> )
}

function AvailabilityPage(){

  const {
    getEmployeeById,
} = useBoundStore((state) => ({...state})) //shorthand to get all data/funcs of obj

  const [checkBox, setCheckBox] = useState("breaks_shifts")

  const {calendarProps,selectedEvent} = useAvailability([], checkBox)

  console.log("///selected event client: ", selectedEvent)

  function handleChange(e) {
    setCheckBox(e.target.value);
 }

 function getEmployeeNames(employee_ids){
  if(!employee_ids) return ""
  return employee_ids.split(",").map(getEmployeeById).map(({name})=>name).join(', ')
 }

   //style={{ height: 800 } this is what makes the inside part of the calendar scrollable
  //without scrolling the calendars container

  return( 
  <div className="availability_page_layout">

    <div className="left_panel">

 
      <div style={{ height: 800 }}>
        <Calendar {...calendarProps}/>
      </div>

      <div className="checkboxes">
        <div>
          <span>show breaks</span>
          <input value="breaks" type="checkbox" onChange = {handleChange} checked={checkBox==="breaks"}/> 
        </div>

        <div>
          <span>show shifts</span>
          <input value="shifts" type="checkbox" onChange = {handleChange} checked={checkBox==="shifts"}/> 
        </div>

        <div>
          <span>show breaks and shifts</span>
          <input value="breaks_shifts" type="checkbox" onChange = {handleChange} checked={checkBox==="breaks_shifts"}/> 
        </div>

        <div>
          <span>show sceduale</span>
          <input value="sceduale" type="checkbox" onChange = {handleChange} checked={checkBox==="sceduale"}/> 
        </div>
      </div>

    </div>

    <div className="right_panel">

      <div className="right_panel_top_section">
        asdsad
      </div>

      <div className="right_panel_bottom_section">
        {selectedEvent ? <>
          type: {selectedEvent.type}<br/>
          start: {selectedEvent.start.toString().split(" ")[4]}<br/>
          end: {selectedEvent.end.toString().split(" ")[4]}<br/>
          avail employees: {getEmployeeNames(selectedEvent.employee_ids)}<br/>
          days: {selectedEvent.week_days.join(',')}<br/>
          {selectedEvent.type === "sceduale" ? 
            <>
            non-avail employees: {getEmployeeNames(selectedEvent.missing_employee_ids)}<br/>
            </> : <></>}
        
        </> : <></>}
      </div>

    </div>

   
    
  </div>)
}



