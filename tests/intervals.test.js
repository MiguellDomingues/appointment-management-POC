import { describe, it, beforeEach }  from "node:test";
import _  from 'lodash';
import assert from 'node:assert/strict';
import moment from "moment";

//import {useBoundStore} from '../src/store.js';

import { 

    //sortByWeekday,
   // Interval,
   // toIntervals,
   // sortIntervals,
    //splitUnionOverlappingIntervalSets,
    areSetsNonEmpty,

    splitUnionOverlappingIntervalSets,
    //getTimeSlotAvailabilities,

    getTimeSlotAvailabilities,
    //splitDiffOverlappingIntervalSets_test,

    mergeConsecutiveIntervalSets,
    splitDiffOverlappingIntervalSets,

    //splitDiffOverlappingIntervalSets_test3,
    areSetsEqual,
    //splitDiffOverlapIntervals_test_2,


   // createCloseIntervals,
   // fillInEmptyDays,

    initObjects,
    createAvailabilityCalendarEvents,

 } from '../src/intervals.js'

 import { 

    IntervalSet,Interval
   

 } from '../src/classes.js'

//import {employees, shifts, breaks, workdays, services, getBreakById, getShiftById} from "../src/assets/data.js"


describe("testing createCloseIntervals todo()", {skip: true}, () => {

    let workingPlan;

    /*
    it("throws assertion error when max time < end time of last interval", () => {
        closed_intervals = [new Interval(55, 60)]
        min_max_interval = new Interval(54, 59)

        try{intervals = getOpenIntervals(closed_intervals, min_max_interval)}catch(err){}
        assert.equal(intervals === null, true, "end of last interval cant be > max time")      
    });
    */

    /*
    it("testing openCloseTimes of  splitIntoOpenCloseTimesShiftsBreaks", () => {

        const { openCloseTimes, shiftsBreaks } = splitIntoOpenCloseTimesShiftsBreaks(workdays)

        const {startMin, endMax} =  getMinMaxWorkingPlanTimes(openCloseTimes)

        assert.deepStrictEqual(startMin , { h: 8, m: 0 }, "");
        assert.deepStrictEqual(endMax , { h: 17, m: 0 }, "");

        const timeStep = getTimeSlotStep(startMin,endMax)

        assert.deepStrictEqual(timeStep , 30, "");

        const closeIntervals = createCloseIntervals(openCloseTimes,startMin,endMax)

        //console.log(closeIntervals)

        
        assert.deepStrictEqual(
            closeIntervals , 
                [
                    {
                      id: 0,
                      start: new Date("2023-11-24T16:00:00.000Z"),
                      end: new Date("2023-11-24T17:00:00.000Z")   
                    },
                    {
                      id: 1,
                      start: new Date("2023-11-24T22:00:00.000Z"),
                      end: new Date("2023-11-25T01:00:00.000Z")   
                    },
                    {
                      id: 2,
                      start: new Date("2023-11-25T16:00:00.000Z"),
                      end: new Date("2023-11-26T01:00:00.000Z")   
                    },
                    {
                      id: 3,
                      start: new Date("2023-11-26T16:00:00.000Z"),
                      end: new Date("2023-11-27T01:00:00.000Z")
                    }
        ],"");
            
    });*/

    it("testing shiftsBreaks of  splitIntoOpenCloseTimesShiftsBreaks", () => {


       // console.log(workdays)

        const wdo = initObjects(workdays)

        //console.log(`${wdo}`)console.log(`${wdo}`)

       // wdo.forEach(a=>console.log(`${a["shifts"]}`))

       wdo.forEach(a=>console.log(`${a}`))

       const a = createAvailabilityCalendarEvents(wdo, "shifts")

       console.log(a)

        //const { openCloseTimes, shiftsBreaks } = splitIntoOpenCloseTimesShiftsBreaks(workdays)

        //const {shifts, breaks} = splitInto_Shifts_Breaks(shiftsBreaks)

        //console.log(shifts,breaks)

       // shifts.forEach(s=>console.log(s))
       // breaks.forEach(b=>console.log(b))

        //console.log(createCalendarEvents(shifts))
    });


    beforeEach(() => {
        workingPlan = []
    });
});

