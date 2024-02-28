//import { Interval } from './intervals.js'
import _ from 'lodash'

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

export const DOTW_STRINGS = Object.keys(DOTW)

export class WorkDay{

    constructor(dotw, open, close, shifts, breaks){

        //appointments

        this.dotw = this.#parseDOTW(dotw)
        this.shifts = shifts || []
        this.breaks = breaks || []

        if(open && close){
            this.interval = new Interval(open, close)  
        }else{
            this.interval = null
        }         
    }

    #parseDOTW(dotw){
        if (_.isInteger(dotw) && (dotw >= 0 && dotw <= 6) ) 
            return dotw
        if (_.isString(dotw) && Object.keys(DOTW).includes(dotw)) 
            return DOTW[dotw]
        else 
            throw new Error( `dotw ${dotw} must be a day of the week string or an integer 0-6`)         
    }

    isOpen(){
        return !!this.interval
    }

    get open(){
        return this.isOpen() ? this.interval.start : ""
    }

    get close(){
        return this.isOpen() ? this.interval.end : ""
    }

    // get shiftIntervalSets
    // get breakIntervalSets

    /*
    createDaysCalendarEvents( workDayCB, intervalSetCB){

        const cloned = _.cloneDeep(this)

        const callenderEvent = {
            dayOfTheWeek: 20+dotw
            id: (sttaic),

        }


        {transformed, ...rest} = workDayCB(cloned) 
        return transformed.map((is)=>{

            const startHoursMinutes = is.startTimeToHMObject()   
            const endHoursMinutes = is.endTimeToHMObject()

            start: new Date("2023", 10, dayOfTheWeek, startHoursMinutes.h , startHoursMinutes.m , 0, 0), 
            end: new Date("2023", 10, dayOfTheWeek, endHoursMinutes.h, endHoursMinutes.m, 0, 0), 
            

            return intervalSetCB(is, cloned, ...rest)
        })


    }
    */

    toString(){
        return `dotw: ${this.dotw}, open: ${this.open}, close: ${this.close}, shifts: [${this.shifts}], breaks: [${this.breaks}]`
    }
}

export class Interval {

    constructor(start, end){
  
      if(_.isString(start))
        this.start = this.hourMinutesStringtoTotalMinutes(start);
      else 
        this.start = start || 0
      
      if(_.isString(end))
        this.end =   this.hourMinutesStringtoTotalMinutes(end);
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

    hourMinutesStringtoTotalMinutes(timeString){
        const regex = new RegExp(`^([0-1]?[0-9]|2[0-3]):([0-5][0-9])(:[0-5][0-9])?$`);

        if(!regex.test(timeString)){
            throw new Error(`time string ${timeString} must be 00:00->23:59 format`)
        }
    
        return parseInt(timeString.split(":")[0])*60 + parseInt(timeString.split(":")[1])
    } 
  
    startToHoursMinutesString(){
      return Interval.totalMinutesToHoursMinutesString(this.start)
    }
  
    endToHoursMinutesString(){
      return Interval.totalMinutesToHoursMinutesString(this.end)
    }

    startTimeToHMObject(){
        return Interval.totalMinutesToHoursMinutesObject(this.start)
    }

    endTimeToHMObject(){
        return Interval.totalMinutesToHoursMinutesObject(this.end)
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

export class IntervalSet{

    //missing_elements = []

    constructor(start, end, set, missing_elements){
        this.interval = new Interval(start, end)
        this.set = _.cloneDeep(set) || []
        this.missing_elements = _.cloneDeep(missing_elements) || []
    }

    get start(){
        return this.interval.start;
    }

    get end(){
        return this.interval.end;
    }

    get duration(){
        return this.interval.duration;
    }

    startTimeToHMObject(){
        return Interval.totalMinutesToHoursMinutesObject(this.interval.start)
    }

    endTimeToHMObject(){
        return Interval.totalMinutesToHoursMinutesObject(this.interval.end)
    }

    toString(){
        return `[start: ${this.start}, end: ${this.end}, set: [${this.set}] ]`
    }
}


export class CalendarEvent{
//add shift, break events here
//KEEP A COUNTING STATIC VAR TO INCREMENT IDS
/*
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
*/

    createCalendarEvent(workDay, processWorkDay, processIntervalSet){      
        workDay.map(processWorkDay)
    }
}

/*

*/





