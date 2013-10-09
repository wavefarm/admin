var api = require('../api')
var fields = require('../fields');
var fs = require('fs')

function defaultClean (value) {
  return String(value);
}

function relClean (value) {
  return value.split(/\n/).map(function (rel) {
    var relArr = rel.match(/^(.+?)\s+(.+)\s*$/);
    return {
      id: relArr[1],
      main: relArr[2]
    };
  });
}

var cleanMap = {
  'boolean': function (value) {
    return !!value;
  }
};

function getClean (type) {
  var clean;
  if (type && type.indexOf('rel:') == 0) clean = relClean;
  else clean = cleanMap[type] || defaultClean;
  return clean;
}

module.exports = function (req, res, next, id) {
  var item = JSON.parse(req.parsedBody.raw);
  var schema = req.schemas[item.type];
  schema.item.forEach(function (fieldName) {
    var field = schema.fields[fieldName];
    var value = req.parsedBody[fieldName];
    var clean = getClean(field.type);
    item[fieldName] = clean(value);
  });
  api.put(id, item, function (err, apiRes, newItem) {
    if (err) return next(err)
    if (apiRes.statusCode == 400) {
      // Problem saving. Render the form and display the errors.
      var raw = JSON.stringify(item, null, 2);
      return res.render('item.html', {
        title: item.main,
        '.item-id span': item.id,
        '.item-name': item.main,
        '.item-type span': item.type,
        '#raw': raw,
        'input[name=raw]': {value: raw},
        '.form-field': fields(item, schema)
      })
    }
    res.statusCode = 303
    res.setHeader('location', '/' + id)
    res.end()
  })
}
