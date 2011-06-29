$(function() {
  $('form.search').submit(function() {
    $.bbq.pushState('#docs?q='+encodeURIComponent($(this).find('input[name=q]').val()));
    return false;
  });
  $(window).bind('hashchange', function(e) {
    var hash = e.fragment;
    var query = {};
    var section = '';
    if (hash.indexOf('?') > -1) {
      query = $.deparam(hash.slice(hash.indexOf('?')+1, hash.length));
      section = hash.slice(0, hash.indexOf('?'));
    }
    $('form.search input[name=q]').val(query.q);
  });
  $(window).trigger('hashchange');
});
