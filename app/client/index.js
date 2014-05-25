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
    return Meteor.users.find({}, {sort: {rating: -1}});
  },
  
  winPercentage: function(id) {
    user = Meteor.users.findOne({_id: id});
    return Math.round(user.wins/(user.wins+user.losses)*100);
  }
});