import _  from 'lodash';

import { WorkDay, IntervalSet, Interval } from './classes.js'

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

    intervalSets.forEach(is=>{
        if(!(is instanceof IntervalSet))
            throw new Error("Error in splitUnionOverlappingIntervalSets: input must be an IntervalSet object")})

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
           
            const unioned_set_arr = _.union(splitee_set, overlap_interval.set)//.sort() //instead of incrementing, union the sets

            overlap_interval.set = _.cloneDeep(unioned_set_arr)

            overlap_interval.overlap_count = overlap_interval.overlap_count + overlap_count
        }
    
    }
    
    return overlapping_intervals
}

//version thats working but is inefficient
// can be optimized using 2 pointer approach
/*
merge unavailability intervals (breaks and appointments) with the availability intervals (shifts):  
 AI *--------------------------(A,B)----------------------------------------* 
+UI         *--(A)--*       *--(B+1)---*       *---(+1)---*       *--(A,B)--*
=   *-(A,B)-*--(B)--*-(A,B)-*--(A,+1)--*-(A,B)-*-(A,B,+1)-*-(A,B)-*---()----*
*/

//generateCapacityIntervals
export function splitDiffOverlappingIntervalSets(availabilityIntervalSets, unavailabilityIntervalSets){

    const getTail = (intervals)=> intervals[intervals.length-1].end
    const getHead = (intervals)=> intervals[0].start

    availabilityIntervalSets = availabilityIntervalSets ?? []
    unavailabilityIntervalSets = unavailabilityIntervalSets ?? []

    if(availabilityIntervalSets.length == 0 ) return []
    if(unavailabilityIntervalSets.length == 0 ) return availabilityIntervalSets
    
    //make sure both interval sets are disjointed with consecutive, equal intervals merged
    availabilityIntervalSets = mergeConsecutiveIntervalSets(splitUnionOverlappingIntervalSets(availabilityIntervalSets),areSetsEqual)
    unavailabilityIntervalSets = mergeConsecutiveIntervalSets(splitUnionOverlappingIntervalSets(unavailabilityIntervalSets),areSetsEqual)

    //availabilityIntervalSets = splitUnionOverlappingIntervalSets(availabilityIntervalSets)
    //unavailabilityIntervalSets = splitUnionOverlappingIntervalSets(unavailabilityIntervalSets)

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
           //is.missing_elements = _.cloneDeep(set)
           //is.
           is.missing_elements = _.union(is.missing_elements, _.cloneDeep(set))//_.cloneDeep(set)
            //check if the 
           is.set = _.cloneDeep( _.difference(is.set,set) ) 
           is.overlap_count = is.overlap_count + overlap_count
        })
      
    }

    //console.log("returning from splitDiffOverlappingIntervalSets: ", overlapping_intervals)
    
    return overlapping_intervals
}

/*
check if set, overlap_count, missing_element props are equal for a pair of intervals
constraints:
- lhs,rhs must be intervals with the set, overlap_count, missing_element props
- overlap_count, missing_element array elements should not contain duplicates
*/
export function areSetsEqual(lhs, rhs){

    if( !lhs || !lhs ||  //if either pointer is null, 
        lhs.set.length !== rhs.set.length ||
        lhs.missing_elements.length !== rhs.missing_elements.length || // the sets are not the same length
        lhs.overlap_count !== rhs.overlap_count) //the overlap count is not the same
            return false

    for (const str of lhs.set)
        if(!rhs.set.includes(str))
            return false

    for (const str of lhs.missing_elements)
        if(!rhs.missing_elements.includes(str))
            return false
         
    return true
}

export function areSetsNonEmpty(lhs, rhs){

    lhs = lhs ?? []
    rhs = rhs ?? []
 
    return lhs.length > 0 && rhs.length > 0
}

