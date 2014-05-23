Meteor.publish('matches', function() {
  return Matches.find();
});

Meteor.publish('players', function() {
  return Players.find();
});

Meteor.publish('singles_ratings', function() {
  return SinglesRatings.find();
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

var updateRating = function(date, player_id, rating, opponent_rating,
                             rating_to_adjust, win, collection) {
  var S = (win ? 1 : 0);
  var We = winExpectancy(rating, opponent_rating);
  var Rn = rating_to_adjust + (K_RATING_COEFFICIENT * (S - We));

  collection.insert({
    date_time: date,
    player_id: player_id,
    rating: Rn
  });

  return Rn;
};

/**
   * @param {string} player_name - name of the player
   * @param {string} rating - initial player rating
   * @return {string} id of the record
   */
var addPlayer = function(player_name, rating) {
  var id = Players.findOne({name: player_name});
  if (id) {
    // player already in database, no need to add again
    console.log('id already exists: ' + id._id);
    return id._id;
  }

  // didn't find player above, so add one now
  id = Players.insert({
    date_time: Date.now(),
    name: player_name
  });

  SinglesRatings.insert({
    date_time: Date.now(),
    player_id: id,
    rating: rating
  });

  return id;
};

var getPlayerId = function(player_name) {
  var id = Players.findOne({name: player_name});
  if (id) {
    return id._id;
  } else {
    // it should never get here since the MatchFormSchema should handle
    // making sure the player exists first
    return undefined;
  }
};

var getPlayerName = function(player_id) {
  var name = Players.findOne({_id: player_id});
  if (name) {
    return name.name;
  } else {
    return undefined;
  }
};

var update1v1Ratings = function(ratingValues) {
  // update singles ratings
  updateRating(ratingValues.date, ratingValues.ro_id,
               ratingValues.last_ro_singles_rating.rating,
               ratingValues.last_bo_singles_rating.rating,
               ratingValues.last_ro_singles_rating.rating,
               ratingValues.red_won, SinglesRatings);
  updateRating(ratingValues.date, ratingValues.bo_id,
               ratingValues.last_bo_singles_rating.rating,
               ratingValues.last_ro_singles_rating.rating,
               ratingValues.last_bo_singles_rating.rating,
               !ratingValues.red_won, SinglesRatings);
};

var updateAllRatings = function(doc, date) {
  var ro_id, bo_id;
  var last_ro_singles_rating, last_bo_singles_rating;

  if (typeof doc.ro !== 'undefined') {
    ro_id = getPlayerId(doc.ro);
    last_ro_singles_rating = SinglesRatings.findOne(
      {player_id: ro_id}, {sort: {date_time: -1}});
  }
  if (typeof doc.bo !== 'undefined') {
    bo_id = getPlayerId(doc.bo);
    last_bo_singles_rating = SinglesRatings.findOne(
      {player_id: bo_id}, {sort: {date_time: -1}});
  }

  var red_won;
  if (parseInt(doc.rs) > parseInt(doc.bs)) {
    red_won = true;
  } else {
    red_won = false;
  }

  var ratingValues = {
    date: date,
    ro_id: ro_id,
    bo_id: bo_id,
    red_won: red_won,
    last_ro_singles_rating: last_ro_singles_rating,
    last_bo_singles_rating: last_bo_singles_rating
  };
  update1v1Ratings(ratingValues);
};

Meteor.startup(function() {
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

  var insertMatch = function(doc) {
    var ro_id, rd_id, bo_id, bd_id;
    if (typeof doc.ro !== 'undefined') {
      ro_id = getPlayerId(doc.ro);
    }
    if (typeof doc.bo !== 'undefined') {
      bo_id = getPlayerId(doc.bo);
    }
    
    Matches.insert({
      date_time: Date.now(),
      ro_id: ro_id,
      bo_id: bo_id,
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
    },

    add_player: function(doc) {
      check(doc, PlayerFormSchema);
      addPlayer(doc.player_name, doc.rating);
    }
  });
});