define(function(require) {
    var C = require('constants');

    var Achievements = {};
    var earned_achievements = 0;

    Achievements.check = function(score) {
        if (earned_achievements >= C.MESSAGES.length) return; // no more achievements

        var min = C.MESSAGES[earned_achievements][0];
        var msg = C.MESSAGES[earned_achievements][1];

        if (score >= min) {
            document.getElementById('achievements').innerHTML += '<div>' + msg + '</div>';
            earned_achievements++;
        }
    }

    return Achievements;
});