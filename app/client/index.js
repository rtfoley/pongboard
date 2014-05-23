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

var pad = function(num, size) {
  var s = num + '';
  while (s.length < size) {
    s = '0' + s;
  }
  return s;
};

Handlebars.registerHelper('formatDate', function(datetime) {
  var monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  var dt = new Date(datetime);
  var d = dt.getDate();
  var m = monthNames[dt.getMonth()];
  var y = dt.getFullYear();
  var h = dt.getHours();
  var min = dt.getMinutes();
  var s = dt.getSeconds();
  return (y + m + d + ' ' + pad(h, 2) + ':' + pad(min, 2) + ':' + pad(s, 2));
});

Handlebars.registerHelper('findPlayerFromId', function(player_id) {
  var player = Players.findOne({_id: player_id});
  if (typeof player !== 'undefined') {
    return player.name;
  } else {
    return 'N/A';
  }
});

Handlebars.registerHelper('findPlayerFirstEloRatingFromId',
                          function(player_id) {
  var elo_rating = SinglesRatings.findOne({player_id: player_id},
                                           {sort: {date_time: 1}});
  if (typeof elo_rating !== 'undefined') {
    return elo_rating.rating;
  } else {
    return 'N/A';
  }
});

Template.game_form.helpers({
  matchForm: function() {
    return MatchFormSchema;
  }
});

Template.player_form.helpers({
  playerForm: function() {
    return PlayerFormSchema;
  }
});

var findPlayerLatestEloRatingFromId = function(player_id, collection) {
  var elo_rating = collection.findOne({player_id: player_id},
                                      {sort: {date_time: -1}});
  if (typeof elo_rating !== 'undefined') {
    return +elo_rating.rating.toFixed(0);
  } else {
    return 'N/A';
  }
};

var addIndPlayersArray = function(players, id, win, loss) {
  if (typeof players[id] !== 'undefined') {
    players[id] = ({
      wins: players[id].wins + win,
      losses: players[id].losses + loss
    });
  } else {
    if ((typeof id !== 'undefined') && (id)) {
      players[id] = ({
        wins: win,
        losses: loss
      });
    }
  }
};

var printObjectProperties = function(obj) {
  console.log('object:');
  for (var param in obj) {
    if (object.hasOwnProperty(param)) {
      console.log('  ' + param + ' = ' + obj[param]);
    }
  }
};

Template.header.events({
  'click #menu-toggle': function() {
    $('#wrapper').toggleClass('active');
  }
});


/** after home template is rendered */
Template.home.rendered = function() {
  
};


/** after game_form template is rendered */
Template.game_form.rendered = function() {
  var players = Players.find({}).fetch();
  var names = [];
  players.forEach(function(player) {
    names.push(player.name);
  });

  $('.input_autocomplete').autocomplete({
    source: names
  });
};

Template.game_form.helpers({
  
});

Template.last_10_matches.helpers({
  matches: function() {
    return Matches.find({}, {sort: {date_time: -1}, limit: 10});
  }
});

Template.last_10_players.helpers({
  players: function() {
    return Players.find({}, {sort: {date_time: -1}, limit: 10});
  }
});

Template.individual_stats.helpers({
  score: function() {
    var cursor = Matches.find({});
    var players = {};
    // loop through Matches to find all individuals and tally up scores
    cursor.forEach(function(match) {
      var red_win = 0;
      var blue_win = 0;
      if (parseInt(match.rs, 10) > parseInt(match.bs, 10)) {
        red_win = 1;
      } else {
        blue_win = 1;
      }

      addIndPlayersArray(players, match.ro_id, red_win, blue_win);
      addIndPlayersArray(players, match.bo_id, blue_win, red_win);
    });

    // now create a list that can be used for display
    var p = [];
    for (var id in players) {
      if (players.hasOwnProperty(id)) {
        var per = (players[id].wins /
          (players[id].wins + players[id].losses));
        if (typeof id !== 'undefined') {
          var player = Players.findOne({_id: id});
          p.push({
            name: player.name,
            wins: players[id].wins,
            losses: players[id].losses,
            percent: +(per * 100).toFixed(0) + '%',
            singles_rating: findPlayerLatestEloRatingFromId(id,
                                                            SinglesRatings)
          });
        }
      }
    }

    return p;
  }
});