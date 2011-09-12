// Set up app
var app;
// Use lower-level ajax function to set async to false 
$.ajax({
  url: '_app', 
  async: false,
  appType: 'json',
  success: function(data) {
    app = data;
    app.routes = [];
    // Add routing functionality
    app.route = function(re, cb) {
      if (typeof re == 'string') re = new RegExp('^'+re+'$');
      app.routes.push({re: re, cb: cb});
    };
    app.load = function(hash) {
      var hashArr = hash.split('?');
      hash = hashArr.shift();
      var query = $.deparam(hashArr.join('?'));
      var route, ret404 = true;
      for (var i=0, l=app.routes.length; i<l; i++) {
        route = app.routes[i];
        if (route.re.test(hash)) {
          ret404 = false;
          // return capture groups as second param
          route.cb(query, route.re.exec(hash));
          break;
        }
      }
      if (ret404) {
        $('#main').html('<p>404</p>');
      }
    };
  }
});

// routes
app.route('', function() {
  window.location = '#dash';
});
app.route('dash', function(query) {
  $('#main').html(whiskers.render(app.templates.dash));
  if (query.q) {
    $('form.search input[name=q]').val(query.q);
  }
});
app.route('dash/([0-9a-f]{7})', function(query, captures) {
  $('#main').html(whiskers.render(app.templates.item));
});
app.route('models', function() {
  $('#main').html('<section class="models"><h1>Models</h1></section>');
});
app.route('templates', function() {
  $('#main').html('<section class="templates"><h1>Templates</h1></section>');
});
app.route('users', function() {
  $('#main').html('<section class="users"><h1>Users</h1></section>');
});

// let's roll
$(function() {
  $(window).bind('hashchange', function(e) {
    var hash = e.fragment;
    app.load(hash);
  });
  $(window).trigger('hashchange');
});

// dashboard js
$('form.search').live('submit', function() {
  $.bbq.pushState('#dash?q='+encodeURIComponent($(this).find('input[name=q]').val()));
  return false;
});
