module.exports = function (template, data) {
  // Delegate
  if (data.type) {
    require('./' + data.type)(template, data)
  }
}
