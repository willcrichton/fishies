/*
 * util.js: various utility functions for the game
 */

define(function(require) {
    'use strict';

    var C = require('constants');

    var Util = {};

    Util.sign = function(n) {
        if (n < 0) { return -1; }
        else if (n > 0) { return 1; }
        else { return 0; }
    };

    Util.decelerate = function(velocity) {
        var decel0 = velocity[0] - Util.sign(velocity[0]) * C.DECELERATION;
        velocity[0] = velocity[0] > 0 ? Math.max(decel0, 0) : Math.min(decel0, 0);

        var decel1 = velocity[1] - Util.sign(velocity[1]) * C.DECELERATION;
        velocity[1] = velocity[1] > 0 ? Math.max(decel1, 0) : Math.min(decel1, 0);
    };

    Util.addVelocity = function(curVel, inc) {
        var newVel = curVel + inc;
        return Util.sign(newVel) * Math.min(Math.abs(newVel), C.MAX_VELOCITY);
    };

    return Util;
});
