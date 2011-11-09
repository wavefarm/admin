// Set up app
var app;
// Set async to false so it's available on page load
$.ajax({
  url: '_app', 
  async: false,
  appType: 'json',
  success: function(data) {
    app = data;
  }
});

// Add routing 
app.routes = [];
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
      // return capture groups as first param
      route.cb(route.re.exec(hash), query);
      break;
    }
  }
  if (ret404) {
    $('#main').html('<p>404</p>');
  }
};

// Other app methods
app.request = function(options) {
  var defaults = {
    url: '_search',
    contentType: 'application/json',
    dataType: 'json',
    processData: false,
    type: 'POST'
  };
  $.ajax(_.defaults(options, defaults));
};


// routes
app.route('', function() {
  window.location = '#dash';
});
app.route('dash', function(captures, query) {
  $('#main').html(whiskers.render(app.templates.dash));
  var showResults = function(data) {
    var result, results = data.hits.hits;
    for (var i=0, l=results.length; i<l; i++) {
      results[i] = results[i]._source;
    }
    var context = {results: results};
    $('section.content').html(whiskers.render(app.templates.results, context));
  };
  if (query.q) {
    $('form.search input[name=q]').val(query.q);
    // the most basic of query parsing
    var parsed = (function(q) {
      if (q.indexOf(':') == -1) {
        return q+' main:('+q+')';
      }
      return q;
    })(query.q);
    var search = JSON.stringify({query: {query_string: {query: parsed}}});
    app.request({
      data: search, 
      error: function() {
        $('section.content').html('<div class="results"><p>No results.</p></div>');
      },
      success: showResults
    });
  } else {
    app.request({
      data: JSON.stringify({
        query: {match_all: {}},
        sort: [{timestamp: 'desc'}]
      }),
      success: showResults
    });
  }
});
app.route('dash/([0-9a-f]{7})', function(captures, query) {
  $('#main').html(whiskers.render(app.templates.dash));
  var id = captures[1];
  app.request({
    url: '_get?id='+id,
    type: 'GET',
    success: function(data) {
      data.raw = JSON.stringify(data, null, '  ');
      var context = {item: data};
      $('section.content').html(whiskers.render(app.templates.item, context));
    }
  });
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