/*
merge consecutive intervals into a single interval where :
    interval[i].end = interval[i+1].start 
    and
    predicateFn(lhsInterval, rhsInterval) = true

constraints:
- intervalSets are sorted 
- intervalSets are non-overlapping

note that intervals that get merged will 
- use the outer intervals overlap_count
- missing_elements set to []
*/
export function mergeConsecutiveIntervalSets(intervalSets, predicateFn){

    intervalSets = intervalSets ?? []
    predicateFn = predicateFn ?? null//( (lhs,rhs)=>false )

    if(!predicateFn || intervalSets.length < 2) return intervalSets

    const merged_intervals = []

    let p1 = 0;

    while(p1 < intervalSets.length){ 
    
        //read the left-hand/outer interval
        const { 
            start: outer_start, 
            end: outer_end, 
            set: outer_set, 
            overlap_count
        } = intervalSets[p1] 

        let current_end = outer_end //set the endpoint
    
        let p2 = p1+1 //set the pointer to the next interval
        //check 1 or more consecutive intervals after the outer interval for merge candidates
        while(p2 < intervalSets.length){

            const { 
                start: inner_start, 
                end: inner_end, 
                //set: inner_set 
            } = intervalSets[p2]
    
            //if this intervals startpoint is touching the previous intervals endpoint and the sets are the same
            //if( current_end === inner_start && predicateFn(inner_set,outer_set) ){
            if( current_end === inner_start && predicateFn(intervalSets[p1] ,intervalSets[p2]) ){
                current_end = inner_end  //update the endpoint...
                p2++;                    //...and proceed to the next interval        
            }else{   
                break;                   //otherwise stop checking for intervals to merge            
            } 
        }
        //create a new interval from outer interval that is merged with 0 or more inner intervals
        merged_intervals.push(new IntervalSet(outer_start, current_end, outer_set, [], overlap_count)) 
        
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


  
    //assert.equal(service_duration > 0, true, "service_duration must be greater then 0");
   // assert.equal(service_duration <= time_slot_intervals[0].duration, true, "service_duration can not exceed the duration of a time slot");
   
    //remove open intervals that are shoter than the service_duration
    open_intervals = open_intervals.filter((interval)=> interval.duration >= service_duration)
    // remove open intervals that have no resources available to fill capacity
    //i could also add a filter which checks for specific employees (book appointment with a specific person)

    //might not need this
   // open_intervals = open_intervals.filter((interval)=> interval.set.length >= 1) 

    if(open_intervals.length === 0){ //if there are no open intervals, just return an array of empty arrays for each time slot 
      return new Array(time_slot_intervals.length).fill([])
    }

    let availability_times = []
    //generate an array of availability times for all the open intervals
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

export function getIntervalsWithAppointmentCapacity(availability, unavailability){

    //diff the availability intervals (shifts) with the unavailability intervals (appointments/breaks)
    const diffed = splitDiffOverlappingIntervalSets(availability, unavailability)

    //keep only the intervals with capacity for an appointment
   // const withCapacity = diffed.filter(({overlap_count, set})=>overlap_count < set.length)

   // console.log("capacity intervals: ", diffed)

    const withCapacity = diffed.filter((is)=>is.has_capacity)

    //console.log("withCapacity: ", withCapacity)

    //intervals that remain and are right next to each other can be merged
    //note that this causes overlap_count and missing_elements props on these intervals to get lost 
    //so return just regular intervals
    return toIntervals(mergeConsecutiveIntervalSets(withCapacity,()=>true))
}


/*
given the days shifts, breaks (workDay), appointments and service_duration, generate the possible 
booking times across the day for each time slot

returns an object of the schema:
    {
        sceduale: [
            0 or more....
            {
                start: Int // start time (in minutes)
                end:   Int // end time (in minutes)
                availability: Int (0-100) // the availability remaining for this time slot, expressed as a percentage
                open_times: [Int1, Int2..] //the times (in minutes) an appointment may be booked
            }
        ],
        day_availability: Int //the average availability across all the time slots
    }

*/
export function getWorkDayAvailability(
    workDay,          //instance of WorkDay class with days shifts,breaks
    appointments,     //list of IntervalSet objects converted from appointments
    service_duration, //requested appointment length
    time_slots        //list of consecutive Interval objects
){
    
    const {shifts, breaks} = workDay

    const totalAvailabilityIntervals = getIntervalsWithAppointmentCapacity(shifts, breaks)
    const adjustedAvailabilityIntervals = getIntervalsWithAppointmentCapacity(shifts, appointments.concat(breaks))

    const totalAvailabilityTimeslots = getTimeSlotAvailabilities(totalAvailabilityIntervals, service_duration, time_slots)
    const adjustedAvailabilityTimeslots = getTimeSlotAvailabilities(adjustedAvailabilityIntervals, service_duration, time_slots)

    return makeObject(totalAvailabilityTimeslots, adjustedAvailabilityTimeslots, time_slots)

}

export function makeObject(totalAvailabilities, adjustedAvailabilities, timeSlots){

    if(timeSlots.length == 0) 
        throw new Error('Error timeSlots arr can not be empty')
    if(totalAvailabilities.length !== adjustedAvailabilities.length) 
        throw new Error('Error adjustedAvailabilities and totalAvailabilities arrs must be same length')

   let availabilityCount = 0

    const sceduale = timeSlots.map(({start,end}, idx)=>{
        if(totalAvailabilities[idx].length < adjustedAvailabilities[idx].length) 
            throw new Error('Error totalAvailabilities can not be greater than adjustedAvailabilities ')
        const availability = totalAvailabilities[idx].length > 0 ? Math.trunc( (adjustedAvailabilities[idx].length/totalAvailabilities[idx].length)*100 ) : 0
        availabilityCount+=availability

        return {start,end,availability, open_times: adjustedAvailabilities[idx]}
    })

    return {sceduale,day_availability: Math.trunc( (availabilityCount/sceduale.length) )}

}





