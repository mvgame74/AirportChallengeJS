# Walkthrough - Airport Challenge in JavaScript

[Back to the Challenge](../airport_challenge_js.md)

Let's start with a user story to drive a feature test:

```
As an air traffic controller
To get passengers to a destinationls
I want to instruct a plane to land at
  an airport and confirm that it has landed
```

Create the feature test in `spec/featureSpec.js`

```javascript
// spec/featureSpec.js
'use strict';

describe('Feature Test:', () => {
  let plane;
  let airport;

  beforeEach(() => {
    plane = new Plane();
    airport = new Airport();
  });

  it('planes can be instructed to land at an airport', () => {
    plane.land(airport);
    expect(airport.planes()).toContain(plane);
  });
});
```

This should fail with the following errors in SpecRunner.html:

```
Feature Test: planes can be instructed to land at an airport
  ReferenceError: Plane is not defined
  TypeError: Cannot read property 'land' of undefined
```

We then create a unit test for a Plane:

```javascript
// spec/planeSpec.js
'use strict';

describe('Plane', () => {
  let plane;
  beforeEach(() => {
    plane = new Plane();
  });
  it('can land at an airport', () => {
    expect(plane.land).not.toBeUndefined()
  });
});
```

which gives a matching error to our feature test

```
Plane can land at an airport
  ReferenceError: Plane is not defined
  TypeError: Cannot read property 'land' of undefined
```

so let's define our Plane class:

```javascript
// src/plane.js
'use strict';

class Plane {};
```

Which makes our unit test go a little cryptic

```
Plane can land at an airport
  Error: Expected undefined not to be undefined.
```

but this is just telling us that plane.land is undefined.  It's the spiritual cousin of RSpec's `expect(...).to respond_to(...)`

Let's add the simplest possible land method to change the error

```javascript
// src/plane.js
'use strict';

class Plane {
    land(){};
}
```

which passes our unit test and we have some different issues to deal with in our feature test:

```
Feature Test: planes can be instructed to land at an airport
  ReferenceError: Airport is not defined
  TypeError: Cannot read property 'planes' of undefined
```

So let's create an Airport spec:

```javascript
// spec/airportSpec.js
'use strict';

describe('Airport', () => {
  let airport;
  beforeEach(() => {
    airport = new Airport();
  });
  it('has no planes by default', () => {
    expect(airport.planes()).toEqual([]);
  });
});
```

So now we have unit test failures that match our feature test failures

```
Airport has no planes by default
  ReferenceError: Airport is not defined
  TypeError: Cannot read property 'planes' of undefined
```

So let's create an airport:

```javascript
// src/airport.js
'use strict';

class Airport{};
```

which drops us to a single matching unit and feature failure:

```
Feature Test: planes can be instructed to land at an airport
  TypeError: airport.planes is not a function
Airport has no planes by default
  TypeError: Cannot read property 'planes' of undefined
```

```javascript
// src/airport.js
'use strict';

class Airport{
  planes() {
    return [];
  };
};
```

which finally takes us to the final part of the feature test, with this failure:

```javascript
Feature Test: planes can be instructed to land at an airport
  Expected [  ] to contain Plane({  }).
```

So we need our plane object to interact with our airport object.  It's tempting here just to implement the final step, but if we're careful with our London style unit testing we want to stub the interaction in the plane unit test like so:

```javascript
// spec/planeSpec.js
'use strict';

describe('Plane', () => {
  let plane;
  let airport;
  beforeEach(() => {
    plane = new Plane();
    airport = jasmine.createSpyObj('airport',['clearForLanding']);
  });
  it('can land at an airport', () => {
    plane.land(airport);
    expect(airport.clearForLanding).toHaveBeenCalledWith(plane);
  });
});
```

where spys are Jasmine's equivalent of doubles.  Notice we've dropped the now redundant check that plane.land is defined, and now this test gives us the following unit test level failure:

```
Plane can land at an airport
  Expected spy airport.clearForLanding to have been called with [ Plane({  }) ] but it was never called.
```

We're using Sandi Metz's space capsule technique, stubbing the outgoing interaction from plane to airport.  Let's have the plane talk to the airport to ask to land:

```javascript
class Plane {
    land(airport){
      airport.clearForLanding(this)
    };
};
```

which satisfies out unit test, but our feature test now fails with:

```
Feature Test: planes can be instructed to land at an airport
  TypeError: airport.clearForLanding is not a function
```

