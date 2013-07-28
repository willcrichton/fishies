define(function(require) {
    'use strict';

    var C = require('constants');

    var group = new Group();
    var start = new Point(0, 0);
    var segments = [start, 
                    start.add([20, 10]), 
                    start.add([40, 3]), 
                    start.add([50, 10]), 
                    start.add([50, -10]), 
                    start.add([40, -3]), 
                    start.add([20, -10])];

    var outline = new Path(segments);
    outline.strokeColor = 'black';
    outline.fillColor = '#a00';
    outline.closed = true;
    outline.smooth();
    
    group.addChild(outline);

    var fish = new Symbol(group);

    function addVel(cur, inc) {
        var newVel = cur + inc;
        var sign = newVel > 0 ? 1 : -1;
        return sign * Math.min(Math.abs(newVel), C.MAX_VELOCITY);
    }

    function Fish(position) {
        _.extend(this, fish.place(position));
        this.orientation = C.LEFT;
        this.velocity = [0, 0];
    }

    Fish.prototype = Object.create(PlacedSymbol.prototype);

    Fish.prototype.addVelocity = function(vector) {
        this.velocity = [addVel(this.velocity[0], vector[0]),
                         addVel(this.velocity[1], vector[1])];
    }

    return Fish;
});
