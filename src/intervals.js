import assert from 'node:assert/strict';
import _  from 'lodash';

import { WorkDay, IntervalSet } from './classes.js'

import { getBreakById, getShiftById, getEmployeeById  } from './assets/data.js'

const MAX_MINUTES_IN_DAY = 60*23 + 59

const DOTW = Object.freeze({
    Monday: 0,
    Tuesday: 1,
    Wednesday: 2,
    Thursday: 3,
    Friday: 4,
    Saturday: 5,
    Sunday: 6
})

/*
export function isTimeStringValid(timeString){
    const regex = new RegExp(`^([0-1]?[0-9]|2[0-3]):([0-5][0-9])(:[0-5][0-9])?$`);
    return regex.test(timeString)
} 


sort the days of the week in order from Monday=0 to Sunday=6
*/
export function sortByWeekday(daysOfTheWeek){
    return daysOfTheWeek.sort((lhs,rhs)=>{lhs.dotw-rhs.dotw})
}

//we want to find the time steps (in minutes) betwen each box for a 24 hour work day such that it does not scroll the screen 
//revisit this function so I can use the entire UI; base it on the container height or something
export function getTimeSlotStep(startMin, endMax){

    const TIME_SLOT_BOXES = 20 //number of boxes we want on the screen at once to prevent scrolling
    const TIME_SLOT_STEP_CHOICES = [15,30,60] //the minutes for each time slot size

    const HMToMinutes = (time) => (time.h*60)+time.m
    const f = (minutes, slotSize) => Math.abs( TIME_SLOT_BOXES - (minutes/slotSize) )

    const timeDiff = HMToMinutes(endMax) - HMToMinutes(startMin)

    let min = Number.MAX_SAFE_INTEGER, step = null

    TIME_SLOT_STEP_CHOICES.forEach(tlsc=>{
    let diff = f(timeDiff, tlsc)
    if(diff < min){
        min = diff
        step = tlsc
    }
    })
            
    return step;
}

const totalMinutesToHoursMinutes = totalMins => ({h: Math.floor(totalMins/60) , m: totalMins%60})

export class Interval {

    constructor(start, end){
  
      if(_.isString(start))
        this.start = hourMinutesStringtoTotalMinutes(start);
      else 
        this.start = start || 0
      
      if(_.isString(end))
        this.end =   hourMinutesStringtoTotalMinutes(end);
      else 
        this.end = end || 0

        if(this.end < 0 || this.start < 0 )
            throw new Error(`start ${this.start} end ${this.end } must be > 0`)
        if(this.start > this.end)
            throw new Error(`start ${this.start} must be < end ${this.end }`)
        if(this.end > MAX_MINUTES_IN_DAY)
            throw new Error( `end ${this.end} must be <= ${MAX_MINUTES_IN_DAY}`)
      
      //assert.equal(this.end >= 0 && this.start >= 0 , true, `start ${this.start} end ${this.end } must be > 0`)
     // assert.equal(this.start <= this.end, true, `start ${this.start} must be < end ${this.end }`)
     // assert.equal(this.end <= MAX_MINUTES_IN_DAY , true, `end ${this.end} must be <= ${MAX_MINUTES_IN_DAY}`)
    }
  
    get duration(){
      return this.end-this.start;
    }
  
    toObject(){
      return {start: this.start, end: this.end}
    }
  
    startToHoursMinutesString(){
      return Interval.totalMinutesToHoursMinutesString(this.start)
    }
  
    endToHoursMinutesString(){
      return Interval.totalMinutesToHoursMinutesString(this.end)
    }

    static totalMinutesToHoursMinutesObject(totalMins){
        return ({h: Math.floor(totalMins/60) , m: totalMins%60})
      }
  
    static totalMinutesToHoursMinutesString(totalMins){
      return `${new String(Math.floor(totalMins/60)).padStart(2, '0')}:${new String(totalMins%60).padStart(2, '0') }`
    }
  
    toString(){
      return `start: ${this.startToHoursMinutesString()} end: ${this.endToHoursMinutesString()}`
    }
  
  
}

export const toIntervals = (time_objs) => time_objs.map(({start, end})=>new Interval(start, end)) 
  
/*
input:  arr of interval objects that may or may not overlap
return: the arr sorted by earliest start and if the starts overlap, the earliest ends
*/
export function sortIntervals(intervals = []){
    return intervals.toSorted((interval1,interval2)=>
        interval1.start !== interval2.start ? interval1.start - interval2.start 
            : interval1.end - interval2.end)
}

