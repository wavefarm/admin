var api = require('../api');
var hyperglue = require('hyperglue');
var fs = require('fs');


function defaultRender (type) {
  return function (name, value) {
    return hyperglue('<div class="label"><label></label></div><div class="input"><input type="' + (type || 'text') + '"></div>', {
      label: {
        'for': name + 'Input',
        _text: name
      },
      '.input input': {
        id: name + 'Input',
        name: name,
        value: String(value)
      }
    });
  };
}

var inputMap = {
  'boolean': function (name, value) {
    var input = {id: name + 'Input', name: name};
    if (value) input.checked = 'checked';
    return hyperglue('<label></label> <input type="checkbox">', {
      label: {
        'for': name + 'Input',
        _text: name
      },
      input: input
    });
  },
  date: defaultRender('date'),
  text: function (name, value) {
    return hyperglue('<div class="label"><label></label></div><textarea></textarea>', {
      label: {
        'for': name + 'Input',
        _text: name
      },
      textarea: {
        id: name + 'Input',
        name: name,
        _text: value
      }
    })
  },
  url: defaultRender('url')
};

function fieldWidget (item, schema) {
  return function (fieldName) {
    var field = schema.fields[fieldName];
    var renderInput = inputMap[field.type] || defaultRender();
    return {div: {_html: renderInput(fieldName, item[fieldName]).innerHTML}};
  };
}

module.exports = function (req, res, next, id) {
  api.get(id, function (err, apiRes, item) {
    if (err) return next(err)
    if (apiRes.statusCode == 404) return next()
    var schema = req.schemas[item.type];
    var fields = schema && schema.item.map(fieldWidget(item, schema));
    res.render('item.html', {
      title: item.main,
      '.item-id span': item.id,
      '.item-name': item.main,
      '.item-type span': item.type,
      '#raw': JSON.stringify(item, null, 2),
      'input[name=raw]': {value: JSON.stringify(item, null, 2)},
      '.form-field': fields
    })
  })
}
