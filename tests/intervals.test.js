import { describe, it, beforeEach }  from "node:test";
import _  from 'lodash';
import assert from 'node:assert/strict';

import { 

    //sortByWeekday,
   // Interval,
   // toIntervals,
   // sortIntervals,
    //splitUnionOverlappingIntervalSets,

    splitUnionOverlappingIntervalSets,
    //splitDiffOverlappingIntervalSets_test,


    splitDiffOverlappingIntervalSets,

    //splitDiffOverlappingIntervalSets_test3,

    //splitDiffOverlapIntervals_test_2,


   // createCloseIntervals,
   // fillInEmptyDays,

    initObjects,
    createAvailabilityCalendarEvents,

 } from '../src/intervals.js'

 import { 

    IntervalSet
   

 } from '../src/classes.js'

import {employees, shifts, breaks, workdays, services, getBreakById, getShiftById} from "../src/assets/data.js"

describe("testing createCloseIntervals todo()", {skip: false}, () => {

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


describe("testing splitDiffOverlapIntervals", () => {

    let availability_sets, unavailability_sets;

    describe("testing every combination of 1 availability interval with 1 unavailability interval", {skip: false},() => {

        it("splits/diffs start/end with no corners touching. unavailability = 5---[0, 1]---8", () => { 
    
            unavailability_sets = [ new IntervalSet(5,8, [0, 1]) ]

            assert.deepStrictEqual( 
            splitDiffOverlappingIntervalSets(availability_sets,unavailability_sets), 
            [ 
                new IntervalSet(4,5, [0, 1, 2]), 
                new IntervalSet(5,8, [2]),
                new IntervalSet(8,10, [0, 1, 2]),
            ],"");  
    
        });

        it("splits/diffs end with start corner touching. unavailability = 4---[0, 1]---6", () => { 
    
            unavailability_sets = [ new IntervalSet(4,6, [0, 1]) ]

            assert.deepStrictEqual( 
            splitDiffOverlappingIntervalSets(availability_sets,unavailability_sets), 
            [ 
                new IntervalSet(4,6, [2]), 
                new IntervalSet(6,10, [0, 1, 2]),
            ],"");  
    
        });

        it("splits/diffs start with end corner touching. unavailability = 6---[0, 1]---10", () => { 
    
            unavailability_sets = [ new IntervalSet(6,10, [0, 1]) ]

            assert.deepStrictEqual( 
            splitDiffOverlappingIntervalSets(availability_sets,unavailability_sets), 
            [ 
                new IntervalSet(4,6, [0, 1, 2]), 
                new IntervalSet(6,10, [2]),
            ],"");  
    
        });

        it("splits/diffs start with end overrunning last interval. unavailability = 8---[0, 1]---11", () => { 
    
            unavailability_sets = [ new IntervalSet(8,11, [0, 1]) ]
   
            assert.deepStrictEqual( 
            splitDiffOverlappingIntervalSets(availability_sets,unavailability_sets), 
            [ 
                new IntervalSet(4,8, [0, 1, 2]), 
                new IntervalSet(8,10, [2]),
            ],"");  
    
        });

        it("splits/diffs end when only end lies within first interval. unavailability = 2---[0, 1]---6", () => { 
    
            unavailability_sets = [ new IntervalSet(2,6, [0, 1]) ]

            assert.deepStrictEqual( 
            splitDiffOverlappingIntervalSets(availability_sets,unavailability_sets), 
            [ 
                new IntervalSet(4,6, [2]), 
                new IntervalSet(6,10, [0,1,2]), 
            ],"");  
    
        });

        it("skips underrunning intervals and splits end when only end lies within first interval. unavailability = 0---[0, 1]---1, 2---[0, 1]---6", () => { 
    
            unavailability_sets = [new IntervalSet(0,1, [0, 1]), new IntervalSet(2,6, [0, 1]) ]
    
           assert.deepStrictEqual( 
            splitDiffOverlappingIntervalSets(availability_sets,unavailability_sets), 
                [ 
                    new IntervalSet(4,6, [2]), 
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
                    new IntervalSet(4,10, [2]), 
                ],"");  
    
        });

        it("diffs entire interval when start/end under/overrun the corners. unavailability = 2---[0, 1]---12", () => { 
    
            unavailability_sets = [new IntervalSet(2,12, [0, 1]) ]
  
           assert.deepStrictEqual( 
            splitDiffOverlappingIntervalSets(availability_sets,unavailability_sets), 
                [ 
                    new IntervalSet(4,10, [2]), 
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
                new IntervalSet(7,9, [1]),
                new IntervalSet(13,17, [1]),
                new IntervalSet(21,23, [1]),
                new IntervalSet(23,25, [0, 1])
            ],"");  
    
        });

        it("correctly splits end and diffs middle span, end split", () => { 
    
            unavailability_sets = [ new IntervalSet(9,23, [0]) ]
    
            assert.deepStrictEqual( 
            splitDiffOverlappingIntervalSets(availability_sets,unavailability_sets), 
            [ 
                new IntervalSet(5,9, [0, 1]), 
                new IntervalSet(13,17, [1]),
                new IntervalSet(21,23, [1]),
                new IntervalSet(23,25, [0, 1])
            ],"");  
    
        });

        it("correctly splits start and diffs middle span, start split", () => { 
    
            unavailability_sets = [ new IntervalSet(7,21, [0]) ]
    
            assert.deepStrictEqual( 
            splitDiffOverlappingIntervalSets(availability_sets,unavailability_sets), 
            [ 
                new IntervalSet(5,7, [0, 1]), 
                new IntervalSet(7,9, [1]),
                new IntervalSet(13,17, [1]),
                new IntervalSet(21,25, [0, 1])
            ],"");  
    
        });

        it("correctly diffs all 3 spans when start/end on corners", () => { 
    
            unavailability_sets = [ new IntervalSet(5,25, [0]) ]
    
            assert.deepStrictEqual( 
            splitDiffOverlappingIntervalSets(availability_sets,unavailability_sets), 
            [ 
                new IntervalSet(5,9, [1]),
                new IntervalSet(13,17, [1]),
                new IntervalSet(21,25, [1]),
            ],"");  
    
        });

        it("correctly diffs all 3 spans when start/end under/overrun corners", () => { 
    
            unavailability_sets = [ new IntervalSet(4,26, [0]) ]
    
            assert.deepStrictEqual( 
            splitDiffOverlappingIntervalSets(availability_sets,unavailability_sets), 
            [ 
                new IntervalSet(5,9, [1]),
                new IntervalSet(13,17, [1]),
                new IntervalSet(21,25, [1]),
            ],"");  
    
        });

        /*
        it("correctly splits/diffs start/ends on 2 subsequent intervals, no corners touching. unavailability = 2---[0, 1]---4, 6---[0, 1, 2]---7", () => { 
    
            unavailability_sets = [ new IntervalSet(2,4, [0, 1]), new IntervalSet(6,7, [0, 1, 2]), ]
    
            assert.deepStrictEqual( 
            splitDiffOverlappingIntervalSets(availability_sets,unavailability_sets), 
            [ 
                new IntervalSet(0,2, [0, 1, 2]), 
                new IntervalSet(2,4, [2]),
                new IntervalSet(4,6, [0, 1, 2]),
                new IntervalSet(6,7, [3]),
                new IntervalSet(7,10, [3,0, 1, 2])
            ],"");  
    
        });

        it("correctly splits/diffs start/ends on 3 subsequent intervals, no corners touching. unavailability = 2---[0, 1]---4, 6---[0, 1, 2]---7, 8---[3]---9", () => { 
    
            unavailability_sets = [ new IntervalSet(2,4, [0, 1]), new IntervalSet(6,7, [0, 1, 2]), new IntervalSet(8,9, [3])] 
    
            //let unavailability = splitDiffOverlappingIntervalSets_test(availability_sets,unavailability_sets)

            
            //console.log("unavail: /////", unavailability )

            assert.deepStrictEqual( 
            splitDiffOverlappingIntervalSets(availability_sets,unavailability_sets), 
            [ 
                new IntervalSet(0,2, [0, 1, 2]), 
                new IntervalSet(2,4, [2]),
                new IntervalSet(4,6, [0, 1, 2]),
                new IntervalSet(6,7, [3]),
                new IntervalSet(7,8, [3 ,0, 1, 2]),
                new IntervalSet(8,9, [0, 1, 2]),
                new IntervalSet(9,10, [3 ,0, 1, 2])
            ],"");  
    
        });

        it("unavailability = (0,3, [1]),(5,7, [0, 1, 2]),(8,10, [3]) returns ", () => { 
    
            unavailability_sets = [new IntervalSet(0,3, [1]),new IntervalSet(5,7, [0, 1, 2]),new IntervalSet(8,10, [3])] 
    
            assert.deepStrictEqual( 
                splitDiffOverlappingIntervalSets(availability_sets,unavailability_sets), 
                [ 
                    new IntervalSet(0,3, [0, 2]), 
                    new IntervalSet(3,5, [0,1,2]),
                    new IntervalSet(5,6, []),
                    new IntervalSet(6,7, [3]),
                    new IntervalSet(7,8, [3 ,0, 1, 2]),
                    new IntervalSet(8,10, [0, 1, 2]),
                ],"");   
        });
        */
      
    
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
                new IntervalSet(5,7, [1]),
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
                new IntervalSet(6,7, [1]),
                new IntervalSet(7,8, [0,1]),
                new IntervalSet(8,9, [1]),
                new IntervalSet(13,15, [1]),
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
                new IntervalSet(8,9, [1]),
                new IntervalSet(13,15, [1]),
                new IntervalSet(15,16, [0,1]),
                new IntervalSet(16,17, [0]),
                new IntervalSet(17,22, [0]),
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
                new IntervalSet(15,17, [1]),
                new IntervalSet(17,18, [1]),
                new IntervalSet(18,22, [0,1]),
                new IntervalSet(22,25, [0]),
            ],"");  
        });

        it("correctly diffs first interval and ignores overrun interval ", () => { 
    
            unavailability_sets = [ new IntervalSet(17,25, [0]), new IntervalSet(25, 27, [1]),]
    
            assert.deepStrictEqual( 
            splitDiffOverlappingIntervalSets(availability_sets,unavailability_sets), 
            [ 
                new IntervalSet(5,9, [0, 1]),
                new IntervalSet(13,17, [0,1]),
                new IntervalSet(17,25, [1]),
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

    describe("testing early exit edge cases", () => {

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
                new IntervalSet(5,8, [2],[3]),
                new IntervalSet(8,10, [0, 1, 2]),
            ],"");  
    
        });

        it("splits/diffs end with start corner touching. unavailability = 4---[0, 1,3]---6", () => { 
    
            unavailability_sets = [ new IntervalSet(4,6, [0, 1, 3]) ]

            assert.deepStrictEqual( 
            splitDiffOverlappingIntervalSets(availability_sets,unavailability_sets), 
            [ 
                new IntervalSet(4,6, [2],[3]), 
                new IntervalSet(6,10, [0, 1, 2]),
            ],"");  
    
        });

        it("splits/diffs start with end corner touching. unavailability = 6---[0, 1,3]---10", () => { 
    
            unavailability_sets = [ new IntervalSet(6,10, [0, 1,3]) ]

            assert.deepStrictEqual( 
            splitDiffOverlappingIntervalSets(availability_sets,unavailability_sets), 
            [ 
                new IntervalSet(4,6, [0, 1, 2]), 
                new IntervalSet(6,10, [2],[3]),
            ],"");  
    
        });

        it("splits/diffs start with end overrunning last interval. unavailability = 8---[0,1,3,4]---11", () => { 
    
            unavailability_sets = [ new IntervalSet(8,11, [0,1,3,4]) ]
   
            assert.deepStrictEqual( 
            splitDiffOverlappingIntervalSets(availability_sets,unavailability_sets), 
            [ 
                new IntervalSet(4,8, [0, 1, 2]), 
                new IntervalSet(8,10, [2],[3,4]),
            ],"");  
    
        });

        it("splits/diffs end when only end lies within first interval. unavailability = 2---[0, 1,3]---6", () => { 
    
            unavailability_sets = [ new IntervalSet(2,6, [0, 1,3]) ]

            assert.deepStrictEqual( 
            splitDiffOverlappingIntervalSets(availability_sets,unavailability_sets), 
            [ 
                new IntervalSet(4,6, [2],[3]), 
                new IntervalSet(6,10, [0,1,2]), 
            ],"");  
    
        });

        it("skips underrunning intervals and splits end when only end lies within first interval. unavailability = 0---[0,1,3]---1, 2---[0,1,3,4]---6", () => { 
    
            unavailability_sets = [new IntervalSet(0,1, [0, 1,3]), new IntervalSet(2,6, [0, 1,3,4]) ]
    
           assert.deepStrictEqual( 
            splitDiffOverlappingIntervalSets(availability_sets,unavailability_sets), 
                [ 
                    new IntervalSet(4,6, [2],[3,4]), 
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
                    new IntervalSet(4,10, [2],[3]), 
                ],"");  
    
        });

        it("diffs entire interval when start/end under/overrun the corners. unavailability = 2---[0, 1,3]---12", () => { 
    
            unavailability_sets = [new IntervalSet(2,12, [0, 1,3]) ]
  
           assert.deepStrictEqual( 
            splitDiffOverlappingIntervalSets(availability_sets,unavailability_sets), 
                [ 
                    new IntervalSet(4,10, [2],[3]), 
                ],"");  
    
        });

        beforeEach(() => {
    
            availability_sets = [
                new IntervalSet(4,10, [0, 1, 2]),
            ]
    
            unavailability_sets = []
           
        });
    
    });

});


describe("testing", () => {

    let availability_sets, unavailability_sets;

    it("", () => { 

        unavailability_sets = [ new IntervalSet(6,15, [0]), new IntervalSet(17,23, [0]),]

        //case 1: each element in antiset is contained in set
        let set = [0,1,2]
        let antiset = [0,1]

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