/*
validate and convert a string into total minutes
input: a string representing a time in 24 hour format: 00:00->23:59 WITH a leading zero on single digits
*/
export function hourMinutesStringtoTotalMinutes(timeString){
    //const regex = new RegExp(`^([0-1]?[0-9]|2[0-3]):([0-5][0-9])(:[0-5][0-9])?$`);
    //assert.equal(regex.test(timeString), true, ` time string ${timeString} must be 00:00->23:59 format`)

return parseInt(timeString.split(":")[0])*60 + parseInt(timeString.split(":")[1])
} 

//input: arr of employee_sceduale objects {intervaL: interval, employees: [stringId0, sid1, ...]}
export function splitUnionOverlappingIntervalSets(intervals){

    intervals = intervals ?? []
    
    if(intervals.length == 0 ) return []
    
    //employees is an array of id strings
    //insert into set for each interval
    intervals = intervals.map(ji=>({interval: new Interval(ji.start, ji.end), map: _.cloneDeep(ji.employees)}))
    
    let overlapping_intervals = []
    
    //2n
    function splitOverlap(split_value, overlapping_interval_index){
    
        const overlapping_interval = overlapping_intervals[overlapping_interval_index]
    
        const left = overlapping_interval.interval.start
        const right= overlapping_interval.interval.end
        const map = overlapping_interval.map
    
        const left_split_interval = {
            interval: new Interval(left, split_value),
            map: _.cloneDeep(map) //MAKE A NEW COPY
        }
    
        const right_split_interval =  {
            interval: new Interval(split_value, right),
            map: _.cloneDeep(map) //MAKE A NEW COPY
        }
    
        overlapping_intervals.splice(overlapping_interval_index, 1 ,[left_split_interval,right_split_interval])
        overlapping_intervals = overlapping_intervals.flat()
    }
    
    const getMaxEnd = ()=> overlapping_intervals[overlapping_intervals.length-1].interval.end
    
    //n
    function splitStart(start){
    
        const size = overlapping_intervals.length
        let i = size-1
    
        while(i >= 0){
            const interval = overlapping_intervals[i]
        
            const left = interval.interval.start
            const right = interval.interval.end
                
            if(start === left){
                break
            }
            if(start < right && start > left){
                splitOverlap(start, i)
                i++//when we split on the start, we need to increment the i so the new overlap gets unioned 
                break
            }
            i--
        }
        return i
    }
    
    //n
    function splitEnd(end, splitee_map){
    
        const size = overlapping_intervals.length
        let i = size-1
    
        if(end > getMaxEnd()){
            overlapping_intervals.push({
                interval: new Interval(getMaxEnd(), end),
                map: _.cloneDeep(splitee_map)
            })
            return i
        }
    
        while(i >= 0){   
            const interval = overlapping_intervals[i]
        
            const left = interval.interval.start
            const right = interval.interval.end
        
            if(end === right){
                return i
            }
            if(end > left){
                splitOverlap(end, i)
                return i
            }
            i--
        }
    }
    
    //add the first interval to the return list
    overlapping_intervals.push(intervals[0])
    
    for(let i = 1; i < intervals.length; i++){
    
        const interval = intervals[i].interval
        const interval_start = interval.start
        let interval_end = interval.end
        let splitee_map = intervals[i].map //save the set of the interval were about to split
    
        //if this interval is disjointed from the currently stored intervals, just add it to the tail and process next interval
        //(equal end/start points are considered disjointed because they dont overlap)
        if(interval_start >= getMaxEnd()){
            overlapping_intervals.push({interval: interval, map: _.cloneDeep(splitee_map)})//make a copy of the map
            continue  
        }
    
        //split the start value and store the index of the split interval
        const split_interval_start_index = splitStart(interval_start) 
    
        //split the end value and store the index of the split interval
        const split_interval_end_index = splitEnd(interval_end, splitee_map)
    
        //assert.equal(split_interval_start_index <= split_interval_end_index, true, 
        //`split_interval_start_index ${split_interval_start_index} is always <= split_interval_end_index ${split_interval_end_index} `);
    
        //increment the overlap counts from split_interval_start_index to split_interval_end_index
        for(let i = split_interval_start_index ; i <= split_interval_end_index; i++){
            const overlap_interval = overlapping_intervals[i]
            const unioned_set_arr = _.union(splitee_map, overlap_interval.map) //instead of incrementing, union the sets
            overlap_interval.map = _.cloneDeep(unioned_set_arr)
        }
    
    }
    
    return overlapping_intervals
}


