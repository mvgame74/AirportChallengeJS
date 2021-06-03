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

   it('blocks takeoff then the weather is stormy', () => {
     plane.land(airport)
     spyOn(airport, 'isStormy').and.returnValue(true);
     expect(function(){plane.takeoff();}).toThrowError('cannot takeoff during a storm');
     expect(airport.planes()).toContain(plane);
   });

   it('blocks landing then the weather is stormy', () => {
    spyOn(airport, 'isStormy').and.returnValue(true);
    expect(function(){plane.land(airport);}).toThrowError('cannot land during a storm');
    expect(airport.planes()).not.toContain(plane);
  });
});