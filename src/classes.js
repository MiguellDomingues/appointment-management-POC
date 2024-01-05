import { Interval } from './intervals.js'
import _ from 'lodash'

const DOTW = Object.freeze({
    Monday: 0,
    Tuesday: 1,
    Wednesday: 2,
    Thursday: 3,
    Friday: 4,
    Saturday: 5,
    Sunday: 6
})

export class WorkDay{

    constructor(dotw, open, close, shifts, breaks){

        if(!this.#isValidDay(dotw))
            throw new Error( `dotw ${dotw} must be a day of the week or an integer 0-6`)
        
        this.dotw = _.isInteger(dotw) ? dotw : DOTW[dotw]
        this.shifts = shifts || []
        this.breaks = breaks || []

        if(open && close){
            this.interval = new Interval(open, close)  
        }else{
            this.interval = null
        }         
    }

    #isValidDay(str){
        return Object.keys(DOTW).includes(str) || //a string day
               (str >= 0 && str <= 6)             // or an integer day 0-6
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

    toString(){
        return `dotw: ${this.dotw}, open: ${this.open}, close: ${this.close}, shifts: [${this.shifts}], breaks: [${this.breaks}]`
    }
}

export class IntervalSet{

    constructor(start, end, set){
        this.interval = new Interval(start, end)
        this.set = _.cloneDeep(set) || []
    }

    get start(){
        return this.interval.start
    }

    get end(){
        return this.interval.end
    }

    toString(){
        return `[start: ${this.start}, end: ${this.end}, set: [${this.set}] ]`
    }
}





