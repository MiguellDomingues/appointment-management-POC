
export const employees = [
    {
      _id: 0,
      name: "tom"
    },
    {
      _id: 1,
      name: "jon"
    },
    {
      _id: 2,
      name: "pam"
    },
    {
      _id: 3,
      name: "gina"
    },
]
  
export const shifts = [
{
    _id: 0,
    start: "08:00",
    end: "17:00",
    employees: [0,1,2]
},
{
    _id: 1,
    start: "12:00",
    end: "17:00",
    employees: [3]
},
{
  _id: 2,
  start: "09:00",
  end: "14:00",
  employees: [0,1,2]
},
]

export const breaks = [
{
    _id: 0,
    start: "09:00",
    end: "09:15",
    employees: [0,1]
},
{
    _id: 1,
    start: "12:00",
    end: "13:00",
    employees: [0,1,2]
},
{
    _id: 2,
    start: "14:00",
    end: "14:15",
    employees: [3]
},
{
  _id: 3,
  start: "11:00",
  end: "11:30",
  employees: [0,1]
},

]

export const workdays = [
  {
      open: "08:00",
      close: "17:00",
      dotw: "Monday",
      shifts: [0,1],
      breaks: [2,1,0]       
  },
  {
      open: "08:00",
      close: "17:00",
      dotw: "Tuesday",
      shifts: [0,1],
      breaks: [0,1,2]       
  },
  {
      open: "08:00",
      close: "17:00",
      dotw: "Wednesday",
      shifts: [0,1],
      breaks: [0,1,2]       
  },
  {
      open: "08:00",
      close: "17:00",
      dotw: "Thursday",
      shifts: [0,1],
      breaks: [0,1,2]       
  },
  {
      open: "09:00",
      close: "14:00",
      dotw: "Friday",
      shifts: [2],
      breaks: [3]       
  },
]

export const services = [
  {
    _id: 0,
    name: "haircut",
    duration: 15
  },
  {
    _id: 1,
    name: "perm",
    duration: 25
  },
  {
    _id: 2,
    name: "hair coloring",
    duration: 45
  },
]

export function getBreakById(id){
  return breaks.find(b=>b._id === id)
}

export function getShiftById(id){
  return shifts.find(s=>s._id === id)
}

export function getEmployeeById(id){
  return employees.find(e=>e._id === id)
}