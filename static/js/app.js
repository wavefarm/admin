// Populate window.app

(function(global) {
  // Use lower-level ajax function to set async to false 
  // so this is available on page load
  $.ajax({
    url: '_app', 
    async: false,
    dataType: 'json',
    success: function(data) {
      global.app = data;
    }
  });
})(this);
