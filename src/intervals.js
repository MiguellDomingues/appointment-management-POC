import assert from 'node:assert/strict';
import _  from 'lodash';

import { WorkDay, IntervalSet, Interval } from './classes.js'

//import { getBreakById, getShiftById, getEmployeeById  } from './assets/data.js'

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

const RBC_EVENT_TYPES = Object.freeze({
    
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
export function getTimeSlotStep(minMaxInterval){

    const TIME_SLOT_BOXES = 20 //number of boxes we want on the screen at once to prevent scrolling
    const TIME_SLOT_STEP_CHOICES = [15,30,60] //the minutes for each time slot size

    //const HMToMinutes = (time) => (time.h*60)+time.m
    const f = (minutes, slotSize) => Math.abs( TIME_SLOT_BOXES - (minutes/slotSize) )

    const timeDiff = minMaxInterval.end - minMaxInterval.start

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

//const totalMinutesToHoursMinutes = totalMins => ({h: Math.floor(totalMins/60) , m: totalMins%60})

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

export function getMinMaxWorkingPlanTimes(openCloseTimes){

    if(!openCloseTimes.some(wp=>wp.open && wp.close)){ //when working plan does not have at least a single set open/close time
        return new Interval(0, MAX_MINUTES_IN_DAY)//{ startMin: {h:0, m:0}, endMax: {h:23, m:59} }
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

    return new Interval(minMinutes,maxMinutes)
}

export function createCloseIntervals(workDayObjects, minMaxInterval){
  
    if(workDayObjects.length !== 7){
      throw new Error("workDayObjects must have exactly 7 objects; 1 for each day of the week")
    }

    const closeIntervals = []

    const createCloseInterval = (openCloseInterval, weekStart) => {

        const startHM = openCloseInterval.startTimeToHMObject()
        const endHM = openCloseInterval.endTimeToHMObject()
      
      closeIntervals.push({
        id: closeIntervals.length, 
        start: new Date("2023", 10, weekStart, startHM.h , startHM.m , 0, 0), 
        end: new Date("2023", 10, weekStart, endHM.h, endHM.m, 0, 0), 
      })
    }

    let weekStart = 20 // set the starting dotw to nov 20 2023; a monday

    workDayObjects.forEach(wdo=>{
        const {open, close, dotw } = wdo 
        const weekDay = weekStart + dotw

        if(wdo.isOpen()){ //if the store is open 

            if(open !== minMaxInterval.start){  
                createCloseInterval(new Interval(minMaxInterval.start, open), weekDay)
            }

            if(close !== minMaxInterval.end){
                createCloseInterval(new Interval(close, minMaxInterval.end), weekDay)
            }
        }
        else{ //otherwise mark the entire day as clossed
            createCloseInterval(new Interval(minMaxInterval.start, minMaxInterval.end), weekDay)
        }
    })

    return closeIntervals;
}

export function fillInEmptyDays(workDayObjects){

    const daysOfTheWeek = new Set(Object.keys(DOTW).map(dotw=>DOTW[dotw]))
  
    workDayObjects.forEach(ds=>daysOfTheWeek.delete(ds.dotw))

    daysOfTheWeek.forEach(d=>{

    workDayObjects.push(
        new WorkDay(d, "", "", [], [])
        
    )})
  
     return workDayObjects
 }

export function initObjects(workdays,getBreakById, getShiftById){

    const workDayObjects = []

    workdays.forEach(wd=>{
        const {dotw, open, close, shifts, breaks} = wd

        const s = shifts.map(getShiftById).map(({start, end, employees})=>new IntervalSet(start,end,employees))
        const b = breaks.map(getBreakById).map(({start, end, employees})=>new IntervalSet(start,end,employees))

        workDayObjects.push(new WorkDay(dotw,open,close,s,b))
    })

    return fillInEmptyDays(workDayObjects)

}

export function createAvailabilityCalendarEvents(workDayObjects, setKey){

    const calendarEvents = []

    workDayObjects.forEach(wdo=>{

        const intervalSets = wdo[setKey]

        console.log("workday object: ", wdo)

        const dayOfTheWeek = 20+wdo.dotw
        //const sorted_si = sortIntervals(intervalSets)
        const split = splitUnionOverlappingIntervalSets(intervalSets)

        console.log(" raw split: ", split)

        const cleaned = mergeConsecutiveIntervalSets(split,areSetsEqual)

        console.log("cleaned: ", cleaned)

        cleaned.forEach(intervalSet=>{

            //const employeeInfo = intervalSet.set.map(getEmployeeById).map(({name})=>name).join(', ')

            const employee_ids = _.cloneDeep(intervalSet.set).sort().join(',')

            const startHoursMinutes = intervalSet.startTimeToHMObject()   
            const endHoursMinutes = intervalSet.endTimeToHMObject()

            const key = `${intervalSet.start}_${intervalSet.end}_${employee_ids}`

            calendarEvents.push({
                id: calendarEvents.length + 100, 
                start: new Date("2023", 10, dayOfTheWeek, startHoursMinutes.h , startHoursMinutes.m , 0, 0), 
                end: new Date("2023", 10, dayOfTheWeek, endHoursMinutes.h, endHoursMinutes.m, 0, 0), 
                type: setKey,
                key: key,
                data: _.cloneDeep(intervalSet.set).sort(),
               // title: setKey === 'breaks' ? `Break for: ${employeeInfo}` : `Shift for: ${employeeInfo}`,
                employee_ids: employee_ids//_.cloneDeep(intervalSet.set).sort().join(',')
            })  
        }) 

    })

    return calendarEvents      
}

export function createScedualeCalendarEvents(workDayObjects,getEmployeeById){

    const calendarEvents = []

    workDayObjects.forEach(wdo=>{

        const {shifts, breaks} = wdo

        const dayOfTheWeek = 20+wdo.dotw
        //const sorted_si = sortIntervals(intervalSets)
        const split = splitDiffOverlappingIntervalSets(shifts,breaks)

        console.log("split: ", split)

        split.forEach(intervalSet=>{

            const employee_ids = intervalSet.set.join(',')//intervalSet.set.map(getEmployeeById).map(({name})=>name).join(', ')

            const missing_employee_ids = intervalSet.missing_elements.join(',') 

           // console.log("employeeInfo",employeeInfo)
           // console.log("missing",missing)
           const key = `${intervalSet.start}_${intervalSet.end}_${employee_ids}`

            const startHoursMinutes = intervalSet.startTimeToHMObject()   
            const endHoursMinutes = intervalSet.endTimeToHMObject()

            calendarEvents.push({
                id: calendarEvents.length + 100, 
                start: new Date("2023", 10, dayOfTheWeek, startHoursMinutes.h , startHoursMinutes.m , 0, 0), 
                end: new Date("2023", 10, dayOfTheWeek, endHoursMinutes.h, endHoursMinutes.m, 0, 0), 
               // type: "shifts",
                //title: "", <- THIS IS THE TITLE FOR RESOURCE -> "room a"/room b
                type: "sceduale",
                key: key,
               // title: `avail: ${employeeInfo} non-avail: ${missing}`,
                employee_ids: employee_ids,
                missing_employee_ids: missing_employee_ids
            })  
        }) 

    })

   // console.log(calendarEvents)

    return calendarEvents      
}

export function splitUnionOverlappingIntervalSets(intervalSets){

    intervalSets = intervalSets ?? []
    
    if(intervalSets.length == 0 ) return []

    intervalSets = _.cloneDeep(sortIntervals(intervalSets))
    
    let overlapping_intervals = []
    
    //2n
    function splitOverlap(split_value, overlapping_interval_index){
    
        const overlapping_interval = overlapping_intervals[overlapping_interval_index]

        const {start, end, set, overlap_count} = overlapping_interval
        //copy the interval type (discrete, counted)
        const left_split_interval = new IntervalSet(start,split_value,set, [],overlap_count)
        const right_split_interval = new IntervalSet(split_value,end, set, [],overlap_count)
    
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
    function splitEnd(end, splitee_set, splitee_overlap_count){
    
        const size = overlapping_intervals.length
        let i = size-1
    
        if(end > getMaxEnd()){
            overlapping_intervals.push(new IntervalSet(getMaxEnd(),end,splitee_set, [], splitee_overlap_count))
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

        // interval type
        const interval_start = intervalSet.start
        let interval_end = intervalSet.end
        let splitee_set = intervalSet.set //save the set of the interval were about to split
        const overlap_count = intervalSet.overlap_count

        //if this interval is disjointed from the currently stored intervals, just add it to the tail and process next interval
        //(equal end/start points are considered disjointed because they dont overlap)
        if(interval_start >= getMaxEnd()){
            overlapping_intervals.push(new IntervalSet(interval_start, interval_end, splitee_set, [], overlap_count))
            //overlapping_intervals.push({interval: interval, map: _.cloneDeep(splitee_set)})//make a copy of the map
            continue  
        }
    
        //split the start value and store the index of the split interval
        const split_interval_start_index = splitStart(interval_start) 
    
        //split the end value and store the index of the split interval
        const split_interval_end_index = splitEnd(interval_end, splitee_set, overlap_count)
    
        //increment the overlap counts from split_interval_start_index to split_interval_end_index
        for(let i = split_interval_start_index ; i <= split_interval_end_index; i++){
            const overlap_interval = overlapping_intervals[i]
            //compare the split interval type with the intervals being iterated
            //4 types: count with count, count with interval, interval with count, interval with interval
            const unioned_set_arr = _.union(splitee_set, overlap_interval.set)//.sort() //instead of incrementing, union the sets

            overlap_interval.set = _.cloneDeep(unioned_set_arr)

            overlap_interval.overlap_count = overlap_interval.overlap_count + overlap_count
        }
    
    }
    
    return overlapping_intervals
}

//version thats working but is inefficient
// can be optimized using 2 pointer approach
export function splitDiffOverlappingIntervalSets(availabilityIntervalSets, unavailabilityIntervalSets){

    const getTail = (intervals)=> intervals[intervals.length-1].end
    const getHead = (intervals)=> intervals[0].start

    availabilityIntervalSets = availabilityIntervalSets ?? []
    unavailabilityIntervalSets = unavailabilityIntervalSets ?? []

    if(availabilityIntervalSets.length == 0 ) return []
    if(unavailabilityIntervalSets.length == 0 ) return availabilityIntervalSets
    
    //make sure both interval sets are disjointed with overlap sets/equal sets merged 
    //const cleaned = mergeEqualSetNeighbours(split)
    availabilityIntervalSets = mergeConsecutiveIntervalSets(splitUnionOverlappingIntervalSets(availabilityIntervalSets,areSetsEqual))
    unavailabilityIntervalSets = mergeConsecutiveIntervalSets(splitUnionOverlappingIntervalSets(unavailabilityIntervalSets,areSetsEqual))

    if(getTail(availabilityIntervalSets) <= getHead(unavailabilityIntervalSets) || //the entire unavailability set overruns the end of the availability set
       getTail(unavailabilityIntervalSets) <= getHead(availabilityIntervalSets)){  //the entire unavailability set underruns the start of the availability set
        return availabilityIntervalSets
    }
    
    function splitInterval(split_value, overlapping_interval_index){
    
        const {start, end, set, overlap_count} = overlapping_intervals[overlapping_interval_index]

        const left_split_interval = new IntervalSet(start,split_value,set, [], overlap_count)
        const right_split_interval = new IntervalSet(split_value,end, set, [], overlap_count)
  
        overlapping_intervals.splice(overlapping_interval_index, 1 ,[left_split_interval,right_split_interval])
        overlapping_intervals = overlapping_intervals.flat()

    }
    

    function findSplitInterval(split_value){

        //if the split value lies outside the left/right boundaries of the availabilityIntervalSets, theres nothing to split
        if(split_value <= getHead(overlapping_intervals) || split_value >= getTail(overlapping_intervals))
                return;

        for(let i = 0; i < overlapping_intervals.length; i++){
            const {start, end} = overlapping_intervals[i]

            if(split_value < start) break;

            if(split_value > start && split_value < end){
                splitInterval(split_value, i)
                break           
            }
        }
    }

    let overlapping_intervals = _.cloneDeep(availabilityIntervalSets)
    
    for(let i = 0; i < unavailabilityIntervalSets.length; i++){

        const {start, end, set, overlap_count} = unavailabilityIntervalSets[i]

        //skip unavailability intervals that end before the begining of the availability intervals
        if(end <= getHead(overlapping_intervals)){
            continue;
        }

        findSplitInterval(start) 
        findSplitInterval(end)

        //capture all the intervals that lie in-between start and end inclusive
       // const greater_equal = overlapping_intervals.filter(is=>is.start >= start)
       // const less_equal  = overlapping_intervals.filter(is=>is.end <= end)
        //const intersect = _.intersectionWith(greater_equal, less_equal, _.isEqual);

        //bracket all the intervals that lie in-between start and end inclusive
        const overlappingSubSet = overlapping_intervals.filter(is=>is.end <= end && is.start >= start)

        overlappingSubSet.forEach(is=>{
           is.missing_elements = _.cloneDeep(set)
           is.set = _.cloneDeep( _.difference(is.set,set) ) 
           is.overlap_count = is.overlap_count + overlap_count
        })
      
    }

    //console.log("returning from splitDiffOverlappingIntervalSets: ", overlapping_intervals)
    
    return overlapping_intervals
}

/*
check if 2 arrays contain the same contents, regardless of order
constraints:
- lhs,rhs elements should be strings
- lhs, rhs array elements should not contain duplicates
*/
export function areSetsEqual(lhs, rhs){

    lhs = lhs ?? []
    rhs = rhs ?? []

    if(lhs.length !== rhs.length) return false

    for (const str of lhs)
        if(!rhs.includes(str))
            return false 
      
    return true
}

export function areSetsNonEmpty(lhs, rhs){

    lhs = lhs ?? []
    rhs = rhs ?? []
 
    return lhs.length > 0 && rhs.length > 0
}

/*
merge consecutive intervals where :
    interval[i].end = interval[i+1].start 
    and
    predicateFn(leftIntervalSet, righIntervalSet) = true

constraints:
- intervalSets are sorted 
- intervalSets are non-overlapping



this idealy is invoked on the output of splitUnionOverlappingIntervalSets()
to clean up jointed intervals with the same sets 
*/
export function mergeConsecutiveIntervalSets(intervalSets, predicateFn){

    intervalSets = intervalSets ?? []
    predicateFn = predicateFn ?? null//( (lhs,rhs)=>false )

    if(!predicateFn || intervalSets.length < 2) return intervalSets

    const merged_intervals = []

    let p1 = 0;

    while(p1 < intervalSets.length){ 
    
        //read the left-hand/outer interval
        const { start: outer_start, end: outer_end, set: outer_set } = intervalSets[p1] 
        let current_end = outer_end //set the endpoint
    
        let p2 = p1+1 //set the pointer to the next interval
        //check 1 or more consecutive intervals after the outer interval for merge candidates
        while(p2 < intervalSets.length){

            const { start: inner_start, end: inner_end, set: inner_set } = intervalSets[p2]
    
            //if this intervals startpoint is touching the previous intervals endpoint and the sets are the same
            if( current_end === inner_start && predicateFn(inner_set,outer_set) ){//areSetsEqual(inner_set,outer_set)){ 
                current_end = inner_end  //update the endpoint...
                p2++;                    //...and proceed to the next interval        
            }else{   
                break;                   //otherwise stop checking for intervals to merge            
            } 
        }
        //create a new interval from outer interval that is merged with 0 or more inner intervals
        merged_intervals.push(new IntervalSet(outer_start, current_end, outer_set)) 
        
        p1 = p2 //update the outer pointer so its pointing back to the last interval processed by inner loop
    }

    return merged_intervals
}




/*
find the available appointment slots for each time slot

  open_intervals:    a list of sorted, non-overlapping intervalSets 
  service_duration:  length of appointment service in minutes
  time_slots:        a list of jointed,sorted intervals

constaints: 
  time_slots.length > 0
  time_slots[0].start <= open_intervals[0].start
  time_slots[time_slots.length-1].end >= open_intervals[open_intervals.length-1].end

return: 
  an array of time_slots length, each containing an array with 0-n integers, each index representing a time where an apt may be booked
*/
export function getTimeSlotAvailabilities(open_intervals, service_duration, time_slot_intervals){

    open_intervals = open_intervals ?? [];
    time_slot_intervals = time_slot_intervals ?? [];
    service_duration = service_duration ?? 0
  
    assert.equal(service_duration > 0, true, "service_duration must be greater then 0");
    assert.equal(service_duration <= time_slot_intervals[0].duration, true, "service_duration can not exceed the duration of a time slot");
   
    //remove open intervals that are shoter than the service_duration
    open_intervals = open_intervals.filter((interval)=> interval.duration >= service_duration)
    // remove open intervals that have no resources available to fill capacity
    //i could also add a filter which checks for specific employees (book appointment with a specific person)
    open_intervals = open_intervals.filter((interval)=> interval.set.length >= 1) 

    if(open_intervals.length === 0){ //if there are no open intervals, just return an array of empty arrays for each time slot 
      return new Array(time_slot_intervals.length).fill([])
    }

    let availability_times = []
    //generate an array of availability times across all the open intervals
    open_intervals.forEach(({start,end})=>{

        const slots = []
        let interval_start = start

        while(interval_start + service_duration <= end){
            slots.push( interval_start )
            interval_start+=service_duration 
        }

        availability_times = availability_times.concat(slots)
    })

   // console.log("all slots",availability_times)

    const time_slot_availabilities = []
    let availability_times_pointer = 0
    //for each time slot, create an array containing 0 or more availability times which can be booked within that slot 
    time_slot_intervals.forEach(time_slot=>{   
        const time_slot_availability = []
        while(availability_times_pointer < availability_times.length && //while there are still availability times
              availability_times[availability_times_pointer] < time_slot.end){ //and this availability time falls within this slot
                time_slot_availability.push(availability_times[availability_times_pointer++]) //add the availability time, increment pointer
        }
        time_slot_availabilities.push(time_slot_availability)
    })
  
    return time_slot_availabilities
}


/*
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

//old but updated from original
export function splitDiffOverlappingIntervalSets_test(availabilityIntervalSets, unavailabilityIntervalSets){

    availabilityIntervalSets = availabilityIntervalSets ?? []
    unavailabilityIntervalSets = unavailabilityIntervalSets ?? []

    if(availabilityIntervalSets.length == 0 ) return []
    
    //make sure both interval set inputs are disjointed with overlap sets merged
    availabilityIntervalSets = splitUnionOverlappingIntervalSets(availabilityIntervalSets)
    unavailabilityIntervalSets = splitUnionOverlappingIntervalSets(unavailabilityIntervalSets)

    let overlapping_intervals = _.cloneDeep(availabilityIntervalSets)
    
    //2n
    function splitOverlap(split_value, overlapping_interval_index){
    
        const overlapping_interval = overlapping_intervals[overlapping_interval_index]

        const {start, end, set} = overlapping_interval

        const left_split_interval = new IntervalSet(start,split_value,set)
        const right_split_interval = new IntervalSet(split_value,end, set)
  
        overlapping_intervals.splice(overlapping_interval_index, 1 ,[left_split_interval,right_split_interval])
        overlapping_intervals = overlapping_intervals.flat()

    }
    
    const getMaxEnd = ()=> overlapping_intervals[overlapping_intervals.length-1].end
    
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
            console.log("end > getMaxEnd()")
           // overlapping_intervals.push({
              //  interval: new Interval(getMaxEnd(), end),
              //  map: _.cloneDeep(splitee_map)
           // })

            //overlapping_intervals.push(new IntervalSet(getMaxEnd(),end,splitee_set))

            return i
        }
    
        while(i >= 0){   
            const intervalSet = overlapping_intervals[i]
        
            const left = intervalSet.start
            const right = intervalSet.end
        
            if(end === right){
                return i
            }
            if(end > left && end < right){ //if(end > left){
                splitOverlap(end, i)
                return i
            }
            i--
        }

        return i;
    }
    
    //add the first interval to the return list
    //overlapping_intervals.push(intervalSets[0])
    
    for(let i = 0; i < unavailabilityIntervalSets.length; i++){

        const {start, end, set} = unavailabilityIntervalSets[i]

        //const intervalSet = unavailabilityIntervalSets[i]


    
       // const interval = intervalSets[i].interval
       // const interval_start = intervalSet.start
       // let interval_end = intervalSet.end
       // let splitee_set = intervalSet.set //save the set of the interval were about to split
    
        //if this interval is disjointed from the currently stored intervals, just add it to the tail and process next interval
        //(equal end/start points are considered disjointed because they dont overlap)
        if(start >= getMaxEnd()){
            console.log("start >= getMaxEnd()")
            //overlapping_intervals.push(new IntervalSet(interval_start, interval_end, splitee_set))
            //overlapping_intervals.push({interval: interval, map: _.cloneDeep(splitee_set)})//make a copy of the map
            continue  
        }

    
        //split the start value and store the index of the split interval
        const split_interval_start_index = splitStart(start) 
    
        //split the end value and store the index of the split interval
        const split_interval_end_index = splitEnd(end, set)

        console.log("split_interval_start_index ",split_interval_start_index)
        console.log("split_interval_end_index ",split_interval_end_index)
        console.log("overlapping_intervals ", overlapping_intervals)

        //split_interval_start_index ;
        //let i = Math.max(split_interval_start_index,0) this is a hacky solution for now
        
        //split_interval_end_index becomes UNDEFINED when it cant be found within overlapping_intervals

        //increment the overlap counts from split_interval_start_index to split_interval_end_index
        for(let i = Math.max(split_interval_start_index,0) ; i <= split_interval_end_index; i++){
            const overlap_interval = overlapping_intervals[i]
            const unioned_set_arr = _.difference(overlap_interval.set,set) //instead of incrementing, union the sets
            overlap_interval.set = _.cloneDeep(unioned_set_arr)
        }
    
    }
    
    return overlapping_intervals
}

//original
function splitDiffOverlapIntervals_test(availability_sets, unavailability_sets){

    availability_sets = availability_sets ?? []
    unavailability_sets = unavailability_sets ?? []
    
    if(availability_sets.length == 0 ) return []
    
    //employees is an array of id strings
    //insert into set for each interval
   // intervals = intervals.map(ji=>({interval: ji.interval, map: _.cloneDeep(ji.employees)}))
    

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
            //once again, a break interval falls outside the scedule
            //this should throw an exception (breaks must fall within a scedule
            //OR i can just set the end to the MaxEnd, ignoring the overrun
           // overlapping_intervals.push({
             //   interval: new Interval(getMaxEnd(), end),
             //   map: _.cloneDeep(splitee_map)
           // })
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
    
    //clone/add the availability set intervals
   let overlapping_intervals = _.cloneDeep(availability_sets)
    
    //for each unavailability(break) interval
    for(let i = 0; i < unavailability_sets.length; i++){
    
        const interval = unavailability_sets[i].interval
        const interval_start = interval.start
        let interval_end = interval.end
        let splitee_map = unavailability_sets[i].map //save the set of the interval were about to split
    
        //if this interval is disjointed from the currently stored intervals, just add it to the tail and process next interval
        //(equal end/start points are considered disjointed because they dont overlap)
        if(interval_start >= getMaxEnd()){

            //a break falls outside the sceduale
            //just skip this 
           // overlapping_intervals.push({interval: interval, map: _.cloneDeep(splitee_map)})//make a copy of the map
            continue  
        }
    
        //split the start value and store the index of the split interval
        const split_interval_start_index = splitStart(interval_start) 
    
        //split the end value and store the index of the split interval
        const split_interval_end_index = splitEnd(interval_end, splitee_map)
    
        assert.equal(split_interval_start_index <= split_interval_end_index, true, 
        `split_interval_start_index ${split_interval_start_index} is always <= split_interval_end_index ${split_interval_end_index} `);
    
        //increment the overlap counts from split_interval_start_index to split_interval_end_index
        for(let i = split_interval_start_index ; i <= split_interval_end_index; i++){
            const overlap_interval = overlapping_intervals[i]
            const unioned_set_arr = _.difference(overlap_interval.map,splitee_map ) //instead of incrementing, union the sets
            overlap_interval.map = _.cloneDeep(unioned_set_arr)
           // overlap_interval.overlap =  overlap_interval.overlap+1
           // assert.equal(overlap_interval.overlap <= intervals.length, true, "max # of interval overlaps must be <= the input size ");
        }
    
    }
    
    return overlapping_intervals
}

*/

/*

OLD VERSION OF FUNCTION
WROTE A CONDENSED VERSION THAT SEEMS TO WORK
DO MORE TESTS
THIS ONE HAS A BUG
when interval ends beyond a time slot boundary, it wount add appointments beyond the time slot end
the result is showing less capacity then actually exists
use new version

find the available appointment slots for each time slot

  open_intervals:    a list of sorted, non-overlapping intervalSets 
  service_duration:  length of appointment service in minutes
  time_slots:        a list of jointed,sorted intervals

constaints: 
  time_slots.length > 0
  time_slots[0].start <= open_intervals[0].start
  time_slots[time_slots.length-1].end >= open_intervals[open_intervals.length-1].end

return: 
  an array of time_slots length, each containing an array with 0-n integers, each index representing a time where an apt may be booked
*/
/*
export function getTimeSlotAvailabilities(open_intervals, service_duration, time_slot_intervals){

    open_intervals = open_intervals ?? [];
    time_slot_intervals = time_slot_intervals ?? [];
    service_duration = service_duration ?? 0
  
    assert.equal(service_duration > 0, true, "service_duration must be greater then 0");
    assert.equal(service_duration <= time_slot_intervals[0].duration, true, "service_duration can not exceed the duration of a time slot");
   
    //remove open intervals that are shoter than the service_duration
    open_intervals = open_intervals.filter((interval)=> interval.duration >= service_duration)
    // remove open intervals that have no resources available to fill capacity
    //i could also add a filter which checks for specific employees (book appointment with a specific person)
    open_intervals = open_intervals.filter((interval)=> interval.set.length >= 1) 

    if(open_intervals.length === 0){ //if there are no open intervals, just return an array of empty arrays for each time slot 
      return new Array(time_slot_intervals.length).fill([])
    }

    //console.log("open_intervalsffsdfdsfs:", open_intervals)
  
    const time_slot_availabilities = []

    //generate an array of integers, starting from interval_start and incrementing by (service_duration) all the way to interval_end 
    //represents the times an appointment may be booked across an open interval starting from the earliest time
    const getAvailabilitySlots = (interval_start, interval_end) => {

      const slots = []

      console.log("getAvailabilitySlots:")
      console.log("interval_start:", interval_start)
      console.log("interval_end:", interval_end)
  
      while(interval_start + service_duration <= interval_end)
      {
        slots.push( interval_start )
        interval_start+=service_duration 
      }
     
      return slots
    }
  
    let open_intervals_index = 0;
    let overflow = 0;

    //console.log("open_intervals:", open_intervals)
  
    time_slot_intervals.forEach(time_slot=>{
  
      const time_slot_end = time_slot.end;
      let bucket_total = []
  
      if(overflow > 0){ //any intervals that overran the last buckets end time will have the difference place in this bucket
        const overflow_for_this_bucket = Math.min( overflow, time_slot.duration) //the most overflow we can take would be the bucket capacity 
        console.log("source1")
        bucket_total = getAvailabilitySlots (  time_slot.start, time_slot.start + overflow_for_this_bucket ) 
        overflow = overflow - overflow_for_this_bucket //and decrement the overflow
      }
  
      //if there is still overflow after the above op, it means an open interval extends past this bucket boundary and the bucket is filled. go to the next bucket
      //when the overflow is empty, walk the intervals to fill the current bucket until the interval falls outside the bucket or there are no intervals
      while(overflow === 0 && open_intervals_index < open_intervals.length){  
  
        const open_interval = open_intervals[open_intervals_index]
        const open_interval_start = open_interval.start
        const open_interval_end = open_interval.end
        //when the interval is 0% inside this bucket, including edges, then we are done processing this bucket
        if(open_interval_start >= time_slot_end){//if the interval needs to be placed into the next bucket
          break;
        }
  
        //interval begins in this bucket and ends in some other bucket; 
        if(open_interval_end > time_slot_end){ 
          const non_overflow =  time_slot_end - open_interval_start // find the section of the interval that lies within this bucket
          overflow = open_interval_end - time_slot_end // find the section of the interval that lies outside this bucket
          //if the part of the interval overflowing into next bucket is too small to fit an apt..
          // AND the part of the interval within this bucket is too small to fit an apt..
          console.log("non_overflow " , non_overflow)
          console.log("overflow " , overflow)
         // console.log("2 " , open_interval_start, open_interval_start + service_duration)
         // console.log("3 " , open_interval_start, non_overflow + open_interval_start)

          if(overflow < service_duration && non_overflow < service_duration){ 
            //still allow the user to book into THIS bucket (because we have enough time on this interval)
            //otherwise user would be denied booking, even though this interval has time
            console.log("source2")
            bucket_total = bucket_total.concat( getAvailabilitySlots (open_interval_start, open_interval_start + service_duration ) )
          }else{  //if the overflow exeeds service duration (book within next bucket)      
            //or the non-overflow is large enough to fit at least one apt into this bucket
            console.log("source3")
            bucket_total = bucket_total.concat( getAvailabilitySlots ( open_interval_start, non_overflow + open_interval_start ) )//should always be >= 1
            //bucket_total = bucket_total.concat( getAvailabilitySlots ( open_interval_start, open_interval_end ) )
          } 
        }else{ //interval is 100% inside this bucket
          //otherwise put the open interval into this bucket and check the next one
          console.log("source4")
          bucket_total = bucket_total.concat( getAvailabilitySlots (open_interval_start, open_interval_end ) )
        }
        //console.log("source1")
        open_intervals_index++
      }
  
      time_slot_availabilities.push(bucket_total)
    })
  
    return time_slot_availabilities
}
this should be called paritionIntervalIntoBuckets*/









