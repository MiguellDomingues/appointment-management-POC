import { describe, it, beforeEach }  from "node:test";
import assert from 'node:assert/strict';

import { createCloseIntervals , createBreakIntervals } from '../src/intervals.js'

describe("testing createCloseIntervals()", {skip: false}, () => {

    let workingPlan;

    /*
    it("throws assertion error when max time < end time of last interval", () => {
        closed_intervals = [new Interval(55, 60)]
        min_max_interval = new Interval(54, 59)

        try{intervals = getOpenIntervals(closed_intervals, min_max_interval)}catch(err){}
        assert.equal(intervals === null, true, "end of last interval cant be > max time")      
    });
    */

    it("returns ", () => {

        workingPlan= [
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
          ]

        console.log(createCloseIntervals(workingPlan))

        /*
        assert.deepStrictEqual(
            getOpenIntervals(closed_intervals, min_max_interval), [min_max_interval] , 
            "interval with no closed intervals should be the min_max_interval");
            */
    });
    

    beforeEach(() => {
        workingPlan = []
    });
});

