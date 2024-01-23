
import useAvailability from './useAvailability';
import PropTypes from 'prop-types';
import { Calendar,  } from "react-big-calendar";

import { useState } from 'react'

import "react-big-calendar/lib/css/react-big-calendar.css";

import './App.css'

import {employees, shifts, breaks, workdays, services,getEmployeeById } from "./assets/data"

const mock_data = [
  {
    breaks: [
      {start: '09:00', end: '09:15', days: ['Mon', 'Tue', 'Wed', 'Thu'], id: '657f6325fd889192b66917bf'},
      {start: '12:00', end: '13:00', days: ['Mon', 'Tue', 'Wed', 'Thu'], id: '657f6325fd889192b66917c0'}, 
      {start: '11:00', end: '11:30', days: ['Fri'], id: '657f6325fd889192b66'}
    ],

    workingPlan: [
      {
          "start": "08:00",
          "end": "17:00",
          "day": "Mon",
          "id": "657f6325fd889192b66917b8"
      },
      {
          "start": "08:00",
          "end": "17:00",
          "day": "Tue",
          "id": "657f6325fd889192b66917b9"
      },
      {
          "start": "08:00",
          "end": "17:00",
          "day": "Wed",
          "id": "657f6325fd889192b66917ba"
      },
      {
          "start": "08:00",
          "end": "17:00",
          "day": "Thu",
          "id": "657f6325fd889192b66917bb"
      },
      {
          "start": "09:00",
          "end": "14:00",
          "day": "Fri",
          "id": "657f6325fd889192b66917bc"
      },
      {
          "start": "",
          "end": "",
          "day": "Sat",
          "id": "657f6325fd889192b66917bd"
      },
      {
          "start": "",
          "end": "",
          "day": "Sun",
          "id": "657f6325fd889192b66917be"
      }
    ],
    serviceDurations: [],
    id: 0,
  }
]

function App() {

  const [body, setBody] = useState("availability")

  const {calendarProps} = useAvailability(mock_data)
 
  return (<>
    <div className="header">
      <span onClick={e=>setBody("config")}>Configuration</span>
      <span onClick={e=>setBody("availability")}>Availability</span>
    </div>
    <div className="body">
      {body === "availability" ? <AvailabilityPage/> : <ConfigurationPage/>} 
    </div>
  </> )
}

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

  const [checkBox, setCheckBox] = useState("breaks_shifts")

  const {calendarProps,selectedEvent} = useAvailability([], checkBox)

  console.log("///selected event client: ", selectedEvent)

  /*
  console.log("///employees: ", 
    selectedEvent?.employee_ids.split(",")
      .map(id=>parseInt(id))
        .map(getEmployeeById)
          .map(({name})=>name).join(', ')) */

  function handleChange(e) {
    setCheckBox(e.target.value);
 }

 function getEmployeeNames(employee_ids){
  return employee_ids.split(",").map(id=>parseInt(id)).map(getEmployeeById).map(({name})=>name).join(', ')
 }

  return( 
  <div className="availability_page_layout">

    <div className="left_panel">

      <Calendar {...calendarProps}/>
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
          employees: {getEmployeeNames(selectedEvent.employee_ids)}<br/>
          days: {selectedEvent.week_days.join(',')}
        
        </> : <></>}
      </div>

    </div>

   
    
  </div>)
}


TableLayOut.propTypes = {
  data: PropTypes.array.isRequired,
  title: PropTypes.string.isRequired
}


