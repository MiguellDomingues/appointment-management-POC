import {create} from "zustand";
import {produce} from "immer";

import { nanoid } from 'nanoid'

import _  from 'lodash';

import {employees, shifts, breaks,workDays } from "./assets/mock_data"

import { DOTW_STRINGS } from "./classes"


const createShiftsSlice = 

    (set,get) => {
        console.log("inside createShiftsSlice (set) ")
        return {
            shifts: shifts,
            addShift: (payload) =>
                set(
                    produce(
                        (draft) => {
                                    const {start, end, employees, desc} = payload
                                    draft.shifts.push({
                                        id: nanoid(),
                                        desc: desc,
                                        start: start,
                                        end:   end,
                                        employees: employees
                                    });
                                }        
                            )
                    ),
            removeShift: (payload) =>
                set(
                produce((draft) => {
                    const shiftsIndex = draft.shifts.findIndex((el) => el.id === payload);
                    draft.shifts.splice(shiftsIndex, 1); 
                    
                    draft.workDays.forEach((workDay)=>{
                        //workDay.breaks = workDay.breaks.filter(b_id=>b_id !== payload)
                        const shiftsIndex = workDay.shifts.findIndex((id) => id === payload);
                        shiftsIndex >= 0 && workDay.shifts.splice(shiftsIndex, 1);
                    })
                })
                ),
            patchShift: (payload) =>
            set(
                produce((draft) => {
                    console.log("patchShift: ", payload)
                    const {id, start, end, employees, desc} = payload
                    const shift = draft.shifts.find((shift) => shift.id === id);

                    shift.start = start;
                    shift.end = end;
                    shift.employees = employees;
                    shift.desc = desc;
                    
                })
            ),
            getShiftById: (id)=>{
                return get().shifts.find(e=>e.id===id)
            },

        }
    }

const createBreaksSlice = 

    (set,get) => {
        console.log("inside createBreaksSlice (set) ")
        return {
            breaks: breaks,
          
            addBreak: (payload) =>
                set(
                    produce(
                        (draft) => {
                                    const {start, end, employees, desc} = payload
                                    draft.breaks.push({
                                        id: nanoid(),
                                        desc: desc,
                                        start: start,
                                        end:   end,
                                        employees: employees
                                    });
                                }        
                            )
                    ),
            removeBreak: (payload) =>
                set(
                    produce((draft) => {
                        const breaksIndex = draft.breaks.findIndex((el) => el.id === payload);
                        draft.breaks.splice(breaksIndex, 1);  
                        
                        draft.workDays.forEach((workDay)=>{
                            //workDay.breaks = workDay.breaks.filter(b_id=>b_id !== payload)
                            const breaksIndex = workDay.breaks.findIndex((id) => id === payload);
                            breaksIndex >= 0 && workDay.breaks.splice(breaksIndex, 1);
                        })
                    })
                ),
            patchBreak: (payload) =>
            set(
                produce((draft) => {
                    console.log("patchBreak: ", payload)
                    const {id, start, end, employees, desc} = payload
                    const breakToPatch = draft.breaks.find((_break) => _break.id === id);

                    breakToPatch.desc = desc;
                    breakToPatch.start = start;
                    breakToPatch.end = end;
                    breakToPatch.employees = employees;
                    
                })
            ),
            getBreakById: (id)=>{
                return get().breaks.find(e=>e.id===id)
            },

        }
    }


/*

draft.shifts.forEach((shift)=>{shift.employees = shift.employees.filter(e_id=>e_id !== payload)})
                            //delete the employee ref from breaks
                            draft.breaks.forEach((_break)=>{_break.employees = _break.employees.filter(e_id=>e_id !== payload)})   

*/

const createEmployeesSlice = 

    (set,get) => {
        console.log("inside createEmployeesSlice (set) ")

        return {
            employees: employees,
            addEmployee: (payload) =>{
                let new_employee = null
                set(
                    produce(
                        (draft) => {
                                const {name} = payload
                                new_employee = {id: nanoid(), name: name}
                                draft.employees.push(new_employee);
                            }        
                        )
                    )

                return new_employee
                
                },
            getEmployeeById: (id)=>{
                return get().employees.find(e=>e.id===id)
            },
            deleteEmployee: (payload) =>{
                //console.log("removeEmployee: ", set)
                set(
                    produce(
                        (draft) => {

                            //delete the employee obj from Employee
                            const employeesIndex = draft.employees.findIndex((el) => el.id === payload);
                            draft.employees.splice(employeesIndex, 1);

                            //delete the employee ref from shifts
                            draft.shifts.forEach((shift)=>{shift.employees = shift.employees.filter(e_id=>e_id !== payload)})
                            //delete the employee ref from breaks
                            draft.breaks.forEach((_break)=>{_break.employees = _break.employees.filter(e_id=>e_id !== payload)})   
                            
                            // get().removeShiftEmployee({shift_id: shift.id, emp_id: payload})
                    }
                )
            )
            },
            patchEmployee: (payload) =>
            set(
                produce((draft) => {
                    console.log("patch emp: ", payload)
                    const {id, name} = payload
                    const employee = draft.employees.find((el) => el.id === id);
                    employee.name = name;
                })
            ),

        }
    }

const createWorkDaysSlice = 

    (set,get) => {
        console.log("inside createWorkDaySlice (set) ")
        return {
            workDays: workDays,
            workDaySchema: {open: "", close: "", dotw: "", shifts: [], breaks: []},
            addWorkDay: (payload) =>
                set(
                    produce(
                        (draft) => {
                                    const {open, close, dotw, shifts, breaks} = payload
                                    draft.workDays.push({
                                        id: nanoid(),
                                        open:   open,
                                        close:  close,
                                        dotw:   dotw,
                                        shifts: shifts,
                                        breaks: breaks,
                                    });
                                }        
                            )
                    ),
            removeWorkDay: (payload) =>
                set(
                produce((draft) => {
                    const workDay = draft.workDays.findIndex((el) => el.id === payload);
                    draft.workDays.splice(workDay, 1);              
                })
                ),
            patchWorkDay: (payload) =>
            set(
                produce((draft) => {
                    console.log("patchShift: ", payload)
                    const {id, open, close, shifts, breaks} = payload
                    const workDay = draft.workDays.find((shift) => shift.id === id);

                    workDay.open = open;
                    workDay.close = close;
                    workDay.shifts = shifts;
                    workDay.breaks = breaks;
                    
                })
            ),
            getWorkDayById: (id)=>{
                return get().workDays.find(e=>e.id===id)
            },
            getWorkDaySchema: ()=>get().workDaySchema,
            getMissingWorkDays: ()=>_.difference(DOTW_STRINGS, get().workDays.map(({dotw})=>dotw))
        }
    }
  
const useBoundStore = create((...a) => ({
    ...createShiftsSlice(...a),
    ...createEmployeesSlice(...a),
    ...createBreaksSlice(...a),
    ...createWorkDaysSlice(...a)
}))

export default useBoundStore

