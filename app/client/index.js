Accounts.config({
  forbidClientAccountCreation : true
});

Accounts.ui.config({
  passwordSignupFields: 'USERNAME_ONLY'
});

Deps.autorun(function(){
  Meteor.subscribe('players');
  Meteor.subscribe('matches');
});

/** options for the spinner package */
Meteor.Spinner.options = {
  // The number of lines to draw
  lines: 13,
  // The length of each line
  length: 5,
  // The line thickness
  width: 2,
  // The radius of the inner circle
  radius: 8,
  // Corner roundness (0..1)
  corners: 0.7,
  // The rotation offset
  rotate: 0,
  // 1: clockwise, -1: counterclockwise
  direction: 1,
  // #rgb or #rrggbb
  color: '#fff',
  // revolutions per second
  speed: 1,
  // Afterglow percentage
  trail: 60,
  // Whether to render a shadow
  shadow: true,
  // Whether to use hardware acceleration
  hwaccel: false,
  // The CSS class to assign to the spinner
  className: 'spinner',
  // The z-index (defaults to 2000000000)
  zIndex: 2e9,
  // Top position relative to parent in px
  top: '20px',
  // Left position relative to parent in px
  left: 'auto'
};

// Replace this with Moment.js?
UI.registerHelper('formatDate', function(context, options) {
  if(context) {
    return moment(context).format('MMMM Do YYYY, h:mm:ss a');
  }
});

UI.registerHelper('winPercentage', function(wins, losses){
  var totalGames;
  totalGames = wins+losses;
  if(totalGames===0) {
    return "---"
  } else {
    return Math.round(wins/totalGames*100);
  }
});
  
UI.registerHelper('roundRating', function(context, options) {
  if(context) {
    return Math.round(context);
  }
});

UI.registerHelper('findPlayerFromId', function(context, options){
  if(context) {
    return Players.findOne({_id: context}).name;
  }
});

UI.registerHelper('getResultClass', function(thisScore, theirScore) {
  if(thisScore > theirScore) {
    return "winner";
  } else {
    return "loser";
  }
});

UI.registerHelper('getResult', function(thisScore, theirScore) {
  if(thisScore > theirScore) {
    return "W";
  } else {
    return "L";
  }
});

UI.registerHelper('getRank', function(playerId) {
  var players = Players.find({}, {sort: {rating: -1}}).fetch();
  
  // TODO could this use an indexOf somehow, instead of a for loop?
  for (var i=0; i< players.length; i++) {
    if(playerId == players[i]._id) {
      return i+1;
    }
  }
  
  return 0;
})

Template.game_form.helpers({
  players: function() {
    var p = [];
    var uTemp = Players.find({}, {sort: {name: 1}});
    uTemp.forEach(function(u) {
      var ret = { 
        value: u._id, 
        label: u.name
      };
      p.push(ret);
    });
    return p;
  }
});

Template.header.events({
  'click #menu-toggle': function() {
    $('#wrapper').toggleClass('active');
  }
});

Template.game_list.helpers({
  matches: function() {
    return Matches.find({}, {sort: {date_time: -1}});
  }
});

Template.recent_games.helpers({
  matches: function() {
    return Matches.find({}, {sort: {date_time: -1}, limit: 10});
  }
});

Template.rankings.helpers({
  players: function() {
    return Players.find({$or: [{ wins: {$gt: 0}}, {losses: {$gt: 0}}]}, {sort: {rating: -1}});
  }
});

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
  insertPlayerForm: {
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
  },
  insertGameForm: {
    // add timestamp to match
    before: {
      insert: function(doc, template) {
        doc.date_time = Date.now();
        return doc;
      }
    },
  }
});

// debugging only
AutoForm.addHooks(null, {
  after: {
    insert: function(error, result) {
      if (error) {
        console.log("Insert Error:", error);
      }
    },
    update: function(error) {
      if (error) {
        console.log("Update Error:", error);
      }
    },
    remove: function(error) {
      console.log("Remove Error:", error);
    }
  }
});