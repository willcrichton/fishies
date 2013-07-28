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

    var player = Fish([100, 100]);

    function sign(n) { return n > 0 ? 1 : -1; }

    function decelerate(velocity) {
        var decel0 = velocity[0] + -1 * sign(velocity[0]) * C.DECELERATION;
        velocity[0] = velocity[0] > 0 ? Math.max(decel0, 0) : Math.min(decel0, 0);

        var decel1 = velocity[1] + -1 * sign(velocity[1]) * C.DECELERATION;
        velocity[1] = velocity[1] > 0 ? Math.max(decel1, 0) : Math.min(decel1, 0);
    }

    var last_fish = 0;

    window.player = player;

    view.onFrame = function(e) {

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

        // do simple 2D physics for the player
        // calculate velocity with deceleration
        var player_bounds = player.strokeBounds;

        if (!view.bounds.contains(player_bounds)) {
            
            // fixme: player can still get stuck. detection isn't 
            var nx = player_bounds.width / 2, ny = player_bounds.height / 2;
            if ((player.position.x <= nx && player.velocity[0] < 0) ||
                (player.position.x >= view.bounds.width - nx && player.velocity[0] > 0)) {
                player.velocity[0] = 0;
            } else if((player.position.y <= ny && player.velocity[1] < 0) ||
                      (player.position.y >= view.bounds.height - ny && player.velocity[1] > 0)) {
                player.velocity[1] = 0;
            }
        }


        // move the fish by the given velocity
        player.position = player.position.add(player.velocity);
            
            // change the fish's orientation accordingly
        if ((player.velocity[0] > 0 && player.orientation == C.LEFT) ||
            (player.velocity[0] < 0 && player.orientation == C.RIGHT)) {
            player.rotate(180);
            player.orientation = !player.orientation;
        }
        
        // detect collisions with other fishes and move them
        _.forEach(project.activeLayer.children, function(other_fish) {
            if (player.id === other_fish.id) {
                return;
            }
            
            var other_bounds = other_fish.strokeBounds;

            if (player_bounds.intersects(other_bounds)) {
                
                if (player_bounds.width > other_bounds.width) {
                    player.scale((player_bounds.width + C.SIZE_GAIN) / player_bounds.width);
                    other_fish.remove();
                } else {
                    console.log('YOU LOSE');
                }
            }

            other_fish.position = other_fish.position.add(other_fish.velocity);
        });
        
        decelerate(player.velocity);

        // generate fishes every second
        if (e.time - last_fish >= 1) {
            var pos = Math.random() * view.bounds.height;
            var side = Math.random() > 0.5;
            var enemy = Fish([side ? view.bounds.width + 100 : -100, pos]);

            var cur_scale = player_bounds.width / enemy.strokeBounds.width;
            var scale = cur_scale + (Math.random() * 1.8 - 0.9)
            enemy.scale(scale);
            enemy.addVelocity([(side ? -1 : 1) * 3 * (cur_scale / scale), 0]);
            enemy.fill = 'rgb(' + Math.random() * 255 + ', ' + Math.random() * 255 + ', ' + Math.random() * 255 +')';
            enemy.rotate(side ? 0 : 180);

            last_fish = e.time;
        }
    }

    view.draw();
});
