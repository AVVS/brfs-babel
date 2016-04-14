var babel = require('babel-core');
var through = require('through2');
var staticFs = require('babel-plugin-static-fs');
var path = require('path');
var ignoreDefaults = ['json'];

module.exports = babelBrfs;
function babelBrfs (filename, opts) {
  var ext = path.extname(filename);
  var ignore = opts && opts.ignore || ignoreDefaults;
  var iterator;
  for (var i = 0, l = ignore.length; i < l; i++) {
    iterator = ignore[i];
    if (ignore === iterator || ignore === '.' + iterator) {
      return through();
    }
  }

  var input = '';
  return through(write, flush);

  function write (buf, enc, next) {
    input += buf.toString();
    next();
  }

  function flush (next) {
    var result;
    try {
      result = babel.transform(input, {
        plugins: [
          [ staticFs, {
            // ensure static-fs files are discovered
            onFile: this.emit.bind(this, 'file')
          } ]
        ],
        filename: filename
      });
      this.push(result.code);
      this.push(null);
      next();
    } catch (err) {
      next(err);
    }
  }
}