Plane is doing everything it needs to, but now we need Airport to play its part, so a unit test for Airport is in order to make sure it stores a reference to the incoming plane after clearForLanding is called.  To move a little faster let's skip the trivial test that clearForLanding is defined, and go straight to making a spy that we can check has been landed correctly.

```javascript
'use strict';

describe('Airport', () => {
  let airport;
  let plane;
  beforeEach(() => {
    airport = new Airport();
    plane = jasmine.createSpy('plane',['land']);
  });
  it('has no planes by default', () => {
    expect(airport.planes()).toEqual([]);
  });
  it('can clear planes for landing', () => {
    airport.clearForLanding(plane);
    expect(airport.planes()).toEqual([plane]);
  });
});
```

which gives is a similar unit and feature test failure:

```
Airport can clear planes for landing
  TypeError: airport.clearForLanding is not a function
Feature Test: planes can be instructed to land at an airport
  TypeError: airport.clearForLanding is not a function
```

Definitely time to get that clearForLanding method in there:

```javascript
// src/airport.js
'use strict';

class Airport{
  planes() {
    return [];
  }

  clearForLanding(plane) {};
};
```

Remember each step we are doing the absolute minimum of work to change the error message(s).  We're trying to write the leanest code possible; we want every line of code to actually be necessary.  Now we get:

```
Airport can clear planes for landing
  Expected [  ] to equal [ spy on plane ].
Feature Test: planes can be instructed to land at an airport
  Expected [  ] to contain Plane({  }).
```

So finally time to get this method to work for a living; and Airport will need some state too:

```javascript
// src/airport.js
'use strict';

class Airport{
  constructor() {
    this._hangar = []
  }
  planes() {
    return this._hangar;
  }
  clearForLanding(plane) {
    this._hangar.push(plane);
  };
};
```

And we are all green!  Note our use of underscore as a prefix to the _hangar variable to indicate that this state should be private.

So our feature is now complete and we have a couple of London style unit tests looking after our models.  Let's consider another user story:

```
As an air traffic controller
To get passengers to a destination
I want to instruct a plane to take off from
  an airport and confirm that it is no longer in the airport
```

which leads us to a corresponding feature test

```javascript
// spec/featureSpec.js
  it('planes can be instructed to takeoff', () => {
    plane.land(airport)
    plane.takeoff();
    expect(airport.planes()).not.toContain(plane);
  });
```

Gives us:

```
Feature Test: planes can be instructed to takeoff
  TypeError: plane.takeoff is not a function
```

and we create a unit test that generates the same error:

```javascript
// spec/planeSpec.js
'use strict';

describe('Plane', () => {
  let plane;
  let airport;
  beforeEach(() => {
    plane = new Plane();
    airport = jasmine.createSpyObj('airport',['clearForLanding','clearForTakeOff']);
  });
  it('can land at an airport', () => {
    plane.land(airport);
    expect(airport.clearForLanding).toHaveBeenCalledWith(plane);
  });
  it('can takeoff from an airport', () => {
    plane.land(airport);
    plane.takeoff();
    expect(airport.clearForTakeOff).toHaveBeenCalled();
  });
});
```

Note that here we're going straight to test the outgoing call to airport as our confidence is increasing.  Let's now fix that up with some more functionality on the Plane:

```javascript
'use strict';

class Plane {
  constructor() {
    this.__location;
  }
  land(airport){
    airport.clearForLanding(this)
    this._location = airport;
  };
  takeoff() {
    this._location.clearForTakeOff()
  }
};
```

This just leaves our feature test failing with:

```
Feature Test: planes can be instructed to takeoff
  TypeError: this._location.clearForTakeOff is not a function
```

Time for a matching unit test on our AirportSpec:

```javascript
// spec/airportSpec.js
  it('can clear planes for takeoff', () => {
    airport.clearForLanding(plane);
    airport.clearForTakeOff(plane);
    expect(airport.planes()).toEqual([]);
  });
```

which creates a matching failure:

```
Airport can clear planes for takeoff
  TypeError: airport.clearForTakeOff is not a function
```

And we can fix that with the following addition to the airport functionality in the class:

```javascript
// src/airport.js

  clearForTakeOff(plane) {
    this._hangar = [];
  }

```

Note that we're clearing the hangar here.  That might seems wrong, but that's all that our tests demand at the moment.  If we want to handle more planes consistently we shouldn't add that functionality until we have tests that drive it.  Want to add it?  Write some tests to justify it.  In the meantime let's add in some weather conditions:

```
As an air traffic controller
To ensure safety
I want to prevent takeoff when weather is stormy
```

For which we can write a test like:

```javascript
// spec/featureSpec.js
  it('blocks takeoff when weather is stormy', () => {
    plane.land(airport)
    spyOn(airport,'isStormy').and.returnValue(true);
    expect(function(){ plane.takeoff();}).toThrowError('cannot takeoff during storm');
    expect(airport.planes()).toContain(plane);
  });
```

Checking that fails as expected `isStormy() method does not exist` we can create the matching unit test, which fails the same way:

```javascript
// spec/airportSpec.js
  it('can check for stormy conditions', () => {
    expect(airport.isStormy()).toBeFalsy();
  });
```

and that brace of failures can be fixed with inside the class:

```javascript
// src/airport.js
isStormy() {
    return false;
  }
```

which takes us to a new couple of errors in our feature test:

```
Feature Test: blocks takeoff when weather is stormy
  Error: Expected function to throw an Error.
  Error: Expected [  ] to contain Plane({ _location: Airport({ _hangar: [  ], isStormy: spy on isStormy }) }).
```

Another unit test matches the first of those errors:

```javascript
// spec/airportSpec.js
describe('under stormy conditions', () => {
  it('does not clear planes for takeoff', () => {
    spyOn(airport,'isStormy').and.returnValue(true);
    expect(() => { airport.clearForTakeOff(plane); }).toThrowError('cannot takeoff during storm');
  });
});
```

And a guard clause in our airport clear for takeoff method will make everything go green:

```javascript
// src/airport.js
clearForTakeOff(plane) {
    if(this.isStormy()) {
      throw new Error('cannot takeoff during storm');
    }
    this._hangar = [];
  }
```

And there's a nearly identical procedure to implement for the following user story:

```
As an air traffic controller
To ensure safety
I want to prevent landing when weather is stormy
```

which you could try yourself following the acceptance-unit test cycle demo'd above.  You can infer the test structure but let's have an overview of where we've got to in terms of our domain models:

```javascript

class Plane {

    constructor() {
        this.__location;
    }
    land(airport) {
      airport.clearForLanding(this);
      this.__location = airport;
    }
    takeoff(airport) {
        this.__locattion.clearForTakeOff();
    }
}

```

Plane is looking pretty good.  Tiny bit of private state, responsibilities for landing and taking off.  Seems good.

```javascript
class Airport{
  constructor() {
    this._hangar = []
  }
  planes() {
    return this._hangar;
  }
  clearForLanding(plane) {
    this._hangar.push(plane);
  };
  clearForTakeOff(plane) {
    if(this.isStormy()) {
      throw new Error('cannot takeoff during storm');
    }
    this._hangar = [];
  }
  isStormy() {
    return false;
  }
};

```

Airport is getting a bit bloated though and that weather functionality looks like a separate responsibility and our client is telling us that in reality the weather is somewhat random.  So let's extract that and use dependency injection to tell an Airport what kind of weather to have.  First up let's just test a weather object:

```javascript
'use strict';

describe('Weather', () => {
  let weather;
  beforeEach(() => {
    weather = new Weather();
  });
  it('gives stormy sometimes', () => {
    spyOn(Math,'random').and.returnValue(1);
    expect(weather.isStormy()).toBeTruthy();
  });
  it('gives not stormy other times', () => {
    spyOn(Math,'random').and.returnValue(0);
    expect(weather.isStormy()).toBeFalsy();
  });
});
```

which can be made to pass with the following

```javascript
'use strict';

class Weather {
  constructor() {
    this._CHANCE_OF_STORMY = 0.5;
  }
  isStormy() {
     return (Math.random() > this._CHANCE_OF_STORMY);
  }
}

```

Now let's inject that into our Airport:

```javascript
'use strict';

class Airport{
  constructor(weather) {
    this._weather = typeof weather !== 'undefined' ? weather : new Weather();
    this._hangar = []
  }
  planes() {
    return this._hangar;
  }
  clearForLanding(plane) {
    this._hangar.push(plane);
  };
  clearForTakeOff(plane) {
    if(this._weather.isStormy()) {
      throw new Error('cannot takeoff during storm');
    }
    this._hangar = [];
  }
  isStormy() {
    return false;
  }
};
```

