
import useAvailability from './useAvailability';
import PropTypes from 'prop-types';
import { Calendar,  } from "react-big-calendar";

import { useState } from 'react'

import useBoundStore from "./store";

import "react-big-calendar/lib/css/react-big-calendar.css";

import './App.css'

import TestingPage from "./TestingPage"

import {employees, shifts, breaks, workdays, services,getEmployeeById } from "./assets/data"




function App() {

  const [body, setBody] = useState("availability")

  return (<>
    <div className="header">
      <span onClick={e=>setBody("config")}>Configuration</span>
      <span onClick={e=>setBody("availability")}>Availability</span>
      <span onClick={e=>setBody("testing")}>Testing</span>
    </div>
    <div className="body">
      {body === "availability" ? <AvailabilityPage/> : (body === "config" ? <ConfigurationPage/> : <TestingPage/>)} 
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


TableLayOut.propTypes = {
  data: PropTypes.array.isRequired,
  title: PropTypes.string.isRequired
}