//broken right now with the missing_elements = [] prop
describe("testing splitDiffOverlapIntervals", { skip: false }, () => {

    let availability_sets, unavailability_sets;

    describe("testing every combination of 1 availability interval with 1 unavailability interval", {skip: false},() => {

        it("splits/diffs start/end with no corners touching. unavailability = 5---[0, 1]---8", () => { 
    
            unavailability_sets = [ new IntervalSet(5,8, [0, 1]) ]

            assert.deepStrictEqual( 
            splitDiffOverlappingIntervalSets(availability_sets,unavailability_sets), 
            [ 
                new IntervalSet(4,5, [0, 1, 2]), 
                new IntervalSet(5,8, [2], [0,1]),
                new IntervalSet(8,10, [0, 1, 2]),
            ],"");  
    
        });

        it("splits/diffs end with start corner touching. unavailability = 4---[0, 1]---6", () => { 
    
            unavailability_sets = [ new IntervalSet(4,6, [0, 1]) ]

            assert.deepStrictEqual( 
            splitDiffOverlappingIntervalSets(availability_sets,unavailability_sets), 
            [ 
                new IntervalSet(4,6, [2], [0,1]), 
                new IntervalSet(6,10, [0, 1, 2]),
            ],"");  
    
        });

        it("splits/diffs start with end corner touching. unavailability = 6---[0, 1]---10", () => { 
    
            unavailability_sets = [ new IntervalSet(6,10, [0, 1]) ]

            assert.deepStrictEqual( 
            splitDiffOverlappingIntervalSets(availability_sets,unavailability_sets), 
            [ 
                new IntervalSet(4,6, [0, 1, 2]), 
                new IntervalSet(6,10, [2], [0,1]),
            ],"");  
    
        });

        it("splits/diffs start with end overrunning last interval. unavailability = 8---[0, 1]---11", () => { 
    
            unavailability_sets = [ new IntervalSet(8,11, [0, 1]) ]
   
            assert.deepStrictEqual( 
            splitDiffOverlappingIntervalSets(availability_sets,unavailability_sets), 
            [ 
                new IntervalSet(4,8, [0, 1, 2]), 
                new IntervalSet(8,10, [2],[0,1]),
            ],"");  
    
        });

        it("splits/diffs end when only end lies within first interval. unavailability = 2---[0, 1]---6", () => { 
    
            unavailability_sets = [ new IntervalSet(2,6, [0, 1]) ]

            assert.deepStrictEqual( 
            splitDiffOverlappingIntervalSets(availability_sets,unavailability_sets), 
            [ 
                new IntervalSet(4,6, [2],[0,1]), 
                new IntervalSet(6,10, [0,1,2]), 
            ],"");  
    
        });

        it("skips underrunning intervals and splits end when only end lies within first interval. unavailability = 0---[0, 1]---1, 2---[0, 1]---6", () => { 
    
            unavailability_sets = [new IntervalSet(0,1, [0, 1]), new IntervalSet(2,6, [0, 1]) ]
    
           assert.deepStrictEqual( 
            splitDiffOverlappingIntervalSets(availability_sets,unavailability_sets), 
                [ 
                    new IntervalSet(4,6, [2], [0,1]), 
                    new IntervalSet(6,10, [0,1,2]), 
                ],"");  
    
        });

        it("skips underrunning intervals. unavailability = 0---[0, 1]---1, 2---[0, 1]---4", () => { 
    
            unavailability_sets = [new IntervalSet(0,1, [0, 1]) ,new IntervalSet(2,4, [0, 1]) ]
  
           assert.deepStrictEqual( 
            splitDiffOverlappingIntervalSets(availability_sets,unavailability_sets), 
                [ 
                    new IntervalSet(4,10, [0,1,2]), 
                ],"");  
    
        });

        it("skips overrunning intervals. unavailability = 10---[0, 1]---11, 12---[0, 1]---14", () => { 
    
            unavailability_sets = [new IntervalSet(10,11, [0, 1]) ,new IntervalSet(12,14, [0, 1]) ]
  
           assert.deepStrictEqual( 
            splitDiffOverlappingIntervalSets(availability_sets,unavailability_sets), 
                [ 
                    new IntervalSet(4,10, [0,1,2]), 
                ],"");  
    
        });

        it("diffs entire interval when corners touch. unavailability = 4---[0, 1]---10", () => { 
    
            unavailability_sets = [new IntervalSet(4,10, [0, 1]) ]
  
           assert.deepStrictEqual( 
            splitDiffOverlappingIntervalSets(availability_sets,unavailability_sets), 
                [ 
                    new IntervalSet(4,10, [2],[0,1]), 
                ],"");  
    
        });

        it("diffs entire interval when start/end under/overrun the corners. unavailability = 2---[0, 1]---12", () => { 
    
            unavailability_sets = [new IntervalSet(2,12, [0, 1]) ]
  
           assert.deepStrictEqual( 
            splitDiffOverlappingIntervalSets(availability_sets,unavailability_sets), 
                [ 
                    new IntervalSet(4,10, [2],[0,1]), 
                ],"");  
    
        });

        beforeEach(() => {
    
            availability_sets = [
                new IntervalSet(4,10, [0, 1, 2]),
            ]
    
            unavailability_sets = []
           
        });
    
    });

    describe("testing 1 unavailability interval with 3 availability intervals", {skip: false},() => {

        it("correctly splits start/end and diffs middle span and inner splits", () => { 
    
            unavailability_sets = [ new IntervalSet(7,23, [0]) ]
    
            assert.deepStrictEqual( 
            splitDiffOverlappingIntervalSets(availability_sets,unavailability_sets), 
            [ 
                new IntervalSet(5,7, [0, 1]), 
                new IntervalSet(7,9, [1], [0]),
                new IntervalSet(13,17, [1], [0]),
                new IntervalSet(21,23, [1], [0]),
                new IntervalSet(23,25, [0, 1])
            ],"");  
    
        });

        it("correctly splits end and diffs middle span, end split", () => { 
    
            unavailability_sets = [ new IntervalSet(9,23, [0]) ]
    
            assert.deepStrictEqual( 
            splitDiffOverlappingIntervalSets(availability_sets,unavailability_sets), 
            [ 
                new IntervalSet(5,9, [0, 1]), 
                new IntervalSet(13,17, [1], [0]),
                new IntervalSet(21,23, [1], [0]),
                new IntervalSet(23,25, [0, 1])
            ],"");  
    
        });

        it("correctly splits start and diffs middle span, start split", () => { 
    
            unavailability_sets = [ new IntervalSet(7,21, [0]) ]
    
            assert.deepStrictEqual( 
            splitDiffOverlappingIntervalSets(availability_sets,unavailability_sets), 
            [ 
                new IntervalSet(5,7, [0, 1]), 
                new IntervalSet(7,9, [1], [0]),
                new IntervalSet(13,17, [1], [0]),
                new IntervalSet(21,25, [0, 1])
            ],"");  
    
        });

        it("correctly diffs all 3 spans when start/end on corners", () => { 
    
            unavailability_sets = [ new IntervalSet(5,25, [0]) ]
    
            assert.deepStrictEqual( 
            splitDiffOverlappingIntervalSets(availability_sets,unavailability_sets), 
            [ 
                new IntervalSet(5,9, [1], [0]),
                new IntervalSet(13,17, [1], [0]),
                new IntervalSet(21,25, [1], [0]),
            ],"");  
    
        });

        it("correctly diffs all 3 spans when start/end under/overrun corners", () => { 
    
            unavailability_sets = [ new IntervalSet(4,26, [0]) ]
    
            assert.deepStrictEqual( 
            splitDiffOverlappingIntervalSets(availability_sets,unavailability_sets), 
            [ 
                new IntervalSet(5,9, [1], [0]),
                new IntervalSet(13,17, [1], [0]),
                new IntervalSet(21,25, [1], [0]),
            ],"");  
    
        });

        beforeEach(() => {
    
            availability_sets = [
                new IntervalSet(5,9, [0, 1]),
                new IntervalSet(13,17, [0,1]),
                new IntervalSet(21,25, [0,1]),
            ]
    
            unavailability_sets = []
           
        });
    
    });

    describe("testing 2 unavailability intervals with 3 availability intervals",{skip: false}, () => {

        it("correctly ignores the underrunning first interval and splits the end on the second", () => { 
    
            unavailability_sets = [ new IntervalSet(0,1, [0]), new IntervalSet(4,7, [0]),]
    
            assert.deepStrictEqual( 
            splitDiffOverlappingIntervalSets(availability_sets,unavailability_sets), 
            [ 
                new IntervalSet(5,7, [1], [0]),
                new IntervalSet(7,9, [0,1]),
                new IntervalSet(13,17, [0,1]),
                new IntervalSet(17,25, [0, 1]),
            ],"");  
    
        });

        it("correctly splits the first interval and splits the end on the second", () => { 
    
            unavailability_sets = [ new IntervalSet(6,7, [0]), new IntervalSet(8,15, [0]),]
    
            assert.deepStrictEqual( 
            splitDiffOverlappingIntervalSets(availability_sets,unavailability_sets), 
            [ 
                new IntervalSet(5,6, [0,1]),
                new IntervalSet(6,7, [1], [0]),
                new IntervalSet(7,8, [0,1]),
                new IntervalSet(8,9, [1], [0]),
                new IntervalSet(13,15, [1], [0]),
                new IntervalSet(15,17, [0,1]),
                new IntervalSet(17,25, [0, 1]),
            ],"");  
        });

        it("correctly splits both intervals between the gaps ", () => { 
    
            unavailability_sets = [ new IntervalSet(8,15, [0]), new IntervalSet(16,22, [1]),]
    
            assert.deepStrictEqual( 
            splitDiffOverlappingIntervalSets(availability_sets,unavailability_sets), 
            [ 
                new IntervalSet(5,8, [0,1]),
                new IntervalSet(8,9, [1], [0]),
                new IntervalSet(13,15, [1], [0]),
                new IntervalSet(15,16, [0,1]),
                new IntervalSet(16,17, [0], [1]),
                new IntervalSet(17,22, [0], [1]),
                new IntervalSet(22,25, [0,1]),
            ],"");  
        });

        it("correctly splits both intervals across multiple intervals ", () => { 
    
            unavailability_sets = [ new IntervalSet(15,18, [0]), new IntervalSet(22, 27, [1]),]
    
            assert.deepStrictEqual( 
            splitDiffOverlappingIntervalSets(availability_sets,unavailability_sets), 
            [ 
                new IntervalSet(5,9, [0, 1]),
                new IntervalSet(13,15, [0,1]),
                new IntervalSet(15,17, [1], [0]),
                new IntervalSet(17,18, [1], [0]),
                new IntervalSet(18,22, [0,1]),
                new IntervalSet(22,25, [0], [1]),
            ],"");  
        });

        it("correctly diffs first interval and ignores overrun interval ", () => { 
    
            unavailability_sets = [ new IntervalSet(17,25, [0]), new IntervalSet(25, 27, [1]),]
    
            assert.deepStrictEqual( 
            splitDiffOverlappingIntervalSets(availability_sets,unavailability_sets), 
            [ 
                new IntervalSet(5,9, [0, 1]),
                new IntervalSet(13,17, [0,1]),
                new IntervalSet(17,25, [1], [0]),
            ],"");  
        });

        beforeEach(() => {
    
            availability_sets = [
                new IntervalSet(5,9, [0, 1]),
                new IntervalSet(13,17, [0,1]),
                new IntervalSet(17,25, [0,1]),
            ]
    
            unavailability_sets = []
           
        });
    
    });

    describe("testing early exit edge cases", {skip: false}, () => {

        it("ignores both underrunning intervals", () => { 
    
            unavailability_sets = [ new IntervalSet(0,1, [0]), new IntervalSet(2,4, [0]),]
    
            assert.deepStrictEqual( 
            splitDiffOverlappingIntervalSets(availability_sets,unavailability_sets), 
            availability_sets,"");  
    
        });

        it("ignores both overrunning intervals", () => { 
    
            unavailability_sets = [new IntervalSet(25, 27, [1]),new IntervalSet(27,29, [0])]
    
            assert.deepStrictEqual( 
            splitDiffOverlappingIntervalSets(availability_sets,unavailability_sets), 
            availability_sets,"");  
        });

        it("returns empty list when the availability set is empty", () => { 
    
            unavailability_sets = [new IntervalSet(25, 27, [1]),new IntervalSet(27,29, [0])]
            availability_sets = []
    
            assert.deepStrictEqual( 
            splitDiffOverlappingIntervalSets(availability_sets,unavailability_sets), 
            [],"");  
        });

        it("returns original availability set when the unavailability set is empty", () => { 
    
            unavailability_sets = []   
            assert.deepStrictEqual( 
            splitDiffOverlappingIntervalSets(availability_sets,unavailability_sets), 
            availability_sets,"");  
        });

        beforeEach(() => {
    
            availability_sets = [
                new IntervalSet(5,9, [0, 1]),
                new IntervalSet(13,17, [0,1]),
                new IntervalSet(17,25, [0,1]),
            ]
    
            unavailability_sets = []
           
        });
    
    });

    describe("testing missing_elements of 1 availability interval with 1 unavailability interval", {skip: false},() => {

        it("splits/diffs start/end with no corners touching. unavailability = 5---[0,1,3]---8", () => { 
    
            unavailability_sets = [ new IntervalSet(5,8, [0,1,3]) ]

            assert.deepStrictEqual( 
            splitDiffOverlappingIntervalSets(availability_sets,unavailability_sets), 
            [ 
                new IntervalSet(4,5, [0, 1, 2]), 
                new IntervalSet(5,8, [2],[0,1,3]),
                new IntervalSet(8,10, [0, 1, 2]),
            ],"");  
    
        });

        it("splits/diffs end with start corner touching. unavailability = 4---[0, 1,3]---6", () => { 
    
            unavailability_sets = [ new IntervalSet(4,6, [0, 1, 3]) ]
//new IntervalSet(4,10, [0, 1, 2]),
            assert.deepStrictEqual( 
            splitDiffOverlappingIntervalSets(availability_sets,unavailability_sets), 
            [ 
                new IntervalSet(4,6, [2],[0, 1, 3]), 
                new IntervalSet(6,10, [0, 1, 2]),
            ],"");  
    
        });

        it("splits/diffs start with end corner touching. unavailability = 6---[0, 1,3]---10", () => { 
    
            unavailability_sets = [ new IntervalSet(6,10, [0, 1,3]) ]

            assert.deepStrictEqual( 
            splitDiffOverlappingIntervalSets(availability_sets,unavailability_sets), 
            [ 
                new IntervalSet(4,6, [0, 1, 2]), 
                new IntervalSet(6,10, [2], [0, 1,3]),
            ],"");  
    
        });

        it("splits/diffs start with end overrunning last interval. unavailability = 8---[0,1,3,4]---11", () => { 
    
            unavailability_sets = [ new IntervalSet(8,11, [0,1,3,4]) ]
   
            assert.deepStrictEqual( 
            splitDiffOverlappingIntervalSets(availability_sets,unavailability_sets), 
            [ 
                new IntervalSet(4,8, [0, 1, 2]), 
                new IntervalSet(8,10, [2], [0, 1,3,4]),
            ],"");  
    
        });

        it("splits/diffs end when only end lies within first interval. unavailability = 2---[0, 1,3]---6", () => { 
    
            unavailability_sets = [ new IntervalSet(2,6, [0, 1,3]) ]

            assert.deepStrictEqual( 
            splitDiffOverlappingIntervalSets(availability_sets,unavailability_sets), 
            [ 
                new IntervalSet(4,6, [2],[0, 1,3]), 
                new IntervalSet(6,10, [0,1,2]), 
            ],"");  
    
        });

        it("skips underrunning intervals and splits end when only end lies within first interval. unavailability = 0---[0,1,3]---1, 2---[0,1,3,4]---6", () => { 
    
            unavailability_sets = [new IntervalSet(0,1, [0, 1,3]), new IntervalSet(2,6, [0, 1,3,4]) ]
    
           assert.deepStrictEqual( 
            splitDiffOverlappingIntervalSets(availability_sets,unavailability_sets), 
                [ 
                    new IntervalSet(4,6, [2],[0, 1,3,4]), 
                    new IntervalSet(6,10, [0,1,2]), 
                ],"");  
    
        });

        it("skips underrunning intervals. unavailability = 0---[0, 1,3,4]---1, 2---[0, 1,3,4]---4", () => { 
    
            unavailability_sets = [new IntervalSet(0,1, [0, 1,3,4]) ,new IntervalSet(2,4, [0, 1,3,4]) ]
  
           assert.deepStrictEqual( 
            splitDiffOverlappingIntervalSets(availability_sets,unavailability_sets), 
                [ 
                    new IntervalSet(4,10, [0,1,2]), 
                ],"");  
    
        });

        it("skips overrunning intervals. unavailability = 10---[0, 1,3]---11, 12---[0, 1,3]---14", () => { 
    
            unavailability_sets = [new IntervalSet(10,11, [0, 1,3]) ,new IntervalSet(12,14, [0, 1,3]) ]
  
           assert.deepStrictEqual( 
            splitDiffOverlappingIntervalSets(availability_sets,unavailability_sets), 
                [ 
                    new IntervalSet(4,10, [0,1,2]), 
                ],"");  
    
        });

        it("diffs entire interval when corners touch. unavailability = 4---[0, 1,3]---10", () => { 
    
            unavailability_sets = [new IntervalSet(4,10, [0, 1,3]) ]
  
           assert.deepStrictEqual( 
            splitDiffOverlappingIntervalSets(availability_sets,unavailability_sets), 
                [ 
                    new IntervalSet(4,10, [2],[0, 1,3]), 
                ],"");  
    
        });

        it("diffs entire interval when start/end under/overrun the corners. unavailability = 2---[0, 1,3]---12", () => { 
    
            unavailability_sets = [new IntervalSet(2,12, [0, 1,3]) ]
  
           assert.deepStrictEqual( 
            splitDiffOverlappingIntervalSets(availability_sets,unavailability_sets), 
                [ 
                    new IntervalSet(4,10, [2],[0, 1,3]), 
                ],"");  
    
        });

        beforeEach(() => {
    
            availability_sets = [
                new IntervalSet(4,10, [0, 1, 2]),
            ]
    
            unavailability_sets = []
           
        });
    
    });

    describe("testing unavailability intervals with overlap_count prop", {skip: false},() => {

        it("correctly adds the prop when is span between start, end ", () => { 
    
            unavailability_sets = [ new IntervalSet(6,8, [],[],1) ]
    
            assert.deepStrictEqual( 
            splitDiffOverlappingIntervalSets(availability_sets,unavailability_sets), 
            [ 
                new IntervalSet(4,6, [0,1]),
                new IntervalSet(6,8, [0,1], [], 1),
                new IntervalSet(8,12, [0,1]),
            ],"");  
    
        });

        it("correctly adds the prop to overlapping section when end of the span overflows  ", () => { 
    
            unavailability_sets = [ new IntervalSet(6,14, [],[],1) ]
    
            assert.deepStrictEqual( 
            splitDiffOverlappingIntervalSets(availability_sets,unavailability_sets), 
            [ 
                new IntervalSet(4,6, [0,1]),
                new IntervalSet(6,12, [0,1], [], 1),
            ],"");  
    
        });

        it("correctly diffs the sets and sums overlap_counts on overlaps  ", () => { 
    
            unavailability_sets = [ new IntervalSet(6,14, [0],[],1) ]
    
            assert.deepStrictEqual( 
            splitDiffOverlappingIntervalSets(availability_sets,unavailability_sets), 
            [ 
                new IntervalSet(4,6, [0,1]),
                new IntervalSet(6,12, [1], [0], 1),
            ],"");  
    
        });

        it("correctly merges and sums the overlap_count on multiple overlapping spans ", () => { 
    
            unavailability_sets = [ 
                new IntervalSet(6,9, [],[],1),
                new IntervalSet(7,11, [],[],1)
             ]

            assert.deepStrictEqual( 
            splitDiffOverlappingIntervalSets(availability_sets,unavailability_sets), 
            [ 
                new IntervalSet(4,6, [0,1]),
                new IntervalSet(6,7, [0,1], [], 1),
                new IntervalSet(7,9, [0,1], [], 2),
                new IntervalSet(9,11, [0,1], [], 1),
                new IntervalSet(11,12, [0,1])
            ],"");  
    
        });

        it("correctly merges and sums the overlap_count, diffs the sets, for multiple overlapping spans ", () => { 
    
            unavailability_sets = [ 
                new IntervalSet(6,9, [1],[],1),
                new IntervalSet(7,11, [],[],1)
             ]

            assert.deepStrictEqual( 
            splitDiffOverlappingIntervalSets(availability_sets,unavailability_sets), 
            [ 
                new IntervalSet(4,6, [0,1]),
                new IntervalSet(6,7, [0], [1], 1),
                new IntervalSet(7,9, [0], [1], 2),
                new IntervalSet(9,11, [0,1], [], 1),
                new IntervalSet(11,12, [0,1])
            ],"");  
    
        });

        it("correctly merges and sums the overlap_count, diffs the sets, for overlapping breaks/appointment ", () => { 
    
            unavailability_sets = [ 
                //an ;appointment; interval would have overlap_count initiated to 1 and sets = []
                new IntervalSet(6,9, [],[],1),  
                //a ;break; interval would have overlap_count initiated to 0 and sets = [a, b, ...]
                new IntervalSet(7,11, [1],[],0)

             ]

             console.log("$$$", splitDiffOverlappingIntervalSets(availability_sets,unavailability_sets))

            assert.deepStrictEqual( 
            splitDiffOverlappingIntervalSets(availability_sets,unavailability_sets), 
            [ 
                new IntervalSet(4,6, [0,1]),
                new IntervalSet(6,7, [0,1], [], 1),
                new IntervalSet(7,9, [0], [1], 1),
                new IntervalSet(9,11, [0], [1]),
                new IntervalSet(11,12, [0,1])
            ],"");  
    
        });



        beforeEach(() => {
    
            availability_sets = [
                new IntervalSet(4,12, [0, 1])
            ]
    
            unavailability_sets = []
           
        });
    
    });

});

