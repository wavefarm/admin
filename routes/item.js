var fs = require('fs')

module.exports = function (req, res, next) {
  data = {
    '.item-name': 'bob',
    '.raw': 'tststst'
  }
  res.render('item.html', data)
}
