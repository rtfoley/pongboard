Meteor.publish('matches', function() {
  return Matches.find();
});

Meteor.publish('users', function() {
  var fields = {
    _id:1,
    username:1, 
    rating:1,
    wins:1,
    losses:1
  }
  return Meteor.users.find({}, {fields: fields});
});

Accounts.onCreateUser(function(options, user) {
  user.rating = 1200;
  user.wins = 0;
  user.losses = 0;
  // We still want the default hook's 'profile' behavior.
  if (options.profile)
    user.profile = options.profile;
  
  console.log('Look! A new user has been created');
  return user;
});


// define some constants for Elo Ratings
// we are using the Bonzini USA values:
//   http://www.bonziniusa.com/foosball/tournament/TournamentRankingSystem.html
var K_RATING_COEFFICIENT = 50;
var F_RATING_INTERVAL_SCALE_WEIGHT = 1000;

var winExpectancy = function(rating, opponent_rating) {
  var We = 1 / (
    Math.pow(10, (-(rating - opponent_rating) /
                  F_RATING_INTERVAL_SCALE_WEIGHT)) + 1);
  return We;
};

var updateRating = function(rating, opponent_rating, win) {
  
  var S = (win ? 1 : 0);
  var We = winExpectancy(rating, opponent_rating);
  var Rn = rating + (K_RATING_COEFFICIENT * (S - We));
  
  return Rn;
};

var updateAllRatings = function(doc, date) {
  var red_won;
  var newRating1, newRating2, newWins1, newWins2, newLosses1, newLosses2;
  if (parseInt(doc.rs) > parseInt(doc.bs)) {
    red_won = true;
  } else {
    red_won = false;
  }
  
  var user1 = Meteor.users.findOne({"_id": doc.ro});
  var user2 = Meteor.users.findOne({"_id": doc.bo});
  
  newRating1 = updateRating(user1.rating, user2.rating, red_won);
  newRating2 = updateRating(user2.rating, user1.rating, !red_won);
  
  if(red_won) {
    newWins1 = user1.wins + 1;
    newLosses1 = user1.losses;
    newWins2 = user2.wins;
    newLosses2 = user2.losses + 1;
  } else {
    newWins1 = user1.wins;
    newLosses1 = user1.losses + 1;
    newWins2 = user2.wins + 1;
    newLosses2 = user2.losses;
  }
  
  // Meteor.users.update()...
  Meteor.users.update(user1._id,{
    $set : {
      'rating':newRating1,
      'wins':newWins1,
      'losses':newLosses1
    }
  });
  Meteor.users.update(user2._id,{
    $set : {
      'rating':newRating2,
      'wins':newWins2,
      'losses':newLosses2
    }
  });
};

Meteor.startup(function() {
  /*
  if (Meteor.settings.recalculate_ratings === 'true') {
    console.log('recalculating ratings');

    SinglesRatings.remove({});

    var INITIAL_RATING = 1250;
    var players = Players.find({}, {sort: {date_time: 1}});
    players.forEach(function(player) {
      // add an initial rating for each rating being tracked
      SinglesRatings.insert({
        date_time: player.date_time,
        player_id: player._id,
        rating: INITIAL_RATING
      });
    });

    var matches = Matches.find({}, {sort: {date_time: 1}});
    matches.forEach(function(match) {
      var doc = ({
        ro: getPlayerName(match.ro_id),
        bo: getPlayerName(match.bo_id),
        rs: match.rs,
        bs: match.bs
      });
      updateAllRatings(doc, match.date_time);
    });
  }
  */
  var insertMatch = function(doc) {
    Matches.insert({
      date_time: Date.now(),
      ro_id: doc.ro,
      bo_id: doc.bo,
      rs: doc.rs,
      bs: doc.bs
    });
  };
  
  Meteor.methods({
    add_match: function(doc) {
      // check the form against the schema
      check(doc, MatchFormSchema);

      // after the form has been checked, insert the Match into the collection
      insertMatch(doc);

      // update all ratings
      updateAllRatings(doc, Date.now());
    }
  });
});