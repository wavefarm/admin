var fs = require('fs')

var t, tPath
module.exports = function (tName) {
  tPath = __dirname + tName
  if (!fs.existsSync(tPath)) return ''
  t = fs.createReadStream(tPath, {encoding: 'utf8'})
  t.stats = fs.statSync(tPath)
  return t
}
