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
});