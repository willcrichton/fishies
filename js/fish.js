define(function(require) {
    'use strict';

    var 
    C    = require('constants'),
    Util = require('util');

    function Fish(position) {
        Group.call(this);

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

        this.addChild(outline);
        this.position = position;
        this.orientation = C.LEFT;
        this.velocity = [0, 0];

        this.addVelocity = function(vector) {
            this.velocity = [Util.addVelocity(this.velocity[0], vector[0]),
                             Util.addVelocity(this.velocity[1], vector[1])];
        }
    }

    Fish.prototype = Object.create(Group.prototype);

    return Fish;
});
