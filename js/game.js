// paperjs has to have this run before
// any modules can reference paper variables
// todo--better, more modular way to do this?
paper.install(window);
paper.setup('fishies');

define(function(require) {
    'use strict';

    var 
    Fish = require('fish'),
    C    = require('constants'),
    Util = require('util');
    

    var Game = {
        start: function() {
            this.player = new Fish(view.bounds.center);
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

        loop: function(e) {

            if (!this.started) {
                return;
            }

            var player = this.player;

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
            var playerBounds = player.strokeBounds;

            if (!view.bounds.contains(playerBounds)) {
                
                // fixme: player can still get stuck. detection isn't 
                var nx = playerBounds.width / 2, ny = playerBounds.height / 2;
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
            _.forEach(project.activeLayer.children, function(otherFish) {
                if (player.id === otherFish.id) {
                    return;
                }
                
                var 
                otherBounds = otherFish.strokeBounds,
                overlap = otherBounds.intersect(playerBounds),
                overlapArea = overlap.width * overlap.height,
                otherArea   = otherBounds.width * otherBounds.height;

                if (overlapArea / otherArea > C.MIN_EAT_OVERLAP & overlap.width > 0) {
                    if (playerBounds.width > otherBounds.width) {
                        player.scale((playerBounds.width + C.SIZE_GAIN * (otherBounds.width / playerBounds.width + 0.3)) / playerBounds.width);
                        otherFish.remove();
                        this.score++;
                    } else {
                        this.end();
                    }
                }
                
                otherFish.position = otherFish.position.add(otherFish.velocity);

                // todo: add GC
                /*if (!other_bounds.intersects(view.bounds) && !view.bounds.contains(other_bounds)) {
                  otherFish.remove();
                  }*/
            }, this);
            
            Util.decelerate(player.velocity);

            // generate fishes every second
            if (e.time - this.lastFish >= C.FISH_SPAWN_TIME) {
                this.newEnemy();
                this.lastFish = e.time;
            }
        },

        newEnemy: function() {
            var pos = Math.random() * view.bounds.height;
            var side = Math.random() > 0.5;
            var enemy = new Fish([side ? view.bounds.width : 0, pos]);
            
            var cur_scale = this.player.strokeBounds.width / enemy.strokeBounds.width;
            var rand = (Math.random() * 2 - 1) * (C.MAX_ENEMY_VARIANCE - C.MIN_ENEMY_VARIANCE);
            rand += Util.sign(rand) * C.MIN_ENEMY_VARIANCE;

            var scale = cur_scale + rand;
            enemy.scale(scale);

            enemy.position.x += (side ? 1 : -1) * enemy.strokeBounds.width / 2;
            
            enemy.addVelocity([(side ? -1 : 1) * 3 * (cur_scale / scale), 0]);
            enemy.children[0].fillColor = '#' + (Math.round(0xffffff * Math.random())).toString(16);
            enemy.rotate(side ? 0 : 180);
        }
    };

    view.onFrame = _.bind(Game.loop, Game);

    return Game;
});
