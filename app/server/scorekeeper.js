Meteor.publish('matches', function() {
  return Matches.find();
});

Matches.allow({
  insert: function(userId, doc) {
    return true;
  },
  update: function(userId, doc, fieldNames, modifier) {
    return !! userId;
  },
  remove: function(userId, doc) {
    return !! userId;
  },
  fetch: []
});

Matches.after.insert(function (userId, doc) {
  updateAllRatings(doc);
});

Matches.after.update(function (userId, doc, fieldNames, modifier, options) {
  recalc();
});

Meteor.publish('players', function() {
  var fields = {
    _id:1,
    date_time: 1,
    name:1, 
    rating:1,
    wins:1,
    losses:1
  }
  return Players.find({}, {fields: fields});
});

Players.allow({
  insert: function() {
    return true;
  },
  update: function(userId, doc) {
    return !! userId;
  },
  fetch: []
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
  
  return Math.round(Rn);
};

var updateAllRatings = function(doc) {
  var red_won;
  var newRating1, newRating2, newWins1, newWins2, newLosses1, newLosses2;
  if (parseInt(doc.rs) > parseInt(doc.bs)) {
    red_won = true;
  } else {
    red_won = false;
  }
  
  var user1 = Players.findOne({"_id": doc.ro_id});
  var user2 = Players.findOne({"_id": doc.bo_id});
  
  // Calculate new ratings
  newRating1 = updateRating(user1.rating, user2.rating, red_won);
  newRating2 = updateRating(user2.rating, user1.rating, !red_won);
  
  // Calculate new win/ loss counts
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
  
  // Update user data
  Players.update(user1._id,{
    $set : {
      'rating':newRating1,
      'wins':newWins1,
      'losses':newLosses1
    }
  });
  Players.update(user2._id,{
    $set : {
      'rating':newRating2,
      'wins':newWins2,
      'losses':newLosses2
    }
  });
};

var recalc = function() {
  console.log('recalculating ratings');

  var INITIAL_RATING = 1200;
  var players = Players.find({}, {sort: {date_time: 1}});
  players.forEach(function(player) {
    // add an initial rating for each rating being tracked
    Players.update(player._id,{
      $set : {
        'rating':INITIAL_RATING,
        'wins': 0,
        'losses': 0
      }
    });
  });

  var matches = Matches.find({}, {sort: {date_time: 1}});
  matches.forEach(function(match) {
    var doc = ({
      ro_id: match.ro_id,
      bo_id: match.bo_id,
      rs: match.rs,
      bs: match.bs
    });
    updateAllRatings(doc);
  });
}

Meteor.methods({
  deleteMatch: function (id) {
    Matches.remove(id);
    recalc();
    return true;
  }
});

Meteor.startup(function() {
  if(Players.find().count()>0 && Matches.find().count()>0) {
    recalc();
  }
  if(Meteor.users.find().count()===0)
    {
      Accounts.createUser({
        username: "admin",
        password: "changeme"
      });
    }
});