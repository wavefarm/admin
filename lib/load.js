var fs = require('fs')

module.exports = function load (path) {
  return function (req, res, next) {
    fs.readFile('static/templates/'+path, 'utf8', function (err, template) {
      if (err) return next(err)
      if (!res.templates) res.templates = {}
      res.templates[path] = template
      next()
    })
  }
}