describe("testing areSetsEqual", () => {

    it("returns correctly for every combination of inputs", () => { 
        assert.equal(areSetsEqual(), true)
        assert.equal(areSetsEqual(["A","B","C"], ["B","A","C"]), true)
        assert.equal(areSetsEqual(["A","B","D"], ["D","A","B"]), true)
        assert.equal(areSetsEqual([], []), true)
        assert.equal(areSetsEqual(["A"], ["A"]), true)
        assert.equal(areSetsEqual(["A"], ["B", "C"]), false)
        assert.equal(areSetsEqual(["A","B","D"], ["B","A","E"]), false)
    });

});

describe("testing mergeEqualSetNeighbours", () => {

    let interval_sets

    it("handles edgecases: 0,1 size arrs and nulls", () => { 

        assert.deepStrictEqual(mergeConsecutiveIntervalSets([], areSetsEqual), [],""); 

        assert.deepStrictEqual(mergeConsecutiveIntervalSets(), [],""); 

        assert.deepStrictEqual(
            mergeConsecutiveIntervalSets([new IntervalSet(2,19, ["A", "B"])], areSetsEqual), 
            [new IntervalSet(2,19, ["A", "B"])]
        ,"");  
    
    });

    it("merges 2, 3 equal set neighbours into a single interval set", () => { 

        interval_sets = [
            new IntervalSet(2,4, ["A", "B"]),
            new IntervalSet(4,6, ["B", "A"])
        ]

        assert.deepStrictEqual(
            mergeConsecutiveIntervalSets(interval_sets,areSetsEqual), 
            [new IntervalSet(2,6, ["A", "B"])]
        ,"");  

        interval_sets = [
            new IntervalSet(2,4, ["A", "B", "C"]),
            new IntervalSet(4,10, ["B", "C", "A"]),
            new IntervalSet(10,12, ["C", "A", "B"])
        ]

        assert.deepStrictEqual(
            mergeConsecutiveIntervalSets(interval_sets,areSetsEqual), 
            [new IntervalSet(2,12, ["A", "B", "C"])]
        ,""); 
    
    });

    it("skips merging non-neighbour, non-equal set interval sets", () => { 

        //neighbours but non-equal sets

        interval_sets = [
            new IntervalSet(2,4, ["A", "B"]),
            new IntervalSet(4,6, ["C", "A"])
        ]

        assert.deepStrictEqual(
            mergeConsecutiveIntervalSets(interval_sets,areSetsEqual), 
            [new IntervalSet(2,4, ["A", "B"]),
             new IntervalSet(4,6, ["C", "A"])]
        ,""); 

        //non-neighbours but equal sets
        
        interval_sets = [
            new IntervalSet(2,3, ["A", "B"]),
            new IntervalSet(4,6, ["B", "A"])
        ]

        assert.deepStrictEqual(
            mergeConsecutiveIntervalSets(interval_sets,areSetsEqual), 
            [
                new IntervalSet(2,3, ["A", "B"]),
                new IntervalSet(4,6, ["B", "A"])
            ]
        ,"");  

         //non-neighbours and non- equal sets
        
         interval_sets = [
            new IntervalSet(2,3, ["A", "B"]),
            new IntervalSet(4,6, ["C", "A"])
        ]

        assert.deepStrictEqual(
            mergeConsecutiveIntervalSets(interval_sets,areSetsEqual), 
            [
                new IntervalSet(2,3, ["A", "B"]),
                new IntervalSet(4,6, ["C", "A"])
            ]
        ,""); 

         //non-neighbours but equal sets and neighbours but non-equal sets
        
         interval_sets = [
            new IntervalSet(2,3, ["A", "B"]),
            new IntervalSet(4,6, ["A", "B"]),
            new IntervalSet(6,8, ["A", "C"])
        ]

        assert.deepStrictEqual(
            mergeConsecutiveIntervalSets(interval_sets,areSetsEqual), 
            [
                new IntervalSet(2,3, ["A", "B"]),
                new IntervalSet(4,6, ["A", "B"]),
                new IntervalSet(6,8, ["A", "C"])
            ]
        ,""); 

    });

    it("performs combinations of both merges and skips within a single input of size 3,4,5", () => { 

        //merge 1,2, skip 3
        interval_sets = [
            new IntervalSet(2,4, ["A", "B"]),
            new IntervalSet(4,6, ["B", "A"]),
            new IntervalSet(6,8, ["C", "A"])
        ]

        assert.deepStrictEqual(
            mergeConsecutiveIntervalSets(interval_sets,areSetsEqual), 
            [new IntervalSet(2,6, ["A", "B"]),
             new IntervalSet(6,8, ["C", "A"])]
        ,""); 

        //skip 1, merge 2,3

        interval_sets = [
            new IntervalSet(2,4, ["A", "B"]),
            new IntervalSet(5,7, ["B", "A"]),
            new IntervalSet(7,10, ["A", "B"])
        ]

        assert.deepStrictEqual(
            mergeConsecutiveIntervalSets(interval_sets,areSetsEqual), 
            [new IntervalSet(2,4, ["A", "B"]),
             new IntervalSet(5,10, ["B", "A"])]
        ,""); 

        //merge 1,2,3 skip 4
        interval_sets = [
            new IntervalSet(2,4, ["A", "B"]),
            new IntervalSet(4,7, ["B", "A"]),
            new IntervalSet(7,10, ["A", "B"]),
            new IntervalSet(10,14, ["A", "C", "D"])
        ]

        assert.deepStrictEqual(
            mergeConsecutiveIntervalSets(interval_sets,areSetsEqual), 
            [new IntervalSet(2,10, ["A", "B"]),
             new IntervalSet(10,14, ["A","C","D"])]
        ,""); 

        //merge 1,2 merge 3,4
        interval_sets = [
            new IntervalSet(2,4, ["A", "B"]),
            new IntervalSet(4,7, ["B", "A"]),
            new IntervalSet(7,10, ["C", "B"]),
            new IntervalSet(10,14, ["B", "C"])
        ]

        assert.deepStrictEqual(
            mergeConsecutiveIntervalSets(interval_sets,areSetsEqual), 
            [new IntervalSet(2,7, ["A", "B"]),
             new IntervalSet(7,14, ["C","B"])]
        ,""); 

        //merge 1,2, skip 3, merge 4,5
        interval_sets = [
            new IntervalSet(2,4, ["A", "B"]),
            new IntervalSet(4,7, ["B", "A"]),
            new IntervalSet(7,10, ["D", "B"]),
            new IntervalSet(11,16, ["D", "B"]),
            new IntervalSet(16,19, ["D", "B"])
        ]

        assert.deepStrictEqual(
            mergeConsecutiveIntervalSets(interval_sets,areSetsEqual), 
            [new IntervalSet(2,7, ["A", "B"]),
             new IntervalSet(7,10, ["D", "B"]),
             new IntervalSet(11,19, ["D","B"])]
        ,""); 

        //skip 1, merge 2,3,4, skip 5
        interval_sets = [
            new IntervalSet(2,4, ["A", "B"]),
            new IntervalSet(4,7, ["A", "B", "C"]),
            new IntervalSet(7,10, ["B", "A", "C"]),
            new IntervalSet(10,16, ["B", "A", "C"]),
            new IntervalSet(16,19, ["D", "B"])
        ]

        assert.deepStrictEqual(
            mergeConsecutiveIntervalSets(interval_sets, areSetsEqual), 
            [new IntervalSet(2,4, ["A", "B"]),
             new IntervalSet(4,16, ["A", "B", "C"]),
             new IntervalSet(16,19, ["D","B"])]
        ,""); 

    });

});

