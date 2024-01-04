//import { useState } from 'react'
//import reactLogo from './assets/react.svg'
//import viteLogo from '/vite.svg'
import useAvailability from './useAvailability';
import PropTypes from 'prop-types';
import { Calendar,  } from "react-big-calendar";

import "react-big-calendar/lib/css/react-big-calendar.css";

import './App.css'

import {employees, shifts, breaks, workdays, services} from "./assets/data"

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

const mock_data2 = [
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

  const {calendarProps} = useAvailability(mock_data)
 
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
}

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


TableLayOut.propTypes = {
  data: PropTypes.array.isRequired,
  title: PropTypes.string.isRequired
}


