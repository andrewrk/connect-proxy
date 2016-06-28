module.exports = URLConverter;

function URLConverter(path) {
  this.path = path;
}

URLConverter.prototype.convert = function() {
  var apiPath = this.path.split("?")[0];
  var queryParameters = this.path.split("?")[1];
  if (apiPath == '/banners/vlp' && undefined != queryParameters) {
    var parameterKey = queryParameters.split("=")[0];
    if(parameterKey == 'area_id') {
      var areaId = queryParameters.split("=")[1];
      var queryForAreaIdFilter = '{"$or":[{"' + parameterKey + '":"' + areaId + '"},{"pan_india":"1"}]}';
      var queryForDateValidation = this.validateDate();
      this.path = apiPath + '?filter={"$and":[' + queryForAreaIdFilter + ',' + queryForDateValidation + ']}';
    }
  }
  return this.path;
}

URLConverter.prototype.validateDate = function() {
  var currentDate = new Date().toISOString().slice(0,10);
  var queryForDateValidation = '{"from_timestamp":{"$lte":"' + currentDate + '"}},' +
      '{"to_timestamp":{"$gte":"' + currentDate + '"}}';
  return queryForDateValidation;
}
