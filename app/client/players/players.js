Template.rankings.helpers({
  players: function() {
    return Players.find({$or: [{ wins: {$gt: 0}}, {losses: {$gt: 0}}]}, {sort: {rating: -1}});
  }
});

Template.player_form.events({
  'click button.cancel': function () {
    history.back();
  },
})

Template.player_list.helpers({
  players: function() {
    return Players.find({}, {sort: {name: 1}});
  }
});

Template.new_players.helpers({
  players: function() {
    return Players.find({}, {sort: {date_time: -1}, limit: 10});
  }
});

Template.player_games.helpers({
  matches: function() {
    return Matches.find({$or: [{ ro_id: this._id}, {bo_id: this._id}]}, {sort: {date_time: -1}, limit: 10});
  }
});

Template.player_game_row.helpers({
  isPlayer: function(player, currentId) {
    return player._id==currentId;
  }
});

Template.player_opponents.helpers({
  getOpponents: function(playerId) {
    var playerCounts = {};
    var matches = Matches.find({$or: [{ ro_id: playerId}, {bo_id: playerId}]}, {});
    var players = Players.find({});
    
    // Initialize data
    players.forEach(function(player) {
      if(playerId!=player._id) {
        playerCounts[player._id] = {
          games: 0, 
          wins: 0, 
          losses: 0
        };  
      }
    });
    
    // Get data for each match
    matches.forEach(function(match){
      if (match.ro_id == playerId) {
        // Current player is red
        playerCounts[match.bo_id].games++;
        if(match.rs>match.bs) {
          // if red (current player) won
          playerCounts[match.bo_id].wins++;
        } else {
          // if blue (opponent) won
          playerCounts[match.bo_id].losses++;
        }
      } else {
        // current player is blue
        playerCounts[match.ro_id].games++;
        if(match.bs>match.rs) {
          // if red (current player) won
          playerCounts[match.ro_id].wins++;
        } else {
          // if blue (opponent) won
          playerCounts[match.ro_id].losses++;
        }
      }
    });
    
    // build opponent data array for template
    var opponents = [];
    for (var key in playerCounts) {
      opponents.push({
        playerId: key, 
        count: playerCounts[key].games,
        wins: playerCounts[key].wins,
        losses: playerCounts[key].losses
      });
    }
    
    // Sort opponents from most-played to least
    return opponents.sort(function(obj1, obj2) {
      return obj2.count - obj1.count;
    });
  }
});

// Form hooks
AutoForm.hooks({
  playerForm: {
    // add timestamp, and initial values for rating, wins, and losses.
    before: {
      insert: function(doc, template) {
        doc.date_time = Date.now();
        doc.rating = 1200;
        doc.wins = 0;
        doc.losses = 0;
        return doc;
      }
    },
    onSuccess: function(operation, result, template) {
      if(operation=="update") {
        AutoForm.resetForm(playerForm);
        history.back();
      }
    }
  }
});