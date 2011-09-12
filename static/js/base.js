$(function() {
  $(window).bind('hashchange', function(e) {
    var hash = e.fragment;
    app.load(hash);
  });
  $(window).trigger('hashchange');
});
