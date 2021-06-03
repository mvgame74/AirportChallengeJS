'use strick';

describe('Feature Test:', () => {
  let plane;
  let airport;

   beforeEach(() => {
     plane = new Plane();
     airport = new Airport();
   });

   it('planes can be instructed to land in the airport', () => {
     plane.land(airport);
     expect(airport.planes()).toContain(plane);
   });

   it('planes can be instructed to takeoff', () => {
     plane.land(airport)
     plane.takeoff();
     expect(airport.planes()).not.toContain(plane);
   });

   

});