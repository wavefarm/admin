var whiskers = require('lib/whiskers');

$(function() {
  $('form.search').submit(function() {
    $.bbq.pushState('#q='+encodeURIComponent($(this).find('input[name=q]').val()));
    return false;
  });
  $(window).bind('hashchange', function(e) {
    var hash = e.fragment;
    var routes = {
      'templates': function() {
        $('#main').html('<section class="templates"><h1>Templates</h1></section>');
      },
      'models': function() {
        $('#main').html('<section class="models"><h1>Models</h1></section>');
      },
      'users': function() {
        $('#main').html('<section class="users"><h1>Users</h1></section>');
      }
    };
    if (routes[hash]) {
      routes[hash]();
    } else {
      if (hash.indexOf('q=') == 0) {
        $('form.search input[name=q]').val(decodeURIComponent(hash.substr(2)));
      }
      $('section.results').html('<p>bob</p>');
    }
  });
  $(window).trigger('hashchange');
});
