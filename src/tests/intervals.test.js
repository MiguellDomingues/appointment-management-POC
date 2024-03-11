import { describe, it, beforeEach }  from "node:test";
import _  from 'lodash';
import assert from 'node:assert/strict';
import moment from "moment";

//import useBoundStore from '../store.js';

//ISSUE:
//I CANT USE USEBOUNDSTORE INSIDE INTERVALS.JS IF I WANT TO RUN TESTS
//ALWAYS FAILS WITH MISSING IMPORTS
// 
import { 
    //areSetsNonEmpty,
   // splitUnionOverlappingIntervalSets,
    getIntervalsWithAppointmentCapacity,
    getTimeSlotAvailabilities,
    mergeConsecutiveIntervalSets,
    splitDiffOverlappingIntervalSets,
    areSetsEqual,
    testingnewfunc,
    //getTimeSlotAvailabilityPercentages,

 } from '../intervals.js'



 import { 

    IntervalSet,Interval
   

 } from '../classes.js'



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
                new IntervalSet(13,25, [0,1]),
                //new IntervalSet(17,25, [0, 1]),
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
                new IntervalSet(15,25, [0,1]),
               // new IntervalSet(17,25, [0,1]),
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
                new IntervalSet(16,22, [0], [1]),
               // new IntervalSet(17,22, [0], [1]),
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
                new IntervalSet(15,18, [1], [0]),
               // new IntervalSet(17,18, [1], [0]),
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
                new IntervalSet(13,25, [0,1]),
               // new IntervalSet(17,25, [0,1]),
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
                //new IntervalSet(6,9, [1],[],1),
                new IntervalSet(6,9, [1]),
                new IntervalSet(7,11, [],[],1)
             ]

            assert.deepStrictEqual(
            splitDiffOverlappingIntervalSets(availability_sets,unavailability_sets), 
            [ 
                new IntervalSet(4,6, [0,1]),
                new IntervalSet(6,7, [0], [1], 0),
                new IntervalSet(7,9, [0], [1], 1),
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

            // console.log("$$$", splitDiffOverlappingIntervalSets(availability_sets,unavailability_sets))

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

describe("testing areSetsEqual",  { skip: false }, () => {

    it("returns correctly for every combination of inputs", () => { 
        //assert.equal(areSetsEqual(), true)

        assert.equal(
            areSetsEqual(
                new IntervalSet(0, 2, ["A","B","C"]),
                new IntervalSet(2, 4, ["B","A","C"])
            ),true)

        assert.equal(
            areSetsEqual(
                new IntervalSet(0, 2, ["D","B","C"]),
                new IntervalSet(2, 4, ["B","A","C"])
            ),false)

        assert.equal(
            areSetsEqual(
                new IntervalSet(0, 2, ["A"], ["B"]),
                new IntervalSet(2, 4, ["A"], ["B"])
            ),true)

        assert.equal(
            areSetsEqual(
                new IntervalSet(0, 2, ["A"], ["B"]),
                new IntervalSet(2, 4, ["A"], ["C"])
            ),false)

        assert.equal(
            areSetsEqual(
                new IntervalSet(0, 2, ["A"], ["B"], 1),
                new IntervalSet(2, 4, ["A"], ["B"], 1)
            ),true)

        assert.equal(
            areSetsEqual(
                new IntervalSet(0, 2, ["A"], ["B"], 1),
                new IntervalSet(2, 4, ["A"], ["B"], 0)
            ),false)
    });

});

describe("testing mergeConsecutiveIntervalSets", () => {

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


describe("Testing getIntervalsWithAppointmentCapacity", { skip: true }, () => {

    let shifts, breaks;

    describe(`
        availability: 0--------------------(a,b,c)------------------------------60             
        `, { skip: false }, () => {

            let shifts, breaks
    
            it(`
            returns: 0---------------------------------------------------------60 
            when
            availability: 0--------------------(a,b,c)------------------------------60
            appointments:  
                  breaks:           15-(a,b)-20              45---(c)---50  
                `, { skip: false },() => { 
    
                const appointments = []
                assert.deepStrictEqual(
                    getIntervalsWithAppointmentCapacity(shifts, breaks.concat(appointments)), 
                    [new Interval(0,60)]
                ,"");  

            }); 

            it(`
            returns:      0---------------------------------------------------------60
            when
            availability: 0--------------------(a,b,c)------------------------------60
            appointments:  5--(+1)--15           25--(c)--40
                  breaks:           15-(a,b)-20              45---(c)---50  
            `, { skip: false },() => { 
    
                const appointments = [
                    new IntervalSet(5,15,[], [], 1),
                    new IntervalSet(25,40,["c"], [], 0),
                ]

                assert.deepStrictEqual(
                    getIntervalsWithAppointmentCapacity(shifts, breaks.concat(appointments)), 
                    [new Interval(0,60)]
                ,"");  

            }); 

            it(`
            returns:      0-------15       20----------------47         48----------60
            when
            availability: 0--------------------(a,b,c)------------------------------60
            appointments:      10---(+1)---20        40--(a)-47--(a,b)--48--(b)--50
                  breaks:         15-(a,b)-20            45-------(c)--------50 
                 
            `, { skip: false },() => { 
    
                const appointments = [
                    new IntervalSet(10,20,[], [], 1),
                    new IntervalSet(40,48,["a"], [], 0),
                    new IntervalSet(47,50,["b"], [], 0),
                ]

                assert.deepStrictEqual(
                    getIntervalsWithAppointmentCapacity(shifts, breaks.concat(appointments)), 
                    [
                        new Interval(0,15),
                        new Interval(20,47),
                        new Interval(48,60)
                    ]
                ,"");  

            }); 

            it(`
            returns:      0-------15       20------------------45   47--------------60
            when
            availability: 0--------------------(a,b,c)------------------------------60
            appointments:      10---(+1)---20       35--+1--43--+2--47----+1----55
                  breaks:         15-(a,b)-20                  45----(c)----50 
            `, { skip: false },() => { 
    
                const appointments = [
                    new IntervalSet(10,20,[], [], 1),
                    new IntervalSet(35,47,[], [], 1),
                    new IntervalSet(43,55,[], [], 1),
                ]

                assert.deepStrictEqual(
                    getIntervalsWithAppointmentCapacity(shifts, breaks.concat(appointments)), 
                    [
                        new Interval(0,15),
                        new Interval(20,45),
                        new Interval(47,60)
                    ]
                ,"");  

            }); 

            it(`
            returns:      0------15       20------------------------------45           50---------60
            when
            availability: 0--------------------(a,b,c)--------------------------------------------60
            appointments:    10----(c)----20--(c+1)--25--+2---30--+1--40  45---(a+1)---50--(a+1)--60
                  breaks:        15-(a,b)-20                              45----(c)----50 
            `, { skip: false },() => { 
    
                const appointments = [
                    new IntervalSet(10,25,["c"]),              
                    new IntervalSet(20,30,[], [], 1),
                    new IntervalSet(25,40,[], [], 1),
                    new IntervalSet(45,50,[], [], 1),
                    new IntervalSet(45,60,["a"]),
                    new IntervalSet(50,60,[], [], 1),
                ]

                const totalAvailability = getIntervalsWithAppointmentCapacity(shifts, breaks.concat(appointments))

                console.log(totalAvailability)

                assert.deepStrictEqual(
                    getIntervalsWithAppointmentCapacity(shifts, breaks.concat(appointments)), 
                    [
                        new Interval(0,15),
                        new Interval(20,45),
                        new Interval(50,60)
                    ]
                ,"");  

            }); 

            beforeEach(() => {
                shifts = [
                    new IntervalSet(0, 60, ["a","b","c"]),
                ]
        
                breaks = [
                    new IntervalSet(15, 20, ["a","b"]),
                    new IntervalSet(45, 50, ["c"]),
                ]
            });

        });

});


describe("Testing getTimeSlotAvailabilities", { skip: true }, () => {

    let shifts, breaks, timeslots;

    describe("Testing Happy Paths. TS: [(0->60), (60->120)]", { skip: false }, () => {

        let shifts, breaks, timeslots, appointments;
   

        it("returns", () => { 

            shifts = [
                new IntervalSet(0, 60, ["0","1"]),
                new IntervalSet(60, 120, ["0","1","3"]),
                //new IntervalSet(60,120, ["3"]),
            ]
    
             breaks = [
                new IntervalSet(15, 20, ["0","1"]),
                new IntervalSet(45,50, ["0"]),

                new IntervalSet(105,115, ["0","1"]),
            ]

            appointments = [
               // new IntervalSet(15, 20, ["0","1"]), //set, no missing_elements, no overlap_count
                new IntervalSet(30,40, [], [], 1), //no sets, no missing_elements, overlap_count
                new IntervalSet(35,45, [], [], 1),
                new IntervalSet(45,50, [], [], 1),

                new IntervalSet(90,106, [], [], 1),
                //new IntervalSet(40,50, [], [], 1),
                //new IntervalSet(35,55, [], [], 1), //no sets, no missing_elements, overlap_count
               // new IntervalSet(35,45, ["0"], [], 0),
               // new IntervalSet(35,45, [], [], 1),

            ]

            let _timeslots = [
                new Interval(0,60),
                new Interval(60,120)
              
            ]

            function makeObject(totalAvailabilities, adjustedAvailabilities, timeSlots){

                if(timeSlots.length == 0) 
                    throw new Error('Error timeSlots arr can not be empty')

               let availabilityCount = 0

                const objs = timeSlots.map(({start,end}, idx)=>{
                    if(totalAvailabilities[idx].length < adjustedAvailabilities[idx].length) 
                        throw new Error('Error totalAvailabilities can not be greater than adjustedAvailabilities ')
                    const availability = totalAvailabilities[idx].length > 0 ? Math.trunc( (adjustedAvailabilities[idx].length/totalAvailabilities[idx].length)*100 ) : 0
                    availabilityCount+=availability

                    return {
                        start,
                        end,
                        openTimes: adjustedAvailabilities[idx],
                        availability: availability

                    }
                })

                

                const ret = {
                    date: "2023-12-07",
                    dotw: "Monday",
                    sceduale: objs,
                    day_availability: Math.trunc( (availabilityCount/objs.length) )
                }

                return {}

                //console.log("ret", ret)
            }
          

            const totalAvailability = getIntervalsWithAppointmentCapacity(shifts, breaks)
            const adjustedAvailability = getIntervalsWithAppointmentCapacity(shifts, appointments.concat(breaks))


            console.log("adjustedAvailability intervals:", adjustedAvailability)
            console.log("totalAvailability intervals:", totalAvailability)
          //  console.log("totalAvailability:", totalAvailability)
         // console.log("adjustedAvailability intervals:", adjustedAvailability)
         // console.log("totalAvailability intervals:", totalAvailability)

         const _totalAvailability = getTimeSlotAvailabilities(totalAvailability, 15, _timeslots)
         const _adjustedAvailability = getTimeSlotAvailabilities(adjustedAvailability, 15, _timeslots)

          console.log("totalAvailability:", _totalAvailability)
          console.log("adjustedAvailability:", _adjustedAvailability)

          makeObject(_totalAvailability, _adjustedAvailability,_timeslots)

         // console.log( getTimeSlotAvailabilityPercentages(_totalAvailability, _adjustedAvailability) )

        
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

describe("testing testingnewfunc", { skip: false}, () => {

    let spans,antispans

    describe("testing edge cases", { skip: false}, () => {

        let spans
    
        it("returns spans when antispans is empty or undefined", () => { 
            assert.deepStrictEqual(testingnewfunc(spans,[]), spans,"");
            assert.deepStrictEqual(testingnewfunc(spans), spans,"");  
        });

        it("returns empty list when both arguments are undefined or an empty list", () => { 
            assert.deepStrictEqual(testingnewfunc(), [],""); 
            assert.deepStrictEqual(testingnewfunc([]), [],""); 
            assert.deepStrictEqual(testingnewfunc([],[]), [],""); 
        });

        it("returns empty list when spans is empty list", () => { 
            assert.deepStrictEqual(testingnewfunc([],[new Interval(12, 18)]), [],""); 
        });

        it("returns spans when antispans underruns or overruns spans", () => { 
            assert.deepStrictEqual(testingnewfunc(spans,
            [
                new Interval(0,5),
                new Interval(6,7),
                new Interval(7,10),
            ]), spans,""); 

            assert.deepStrictEqual(testingnewfunc(spans,
            [
                new Interval(100,105),
                new Interval(106,110),
                new Interval(111,115),
            ]), spans,""); 
        });

        beforeEach(() => {
    
            spans = [
                new Interval(10,20),
                new Interval(30,40),
                new Interval(50,60),
            ]

            antispans = []
           
        });
    
    });

    describe("testing AS (0,5), (5,10), (15,20), shifting right 6 units each case until antispans overruns spans", { skip: false}, () => {

        let spans,antispans
    
        it(`
            S:              10----------20         30----------40       50----------60
            AS:   0-----5   10-----15   20-----25
       f(S,AS)=                    15---20         30----------40       50----------60                       
        `, () => { 

            assert.deepStrictEqual(
                testingnewfunc(spans,
                    [new Interval(0,5),new Interval(10,15),new Interval(20,25)]),
                [new Interval(15,20),new Interval(30,40),new Interval(50,60), ],"");

         

        });

        it(`
            S:         10----------20         30----------40       50----------60
            AS:   6-----11   16-----21   26-----31
       f(S,AS)=        10----------20         30----------40       50----------60                                  
        `, () => { 

            assert.deepStrictEqual(
                testingnewfunc(spans,
                    [new Interval(6,11),new Interval(16,21),new Interval(26,31)]),
                spans,"");

        });

        it(`
            S:         10---------20          30----------40       50----------60
            AS:           12---17     22---27    32----38
       f(S,AS)=        10-12   17-20          30-32    38-40       50----------60                                  
        `, () => { 

            assert.deepStrictEqual(
                testingnewfunc(spans,
                    [new Interval(12,17),new Interval(22,27),new Interval(32,38)]),
                    [
                        new Interval(10,12),
                        new Interval(17,20),
                        new Interval(30,32),
                        new Interval(38,40),
                        new Interval(50,60),
                    ],"");

        });

        it(`
        S:         10---------20          30----------40       50----------60
        AS:                18----23     28----33    38-----44
   f(S,AS)=        10---------20          30----------40       50----------60                                  
    `, () => { 

        assert.deepStrictEqual(
            testingnewfunc(spans,
                [new Interval(18,23),new Interval(28,33),new Interval(38,44)]),
               spans,"");

        });

        it(`
        S:         10---------20        30----------40          50----------60
        AS:                       24----30      35----41   46-----52
   f(S,AS)=        10---------20        30----------40          50----------60                                  
    `, () => { 

        assert.deepStrictEqual(
            testingnewfunc(spans,
                [new Interval(24,30),new Interval(35,41),new Interval(46,52)]),
               spans,"");

        });

        it(`
        S:         10---------20     30----------40           50----------60
        AS:                          30----36       41----47      52---58
   f(S,AS)=        10---------20           36----40           50--52   58--60                                  
    `, () => { 

        assert.deepStrictEqual(
            testingnewfunc(spans,
                [new Interval(30,36),new Interval(41,47),new Interval(52,58)]),
                [
                    new Interval(10,20),
                    new Interval(36,40),
                    new Interval(50,52),
                    new Interval(58,60),
                ],"");

        });

        it(`
        S:         10---------20     30----------40        50----------60
        AS:                                  36-----42  47-----53   58-----64
   f(S,AS)=        10---------20     30----------40        50----------60                                      
    `, () => { 

        assert.deepStrictEqual(
            testingnewfunc(spans,
                [new Interval(36,42),new Interval(47,53),new Interval(58,64)]),
                spans,"");

        });

        it(`
        S:         10---------20   30----------40         50-----------60
        AS:                                       42---48     53---59     64---70
   f(S,AS)=        10---------20   30----------40         50--53   59--60                                      
    `, () => { 

        assert.deepStrictEqual(
            testingnewfunc(spans,
                [new Interval(42,48),new Interval(53,59),new Interval(64,70)]),
                [
                    new Interval(10,20),
                    new Interval(30,40),
                    new Interval(50,53),
                    new Interval(59,60),
                ],"");

        });

        it(`
        S:         10---------20   30----------40     50-----------60
        AS:                                        48-----54   56-----65   70---76
   f(S,AS)=        10---------20   30----------40     50-----------60                                        
    `, () => { 

        assert.deepStrictEqual(
            testingnewfunc(spans,
                [new Interval(48,54),new Interval(59,65),new Interval(70,76)]),
                spans,"");

        });

        it(`
        S:         10---------20 30----------40  50-----------60
        AS:                                            54-----60   62---68   76---82
   f(S,AS)=        10---------20 30----------40  50----54                                        
    `, () => { 

        assert.deepStrictEqual(
            testingnewfunc(spans,
                [new Interval(54,60),new Interval(62,68),new Interval(76,82)]),
                [new Interval(10,20),new Interval(30,40),new Interval(50,54)],"");

        });

        it(`
        S:         10---------20 30----------40 50-----------60
        AS:                                                  60-----66   68---74   82---88
   f(S,AS)=        10---------20 30----------40 50-----------60                                        
    `, () => { 
        assert.deepStrictEqual(
            testingnewfunc(spans,
                [new Interval(60,66),new Interval(68,74),new Interval(82,88)]),
                spans,"");
        });

        beforeEach(() => {
    
            spans = [
                new Interval(10,20),
                new Interval(30,40),
                new Interval(50,60),
            ]

            antispans = []
           
        });
    
    });

    describe("testing multiple consecutive/nonconsecutive span deletions with single spans", { skip: false}, () => {

        let spans,antispans
    
        it(`
            S:    10----------20   30----------40  50----------60
            AS:   10----15----20   30---35--39        51---55--60
       f(S,AS)=                             39-40  50-51                      
        `, () => { 

            assert.deepStrictEqual(
                testingnewfunc(spans,
                    [new Interval(10,15),new Interval(15,20),
                     new Interval(30,35), new Interval(35,39),
                     new Interval(51,55), new Interval(55,60),
                    ]),
                [new Interval(39,40),new Interval(50,51)],"");

        });

        it(`
            S:   10--------------------------20   
            AS:  10--11  13--15  17--18  19--20  
       f(S,AS)=      11--13  15--17  18--19                     
        `, () => { 

            assert.deepStrictEqual(
                testingnewfunc([new Interval(10,20)],
                    [new Interval(10,11),new Interval(13,15),
                     new Interval(17,18), new Interval(19,20),
                    ]),
                [new Interval(11,13),new Interval(15,17), new Interval(18,19),],"");

        });

        beforeEach(() => {
    
            spans = [
                new Interval(10,20),
                new Interval(30,40),
                new Interval(50,60),
            ]

            antispans = []
           
        });
    
    });

    describe("testing deletions with overlapping spans", { skip: false}, () => {

        let spans,antispans
    
        it(`
            S:    10----------20   30----------40  50----------60
            AS:   10-------17            35----40          
                      15------20   30-------37  
       f(S,AS)=            17-20            37-40  50----------60                    
        `, () => { 

            assert.deepStrictEqual(
                testingnewfunc(spans,
                    [new Interval(10,17),new Interval(15,20),
                     new Interval(30,37), new Interval(35, 40), 
                    ]),
                [new Interval(17,20),new Interval(37,40),new Interval(50,60)],"");

        });


        beforeEach(() => {
    
            spans = [
                new Interval(10,20),
                new Interval(30,40),
                new Interval(50,60),
            ]

            antispans = []
           
        });
    
    });

    describe("testing removals from antispans list when spans are deleted", { skip: false}, () => {

        let spans,antispans
    
        it(`
            S:              10----------20         30----------40       50----------60
            AS:   0-----5   10-----15   20-----25
       f(S,AS)=                    15---20         30----------40       50----------60
            AS=   0-----5               20-----25                       
        `, () => { 

            antispans = [new Interval(0,5),new Interval(10,15),new Interval(20,25)]

            assert.deepStrictEqual(
                testingnewfunc(spans,antispans),
                [new Interval(15,20),new Interval(30,40),new Interval(50,60), ],"");

            assert.deepStrictEqual(antispans,
                [new Interval(0,5),new Interval(20,25)],"");

        });

        it(`
            S:         10---------20          30----------40       50----------60
            AS:           12---17     22---27    32----38
       f(S,AS)=        10-12   17-20          30-32    38-40       50----------60
            AS=                       22---27                                   
        `, () => { 

            antispans = [new Interval(12,17),new Interval(22,27),new Interval(32,38)]

            assert.deepStrictEqual(
                testingnewfunc(spans,antispans),
                    [
                        new Interval(10,12),
                        new Interval(17,20),
                        new Interval(30,32),
                        new Interval(38,40),
                        new Interval(50,60),
                    ],"");

            assert.deepStrictEqual(antispans,
                [new Interval(22,27)],"");

        });

        it(`
        S:         10---------20     30----------40           50----------60
        AS:                          30----36       41----47      52---58
   f(S,AS)=        10---------20           36----40           50--52   58--60 
        AS=                                         41----47                           
    `, () => { 

            antispans = [new Interval(30,36),new Interval(41,47),new Interval(52,58)]

       
            assert.deepStrictEqual(
                testingnewfunc(spans,antispans),
                    [
                        new Interval(10,20),
                        new Interval(36,40),
                        new Interval(50,52),
                        new Interval(58,60),
                    ],"");

            assert.deepStrictEqual(antispans,
                [new Interval(41,47)],"");

        });

        it(`
        S:         10---------20   30----------40         50-----------60
        AS:                                       42---48     53---59     64---70
   f(S,AS)=        10---------20   30----------40         50--53   59--60
        AS=                                       42---48                 64---70                                      
    `, () => { 

        antispans = [new Interval(42,48),new Interval(53,59),new Interval(64,70)]

        assert.deepStrictEqual(
            testingnewfunc(spans,antispans),
                [
                    new Interval(10,20),
                    new Interval(30,40),
                    new Interval(50,53),
                    new Interval(59,60),
                ],"");

            
        assert.deepStrictEqual(antispans,
            [new Interval(42,48),new Interval(64,70)],"");

        });

        it(`
        S:         10---------20 30----------40  50-----------60
        AS:                                            54-----60   62---68   76---82
   f(S,AS)=        10---------20 30----------40  50----54
        AS=                                                        62---68   76---82                                        
    `, () => { 

        antispans = [new Interval(54,60),new Interval(62,68),new Interval(76,82)]

        assert.deepStrictEqual(
            testingnewfunc(spans,antispans),
                [new Interval(10,20),new Interval(30,40),new Interval(50,54)],"");
           
        assert.deepStrictEqual(antispans,
            [new Interval(62,68),new Interval(76,82)],"");

        });

        beforeEach(() => {
    
            spans = [
                new Interval(10,20),
                new Interval(30,40),
                new Interval(50,60),
            ]

            antispans = []
           
        });
    
    });

    beforeEach(() => {

        spans = [
            new Interval(10,20),
            new Interval(30,40),
            new Interval(50,60),
        ]

        antispans = []
       
    });

});

describe("testing stuff", { skip: true}, () => {

    let mergedSpans

    it("", () => { 

        let antispans = [
            new Interval(4,7),
            new Interval(11,18),


        ]

        const a = testingnewfunc(mergedSpans,antispans)

        console.log(a)

      
       
     });

    beforeEach(() => {

        mergedSpans = [
            //new Interval(10,20),
           // new Interval(30,40),
            new Interval(50,60),
            new Interval(60,80),
        ]
       
    });

});





/*

TESTING DECORATORS

function addDecorators2(context, decorators ){
    //this.this = context
    const {set, missing_elements, overlap_count } =  decorators

    if(set) context.set = set
    if(missing_elements) context.missing_elements = missing_elements
    if(overlap_count) context.overlap_count = overlap_count
}

class Test{
    decorators = []
    constructor(_decorators = {}){

        this.decorators = Object.keys(_decorators)

        //const {set, missing_elements, overlap_count } =  _decorators

       //console.log(set, missing_elements, overlap_count)

       this.addDecorators(_decorators)
       //addDecorators2(this,_decorators)
       

        this.a = 5
       // Test.prototype.getValue = function (){console.log("hi")}

    }

    addDecorators(decorators){

        const {set, missing_elements, overlap_count } =  decorators

        if(set) this.set = set
        if(missing_elements) this.missing_elements = missing_elements
        if(overlap_count) this.overlap_count = overlap_count

    }
}

const decorators = {
    //set: [1,3],
   // set: [],
  missing_elements: [2,3],
   overlap_count: 101
}

const d = new Test(decorators)

console.log(d.set, d.missing_elements, d.overlap_count)

const f = new Test()

Test.prototype.getValue = function (){console.log("hi")}

f.getValue()
d.getValue()

   function getIntervalsWithCapacity(availability, unavailability){

                const diffed = splitDiffOverlappingIntervalSets(availability, unavailability)

              //  console.log("diffed", diffed)
                //console.log("merged", merged)

               // const merged = mergeConsecutiveIntervalSets(diffed,areSetsEqual)

               // console.log("merged length", merged.length)
              //  console.log("merged", merged)
                const withCapacity = diffed.filter(({overlap_count, set})=>overlap_count < set.length)

                //note that this causes overlap_count and missing_elements props on these intervals to get lost 
                return mergeConsecutiveIntervalSets(withCapacity,()=>true)
            }

*/








