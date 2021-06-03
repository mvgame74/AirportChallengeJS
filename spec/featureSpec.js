'use strict';

describe('Feature Test:', () => {
  let plane;
  let airport;
  beforeEach(() => {
    plane = new Plane();
    airport = new Airport();
  });

  describe('under non-stormy conditions', () => {

    beforeEach(() => {
      spyOn(Math, 'random').and.returnValue(0);
    });

    it('planes can be instructed to land at an airport', () => {
      plane.land(airport);
      expect(airport.planes()).toContain(plane);
    });

    it('planes can be instructed to take off', () => {
      plane.land(airport);
      plane.takeoff();
      expect(airport.planes()).not.toContain(plane);
    });
  });

  describe('under stormy conditions', () => {

    it('blocks takeoff when weather is stormy', () => {
      spyOn(Math,'random').and.returnValue(0);
      plane.land(airport)
      spyOn(airport._weather,'isStormy').and.returnValue(true);
      expect(function(){ plane.takeoff();}).toThrowError('cannot takeoff during storm');
      expect(airport.planes()).toContain(plane);
    });

    it('blocks landing when weather is stormy', () => {
      spyOn(Math,'random').and.returnValue(1);
      expect(() => { plane.land(airport); }).toThrowError('cannot land during storm');
      expect(airport.planes()).toEqual([]);
    });
  });
});
