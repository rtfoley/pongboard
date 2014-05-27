// something is not working anymore with respect to the loadingTemplate
// and the waitOn hook, there is a lot of discussion about this here:
// https://github.com/EventedMind/iron-router/issues/265
// functionality changed after Meteor 0.8/iron-router 0.7
// waitOn should not go in the global configure since you shouldn't wait
// on all of the subscriptions for every route, but it is here for now
// to try to figure out what is going on
Router.configure({
  layoutTemplate: 'layout',
  loadingTemplate: 'loading',
  notFoundTemplate: 'notFound',
  waitOn: function() {
    return [Meteor.subscribe('users'),
            Meteor.subscribe('matches')];
  }
});

// in the post above, it was suggested to call if(this.ready()) in the data
// hook to actually get the loadingTemplate to work, so this is being done
// for the home route below
Router.map(function() {
  this.route('home', {
    path: '/',
    layoutTemplate: 'layout',
    waitOn: function() {
      return [Meteor.subscribe('users'),
              Meteor.subscribe('matches')];
    }
  });

  this.route('addmatch', {
    path: '/addmatch',
    waitOn: function() {
      return [Meteor.subscribe('users'),
              Meteor.subscribe('matches')];
    }
  });

  this.route('individual_stats', {
    path: '/individual_stats',
    waitOn: function() {
      return [Meteor.subscribe('users'),
              Meteor.subscribe('matches')];
    }
  });
  
  this.route('games', {
    path: '/games',
    waitOn: function() {
      return [Meteor.subscribe('users'),
              Meteor.subscribe('matches')];
    }
  });

  this.route('rules', {
    path: '/rules'
  });

  // route with name 'notFound' that for example matches
  // '/non-sense/route/that-matches/nothing' and automatically renders
  // template 'notFound'
  // HINT: Define a global not found route as the very last route in your router
  this.route('notFound', {
    path: '*'
  });
});
