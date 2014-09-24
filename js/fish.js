/*
 * fish.js: defines the Fish class, the main entity in the game
 */

define(function(require) {
    'use strict';

    var
    C    = require('constants'),
    Util = require('util');

    function Fish(position) {

        // our Fish is an instance of a paper Group
        Group.call(this);

        var start = new Point(0, 0);

        // points of fish outline
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
        this.outline = outline;
        this.position = position;
        this.orientation = C.LEFT;
        this.velocity = [0, 0];
    }

    Fish.prototype = Object.create(Group.prototype);

    Fish.prototype.addVelocity = function(vector) {
        this.velocity = [Util.addVelocity(this.velocity[0], vector[0]),
                         Util.addVelocity(this.velocity[1], vector[1])];
    };

    Fish.prototype.setColor = function(color) {
        this.outline.fillColor = color;
    };

    Fish.prototype.getColor = function() {
        return this.outline.fillColor;
    }

    return Fish;
});
