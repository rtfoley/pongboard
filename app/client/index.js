Accounts.ui.config({
  passwordSignupFields: 'USERNAME_ONLY'
});

Deps.autorun(function(){
  Meteor.subscribe('users');
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
Handlebars.registerHelper('formatDate', function(datetime) {
  return moment(datetime).format('MMMM Do YYYY, h:mm:ss a');
});

Template.game_form.helpers({
  matchForm: function() {
    return MatchFormSchema;
  },
  
  players: function() {
    var p = [];
    var uTemp = Meteor.users.find({}, {sort: {username: 1}});
    uTemp.forEach(function(u) {
      var ret = { 
        value: u._id, 
        label: u.username
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

Template.last_10_matches.helpers({
  matches: function() {
    return Matches.find({}, {sort: {date_time: -1}, limit: 10});
  },
  
  findPlayerFromId: function(id) {
    return Meteor.users.findOne({_id: id}).username;
  }
});

Template.individual_stats.helpers({
  players: function() {
    return Meteor.users.find({$or: [{ wins: {$gt: 0}}, {losses: {$gt: 0}}]}, {sort: {rating: -1}});
  },
  
  winPercentage: function(id) {
    var totalGames;
    user = Meteor.users.findOne({_id: id});
    totalGames = user.wins+user.losses;
    if(totalGames===0) {
      return "---"
    } else {
      return Math.round(user.wins/totalGames*100);
    }
  },
  
  roundRating: function(rawRating) {
    return Math.round(rawRating);
  }
});