export function getMinMaxWorkingPlanTimes_obj_test(openCloseTimes){

    
    if(!openCloseTimes.some(wp=>wp.open && wp.close)){ //when working plan does not have at least a single set open/close time
        return { startMin: {h:0, m:0}, endMax: {h:23, m:59} }
    }

    let minMinutes =   MAX_MINUTES_IN_DAY
    let maxMinutes =   0

    openCloseTimes.forEach((wp)=>{
        const {open, close} = wp

        if(open && close){
            minMinutes = Math.min(open, minMinutes)
            maxMinutes = Math.max(close, maxMinutes)
        }
    })

    return { startMin: Interval.totalMinutesToHoursMinutesObject(minMinutes), endMax: Interval.totalMinutesToHoursMinutesObject(maxMinutes)}
}


export function createCloseIntervals_obj_test(workDayObjects, startMin, endMax){
  
    if(workDayObjects.length !== 7){
      throw new Error("workDayObjects must have exactly 7 objects; 1 for each day of the week")
    }

    const isEqual = (t1, t2) => t1.h === t2.h && t1.m === t2.m

    const closeIntervals = []

    const createCloseInterval = (startHM, endHM, weekStart) => {
      closeIntervals.push({
        id: closeIntervals.length, 
        start: new Date("2023", 10, weekStart, startHM.h , startHM.m , 0, 0), 
        end: new Date("2023", 10, weekStart, endHM.h, endHM.m, 0, 0), 
      })
    }

    let weekStart = 20 // set the starting dotw to nov 20 2023; a monday

    workDayObjects.forEach(wdo=>{
        const {open, close, dotw} = wdo 
        const weekDay = weekStart + dotw

        if(open && close){ //if the store is open (start and end are not empty strings)

            const startHoursMinutes = Interval.totalMinutesToHoursMinutesObject(open)

            if(!isEqual(startHoursMinutes, startMin)){  
                createCloseInterval(startMin, startHoursMinutes, weekDay)
            }

            const endHoursMinutes = Interval.totalMinutesToHoursMinutesObject(close)
            
            if(!isEqual(endHoursMinutes, endMax)){
                createCloseInterval(endHoursMinutes, endMax, weekDay)
            }
        }
        else{ //otherwise mark the entire day as clossed
            createCloseInterval(startMin, endMax, weekDay)    
        }
    })

    return closeIntervals;
}


export function fillInEmptyDays_test(workDayObjects){

    const daysOfTheWeek = new Set(Object.keys(DOTW).map(dotw=>DOTW[dotw]))
  
    workDayObjects.forEach(ds=>daysOfTheWeek.delete(ds.dotw))

    daysOfTheWeek.forEach(d=>{

    workDayObjects.push(
        new WorkDay(d, "", "", [], [])
        
    )})
  
     return workDayObjects
 }

export function initObjects(workdays){

    const workDayObjects = []

    workdays.forEach(wd=>{
        const {dotw, open, close, shifts, breaks} = wd

        const s = shifts.map(getShiftById).map(({start, end, employees})=>new IntervalSet(start,end,employees))
        const b = breaks.map(getBreakById).map(({start, end, employees})=>new IntervalSet(start,end,employees))

        workDayObjects.push(new WorkDay(dotw,open,close,s,b))
    })

    return fillInEmptyDays_test(workDayObjects)

}

export function createCalendarEvents_test(workDayObjects, setKey){

    const calendarEvents = []

    workDayObjects.forEach(wdo=>{

        const intervalSets = wdo[setKey]

        const dayOfTheWeek = 20+wdo.dotw
        const sorted_si = sortIntervals(intervalSets)
        const split = splitUnionOverlappingIntervalSets_test(sorted_si)

        console.log("split: ", split)

        split.forEach(intervalSet=>{

            const {start, end, set} = intervalSet

            console.log("employee ids: ", set)

            const startHoursMinutes = totalMinutesToHoursMinutes (start)     
            const endHoursMinutes = totalMinutesToHoursMinutes (end)

            calendarEvents.push({
                id: calendarEvents.length + 100, 
                start: new Date("2023", 10, dayOfTheWeek, startHoursMinutes.h , startHoursMinutes.m , 0, 0), 
                end: new Date("2023", 10, dayOfTheWeek, endHoursMinutes.h, endHoursMinutes.m, 0, 0), 
                type: setKey,
                title: setKey === 'breaks' ? "Break" : "Shift",
                employee_ids: set.join(',')
            })  
        }) 

    })

    return calendarEvents      
}

