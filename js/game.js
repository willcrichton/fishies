// paperjs has to have this run before
// any modules can reference paper variables
// todo--better, more modular way to do this?
paper.install(window);
paper.setup('fishies');

define(function(require) {
    'use strict';

    // prevent JS files from getting cached (for development)
    requirejs.config({urlArgs: 'bust=' + (new Date()).getTime()});
    
    var Fish = require('fish');
    var C    = require('constants');

    var fishes = [];

    var player = new Fish([100, 100]);
    fishes.push(player);

    function sign(n) { return n > 0 ? 1 : -1; }

    function decelerate(velocity) {
        var decel0 = velocity[0] + -1 * sign(velocity[0]) * C.DECELERATION;
        velocity[0] = velocity[0] > 0 ? Math.max(decel0, 0) : Math.min(decel0, 0);

        var decel1 = velocity[1] + -1 * sign(velocity[1]) * C.DECELERATION;
        velocity[1] = velocity[1] > 0 ? Math.max(decel1, 0) : Math.min(decel1, 0);

        return velocity;
    }

    view.onFrame = function() {

        // handle keyboard events for moving fish
        if (Key.isDown('w') || Key.isDown('up')) { 
            player.addVelocity([0, -C.ACCELERATION]);
        } else if (Key.isDown('s') || Key.isDown('down')) {
            player.addVelocity([0, C.ACCELERATION]);
        } 
        
        if (Key.isDown('a') || Key.isDown('left')) {
            player.addVelocity([-C.ACCELERATION, 0]);
        } else if (Key.isDown('d') || Key.isDown('right')) {
            player.addVelocity([C.ACCELERATION, 0]);
        }

        // run our fancy 2D physics
        _.forEach(fishes, function(fish) {
            
            // calculate velocity with deceleration
            var velocity = decelerate(fish.velocity);

            // move the fish by the given velocity
            fish.position = fish.position.add(fish.velocity);
            
            if (!view.bounds.contains(fish.strokeBounds)) {
                fish.position = fish.position.subtract(fish.velocity);
                
                // todo: rather than eliminating velocity altogether, 
                // only remove component corresponding to the side of the
                // view that we collide with
                fish.velocity = [0, 0];
            }


            // change the fish's orientation accordingly
            if ((velocity[0] > 0 && fish.orientation == C.LEFT) ||
               (velocity[0] < 0 && fish.orientation == C.RIGHT)) {
                fish.rotate(180);
                fish.orientation = !fish.orientation;
            }
        });
    }

    view.draw();
});
