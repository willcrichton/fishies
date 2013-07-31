// paperjs has to have this run before
// any modules can reference paper variables
// todo--better, more modular way to do this?
paper.install(window);
paper.setup('fishies');

define(function(require) {
    'use strict';

    var Fish = require('fish');
    var C    = require('constants');

    var Game = {
        start: function() {
            this.player = Fish(view.bounds.center);
            this.lastFish = 0;
            this.score = 0;
            this.started = true;

            for (var i = 0; i < 10; i++) {
                this.newEnemy();
            }
        },

        end: function() {
            document.getElementById('dialogue').style.display = 'block';
            document.getElementById('score').innerHTML = 'Your score was ' + this.score;
            project.activeLayer.removeChildren();
            this.started = false;
        },

        newEnemy: function() {
            var pos = Math.random() * view.bounds.height;
            var side = Math.random() > 0.5;
            var enemy = Fish([side ? view.bounds.width : 0, pos]);
            
            var cur_scale = this.player.strokeBounds.width / enemy.strokeBounds.width;
            var rand = (Math.random() * 2 - 1) * (C.MAX_ENEMY_VARIANCE - C.MIN_ENEMY_VARIANCE);
            rand += sign(rand) * C.MIN_ENEMY_VARIANCE;

            var scale = cur_scale + rand;
            enemy.scale(scale);

            enemy.position.x += (side ? 1 : -1) * enemy.strokeBounds.width / 2;
            
            enemy.addVelocity([(side ? -1 : 1) * 3 * (cur_scale / scale), 0]);
            enemy.children[0].fillColor = '#' + (Math.round(0xffffff * Math.random())).toString(16);
            enemy.rotate(side ? 0 : 180);
        }
    }


    function sign(n) { return n > 0 ? 1 : -1; }

    function decelerate(velocity) {
        var decel0 = velocity[0] + -1 * sign(velocity[0]) * C.DECELERATION;
        velocity[0] = velocity[0] > 0 ? Math.max(decel0, 0) : Math.min(decel0, 0);

        var decel1 = velocity[1] + -1 * sign(velocity[1]) * C.DECELERATION;
        velocity[1] = velocity[1] > 0 ? Math.max(decel1, 0) : Math.min(decel1, 0);
    }

    view.onFrame = function(e) {

        if (!Game.started) {
            return;
        }

        var player = Game.player;

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
        
        // handle enemy fish logic and collisions
        _.forEach(project.activeLayer.children, function(other_fish) {
            if (player.id === other_fish.id) {
                return;
            }
            
            var other_bounds = other_fish.strokeBounds;

            if (player_bounds.intersects(other_bounds)) {
                
                if (player_bounds.width > other_bounds.width) {
                    player.scale((player_bounds.width + C.SIZE_GAIN) / player_bounds.width);
                    other_fish.remove();
                    Game.score++;
                } else {
                    Game.end();
                }
            }
            
            other_fish.position = other_fish.position.add(other_fish.velocity);

            // todo: add GC
            /*if (!other_bounds.intersects(view.bounds) && !view.bounds.contains(other_bounds)) {
              other_fish.remove();
              }*/
        });
        
        decelerate(player.velocity);

        // generate fishes every second
        if (e.time - Game.lastFish >= C.FISH_SPAWN_TIME) {
            Game.newEnemy();
            Game.lastFish = e.time;
        }
    }

    return Game;

});