//input: arr of employee_sceduale objects {intervaL: interval, employees: [stringId0, sid1, ...]}
export function splitUnionOverlappingIntervalSets_test(intervalSets){

    intervalSets = intervalSets ?? []
    
    if(intervalSets.length == 0 ) return []
    
    //employees is an array of id strings
    //insert into set for each interval
    //intervalSets = intervalSets.map(ji=>({interval: new Interval(ji.start, ji.end), map: _.cloneDeep(ji.employees)}))

    intervalSets = _.cloneDeep(intervalSets)
    
    let overlapping_intervals = []
    
    //2n
    function splitOverlap(split_value, overlapping_interval_index){
    
        const overlapping_interval = overlapping_intervals[overlapping_interval_index]
    
        const left = overlapping_interval.start
        const right= overlapping_interval.end
        const set = overlapping_interval.set

        const left_split_interval = new IntervalSet(left,split_value,set)
        const right_split_interval = new IntervalSet(split_value,right,set)
    
        /*
        const left_split_interval = {
            interval: new Interval(left, split_value),
            map: _.cloneDeep(map) //MAKE A NEW COPY
        }
    
        const right_split_interval =  {
            interval: new Interval(split_value, right),
            map: _.cloneDeep(map) //MAKE A NEW COPY
        }
    */
        overlapping_intervals.splice(overlapping_interval_index, 1 ,[left_split_interval,right_split_interval])
        overlapping_intervals = overlapping_intervals.flat()
    }
    
    const getMaxEnd = ()=> overlapping_intervals[overlapping_intervals.length-1].interval.end
    
    //n
    function splitStart(start){
    
        const size = overlapping_intervals.length
        let i = size-1
    
        while(i >= 0){
            const intervalSet = overlapping_intervals[i]
        
            const left = intervalSet.start
            const right = intervalSet.end
                
            if(start === left){
                break
            }
            if(start < right && start > left){
                splitOverlap(start, i)
                i++//when we split on the start, we need to increment the i so the new overlap gets unioned 
                break
            }
            i--
        }
        return i
    }
    
    //n
    function splitEnd(end, splitee_set){
    
        const size = overlapping_intervals.length
        let i = size-1
    
        if(end > getMaxEnd()){

            /*overlapping_intervals.push({
                interval: new Interval(getMaxEnd(), end),
                map: _.cloneDeep(splitee_map)
            })*/

            overlapping_intervals.push(new IntervalSet(getMaxEnd(),end,splitee_set))

            return i
        }
    
        while(i >= 0){   
            const intervalSet = overlapping_intervals[i]
        
            const left = intervalSet.start
            const right = intervalSet.end
        
            if(end === right){
                return i
            }
            if(end > left){
                splitOverlap(end, i)
                return i
            }
            i--
        }
    }
    
    //add the first interval to the return list
    overlapping_intervals.push(intervalSets[0])
    
    for(let i = 1; i < intervalSets.length; i++){

        const intervalSet = intervalSets[i]
    
       // const interval = intervalSets[i].interval
        const interval_start = intervalSet.start
        let interval_end = intervalSet.end
        let splitee_set = intervalSet.set //save the set of the interval were about to split
    
        //if this interval is disjointed from the currently stored intervals, just add it to the tail and process next interval
        //(equal end/start points are considered disjointed because they dont overlap)
        if(interval_start >= getMaxEnd()){
            overlapping_intervals.push(new IntervalSet(interval_start, interval_end, splitee_set))
            //overlapping_intervals.push({interval: interval, map: _.cloneDeep(splitee_set)})//make a copy of the map
            continue  
        }
    
        //split the start value and store the index of the split interval
        const split_interval_start_index = splitStart(interval_start) 
    
        //split the end value and store the index of the split interval
        const split_interval_end_index = splitEnd(interval_end, splitee_set)
    
        //assert.equal(split_interval_start_index <= split_interval_end_index, true, 
        //`split_interval_start_index ${split_interval_start_index} is always <= split_interval_end_index ${split_interval_end_index} `);
    
        //increment the overlap counts from split_interval_start_index to split_interval_end_index
        for(let i = split_interval_start_index ; i <= split_interval_end_index; i++){
            const overlap_interval = overlapping_intervals[i]
            const unioned_set_arr = _.union(splitee_set, overlap_interval.set) //instead of incrementing, union the sets
            overlap_interval.set = _.cloneDeep(unioned_set_arr)
        }
    
    }
    
    return overlapping_intervals
}