//initObjects(workDays, getBreakById, getShiftById), [workDays])


describe("testing stuff", { skip: true }, () => {

    let availability_sets, unavailability_sets;

    /*
    it("", () => { 

       // unavailability_sets = [ new IntervalSet(6,15, [0]), new IntervalSet(17,23, [0]),]

        //case 1: each element in antiset is contained in set
        let set = ["0","1","2"]
        let antiset = ["0","1"]

        console.log("S-AS", _.difference(set, antiset))
        console.log("AS-S", _.difference(antiset, set))

        //case 2: antiset contains elements not in set
        set = [1,2,3]
        antiset = [2,3,4,5]

        console.log("S-AS", _.difference(set, antiset))
        console.log("AS-S", _.difference(antiset, set))

        //case 3: antiset is empty
        set = [1,2,3]
        antiset = []

        console.log("S-AS", _.difference(set, antiset))
        console.log("AS-S", _.difference(antiset, set))

        //case 3: set is empty
        set = []
        antiset = [2,3,4,5]

        console.log("S-AS", _.difference(set, antiset))
        console.log("AS-S", _.difference(antiset, set))



        


        //splitDiffOverlappingIntervalSets_test3(availability_sets, unavailability_sets)


       // assert.deepStrictEqual( 
       // splitDiffOverlappingIntervalSets(availability_sets,unavailability_sets), 
       // availability_sets,"");  

    });
*/
    it("", () => { 

       function isEventOverlappingUnsorted2(tStart, tEnd, events){
            for (const event of events) 
                    if( !(tEnd <= event.start || tStart >= event.end) )
                        return true
                
            return false
        }
       




    
        

        function isEventOverlapping(tStart, tEnd, events){
            //events must be sorted
            if(events.length === 0) return false

            //const head = event[0].start
           // const tail = event[event.length-1].end

            if(events.length === 0 || //if the arr is empty
               tEnd <= events[0].start ||  // or the event ends before the first event
               tStart >= events[events.length-1].end) //or the event starts after the last event 
                    return false
            

            let i = 0;
//i < a.length && 
            //iterate i to first event where sStart < events[i].end
            while(tStart >= events[i].end)i++

           // console.log(i)

           //if tEnd overruns events[i].start, theres overlap 
           return (tEnd > events[i].start) 

           // return !(tEnd <= events[i].start) 
    
        }

        const a = [
            {start: 11, end: 14},
            {start: 4, end: 7},
            {start: 17, end: 20},       
        ]

        const aa = [
            {start: 3, end: 5},
            {start: 8, end: 12},

        ]

        const aaa = [
            {start: 3, end: 6},
        ]

       function nonoverlaping(a){

            console.log("non overlap cases:")

            //(4,7)(11,14)(17,20)
            console.log(isEventOverlappingUnsorted2(1,3,a)) //left disjointed
            console.log(isEventOverlappingUnsorted2(1,4,a)) //left jointed

            console.log(isEventOverlappingUnsorted2(7,11,a)) //tie both
            console.log(isEventOverlappingUnsorted2(7,10,a)) //tie lhs
            console.log(isEventOverlappingUnsorted2(8,10,a)) //tie none
            console.log(isEventOverlappingUnsorted2(8,11,a)) //tie rhs

            console.log(isEventOverlappingUnsorted2(14,17,a)) //tie both
            console.log(isEventOverlappingUnsorted2(14,16,a)) //tie lhs
            console.log(isEventOverlappingUnsorted2(15,16,a)) //tie none
            console.log(isEventOverlappingUnsorted2(15,17,a)) //tie rhs

            console.log(isEventOverlappingUnsorted2(20,21,a)) //right disjointed
            console.log(isEventOverlappingUnsorted2(21,22,a)) //right jointed

       }

       overlaping(a)

       
  

       // console.log(isEventOverlappingUnsorted2(19,21,a)) //false
       

       function overlaping(a){

        console.log("overlap cases:")

        //(4,7)(11,14)(17,20)
        console.log(isEventOverlappingUnsorted2(20,21,a))
  


   }
        
       

       // console.log(isEventOverlappingUnsorted(8,12,a))
       // console.log(isEventOverlappingUnsorted(12,13,a))
       // console.log(isEventOverlappingUnsorted(15,17,a))

        //edge case i need to check
      //  console.log(isEventOverlappingUnsorted(16,18,a))
      //  console.log(isEventOverlappingUnsorted(8,18,a))
       

      //left/right corners




      
      /*

  console.log(isEventOverlappingUnsorted2(1,5,a))

        console.log(isEventOverlappingUnsorted2(1,8,a))
        console.log(isEventOverlappingUnsorted2(1,9,a))
        console.log(isEventOverlappingUnsorted2(1,11,a))

        console.log(isEventOverlappingUnsorted2(1,13,a))
        console.log(isEventOverlappingUnsorted2(1,14,a))

        console.log(isEventOverlappingUnsorted2(1,15,a))
        console.log(isEventOverlappingUnsorted2(1,16,a))
        console.log(isEventOverlappingUnsorted2(1,17,a))

        console.log(isEventOverlappingUnsorted2(1,18,a))
        console.log(isEventOverlappingUnsorted2(1,19,a))


      console.log("passing cases:")
      console.log("l/r corners")
    console.log(isEventOverlapping(1,3,a))
       console.log(isEventOverlapping(18,21,a))

       console.log("in-between non inclusive")
       console.log(isEventOverlapping(6,7,a))
       console.log(isEventOverlapping(13,14,a))

       console.log("in-between inclusive")
       console.log(isEventOverlapping(5,8,a))

       console.log("in-between l/r inclusive")
       console.log(isEventOverlapping(5,7,a))
       console.log(isEventOverlapping(6,8,a))
         // console.log(isAptOverlapping(13,15,a)) 
         
             console.log("left corner")
    console.log(isEventOverlapping(1,4,a))
    console.log(isEventOverlapping(1,7,a))
    console.log(isEventOverlapping(1,9,a))
    console.log(isEventOverlapping(1,13,a))
    console.log(isEventOverlapping(1,16,a))
        */ 
         
         

   

      



 
     });

    beforeEach(() => {

        availability_sets = [
            new IntervalSet(5,9, [0, 1]),
            new IntervalSet(13,17, [0,1]),
            new IntervalSet(17,25, [0,1]),
            new IntervalSet(28,33, [0,1]),
        ]

        unavailability_sets = []
       
    });

});


