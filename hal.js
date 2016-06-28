var Transform = require('stream').Transform;  
var inherits = require('util').inherits;

module.exports = JSONEncode;

function JSONEncode(options) {  
  if ( ! (this instanceof JSONEncode))
    return new JSONEncode(options);

  // if (! options) options = {};
  // options.objectMode = true;
  Transform.call(this, options);
}

inherits(JSONEncode, Transform);

JSONEncode.prototype._transform = function _transform(chunk, enc, callback) {  
  var buffer = (Buffer.isBuffer(chunk)) ? chunk : new Buffer(chunk, enc);
  this.requestedJson = buffer;
  this.encoding = enc;
  callback();
};


JSONEncode.prototype._flush = function (callback) {
  if(!this.requestedJson) {
    callback();
    return;
  }

  var halResponse = this.requestedJson.toString(this.enc);
  
  try {
   var jsonDecoded = JSON.parse(halResponse);
   if(!jsonDecoded._embedded) { callback(); return; }
   
   jsonDecoded.data = jsonDecoded._embedded;
   delete jsonDecoded._embedded;
   
   var rhDoc = jsonDecoded.data['rh:doc'];
   if(rhDoc) {
    jsonDecoded.data.items = rhDoc;
    for(var i = 0; i < rhDoc.length; i += 1) {
      if(jsonDecoded.data.items[i]._id['$oid']) {
        // translate according to client. overriding _id here.
        jsonDecoded.data.items[i]._id = jsonDecoded.data.items[i]._id['$oid'];
      }
    }
    delete jsonDecoded.data['rh:doc'];
   }

   var rhColl = jsonDecoded.data['rh:coll'];
   if(rhColl) {
      jsonDecoded.data.items = rhColl;
      delete jsonDecoded.data['rh:coll'];
   }

   jsonDecoded.status_code = 200;
   this.push(new Buffer(JSON.stringify(jsonDecoded)));
 } catch(er) {
   console.error(er);
   this.push(new Buffer('{"status_code":500,"error":"Error occurred in Transform"}'));
 } //this.push(this.requestedJson);
 callback();
}
