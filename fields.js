var hyperglue = require('hyperglue');

function defaultRender (type) {
  return function (name, value) {
    return hyperglue('<div class="label"><label></label></div><div class="input"><input></div>', {
      label: {
        'for': name + '-input',
        _text: name
      },
      '.input input': {
        id: name + '-input',
        name: name,
        type: type || 'text',
        value: String(value)
      }
    });
  };
}

var inputMap = {
  'boolean': function (name, value) {
    var input = {id: name + '-input', name: name};
    if (value) input.checked = 'checked';
    return hyperglue('<label></label> <input type="checkbox">', {
      label: {
        'for': name + '-input',
        _text: name
      },
      input: input
    });
  },
  date: defaultRender('date'),
  text: function (name, value) {
    return hyperglue('<div class="label"><label></label></div><textarea></textarea>', {
      label: {
        'for': name + '-input',
        _text: name
      },
      textarea: {
        id: name + '-input',
        name: name,
        _text: value
      }
    })
  },
  url: defaultRender('url')
};

function relRender (type) {
  var rel = type.substr(type.indexOf(':') + 1);
  return function (name, value) {
    value = value || [];
    return hyperglue('<div class="label"><label></label></div><textarea></textarea>', {
      label: {
        'for': name + '-input',
        _text: name
      },
      'textarea': {
        'data-rel': rel,
        id: name + '-input',
        name: name,
        'class': 'rel',
        _text: value.map(function (item) {
          return item.id + ' ' + item.main;
        }).join('\n'),
      }
    });
  };
}
  

function fieldWidget (item, schema) {
  return function (fieldName) {
    var field = schema.fields[fieldName];
    var renderInput = inputMap[field.type] || defaultRender();
    if (field.type && field.type.indexOf('rel:') == 0) renderInput = relRender(field.type);
    return {div: {_html: renderInput(fieldName, item[fieldName]).innerHTML}};
  };
}

module.exports = function (item, schema) {
  return schema && schema.item && schema.item.map(fieldWidget(item, schema));
};
