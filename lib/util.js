const {app, BrowserWindow, Menu, dialog} = require('electron')
var fs = require('fs');
var path = require('path');

module.exports.clone = function clone(item) {
    if (!item) { return item; } // null, undefined values check

    var types = [ Number, String, Boolean ], 
        result;

    // normalizing primitives if someone did new String('aaa'), or new Number('444');
    types.forEach(function(type) {
        if (item instanceof type) {
            result = type( item );
        }
    });

    if (typeof result == "undefined") {
        if (Object.prototype.toString.call( item ) === "[object Array]") {
            result = [];
            item.forEach(function(child, index, array) { 
                result[index] = clone( child );
            });
        } else if (typeof item == "object") {
            // testing that this is DOM
            if (item.nodeType && typeof item.cloneNode == "function") {
                var result = item.cloneNode( true );    
            } else if (!item.prototype) { // check that this is a literal
                if (item instanceof Date) {
                    result = new Date(item);
                } else {
                    // it is an object literal
                    result = {};
                    for (var i in item) {
                        result[i] = clone( item[i] );
                    }
                }
            } else {
                // depending what you would like here,
                // just keep the reference, or create new object
                if (false && item.constructor) {
                    // would not advice to do that, reason? Read below
                    result = new item.constructor();
                } else {
                    result = item;
                }
            }
        } else {
            result = item;
        }
    }

    return result;
}

module.exports.alert = function(message) {
	dialog.showMessageBox({message:message,buttons:['OK']});
}

module.exports.replaceAll = function(s, n,v) {
	while(s.indexOf(n) != -1) {
		s = s.replace(n,v);
	}
	return s;
}

module.exports.fetchValue = function(ws,cell) {
	var val = ws.getCell(cell).value;
	if(val != null) {
		if(val.result != null) {
			val = val.result;
		}
		
		return val;
	}
	return null;
}

module.exports.in_array = function(item, arr) {
	var matched = false;
	arr.forEach(function(i) {
		if(item == i) matched = true;
	});
	return matched;
}

module.exports.getStringBetween = function(chunk, startkey, endkey) {
	var startIndex = -1;
	var endIndex = -1;
	if((startIndex = chunk.indexOf(startkey)) != -1) {
		chunk = chunk.substring(startIndex + startkey.length);
		if((endIndex = chunk.indexOf(endkey)) != -1) {
			return chunk.substring(0, chunk.indexOf(endkey));
		}
		else {
			return null;
		}
	}
	return null;
}

module.exports.isOnlyOneVariable = function(c) {
	if(c.indexOf('##') == 0 && c.lastIndexOf('##') == c.length - 2) {
		var test = util.getStringBetween(c, '##','##')
		if(test.length == c.length - 4) {
			return true;
		}
	}
	return false;
}

module.exports.deleteFolderRecursive = function (path) {
  if( fs.existsSync(path) ) {
    fs.readdirSync(path).forEach(function(file,index){
      var curPath = path + "/" + file;
      if(fs.lstatSync(curPath).isDirectory()) { // recurse
        util.deleteFolderRecursive(curPath);
      } else { // delete file
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(path);
  }
};


module.exports.copyFileSync = function( source, target ) {

    var targetFile = target;

    //if target is a directory a new file with the same name will be created
    if ( fs.existsSync( target ) ) {
        if ( fs.lstatSync( target ).isDirectory() ) {
            targetFile = path.join( target, path.basename( source ) );
        }
    }

    fs.writeFileSync(targetFile, fs.readFileSync(source));
}

module.exports.copyFolderRecursiveSync = function( source, target ) {
    var files = [];

    //check if folder needs to be created or integrated
    var targetFolder = target
	if ( !fs.existsSync( targetFolder ) ) {
        fs.mkdirSync( targetFolder );
    }

    //copy
    if ( fs.lstatSync( source ).isDirectory() ) {
        files = fs.readdirSync( source );
        files.forEach( function ( file ) {
            var curSource = path.join( source, file );
            if ( fs.lstatSync( curSource ).isDirectory() ) {
                util.copyFolderRecursiveSync( curSource, targetFolder );
            } else {
                util.copyFileSync( curSource, targetFolder );
            }
        } );
    }
}


var util = module.exports;