[Note that with ECMAScript 6 we'll finally be able to set default values in function parameter declarations like so: `function f (x, y = 7) { return x + y; }` http://es6-features.org/#DefaultParameterValues] and avoid clunkiness like the above, i.e. `function Airport(weather = new Weather)`

However we've extracted the responsibility for weather out of the Airport, we'll have to do a fairly major refactoring of our tests to get back to green here.  This is what we end up with:

```javascript
'use strict';

describe('Feature Test: ', () => {
  let plane;
  let airport;

  beforeEach(() => {
    plane = new Plane();
    airport = new Airport();
  });

  describe('under normal conditions',() => {
    beforeEach(() => {
      spyOn(Math,'random').and.returnValue(0);
    });

    it('planes can be instructed to land at an airport', () => {
      plane.land(airport);
      expect(airport.planes()).toContain(plane);
    });

    it('planes can be instructed to takeoff', () => {
      plane.land(airport)
      plane.takeoff();
      expect(airport.planes()).not.toContain(plane);
    });
  });

  describe('under stormy conditions',() => {

    it('blocks takeoff when weather is stormy', () => {
      spyOn(Math,'random').and.returnValue(0);
      plane.land(airport)
      spyOn(airport._weather,'isStormy').and.returnValue(true);
      expect(() => { plane.takeoff();}).toThrowError('cannot takeoff during storm');
      expect(airport.planes()).toContain(plane);
    });

    it('blocks landing when weather is stormy', () => {
      spyOn(Math,'random').and.returnValue(1);
      expect(() => { plane.land(airport); }).toThrowError('cannot land during storm');
      expect(airport.planes()).toEqual([]);
    });
  });
});
```

```javascript
'use strict';

describe('Airport', () => {
  let airport;
  let plane;
  let weather;

  beforeEach(() => {
    plane = jasmine.createSpy('plane');
    weather = jasmine.createSpyObj('weather', ['isStormy']);
    airport = new Airport(weather);
  });

  it('has no planes by default', () => {
    expect(airport.planes()).toEqual([]);
  });

  describe('under normal conditions',() => {
    beforeEach(() => {
      weather.isStormy.and.returnValue(false);
    });
    it('can clear planes for landing', () => {
      airport.clearForLanding(plane);
      expect(airport.planes()).toEqual([plane]);
    });
    it('can clear planes for takeoff', () => {
      airport.clearForLanding(plane);
      airport.clearForTakeOff(plane);
      expect(airport.planes()).toEqual([]);
    });
  });

  describe('under stormy conditions',() => {
    beforeEach(() => {
      weather.isStormy.and.returnValue(true);
    });
    it('does not clear planes for landing', () => {
      expect(() => { airport.clearForLanding(plane); }).toThrowError('cannot land during storm');
    });
    it('does not clear planes for takeoff', () => {
      expect(() => { airport.clearForTakeOff(plane); }).toThrowError('cannot takeoff during storm');
    });
  });
});
```

```javascript
'use strict';

describe('Plane', () => {
  let plane;
  let airport;
  beforeEach(() => {
    plane = new Plane();
    airport = jasmine.createSpyObj('airport',['clearForLanding','clearForTakeOff']);
  });
  it('can land at an airport', () => {
    plane.land(airport);
    expect(airport.clearForLanding).toHaveBeenCalledWith(plane);
  });
  it('can takeoff from an airport', () => {
    plane.land(airport);
    plane.takeoff();
    expect(airport.clearForTakeOff).toHaveBeenCalled();
  });
});
```

However we've lost some of the readability by stubbing at the level of Math.random ... Still all of our tests are green ...

```
13 specs, 0 failures
Airport
  has no planes by default
  under normal conditions
    can clear planes for landing
    can clear planes for takeoff
  under stormy conditions
    does not clear planes for landing
    does not clear planes for takeoff
Plane
  can land at an airport
  can takeoff from an airport
Weather
  gives stormy sometimes
  gives not stormy other times
Feature Test:
  under normal conditions
    planes can be instructed to land at an airport
    planes can be instructed to takeoff
  under stormy conditions
    blocks takeoff when weather is stormy
    blocks landing when weather is stormy
```

In Ruby the ability to call sample on an array means we can have a more readable stub such as `allow(Weather::CONDITIONS).to receive(:sample).and_return(:stormy)` which effectively stubs at the same level, but is clearer in terms of what it does.  We could get to the same level of readability by creating a sample method for the JavaScript array class, but that's beyond the scope of this walkthrough.

Exercise of the interested reader - add a capacity to the airport that when exceeded prevents planes from landing.

Full code for above (but in ES5 syntax) available at: https://github.com/tansaku/airport_js

