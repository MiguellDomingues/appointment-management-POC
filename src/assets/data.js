
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

]

export const workdays = [
{
    open: "08:00",
    close: "17:00",
    dotw: "Monday",
    shifts: [0,1],
    breaks: [0,1,2]

}
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