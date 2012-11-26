var crypto = require('crypto')

module.exports = function hash (str) {
  var h = crypto.createHash("sha1")
  h.update(str)
  return '"' + h.digest('base64') + '"'
}