describe("Testing getTimeSlotAvailabilities", { skip: true }, () => {

    let shifts, breaks, timeslots;

    describe("Testing Happy Paths. TS: [(0->60), (60->120)]", { skip: false }, () => {

        let shifts, breaks, timeslots, appointments;
    //"S: [ (0, 60, [0,1,2]), (60, 120, [3]) ] B: [ (30,40,[0,1]) (90,100,[0,1]) ]"
        it("returns proper times for every timeslot. service_duration: 10", { skip: true }, () => { 
    
            shifts = [
                new IntervalSet(0, 60, ["0","1","2"]),
                new IntervalSet(60,120, ["3"]),
            ]
    
             breaks = [
                new IntervalSet(30, 40, ["0","1"]),
                new IntervalSet(90,100, ["3"]),
            ]
    
            const split = splitDiffOverlappingIntervalSets(shifts, breaks)
            const merged = mergeConsecutiveIntervalSets(split, areSetsNonEmpty)
    
            assert.deepStrictEqual( 
                getTimeSlotAvailabilities(merged, 10, timeslots), 
                [ 
                    [0,10,20,30,40,50], 
                    [60,70,80,100,110]
                ],"");  
        
        }); 

        it("returns proper times for every timeslot after merging. service_duration: 15",{ skip: true }, () => { 
    
            shifts = [
                new IntervalSet(0, 60, ["0","1","2"]),
                new IntervalSet(60,120, ["3"]),
            ]
    
             breaks = [
                new IntervalSet(30, 40, ["0","1"]),
                new IntervalSet(90,100, ["3"]),
            ]
    
            const split = splitDiffOverlappingIntervalSets(shifts, breaks)
            
            const merged = mergeConsecutiveIntervalSets(split, areSetsNonEmpty)
            //console.log( "MERGED", merged )

            assert.deepStrictEqual( 
                getTimeSlotAvailabilities(merged, 15, timeslots), 
                [ 
                    [0,15,30,45], 
                    [60,75,100]
                ],"");  
        
        }); 

        it("returns proper times for every timeslot after merging. service_duration: 25",{ skip: true }, () => { 
    
            shifts = [
                new IntervalSet(0, 60, ["0","1","2"]),
                new IntervalSet(60,120, ["3"]),
            ]
    
             breaks = [
                new IntervalSet(30, 40, ["0","1"]),
                new IntervalSet(80,95, ["3"]),
            ]
    
            const split = splitDiffOverlappingIntervalSets(shifts, breaks)

        // console.log( "split", split )
            
            const merged = mergeConsecutiveIntervalSets(split, areSetsNonEmpty)

           // console.log( "MERGED", merged )

            let _timeslots = [
                new Interval(0,60),
                new Interval(60,120)
            ]

            assert.deepStrictEqual( 
                getTimeSlotAvailabilities(merged, 25, _timeslots), 
                [ 
                    [0,25,50], 
                    [95]
                ],"");  
             
        }); 

        it("returns", () => { 
    
            shifts = [
                new IntervalSet(0, 60, ["0","1"]),
                //new IntervalSet(60,120, ["3"]),
            ]
    
             breaks = [
                new IntervalSet(15, 20, ["0","1"]),
                new IntervalSet(45,50, ["0"]),
            ]

            appointments = [
                new IntervalSet(15, 20, ["0","1"]),
                new IntervalSet(30,40, [], [], 1),
                new IntervalSet(35,45, ["0"]),
                new IntervalSet(35,55, [], [], 1),
               // new IntervalSet(35,45, ["0"], [], 0),
               // new IntervalSet(35,45, [], [], 1),

            ]

            let _timeslots = [
                new Interval(0,60),
                //new Interval(60,120)
            ]

            //console.log( "appointments", appointments )

            const a = splitUnionOverlappingIntervalSets(appointments)

           // console.log( "new merger", a )

            const b = splitDiffOverlappingIntervalSets(shifts, appointments)

            console.log( "new merger", b )


            const c = b.filter(({overlap_count, set})=>overlap_count < set.length)

            console.log( "filtered out intervals with too many overlaps", c )

            /*
                how to merge appointments with breaks?
                appointments = [
                    "confirmed" appointments can use an interval set with employee id 
                    new IntervalSet(35, 50, [ "0" ]),
                    how can "requested" appointments be merged
                    new IntervalSet(35, 50, [ ?? ]),
                ]

                algo for merging requested appointments:

                    combine the breaks with the confirmed appointments
                    split = splitDiffOverlappingIntervalSets(shifts, breaks)
                    make sure not to filter the empty sets

                    merge the requested appointments together by counting the overlaps, not merging
                        - use the old counting algo?
                        - or just make a new "temp id" to add to the set of each 

                    for each merged requested appointment:
                        get the start, end point
                        walk split from start until start is within interval
                            starting from interval from above, walk split until end is within interval
                        
                        for each intervals walked in split
                            check if the set size is <= merged requested appointment set size
                                if it is, flag it

                abovethis wount work
                i need to :
                    combine/union the breaks and appointments

                combine the breaks with all the appointments
                modify intervalsets so it stores both discrete employees and overlap counts
                modify splitUnionOverlappingIntervalSets so it dinguishes between overlap intervals and discrete intervals 
                and splits unions overlap/discrete intervals correctly



            */
    
            const split = splitDiffOverlappingIntervalSets(shifts, breaks)

        // console.log( "split", split )
            
            const merged = mergeConsecutiveIntervalSets(split, areSetsNonEmpty)

           // console.log( "MERGED", merged )

           
/*
            assert.deepStrictEqual( 
                getTimeSlotAvailabilities(merged, 25, _timeslots), 
                [ 
                    [0,40], 
                    [95]
                ],"");  */
             
        }); 


        beforeEach(() => {

            timeslots = [
                new Interval(0,60),
                new Interval(60,120)
            ]

        });


            
           
    
    

    
    });

    describe("Testing Edgecases", { skip: true }, () => {

        let shifts, breaks, timeslots;
    //"S: [ (0, 60, [0,1,2]), (60, 120, [3]) ] B: [ (30,40,[0,1]) (90,100,[0,1]) ]
        it("returns 2 arrays of strictly ascending integers representing ", () => { 
    
            shifts = [
                new IntervalSet(0, 60, ["0","1","2"]),
                new IntervalSet(60,120, ["3"]),
            ]
    
             breaks = [
                new IntervalSet(30, 40, ["0","1"]),
                new IntervalSet(90,100, ["3"]),
            ]
    
            const split = splitDiffOverlappingIntervalSets(shifts, breaks)
    
            assert.deepStrictEqual( 
                getTimeSlotAvailabilities(split, 10, timeslots), 
                [ 
                    [0,10,20,30,40,50], 
                    [60,70,80,100,110]
                ],"");  
    
    
        
        }); 
            
           
    
    
    
          
        
     
         
    
        beforeEach(() => {
    
            timeslots = [
                new Interval(0,60),
                new Interval(60,120)
            ]
    
        });
    
    });
        
       



      
    
 
     

    beforeEach(() => {

        timeslots = [
            new Interval(0,60),
            new Interval(60,120)
        ]

    });

});








