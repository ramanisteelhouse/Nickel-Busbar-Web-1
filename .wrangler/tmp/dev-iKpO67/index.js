var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
  get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
}) : x)(function(x) {
  if (typeof require !== "undefined") return require.apply(this, arguments);
  throw Error('Dynamic require of "' + x + '" is not supported');
});
var __esm = (fn, res, err) => function __init() {
  if (err) throw err[0];
  try {
    return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
  } catch (e) {
    throw err = [e], e;
  }
};
var __commonJS = (cb, mod) => function __require2() {
  try {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  } catch (e) {
    throw mod = 0, e;
  }
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// wrangler-modules-watch:wrangler:modules-watch
var init_wrangler_modules_watch = __esm({
  "wrangler-modules-watch:wrangler:modules-watch"() {
    init_modules_watch_stub();
  }
});

// node_modules/wrangler/templates/modules-watch-stub.js
var init_modules_watch_stub = __esm({
  "node_modules/wrangler/templates/modules-watch-stub.js"() {
    init_wrangler_modules_watch();
  }
});

// node-built-in-modules:events
import libDefault from "events";
var require_events = __commonJS({
  "node-built-in-modules:events"(exports, module) {
    init_modules_watch_stub();
    module.exports = libDefault;
  }
});

// node_modules/postgres-array/index.js
var require_postgres_array = __commonJS({
  "node_modules/postgres-array/index.js"(exports) {
    "use strict";
    init_modules_watch_stub();
    exports.parse = function(source, transform) {
      return new ArrayParser(source, transform).parse();
    };
    var ArrayParser = class _ArrayParser {
      static {
        __name(this, "ArrayParser");
      }
      constructor(source, transform) {
        this.source = source;
        this.transform = transform || identity;
        this.position = 0;
        this.entries = [];
        this.recorded = [];
        this.dimension = 0;
      }
      isEof() {
        return this.position >= this.source.length;
      }
      nextCharacter() {
        var character = this.source[this.position++];
        if (character === "\\") {
          return {
            value: this.source[this.position++],
            escaped: true
          };
        }
        return {
          value: character,
          escaped: false
        };
      }
      record(character) {
        this.recorded.push(character);
      }
      newEntry(includeEmpty) {
        var entry;
        if (this.recorded.length > 0 || includeEmpty) {
          entry = this.recorded.join("");
          if (entry === "NULL" && !includeEmpty) {
            entry = null;
          }
          if (entry !== null) entry = this.transform(entry);
          this.entries.push(entry);
          this.recorded = [];
        }
      }
      consumeDimensions() {
        if (this.source[0] === "[") {
          while (!this.isEof()) {
            var char = this.nextCharacter();
            if (char.value === "=") break;
          }
        }
      }
      parse(nested) {
        var character, parser, quote;
        this.consumeDimensions();
        while (!this.isEof()) {
          character = this.nextCharacter();
          if (character.value === "{" && !quote) {
            this.dimension++;
            if (this.dimension > 1) {
              parser = new _ArrayParser(this.source.substr(this.position - 1), this.transform);
              this.entries.push(parser.parse(true));
              this.position += parser.position - 2;
            }
          } else if (character.value === "}" && !quote) {
            this.dimension--;
            if (!this.dimension) {
              this.newEntry();
              if (nested) return this.entries;
            }
          } else if (character.value === '"' && !character.escaped) {
            if (quote) this.newEntry(true);
            quote = !quote;
          } else if (character.value === "," && !quote) {
            this.newEntry();
          } else {
            this.record(character.value);
          }
        }
        if (this.dimension !== 0) {
          throw new Error("array dimension not balanced");
        }
        return this.entries;
      }
    };
    function identity(value) {
      return value;
    }
    __name(identity, "identity");
  }
});

// node_modules/pg-types/lib/arrayParser.js
var require_arrayParser = __commonJS({
  "node_modules/pg-types/lib/arrayParser.js"(exports, module) {
    init_modules_watch_stub();
    var array = require_postgres_array();
    module.exports = {
      create: /* @__PURE__ */ __name(function(source, transform) {
        return {
          parse: /* @__PURE__ */ __name(function() {
            return array.parse(source, transform);
          }, "parse")
        };
      }, "create")
    };
  }
});

// node_modules/postgres-date/index.js
var require_postgres_date = __commonJS({
  "node_modules/postgres-date/index.js"(exports, module) {
    "use strict";
    init_modules_watch_stub();
    var DATE_TIME = /(\d{1,})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})(\.\d{1,})?.*?( BC)?$/;
    var DATE = /^(\d{1,})-(\d{2})-(\d{2})( BC)?$/;
    var TIME_ZONE = /([Z+-])(\d{2})?:?(\d{2})?:?(\d{2})?/;
    var INFINITY = /^-?infinity$/;
    module.exports = /* @__PURE__ */ __name(function parseDate(isoDate) {
      if (INFINITY.test(isoDate)) {
        return Number(isoDate.replace("i", "I"));
      }
      var matches = DATE_TIME.exec(isoDate);
      if (!matches) {
        return getDate(isoDate) || null;
      }
      var isBC = !!matches[8];
      var year = parseInt(matches[1], 10);
      if (isBC) {
        year = bcYearToNegativeYear(year);
      }
      var month = parseInt(matches[2], 10) - 1;
      var day = matches[3];
      var hour = parseInt(matches[4], 10);
      var minute = parseInt(matches[5], 10);
      var second = parseInt(matches[6], 10);
      var ms = matches[7];
      ms = ms ? 1e3 * parseFloat(ms) : 0;
      var date;
      var offset = timeZoneOffset(isoDate);
      if (offset != null) {
        date = new Date(Date.UTC(year, month, day, hour, minute, second, ms));
        if (is0To99(year)) {
          date.setUTCFullYear(year);
        }
        if (offset !== 0) {
          date.setTime(date.getTime() - offset);
        }
      } else {
        date = new Date(year, month, day, hour, minute, second, ms);
        if (is0To99(year)) {
          date.setFullYear(year);
        }
      }
      return date;
    }, "parseDate");
    function getDate(isoDate) {
      var matches = DATE.exec(isoDate);
      if (!matches) {
        return;
      }
      var year = parseInt(matches[1], 10);
      var isBC = !!matches[4];
      if (isBC) {
        year = bcYearToNegativeYear(year);
      }
      var month = parseInt(matches[2], 10) - 1;
      var day = matches[3];
      var date = new Date(year, month, day);
      if (is0To99(year)) {
        date.setFullYear(year);
      }
      return date;
    }
    __name(getDate, "getDate");
    function timeZoneOffset(isoDate) {
      if (isoDate.endsWith("+00")) {
        return 0;
      }
      var zone = TIME_ZONE.exec(isoDate.split(" ")[1]);
      if (!zone) return;
      var type = zone[1];
      if (type === "Z") {
        return 0;
      }
      var sign = type === "-" ? -1 : 1;
      var offset = parseInt(zone[2], 10) * 3600 + parseInt(zone[3] || 0, 10) * 60 + parseInt(zone[4] || 0, 10);
      return offset * sign * 1e3;
    }
    __name(timeZoneOffset, "timeZoneOffset");
    function bcYearToNegativeYear(year) {
      return -(year - 1);
    }
    __name(bcYearToNegativeYear, "bcYearToNegativeYear");
    function is0To99(num) {
      return num >= 0 && num < 100;
    }
    __name(is0To99, "is0To99");
  }
});

// node_modules/xtend/mutable.js
var require_mutable = __commonJS({
  "node_modules/xtend/mutable.js"(exports, module) {
    init_modules_watch_stub();
    module.exports = extend;
    var hasOwnProperty = Object.prototype.hasOwnProperty;
    function extend(target) {
      for (var i = 1; i < arguments.length; i++) {
        var source = arguments[i];
        for (var key in source) {
          if (hasOwnProperty.call(source, key)) {
            target[key] = source[key];
          }
        }
      }
      return target;
    }
    __name(extend, "extend");
  }
});

// node_modules/postgres-interval/index.js
var require_postgres_interval = __commonJS({
  "node_modules/postgres-interval/index.js"(exports, module) {
    "use strict";
    init_modules_watch_stub();
    var extend = require_mutable();
    module.exports = PostgresInterval;
    function PostgresInterval(raw) {
      if (!(this instanceof PostgresInterval)) {
        return new PostgresInterval(raw);
      }
      extend(this, parse(raw));
    }
    __name(PostgresInterval, "PostgresInterval");
    var properties = ["seconds", "minutes", "hours", "days", "months", "years"];
    PostgresInterval.prototype.toPostgres = function() {
      var filtered = properties.filter(this.hasOwnProperty, this);
      if (this.milliseconds && filtered.indexOf("seconds") < 0) {
        filtered.push("seconds");
      }
      if (filtered.length === 0) return "0";
      return filtered.map(function(property) {
        var value = this[property] || 0;
        if (property === "seconds" && this.milliseconds) {
          value = (value + this.milliseconds / 1e3).toFixed(6).replace(/\.?0+$/, "");
        }
        return value + " " + property;
      }, this).join(" ");
    };
    var propertiesISOEquivalent = {
      years: "Y",
      months: "M",
      days: "D",
      hours: "H",
      minutes: "M",
      seconds: "S"
    };
    var dateProperties = ["years", "months", "days"];
    var timeProperties = ["hours", "minutes", "seconds"];
    PostgresInterval.prototype.toISOString = PostgresInterval.prototype.toISO = function() {
      var datePart = dateProperties.map(buildProperty, this).join("");
      var timePart = timeProperties.map(buildProperty, this).join("");
      return "P" + datePart + "T" + timePart;
      function buildProperty(property) {
        var value = this[property] || 0;
        if (property === "seconds" && this.milliseconds) {
          value = (value + this.milliseconds / 1e3).toFixed(6).replace(/0+$/, "");
        }
        return value + propertiesISOEquivalent[property];
      }
      __name(buildProperty, "buildProperty");
    };
    var NUMBER = "([+-]?\\d+)";
    var YEAR = NUMBER + "\\s+years?";
    var MONTH = NUMBER + "\\s+mons?";
    var DAY = NUMBER + "\\s+days?";
    var TIME = "([+-])?([\\d]*):(\\d\\d):(\\d\\d)\\.?(\\d{1,6})?";
    var INTERVAL = new RegExp([YEAR, MONTH, DAY, TIME].map(function(regexString) {
      return "(" + regexString + ")?";
    }).join("\\s*"));
    var positions = {
      years: 2,
      months: 4,
      days: 6,
      hours: 9,
      minutes: 10,
      seconds: 11,
      milliseconds: 12
    };
    var negatives = ["hours", "minutes", "seconds", "milliseconds"];
    function parseMilliseconds(fraction) {
      var microseconds = fraction + "000000".slice(fraction.length);
      return parseInt(microseconds, 10) / 1e3;
    }
    __name(parseMilliseconds, "parseMilliseconds");
    function parse(interval) {
      if (!interval) return {};
      var matches = INTERVAL.exec(interval);
      var isNegative = matches[8] === "-";
      return Object.keys(positions).reduce(function(parsed, property) {
        var position = positions[property];
        var value = matches[position];
        if (!value) return parsed;
        value = property === "milliseconds" ? parseMilliseconds(value) : parseInt(value, 10);
        if (!value) return parsed;
        if (isNegative && ~negatives.indexOf(property)) {
          value *= -1;
        }
        parsed[property] = value;
        return parsed;
      }, {});
    }
    __name(parse, "parse");
  }
});

// node_modules/postgres-bytea/index.js
var require_postgres_bytea = __commonJS({
  "node_modules/postgres-bytea/index.js"(exports, module) {
    "use strict";
    init_modules_watch_stub();
    var bufferFrom = Buffer.from || Buffer;
    module.exports = /* @__PURE__ */ __name(function parseBytea(input) {
      if (/^\\x/.test(input)) {
        return bufferFrom(input.substr(2), "hex");
      }
      var output = "";
      var i = 0;
      while (i < input.length) {
        if (input[i] !== "\\") {
          output += input[i];
          ++i;
        } else {
          if (/[0-7]{3}/.test(input.substr(i + 1, 3))) {
            output += String.fromCharCode(parseInt(input.substr(i + 1, 3), 8));
            i += 4;
          } else {
            var backslashes = 1;
            while (i + backslashes < input.length && input[i + backslashes] === "\\") {
              backslashes++;
            }
            for (var k = 0; k < Math.floor(backslashes / 2); ++k) {
              output += "\\";
            }
            i += Math.floor(backslashes / 2) * 2;
          }
        }
      }
      return bufferFrom(output, "binary");
    }, "parseBytea");
  }
});

// node_modules/pg-types/lib/textParsers.js
var require_textParsers = __commonJS({
  "node_modules/pg-types/lib/textParsers.js"(exports, module) {
    init_modules_watch_stub();
    var array = require_postgres_array();
    var arrayParser = require_arrayParser();
    var parseDate = require_postgres_date();
    var parseInterval = require_postgres_interval();
    var parseByteA = require_postgres_bytea();
    function allowNull(fn) {
      return /* @__PURE__ */ __name(function nullAllowed(value) {
        if (value === null) return value;
        return fn(value);
      }, "nullAllowed");
    }
    __name(allowNull, "allowNull");
    function parseBool(value) {
      if (value === null) return value;
      return value === "TRUE" || value === "t" || value === "true" || value === "y" || value === "yes" || value === "on" || value === "1";
    }
    __name(parseBool, "parseBool");
    function parseBoolArray(value) {
      if (!value) return null;
      return array.parse(value, parseBool);
    }
    __name(parseBoolArray, "parseBoolArray");
    function parseBaseTenInt(string) {
      return parseInt(string, 10);
    }
    __name(parseBaseTenInt, "parseBaseTenInt");
    function parseIntegerArray(value) {
      if (!value) return null;
      return array.parse(value, allowNull(parseBaseTenInt));
    }
    __name(parseIntegerArray, "parseIntegerArray");
    function parseBigIntegerArray(value) {
      if (!value) return null;
      return array.parse(value, allowNull(function(entry) {
        return parseBigInteger(entry).trim();
      }));
    }
    __name(parseBigIntegerArray, "parseBigIntegerArray");
    var parsePointArray = /* @__PURE__ */ __name(function(value) {
      if (!value) {
        return null;
      }
      var p = arrayParser.create(value, function(entry) {
        if (entry !== null) {
          entry = parsePoint(entry);
        }
        return entry;
      });
      return p.parse();
    }, "parsePointArray");
    var parseFloatArray = /* @__PURE__ */ __name(function(value) {
      if (!value) {
        return null;
      }
      var p = arrayParser.create(value, function(entry) {
        if (entry !== null) {
          entry = parseFloat(entry);
        }
        return entry;
      });
      return p.parse();
    }, "parseFloatArray");
    var parseStringArray = /* @__PURE__ */ __name(function(value) {
      if (!value) {
        return null;
      }
      var p = arrayParser.create(value);
      return p.parse();
    }, "parseStringArray");
    var parseDateArray = /* @__PURE__ */ __name(function(value) {
      if (!value) {
        return null;
      }
      var p = arrayParser.create(value, function(entry) {
        if (entry !== null) {
          entry = parseDate(entry);
        }
        return entry;
      });
      return p.parse();
    }, "parseDateArray");
    var parseIntervalArray = /* @__PURE__ */ __name(function(value) {
      if (!value) {
        return null;
      }
      var p = arrayParser.create(value, function(entry) {
        if (entry !== null) {
          entry = parseInterval(entry);
        }
        return entry;
      });
      return p.parse();
    }, "parseIntervalArray");
    var parseByteAArray = /* @__PURE__ */ __name(function(value) {
      if (!value) {
        return null;
      }
      return array.parse(value, allowNull(parseByteA));
    }, "parseByteAArray");
    var parseInteger = /* @__PURE__ */ __name(function(value) {
      return parseInt(value, 10);
    }, "parseInteger");
    var parseBigInteger = /* @__PURE__ */ __name(function(value) {
      var valStr = String(value);
      if (/^\d+$/.test(valStr)) {
        return valStr;
      }
      return value;
    }, "parseBigInteger");
    var parseJsonArray = /* @__PURE__ */ __name(function(value) {
      if (!value) {
        return null;
      }
      return array.parse(value, allowNull(JSON.parse));
    }, "parseJsonArray");
    var parsePoint = /* @__PURE__ */ __name(function(value) {
      if (value[0] !== "(") {
        return null;
      }
      value = value.substring(1, value.length - 1).split(",");
      return {
        x: parseFloat(value[0]),
        y: parseFloat(value[1])
      };
    }, "parsePoint");
    var parseCircle = /* @__PURE__ */ __name(function(value) {
      if (value[0] !== "<" && value[1] !== "(") {
        return null;
      }
      var point = "(";
      var radius = "";
      var pointParsed = false;
      for (var i = 2; i < value.length - 1; i++) {
        if (!pointParsed) {
          point += value[i];
        }
        if (value[i] === ")") {
          pointParsed = true;
          continue;
        } else if (!pointParsed) {
          continue;
        }
        if (value[i] === ",") {
          continue;
        }
        radius += value[i];
      }
      var result = parsePoint(point);
      result.radius = parseFloat(radius);
      return result;
    }, "parseCircle");
    var init = /* @__PURE__ */ __name(function(register) {
      register(20, parseBigInteger);
      register(21, parseInteger);
      register(23, parseInteger);
      register(26, parseInteger);
      register(700, parseFloat);
      register(701, parseFloat);
      register(16, parseBool);
      register(1082, parseDate);
      register(1114, parseDate);
      register(1184, parseDate);
      register(600, parsePoint);
      register(651, parseStringArray);
      register(718, parseCircle);
      register(1e3, parseBoolArray);
      register(1001, parseByteAArray);
      register(1005, parseIntegerArray);
      register(1007, parseIntegerArray);
      register(1028, parseIntegerArray);
      register(1016, parseBigIntegerArray);
      register(1017, parsePointArray);
      register(1021, parseFloatArray);
      register(1022, parseFloatArray);
      register(1231, parseFloatArray);
      register(1014, parseStringArray);
      register(1015, parseStringArray);
      register(1008, parseStringArray);
      register(1009, parseStringArray);
      register(1040, parseStringArray);
      register(1041, parseStringArray);
      register(1115, parseDateArray);
      register(1182, parseDateArray);
      register(1185, parseDateArray);
      register(1186, parseInterval);
      register(1187, parseIntervalArray);
      register(17, parseByteA);
      register(114, JSON.parse.bind(JSON));
      register(3802, JSON.parse.bind(JSON));
      register(199, parseJsonArray);
      register(3807, parseJsonArray);
      register(3907, parseStringArray);
      register(2951, parseStringArray);
      register(791, parseStringArray);
      register(1183, parseStringArray);
      register(1270, parseStringArray);
    }, "init");
    module.exports = {
      init
    };
  }
});

// node_modules/pg-int8/index.js
var require_pg_int8 = __commonJS({
  "node_modules/pg-int8/index.js"(exports, module) {
    "use strict";
    init_modules_watch_stub();
    var BASE = 1e6;
    function readInt8(buffer) {
      var high = buffer.readInt32BE(0);
      var low = buffer.readUInt32BE(4);
      var sign = "";
      if (high < 0) {
        high = ~high + (low === 0);
        low = ~low + 1 >>> 0;
        sign = "-";
      }
      var result = "";
      var carry;
      var t;
      var digits;
      var pad;
      var l;
      var i;
      {
        carry = high % BASE;
        high = high / BASE >>> 0;
        t = 4294967296 * carry + low;
        low = t / BASE >>> 0;
        digits = "" + (t - BASE * low);
        if (low === 0 && high === 0) {
          return sign + digits + result;
        }
        pad = "";
        l = 6 - digits.length;
        for (i = 0; i < l; i++) {
          pad += "0";
        }
        result = pad + digits + result;
      }
      {
        carry = high % BASE;
        high = high / BASE >>> 0;
        t = 4294967296 * carry + low;
        low = t / BASE >>> 0;
        digits = "" + (t - BASE * low);
        if (low === 0 && high === 0) {
          return sign + digits + result;
        }
        pad = "";
        l = 6 - digits.length;
        for (i = 0; i < l; i++) {
          pad += "0";
        }
        result = pad + digits + result;
      }
      {
        carry = high % BASE;
        high = high / BASE >>> 0;
        t = 4294967296 * carry + low;
        low = t / BASE >>> 0;
        digits = "" + (t - BASE * low);
        if (low === 0 && high === 0) {
          return sign + digits + result;
        }
        pad = "";
        l = 6 - digits.length;
        for (i = 0; i < l; i++) {
          pad += "0";
        }
        result = pad + digits + result;
      }
      {
        carry = high % BASE;
        t = 4294967296 * carry + low;
        digits = "" + t % BASE;
        return sign + digits + result;
      }
    }
    __name(readInt8, "readInt8");
    module.exports = readInt8;
  }
});

// node_modules/pg-types/lib/binaryParsers.js
var require_binaryParsers = __commonJS({
  "node_modules/pg-types/lib/binaryParsers.js"(exports, module) {
    init_modules_watch_stub();
    var parseInt64 = require_pg_int8();
    var parseBits = /* @__PURE__ */ __name(function(data, bits, offset, invert, callback) {
      offset = offset || 0;
      invert = invert || false;
      callback = callback || function(lastValue, newValue, bits2) {
        return lastValue * Math.pow(2, bits2) + newValue;
      };
      var offsetBytes = offset >> 3;
      var inv = /* @__PURE__ */ __name(function(value) {
        if (invert) {
          return ~value & 255;
        }
        return value;
      }, "inv");
      var mask = 255;
      var firstBits = 8 - offset % 8;
      if (bits < firstBits) {
        mask = 255 << 8 - bits & 255;
        firstBits = bits;
      }
      if (offset) {
        mask = mask >> offset % 8;
      }
      var result = 0;
      if (offset % 8 + bits >= 8) {
        result = callback(0, inv(data[offsetBytes]) & mask, firstBits);
      }
      var bytes = bits + offset >> 3;
      for (var i = offsetBytes + 1; i < bytes; i++) {
        result = callback(result, inv(data[i]), 8);
      }
      var lastBits = (bits + offset) % 8;
      if (lastBits > 0) {
        result = callback(result, inv(data[bytes]) >> 8 - lastBits, lastBits);
      }
      return result;
    }, "parseBits");
    var parseFloatFromBits = /* @__PURE__ */ __name(function(data, precisionBits, exponentBits) {
      var bias = Math.pow(2, exponentBits - 1) - 1;
      var sign = parseBits(data, 1);
      var exponent = parseBits(data, exponentBits, 1);
      if (exponent === 0) {
        return 0;
      }
      var precisionBitsCounter = 1;
      var parsePrecisionBits = /* @__PURE__ */ __name(function(lastValue, newValue, bits) {
        if (lastValue === 0) {
          lastValue = 1;
        }
        for (var i = 1; i <= bits; i++) {
          precisionBitsCounter /= 2;
          if ((newValue & 1 << bits - i) > 0) {
            lastValue += precisionBitsCounter;
          }
        }
        return lastValue;
      }, "parsePrecisionBits");
      var mantissa = parseBits(data, precisionBits, exponentBits + 1, false, parsePrecisionBits);
      if (exponent == Math.pow(2, exponentBits + 1) - 1) {
        if (mantissa === 0) {
          return sign === 0 ? Infinity : -Infinity;
        }
        return NaN;
      }
      return (sign === 0 ? 1 : -1) * Math.pow(2, exponent - bias) * mantissa;
    }, "parseFloatFromBits");
    var parseInt16 = /* @__PURE__ */ __name(function(value) {
      if (parseBits(value, 1) == 1) {
        return -1 * (parseBits(value, 15, 1, true) + 1);
      }
      return parseBits(value, 15, 1);
    }, "parseInt16");
    var parseInt32 = /* @__PURE__ */ __name(function(value) {
      if (parseBits(value, 1) == 1) {
        return -1 * (parseBits(value, 31, 1, true) + 1);
      }
      return parseBits(value, 31, 1);
    }, "parseInt32");
    var parseFloat32 = /* @__PURE__ */ __name(function(value) {
      return parseFloatFromBits(value, 23, 8);
    }, "parseFloat32");
    var parseFloat64 = /* @__PURE__ */ __name(function(value) {
      return parseFloatFromBits(value, 52, 11);
    }, "parseFloat64");
    var parseNumeric = /* @__PURE__ */ __name(function(value) {
      var sign = parseBits(value, 16, 32);
      if (sign == 49152) {
        return NaN;
      }
      var weight = Math.pow(1e4, parseBits(value, 16, 16));
      var result = 0;
      var digits = [];
      var ndigits = parseBits(value, 16);
      for (var i = 0; i < ndigits; i++) {
        result += parseBits(value, 16, 64 + 16 * i) * weight;
        weight /= 1e4;
      }
      var scale = Math.pow(10, parseBits(value, 16, 48));
      return (sign === 0 ? 1 : -1) * Math.round(result * scale) / scale;
    }, "parseNumeric");
    var parseDate = /* @__PURE__ */ __name(function(isUTC, value) {
      var sign = parseBits(value, 1);
      var rawValue = parseBits(value, 63, 1);
      var result = new Date((sign === 0 ? 1 : -1) * rawValue / 1e3 + 9466848e5);
      if (!isUTC) {
        result.setTime(result.getTime() + result.getTimezoneOffset() * 6e4);
      }
      result.usec = rawValue % 1e3;
      result.getMicroSeconds = function() {
        return this.usec;
      };
      result.setMicroSeconds = function(value2) {
        this.usec = value2;
      };
      result.getUTCMicroSeconds = function() {
        return this.usec;
      };
      return result;
    }, "parseDate");
    var parseArray = /* @__PURE__ */ __name(function(value) {
      var dim = parseBits(value, 32);
      var flags = parseBits(value, 32, 32);
      var elementType = parseBits(value, 32, 64);
      var offset = 96;
      var dims = [];
      for (var i = 0; i < dim; i++) {
        dims[i] = parseBits(value, 32, offset);
        offset += 32;
        offset += 32;
      }
      var parseElement = /* @__PURE__ */ __name(function(elementType2) {
        var length = parseBits(value, 32, offset);
        offset += 32;
        if (length == 4294967295) {
          return null;
        }
        var result;
        if (elementType2 == 23 || elementType2 == 20) {
          result = parseBits(value, length * 8, offset);
          offset += length * 8;
          return result;
        } else if (elementType2 == 25) {
          result = value.toString(this.encoding, offset >> 3, (offset += length << 3) >> 3);
          return result;
        } else {
          console.log("ERROR: ElementType not implemented: " + elementType2);
        }
      }, "parseElement");
      var parse = /* @__PURE__ */ __name(function(dimension, elementType2) {
        var array = [];
        var i2;
        if (dimension.length > 1) {
          var count = dimension.shift();
          for (i2 = 0; i2 < count; i2++) {
            array[i2] = parse(dimension, elementType2);
          }
          dimension.unshift(count);
        } else {
          for (i2 = 0; i2 < dimension[0]; i2++) {
            array[i2] = parseElement(elementType2);
          }
        }
        return array;
      }, "parse");
      return parse(dims, elementType);
    }, "parseArray");
    var parseText = /* @__PURE__ */ __name(function(value) {
      return value.toString("utf8");
    }, "parseText");
    var parseBool = /* @__PURE__ */ __name(function(value) {
      if (value === null) return null;
      return parseBits(value, 8) > 0;
    }, "parseBool");
    var init = /* @__PURE__ */ __name(function(register) {
      register(20, parseInt64);
      register(21, parseInt16);
      register(23, parseInt32);
      register(26, parseInt32);
      register(1700, parseNumeric);
      register(700, parseFloat32);
      register(701, parseFloat64);
      register(16, parseBool);
      register(1114, parseDate.bind(null, false));
      register(1184, parseDate.bind(null, true));
      register(1e3, parseArray);
      register(1007, parseArray);
      register(1016, parseArray);
      register(1008, parseArray);
      register(1009, parseArray);
      register(25, parseText);
    }, "init");
    module.exports = {
      init
    };
  }
});

// node_modules/pg-types/lib/builtins.js
var require_builtins = __commonJS({
  "node_modules/pg-types/lib/builtins.js"(exports, module) {
    init_modules_watch_stub();
    module.exports = {
      BOOL: 16,
      BYTEA: 17,
      CHAR: 18,
      INT8: 20,
      INT2: 21,
      INT4: 23,
      REGPROC: 24,
      TEXT: 25,
      OID: 26,
      TID: 27,
      XID: 28,
      CID: 29,
      JSON: 114,
      XML: 142,
      PG_NODE_TREE: 194,
      SMGR: 210,
      PATH: 602,
      POLYGON: 604,
      CIDR: 650,
      FLOAT4: 700,
      FLOAT8: 701,
      ABSTIME: 702,
      RELTIME: 703,
      TINTERVAL: 704,
      CIRCLE: 718,
      MACADDR8: 774,
      MONEY: 790,
      MACADDR: 829,
      INET: 869,
      ACLITEM: 1033,
      BPCHAR: 1042,
      VARCHAR: 1043,
      DATE: 1082,
      TIME: 1083,
      TIMESTAMP: 1114,
      TIMESTAMPTZ: 1184,
      INTERVAL: 1186,
      TIMETZ: 1266,
      BIT: 1560,
      VARBIT: 1562,
      NUMERIC: 1700,
      REFCURSOR: 1790,
      REGPROCEDURE: 2202,
      REGOPER: 2203,
      REGOPERATOR: 2204,
      REGCLASS: 2205,
      REGTYPE: 2206,
      UUID: 2950,
      TXID_SNAPSHOT: 2970,
      PG_LSN: 3220,
      PG_NDISTINCT: 3361,
      PG_DEPENDENCIES: 3402,
      TSVECTOR: 3614,
      TSQUERY: 3615,
      GTSVECTOR: 3642,
      REGCONFIG: 3734,
      REGDICTIONARY: 3769,
      JSONB: 3802,
      REGNAMESPACE: 4089,
      REGROLE: 4096
    };
  }
});

// node_modules/pg-types/index.js
var require_pg_types = __commonJS({
  "node_modules/pg-types/index.js"(exports) {
    init_modules_watch_stub();
    var textParsers = require_textParsers();
    var binaryParsers = require_binaryParsers();
    var arrayParser = require_arrayParser();
    var builtinTypes = require_builtins();
    exports.getTypeParser = getTypeParser;
    exports.setTypeParser = setTypeParser;
    exports.arrayParser = arrayParser;
    exports.builtins = builtinTypes;
    var typeParsers = {
      text: {},
      binary: {}
    };
    function noParse(val) {
      return String(val);
    }
    __name(noParse, "noParse");
    function getTypeParser(oid, format) {
      format = format || "text";
      if (!typeParsers[format]) {
        return noParse;
      }
      return typeParsers[format][oid] || noParse;
    }
    __name(getTypeParser, "getTypeParser");
    function setTypeParser(oid, format, parseFn) {
      if (typeof format == "function") {
        parseFn = format;
        format = "text";
      }
      typeParsers[format][oid] = parseFn;
    }
    __name(setTypeParser, "setTypeParser");
    textParsers.init(function(oid, converter) {
      typeParsers.text[oid] = converter;
    });
    binaryParsers.init(function(oid, converter) {
      typeParsers.binary[oid] = converter;
    });
  }
});

// node_modules/pg/lib/defaults.js
var require_defaults = __commonJS({
  "node_modules/pg/lib/defaults.js"(exports, module) {
    "use strict";
    init_modules_watch_stub();
    var user;
    try {
      user = process.platform === "win32" ? process.env.USERNAME : process.env.USER;
    } catch {
    }
    module.exports = {
      // database host. defaults to localhost
      host: "localhost",
      // database user's name
      user,
      // name of database to connect
      database: void 0,
      // database user's password
      password: null,
      // a Postgres connection string to be used instead of setting individual connection items
      // NOTE:  Setting this value will cause it to override any other value (such as database or user) defined
      // in the defaults object.
      connectionString: void 0,
      // database port
      port: 5432,
      // number of rows to return at a time from a prepared statement's
      // portal. 0 will return all rows at once
      rows: 0,
      // binary result mode
      binary: false,
      // Connection pool options - see https://github.com/brianc/node-pg-pool
      // number of connections to use in connection pool
      // 0 will disable connection pooling
      max: 10,
      // max milliseconds a client can go unused before it is removed
      // from the pool and destroyed
      idleTimeoutMillis: 3e4,
      client_encoding: "",
      ssl: false,
      application_name: void 0,
      fallback_application_name: void 0,
      options: void 0,
      parseInputDatesAsUTC: false,
      // max milliseconds any query using this connection will execute for before timing out in error.
      // false=unlimited
      statement_timeout: false,
      // Abort any statement that waits longer than the specified duration in milliseconds while attempting to acquire a lock.
      // false=unlimited
      lock_timeout: false,
      // Terminate any session with an open transaction that has been idle for longer than the specified duration in milliseconds
      // false=unlimited
      idle_in_transaction_session_timeout: false,
      // max milliseconds to wait for query to complete (client side)
      query_timeout: false,
      connect_timeout: 0,
      keepalives: 1,
      keepalives_idle: 0
    };
    var pgTypes = require_pg_types();
    var parseBigInteger = pgTypes.getTypeParser(20, "text");
    var parseBigIntegerArray = pgTypes.getTypeParser(1016, "text");
    module.exports.__defineSetter__("parseInt8", function(val) {
      pgTypes.setTypeParser(20, "text", val ? pgTypes.getTypeParser(23, "text") : parseBigInteger);
      pgTypes.setTypeParser(1016, "text", val ? pgTypes.getTypeParser(1007, "text") : parseBigIntegerArray);
    });
  }
});

// node-built-in-modules:util
import libDefault2 from "util";
var require_util = __commonJS({
  "node-built-in-modules:util"(exports, module) {
    init_modules_watch_stub();
    module.exports = libDefault2;
  }
});

// node_modules/pg/lib/utils.js
var require_utils = __commonJS({
  "node_modules/pg/lib/utils.js"(exports, module) {
    "use strict";
    init_modules_watch_stub();
    var defaults2 = require_defaults();
    var util = require_util();
    var { isDate } = util.types || util;
    function escapeElement(elementRepresentation) {
      const escaped = elementRepresentation.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
      return '"' + escaped + '"';
    }
    __name(escapeElement, "escapeElement");
    function arrayString(val) {
      let result = "{";
      for (let i = 0; i < val.length; i++) {
        if (i > 0) {
          result = result + ",";
        }
        if (val[i] === null || typeof val[i] === "undefined") {
          result = result + "NULL";
        } else if (Array.isArray(val[i])) {
          result = result + arrayString(val[i]);
        } else if (ArrayBuffer.isView(val[i])) {
          let item = val[i];
          if (!(item instanceof Buffer)) {
            const buf = Buffer.from(item.buffer, item.byteOffset, item.byteLength);
            if (buf.length === item.byteLength) {
              item = buf;
            } else {
              item = buf.slice(item.byteOffset, item.byteOffset + item.byteLength);
            }
          }
          result += "\\\\x" + item.toString("hex");
        } else {
          result += escapeElement(prepareValue(val[i]));
        }
      }
      result = result + "}";
      return result;
    }
    __name(arrayString, "arrayString");
    var prepareValue = /* @__PURE__ */ __name(function(val, seen) {
      if (val == null) {
        return null;
      }
      if (typeof val === "object") {
        if (val instanceof Buffer) {
          return val;
        }
        if (ArrayBuffer.isView(val)) {
          const buf = Buffer.from(val.buffer, val.byteOffset, val.byteLength);
          if (buf.length === val.byteLength) {
            return buf;
          }
          return buf.slice(val.byteOffset, val.byteOffset + val.byteLength);
        }
        if (isDate(val)) {
          if (defaults2.parseInputDatesAsUTC) {
            return dateToStringUTC(val);
          } else {
            return dateToString(val);
          }
        }
        if (Array.isArray(val)) {
          return arrayString(val);
        }
        return prepareObject(val, seen);
      }
      return val.toString();
    }, "prepareValue");
    function prepareObject(val, seen) {
      if (val && typeof val.toPostgres === "function") {
        seen = seen || [];
        if (seen.indexOf(val) !== -1) {
          throw new Error('circular reference detected while preparing "' + val + '" for query');
        }
        seen.push(val);
        return prepareValue(val.toPostgres(prepareValue), seen);
      }
      return JSON.stringify(val);
    }
    __name(prepareObject, "prepareObject");
    function dateToString(date) {
      let offset = -date.getTimezoneOffset();
      let year = date.getFullYear();
      const isBCYear = year < 1;
      if (isBCYear) year = Math.abs(year) + 1;
      let ret = String(year).padStart(4, "0") + "-" + String(date.getMonth() + 1).padStart(2, "0") + "-" + String(date.getDate()).padStart(2, "0") + "T" + String(date.getHours()).padStart(2, "0") + ":" + String(date.getMinutes()).padStart(2, "0") + ":" + String(date.getSeconds()).padStart(2, "0") + "." + String(date.getMilliseconds()).padStart(3, "0");
      if (offset < 0) {
        ret += "-";
        offset *= -1;
      } else {
        ret += "+";
      }
      ret += String(Math.floor(offset / 60)).padStart(2, "0") + ":" + String(offset % 60).padStart(2, "0");
      if (isBCYear) ret += " BC";
      return ret;
    }
    __name(dateToString, "dateToString");
    function dateToStringUTC(date) {
      let year = date.getUTCFullYear();
      const isBCYear = year < 1;
      if (isBCYear) year = Math.abs(year) + 1;
      let ret = String(year).padStart(4, "0") + "-" + String(date.getUTCMonth() + 1).padStart(2, "0") + "-" + String(date.getUTCDate()).padStart(2, "0") + "T" + String(date.getUTCHours()).padStart(2, "0") + ":" + String(date.getUTCMinutes()).padStart(2, "0") + ":" + String(date.getUTCSeconds()).padStart(2, "0") + "." + String(date.getUTCMilliseconds()).padStart(3, "0");
      ret += "+00:00";
      if (isBCYear) ret += " BC";
      return ret;
    }
    __name(dateToStringUTC, "dateToStringUTC");
    function normalizeQueryConfig(config, values, callback) {
      config = typeof config === "string" ? { text: config } : config;
      if (values) {
        if (typeof values === "function") {
          config.callback = values;
        } else {
          config.values = values;
        }
      }
      if (callback) {
        config.callback = callback;
      }
      return config;
    }
    __name(normalizeQueryConfig, "normalizeQueryConfig");
    var escapeIdentifier2 = /* @__PURE__ */ __name(function(str) {
      return '"' + str.replace(/"/g, '""') + '"';
    }, "escapeIdentifier");
    var escapeLiteral2 = /* @__PURE__ */ __name(function(str) {
      let hasBackslash = false;
      let escaped = "'";
      if (str == null) {
        return "''";
      }
      if (typeof str !== "string") {
        return "''";
      }
      for (let i = 0; i < str.length; i++) {
        const c = str[i];
        if (c === "'") {
          escaped += c + c;
        } else if (c === "\\") {
          escaped += c + c;
          hasBackslash = true;
        } else {
          escaped += c;
        }
      }
      escaped += "'";
      if (hasBackslash === true) {
        escaped = " E" + escaped;
      }
      return escaped;
    }, "escapeLiteral");
    module.exports = {
      prepareValue: /* @__PURE__ */ __name(function prepareValueWrapper(value) {
        return prepareValue(value);
      }, "prepareValueWrapper"),
      normalizeQueryConfig,
      escapeIdentifier: escapeIdentifier2,
      escapeLiteral: escapeLiteral2
    };
  }
});

// node-built-in-modules:crypto
import libDefault3 from "crypto";
var require_crypto = __commonJS({
  "node-built-in-modules:crypto"(exports, module) {
    init_modules_watch_stub();
    module.exports = libDefault3;
  }
});

// node_modules/pg/lib/crypto/utils-legacy.js
var require_utils_legacy = __commonJS({
  "node_modules/pg/lib/crypto/utils-legacy.js"(exports, module) {
    "use strict";
    init_modules_watch_stub();
    var nodeCrypto = require_crypto();
    function md5(string) {
      return nodeCrypto.createHash("md5").update(string, "utf-8").digest("hex");
    }
    __name(md5, "md5");
    function postgresMd5PasswordHash(user, password, salt) {
      const inner = md5(password + user);
      const outer = md5(Buffer.concat([Buffer.from(inner), salt]));
      return "md5" + outer;
    }
    __name(postgresMd5PasswordHash, "postgresMd5PasswordHash");
    function sha256(text) {
      return nodeCrypto.createHash("sha256").update(text).digest();
    }
    __name(sha256, "sha256");
    function hashByName(hashName, text) {
      hashName = hashName.replace(/(\D)-/, "$1");
      return nodeCrypto.createHash(hashName).update(text).digest();
    }
    __name(hashByName, "hashByName");
    function hmacSha256(key, msg) {
      return nodeCrypto.createHmac("sha256", key).update(msg).digest();
    }
    __name(hmacSha256, "hmacSha256");
    async function deriveKey(password, salt, iterations) {
      return nodeCrypto.pbkdf2Sync(password, salt, iterations, 32, "sha256");
    }
    __name(deriveKey, "deriveKey");
    module.exports = {
      postgresMd5PasswordHash,
      randomBytes: nodeCrypto.randomBytes,
      deriveKey,
      sha256,
      hashByName,
      hmacSha256,
      md5
    };
  }
});

// node_modules/pg/lib/crypto/utils-webcrypto.js
var require_utils_webcrypto = __commonJS({
  "node_modules/pg/lib/crypto/utils-webcrypto.js"(exports, module) {
    init_modules_watch_stub();
    var nodeCrypto = require_crypto();
    module.exports = {
      postgresMd5PasswordHash,
      randomBytes,
      deriveKey,
      sha256,
      hashByName,
      hmacSha256,
      md5
    };
    var webCrypto = nodeCrypto.webcrypto || globalThis.crypto;
    var subtleCrypto = webCrypto.subtle;
    var textEncoder = new TextEncoder();
    function randomBytes(length) {
      return webCrypto.getRandomValues(Buffer.alloc(length));
    }
    __name(randomBytes, "randomBytes");
    async function md5(string) {
      try {
        return nodeCrypto.createHash("md5").update(string, "utf-8").digest("hex");
      } catch (e) {
        const data = typeof string === "string" ? textEncoder.encode(string) : string;
        const hash = await subtleCrypto.digest("MD5", data);
        return Array.from(new Uint8Array(hash)).map((b) => b.toString(16).padStart(2, "0")).join("");
      }
    }
    __name(md5, "md5");
    async function postgresMd5PasswordHash(user, password, salt) {
      const inner = await md5(password + user);
      const outer = await md5(Buffer.concat([Buffer.from(inner), salt]));
      return "md5" + outer;
    }
    __name(postgresMd5PasswordHash, "postgresMd5PasswordHash");
    async function sha256(text) {
      return await subtleCrypto.digest("SHA-256", text);
    }
    __name(sha256, "sha256");
    async function hashByName(hashName, text) {
      return await subtleCrypto.digest(hashName, text);
    }
    __name(hashByName, "hashByName");
    async function hmacSha256(keyBuffer, msg) {
      const key = await subtleCrypto.importKey("raw", keyBuffer, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
      return await subtleCrypto.sign("HMAC", key, textEncoder.encode(msg));
    }
    __name(hmacSha256, "hmacSha256");
    async function deriveKey(password, salt, iterations) {
      const key = await subtleCrypto.importKey("raw", textEncoder.encode(password), "PBKDF2", false, ["deriveBits"]);
      const params = { name: "PBKDF2", hash: "SHA-256", salt, iterations };
      return await subtleCrypto.deriveBits(params, key, 32 * 8, ["deriveBits"]);
    }
    __name(deriveKey, "deriveKey");
  }
});

// node_modules/pg/lib/crypto/utils.js
var require_utils2 = __commonJS({
  "node_modules/pg/lib/crypto/utils.js"(exports, module) {
    "use strict";
    init_modules_watch_stub();
    var useLegacyCrypto = parseInt(process.versions && process.versions.node && process.versions.node.split(".")[0]) < 15;
    if (useLegacyCrypto) {
      module.exports = require_utils_legacy();
    } else {
      module.exports = require_utils_webcrypto();
    }
  }
});

// node_modules/pg/lib/crypto/cert-signatures.js
var require_cert_signatures = __commonJS({
  "node_modules/pg/lib/crypto/cert-signatures.js"(exports, module) {
    init_modules_watch_stub();
    function x509Error(msg, cert) {
      return new Error("SASL channel binding: " + msg + " when parsing public certificate " + cert.toString("base64"));
    }
    __name(x509Error, "x509Error");
    function readASN1Length(data, index) {
      let length = data[index++];
      if (length < 128) return { length, index };
      const lengthBytes = length & 127;
      if (lengthBytes > 4) throw x509Error("bad length", data);
      length = 0;
      for (let i = 0; i < lengthBytes; i++) {
        length = length << 8 | data[index++];
      }
      return { length, index };
    }
    __name(readASN1Length, "readASN1Length");
    function readASN1OID(data, index) {
      if (data[index++] !== 6) throw x509Error("non-OID data", data);
      const { length: OIDLength, index: indexAfterOIDLength } = readASN1Length(data, index);
      index = indexAfterOIDLength;
      const lastIndex = index + OIDLength;
      const byte1 = data[index++];
      let oid = (byte1 / 40 >> 0) + "." + byte1 % 40;
      while (index < lastIndex) {
        let value = 0;
        while (index < lastIndex) {
          const nextByte = data[index++];
          value = value << 7 | nextByte & 127;
          if (nextByte < 128) break;
        }
        oid += "." + value;
      }
      return { oid, index };
    }
    __name(readASN1OID, "readASN1OID");
    function expectASN1Seq(data, index) {
      if (data[index++] !== 48) throw x509Error("non-sequence data", data);
      return readASN1Length(data, index);
    }
    __name(expectASN1Seq, "expectASN1Seq");
    function signatureAlgorithmHashFromCertificate(data, index) {
      if (index === void 0) index = 0;
      index = expectASN1Seq(data, index).index;
      const { length: certInfoLength, index: indexAfterCertInfoLength } = expectASN1Seq(data, index);
      index = indexAfterCertInfoLength + certInfoLength;
      index = expectASN1Seq(data, index).index;
      const { oid, index: indexAfterOID } = readASN1OID(data, index);
      switch (oid) {
        // RSA
        case "1.2.840.113549.1.1.4":
          return "MD5";
        case "1.2.840.113549.1.1.5":
          return "SHA-1";
        case "1.2.840.113549.1.1.11":
          return "SHA-256";
        case "1.2.840.113549.1.1.12":
          return "SHA-384";
        case "1.2.840.113549.1.1.13":
          return "SHA-512";
        case "1.2.840.113549.1.1.14":
          return "SHA-224";
        case "1.2.840.113549.1.1.15":
          return "SHA512-224";
        case "1.2.840.113549.1.1.16":
          return "SHA512-256";
        // ECDSA
        case "1.2.840.10045.4.1":
          return "SHA-1";
        case "1.2.840.10045.4.3.1":
          return "SHA-224";
        case "1.2.840.10045.4.3.2":
          return "SHA-256";
        case "1.2.840.10045.4.3.3":
          return "SHA-384";
        case "1.2.840.10045.4.3.4":
          return "SHA-512";
        // RSASSA-PSS: hash is indicated separately
        case "1.2.840.113549.1.1.10": {
          index = indexAfterOID;
          index = expectASN1Seq(data, index).index;
          if (data[index++] !== 160) throw x509Error("non-tag data", data);
          index = readASN1Length(data, index).index;
          index = expectASN1Seq(data, index).index;
          const { oid: hashOID } = readASN1OID(data, index);
          switch (hashOID) {
            // standalone hash OIDs
            case "1.2.840.113549.2.5":
              return "MD5";
            case "1.3.14.3.2.26":
              return "SHA-1";
            case "2.16.840.1.101.3.4.2.1":
              return "SHA-256";
            case "2.16.840.1.101.3.4.2.2":
              return "SHA-384";
            case "2.16.840.1.101.3.4.2.3":
              return "SHA-512";
          }
          throw x509Error("unknown hash OID " + hashOID, data);
        }
        // Ed25519 -- see https: return//github.com/openssl/openssl/issues/15477
        case "1.3.101.110":
        case "1.3.101.112":
          return "SHA-512";
        // Ed448 -- still not in pg 17.2 (if supported, digest would be SHAKE256 x 64 bytes)
        case "1.3.101.111":
        case "1.3.101.113":
          throw x509Error("Ed448 certificate channel binding is not currently supported by Postgres");
      }
      throw x509Error("unknown OID " + oid, data);
    }
    __name(signatureAlgorithmHashFromCertificate, "signatureAlgorithmHashFromCertificate");
    module.exports = { signatureAlgorithmHashFromCertificate };
  }
});

// node_modules/pg/lib/crypto/sasl.js
var require_sasl = __commonJS({
  "node_modules/pg/lib/crypto/sasl.js"(exports, module) {
    "use strict";
    init_modules_watch_stub();
    var crypto2 = require_utils2();
    var { signatureAlgorithmHashFromCertificate } = require_cert_signatures();
    function startSession(mechanisms, stream) {
      const candidates = ["SCRAM-SHA-256"];
      if (stream) candidates.unshift("SCRAM-SHA-256-PLUS");
      const mechanism = candidates.find((candidate) => mechanisms.includes(candidate));
      if (!mechanism) {
        throw new Error("SASL: Only mechanism(s) " + candidates.join(" and ") + " are supported");
      }
      if (mechanism === "SCRAM-SHA-256-PLUS" && typeof stream.getPeerCertificate !== "function") {
        throw new Error("SASL: Mechanism SCRAM-SHA-256-PLUS requires a certificate");
      }
      const clientNonce = crypto2.randomBytes(18).toString("base64");
      const gs2Header = mechanism === "SCRAM-SHA-256-PLUS" ? "p=tls-server-end-point" : stream ? "y" : "n";
      return {
        mechanism,
        clientNonce,
        response: gs2Header + ",,n=*,r=" + clientNonce,
        message: "SASLInitialResponse"
      };
    }
    __name(startSession, "startSession");
    async function continueSession(session, password, serverData, stream) {
      if (session.message !== "SASLInitialResponse") {
        throw new Error("SASL: Last message was not SASLInitialResponse");
      }
      if (typeof password !== "string") {
        throw new Error("SASL: SCRAM-SERVER-FIRST-MESSAGE: client password must be a string");
      }
      if (password === "") {
        throw new Error("SASL: SCRAM-SERVER-FIRST-MESSAGE: client password must be a non-empty string");
      }
      if (typeof serverData !== "string") {
        throw new Error("SASL: SCRAM-SERVER-FIRST-MESSAGE: serverData must be a string");
      }
      const sv = parseServerFirstMessage(serverData);
      if (!sv.nonce.startsWith(session.clientNonce)) {
        throw new Error("SASL: SCRAM-SERVER-FIRST-MESSAGE: server nonce does not start with client nonce");
      } else if (sv.nonce.length === session.clientNonce.length) {
        throw new Error("SASL: SCRAM-SERVER-FIRST-MESSAGE: server nonce is too short");
      }
      const clientFirstMessageBare = "n=*,r=" + session.clientNonce;
      const serverFirstMessage = "r=" + sv.nonce + ",s=" + sv.salt + ",i=" + sv.iteration;
      let channelBinding = stream ? "eSws" : "biws";
      if (session.mechanism === "SCRAM-SHA-256-PLUS") {
        const peerCert = stream.getPeerCertificate().raw;
        let hashName = signatureAlgorithmHashFromCertificate(peerCert);
        if (hashName === "MD5" || hashName === "SHA-1") hashName = "SHA-256";
        const certHash = await crypto2.hashByName(hashName, peerCert);
        const bindingData = Buffer.concat([Buffer.from("p=tls-server-end-point,,"), Buffer.from(certHash)]);
        channelBinding = bindingData.toString("base64");
      }
      const clientFinalMessageWithoutProof = "c=" + channelBinding + ",r=" + sv.nonce;
      const authMessage = clientFirstMessageBare + "," + serverFirstMessage + "," + clientFinalMessageWithoutProof;
      const saltBytes = Buffer.from(sv.salt, "base64");
      const saltedPassword = await crypto2.deriveKey(password, saltBytes, sv.iteration);
      const clientKey = await crypto2.hmacSha256(saltedPassword, "Client Key");
      const storedKey = await crypto2.sha256(clientKey);
      const clientSignature = await crypto2.hmacSha256(storedKey, authMessage);
      const clientProof = xorBuffers(Buffer.from(clientKey), Buffer.from(clientSignature)).toString("base64");
      const serverKey = await crypto2.hmacSha256(saltedPassword, "Server Key");
      const serverSignatureBytes = await crypto2.hmacSha256(serverKey, authMessage);
      session.message = "SASLResponse";
      session.serverSignature = Buffer.from(serverSignatureBytes).toString("base64");
      session.response = clientFinalMessageWithoutProof + ",p=" + clientProof;
    }
    __name(continueSession, "continueSession");
    function finalizeSession(session, serverData) {
      if (session.message !== "SASLResponse") {
        throw new Error("SASL: Last message was not SASLResponse");
      }
      if (typeof serverData !== "string") {
        throw new Error("SASL: SCRAM-SERVER-FINAL-MESSAGE: serverData must be a string");
      }
      const { serverSignature } = parseServerFinalMessage(serverData);
      if (serverSignature !== session.serverSignature) {
        throw new Error("SASL: SCRAM-SERVER-FINAL-MESSAGE: server signature does not match");
      }
    }
    __name(finalizeSession, "finalizeSession");
    function isPrintableChars(text) {
      if (typeof text !== "string") {
        throw new TypeError("SASL: text must be a string");
      }
      return text.split("").map((_, i) => text.charCodeAt(i)).every((c) => c >= 33 && c <= 43 || c >= 45 && c <= 126);
    }
    __name(isPrintableChars, "isPrintableChars");
    function isBase64(text) {
      return /^(?:[a-zA-Z0-9+/]{4})*(?:[a-zA-Z0-9+/]{2}==|[a-zA-Z0-9+/]{3}=)?$/.test(text);
    }
    __name(isBase64, "isBase64");
    function parseAttributePairs(text) {
      if (typeof text !== "string") {
        throw new TypeError("SASL: attribute pairs text must be a string");
      }
      return new Map(
        text.split(",").map((attrValue) => {
          if (!/^.=/.test(attrValue)) {
            throw new Error("SASL: Invalid attribute pair entry");
          }
          const name = attrValue[0];
          const value = attrValue.substring(2);
          return [name, value];
        })
      );
    }
    __name(parseAttributePairs, "parseAttributePairs");
    function parseServerFirstMessage(data) {
      const attrPairs = parseAttributePairs(data);
      const nonce = attrPairs.get("r");
      if (!nonce) {
        throw new Error("SASL: SCRAM-SERVER-FIRST-MESSAGE: nonce missing");
      } else if (!isPrintableChars(nonce)) {
        throw new Error("SASL: SCRAM-SERVER-FIRST-MESSAGE: nonce must only contain printable characters");
      }
      const salt = attrPairs.get("s");
      if (!salt) {
        throw new Error("SASL: SCRAM-SERVER-FIRST-MESSAGE: salt missing");
      } else if (!isBase64(salt)) {
        throw new Error("SASL: SCRAM-SERVER-FIRST-MESSAGE: salt must be base64");
      }
      const iterationText = attrPairs.get("i");
      if (!iterationText) {
        throw new Error("SASL: SCRAM-SERVER-FIRST-MESSAGE: iteration missing");
      } else if (!/^[1-9][0-9]*$/.test(iterationText)) {
        throw new Error("SASL: SCRAM-SERVER-FIRST-MESSAGE: invalid iteration count");
      }
      const iteration = parseInt(iterationText, 10);
      return {
        nonce,
        salt,
        iteration
      };
    }
    __name(parseServerFirstMessage, "parseServerFirstMessage");
    function parseServerFinalMessage(serverData) {
      const attrPairs = parseAttributePairs(serverData);
      const serverSignature = attrPairs.get("v");
      if (!serverSignature) {
        throw new Error("SASL: SCRAM-SERVER-FINAL-MESSAGE: server signature is missing");
      } else if (!isBase64(serverSignature)) {
        throw new Error("SASL: SCRAM-SERVER-FINAL-MESSAGE: server signature must be base64");
      }
      return {
        serverSignature
      };
    }
    __name(parseServerFinalMessage, "parseServerFinalMessage");
    function xorBuffers(a, b) {
      if (!Buffer.isBuffer(a)) {
        throw new TypeError("first argument must be a Buffer");
      }
      if (!Buffer.isBuffer(b)) {
        throw new TypeError("second argument must be a Buffer");
      }
      if (a.length !== b.length) {
        throw new Error("Buffer lengths must match");
      }
      if (a.length === 0) {
        throw new Error("Buffers cannot be empty");
      }
      return Buffer.from(a.map((_, i) => a[i] ^ b[i]));
    }
    __name(xorBuffers, "xorBuffers");
    module.exports = {
      startSession,
      continueSession,
      finalizeSession
    };
  }
});

// node_modules/pg/lib/type-overrides.js
var require_type_overrides = __commonJS({
  "node_modules/pg/lib/type-overrides.js"(exports, module) {
    "use strict";
    init_modules_watch_stub();
    var types2 = require_pg_types();
    function TypeOverrides2(userTypes) {
      this._types = userTypes || types2;
      this.text = {};
      this.binary = {};
    }
    __name(TypeOverrides2, "TypeOverrides");
    TypeOverrides2.prototype.getOverrides = function(format) {
      switch (format) {
        case "text":
          return this.text;
        case "binary":
          return this.binary;
        default:
          return {};
      }
    };
    TypeOverrides2.prototype.setTypeParser = function(oid, format, parseFn) {
      if (typeof format === "function") {
        parseFn = format;
        format = "text";
      }
      this.getOverrides(format)[oid] = parseFn;
    };
    TypeOverrides2.prototype.getTypeParser = function(oid, format) {
      format = format || "text";
      return this.getOverrides(format)[oid] || this._types.getTypeParser(oid, format);
    };
    module.exports = TypeOverrides2;
  }
});

// node-built-in-modules:dns
import libDefault4 from "dns";
var require_dns = __commonJS({
  "node-built-in-modules:dns"(exports, module) {
    init_modules_watch_stub();
    module.exports = libDefault4;
  }
});

// node-built-in-modules:fs
import libDefault5 from "fs";
var require_fs = __commonJS({
  "node-built-in-modules:fs"(exports, module) {
    init_modules_watch_stub();
    module.exports = libDefault5;
  }
});

// node_modules/pg-connection-string/index.js
var require_pg_connection_string = __commonJS({
  "node_modules/pg-connection-string/index.js"(exports, module) {
    "use strict";
    init_modules_watch_stub();
    function parse(str, options = {}) {
      if (str.charAt(0) === "/") {
        const config2 = str.split(" ");
        return { host: config2[0], database: config2[1] };
      }
      const config = {};
      let result;
      let dummyHost = false;
      if (/ |%[^a-f0-9]|%[a-f0-9][^a-f0-9]/i.test(str)) {
        str = encodeURI(str).replace(/%25(\d\d)/g, "%$1");
      }
      try {
        try {
          result = new URL(str, "postgres://base");
        } catch (e) {
          result = new URL(str.replace("@/", "@___DUMMY___/"), "postgres://base");
          dummyHost = true;
        }
      } catch (err) {
        err.input && (err.input = "*****REDACTED*****");
        throw err;
      }
      for (const entry of result.searchParams.entries()) {
        config[entry[0]] = entry[1];
      }
      config.user = config.user || decodeURIComponent(result.username);
      config.password = config.password || decodeURIComponent(result.password);
      if (result.protocol == "socket:") {
        config.host = decodeURI(result.pathname);
        config.database = result.searchParams.get("db");
        config.client_encoding = result.searchParams.get("encoding");
        return config;
      }
      const hostname = dummyHost ? "" : result.hostname;
      if (!config.host) {
        config.host = decodeURIComponent(hostname);
      } else if (hostname && /^%2f/i.test(hostname)) {
        result.pathname = hostname + result.pathname;
      }
      if (!config.port) {
        config.port = result.port;
      }
      const pathname = result.pathname.slice(1) || null;
      config.database = pathname ? decodeURI(pathname) : null;
      if (config.ssl === "true" || config.ssl === "1") {
        config.ssl = true;
      }
      if (config.ssl === "0") {
        config.ssl = false;
      }
      if (config.sslcert || config.sslkey || config.sslrootcert || config.sslmode) {
        config.ssl = {};
      }
      const fs = config.sslcert || config.sslkey || config.sslrootcert ? require_fs() : null;
      if (config.sslcert) {
        config.ssl.cert = fs.readFileSync(config.sslcert).toString();
      }
      if (config.sslkey) {
        config.ssl.key = fs.readFileSync(config.sslkey).toString();
      }
      if (config.sslrootcert) {
        config.ssl.ca = fs.readFileSync(config.sslrootcert).toString();
      }
      if (options.useLibpqCompat && config.uselibpqcompat) {
        throw new Error("Both useLibpqCompat and uselibpqcompat are set. Please use only one of them.");
      }
      if (config.uselibpqcompat === "true" || options.useLibpqCompat) {
        switch (config.sslmode) {
          case "disable": {
            config.ssl = false;
            break;
          }
          case "prefer": {
            config.ssl.rejectUnauthorized = false;
            break;
          }
          case "require": {
            if (config.sslrootcert) {
              config.ssl.checkServerIdentity = function() {
              };
            } else {
              config.ssl.rejectUnauthorized = false;
            }
            break;
          }
          case "verify-ca": {
            if (!config.ssl.ca) {
              throw new Error(
                "SECURITY WARNING: Using sslmode=verify-ca requires specifying a CA with sslrootcert. If a public CA is used, verify-ca allows connections to a server that somebody else may have registered with the CA, making you vulnerable to Man-in-the-Middle attacks. Either specify a custom CA certificate with sslrootcert parameter or use sslmode=verify-full for proper security."
              );
            }
            config.ssl.checkServerIdentity = function() {
            };
            break;
          }
          case "verify-full": {
            break;
          }
        }
      } else {
        switch (config.sslmode) {
          case "disable": {
            config.ssl = false;
            break;
          }
          case "prefer":
          case "require":
          case "verify-ca":
          case "verify-full": {
            if (config.sslmode !== "verify-full") {
              deprecatedSslModeWarning(config.sslmode);
            }
            break;
          }
          case "no-verify": {
            config.ssl.rejectUnauthorized = false;
            break;
          }
        }
      }
      return config;
    }
    __name(parse, "parse");
    function toConnectionOptions(sslConfig) {
      const connectionOptions = Object.entries(sslConfig).reduce((c, [key, value]) => {
        if (value !== void 0 && value !== null) {
          c[key] = value;
        }
        return c;
      }, {});
      return connectionOptions;
    }
    __name(toConnectionOptions, "toConnectionOptions");
    function toClientConfig(config) {
      const poolConfig = Object.entries(config).reduce((c, [key, value]) => {
        if (key === "ssl") {
          const sslConfig = value;
          if (typeof sslConfig === "boolean") {
            c[key] = sslConfig;
          }
          if (typeof sslConfig === "object") {
            c[key] = toConnectionOptions(sslConfig);
          }
        } else if (value !== void 0 && value !== null) {
          if (key === "port") {
            if (value !== "") {
              const v = parseInt(value, 10);
              if (isNaN(v)) {
                throw new Error(`Invalid ${key}: ${value}`);
              }
              c[key] = v;
            }
          } else {
            c[key] = value;
          }
        }
        return c;
      }, {});
      return poolConfig;
    }
    __name(toClientConfig, "toClientConfig");
    function parseIntoClientConfig(str) {
      return toClientConfig(parse(str));
    }
    __name(parseIntoClientConfig, "parseIntoClientConfig");
    function deprecatedSslModeWarning(sslmode) {
      if (!deprecatedSslModeWarning.warned && typeof process !== "undefined" && process.emitWarning) {
        deprecatedSslModeWarning.warned = true;
        process.emitWarning(`SECURITY WARNING: The SSL modes 'prefer', 'require', and 'verify-ca' are treated as aliases for 'verify-full'.
In the next major version (pg-connection-string v3.0.0 and pg v9.0.0), these modes will adopt standard libpq semantics, which have weaker security guarantees.

To prepare for this change:
- If you want the current behavior, explicitly use 'sslmode=verify-full'
- If you want libpq compatibility now, use 'uselibpqcompat=true&sslmode=${sslmode}'

See https://www.postgresql.org/docs/current/libpq-ssl.html for libpq SSL mode definitions.`);
      }
    }
    __name(deprecatedSslModeWarning, "deprecatedSslModeWarning");
    module.exports = parse;
    parse.parse = parse;
    parse.toClientConfig = toClientConfig;
    parse.parseIntoClientConfig = parseIntoClientConfig;
  }
});

// node_modules/pg/lib/connection-parameters.js
var require_connection_parameters = __commonJS({
  "node_modules/pg/lib/connection-parameters.js"(exports, module) {
    "use strict";
    init_modules_watch_stub();
    var dns = require_dns();
    var defaults2 = require_defaults();
    var parse = require_pg_connection_string().parse;
    var val = /* @__PURE__ */ __name(function(key, config, envVar) {
      if (config[key]) {
        return config[key];
      }
      if (envVar === void 0) {
        envVar = process.env["PG" + key.toUpperCase()];
      } else if (envVar === false) {
      } else {
        envVar = process.env[envVar];
      }
      return envVar || defaults2[key];
    }, "val");
    var readSSLConfigFromEnvironment = /* @__PURE__ */ __name(function() {
      switch (process.env.PGSSLMODE) {
        case "disable":
          return false;
        case "prefer":
        case "require":
        case "verify-ca":
        case "verify-full":
          return true;
        case "no-verify":
          return { rejectUnauthorized: false };
      }
      return defaults2.ssl;
    }, "readSSLConfigFromEnvironment");
    var quoteParamValue = /* @__PURE__ */ __name(function(value) {
      return "'" + ("" + value).replace(/\\/g, "\\\\").replace(/'/g, "\\'") + "'";
    }, "quoteParamValue");
    var add = /* @__PURE__ */ __name(function(params, config, paramName) {
      const value = config[paramName];
      if (value !== void 0 && value !== null) {
        params.push(paramName + "=" + quoteParamValue(value));
      }
    }, "add");
    var ConnectionParameters = class {
      static {
        __name(this, "ConnectionParameters");
      }
      constructor(config) {
        config = typeof config === "string" ? parse(config) : config || {};
        if (config.connectionString) {
          config = Object.assign({}, config, parse(config.connectionString));
        }
        this.user = val("user", config);
        this.database = val("database", config);
        if (this.database === void 0) {
          this.database = this.user;
        }
        this.port = parseInt(val("port", config), 10);
        this.host = val("host", config);
        Object.defineProperty(this, "password", {
          configurable: true,
          enumerable: false,
          writable: true,
          value: val("password", config)
        });
        this.binary = val("binary", config);
        this.options = val("options", config);
        this.ssl = typeof config.ssl === "undefined" ? readSSLConfigFromEnvironment() : config.ssl;
        if (typeof this.ssl === "string") {
          if (this.ssl === "true") {
            this.ssl = true;
          }
        }
        if (this.ssl === "no-verify") {
          this.ssl = { rejectUnauthorized: false };
        }
        if (this.ssl && this.ssl.key) {
          Object.defineProperty(this.ssl, "key", {
            enumerable: false
          });
        }
        this.client_encoding = val("client_encoding", config);
        this.replication = val("replication", config);
        this.isDomainSocket = !(this.host || "").indexOf("/");
        this.application_name = val("application_name", config, "PGAPPNAME");
        this.fallback_application_name = val("fallback_application_name", config, false);
        this.statement_timeout = val("statement_timeout", config, false);
        this.lock_timeout = val("lock_timeout", config, false);
        this.idle_in_transaction_session_timeout = val("idle_in_transaction_session_timeout", config, false);
        this.query_timeout = val("query_timeout", config, false);
        if (config.connectionTimeoutMillis === void 0) {
          this.connect_timeout = process.env.PGCONNECT_TIMEOUT || 0;
        } else {
          this.connect_timeout = Math.floor(config.connectionTimeoutMillis / 1e3);
        }
        if (config.keepAlive === false) {
          this.keepalives = 0;
        } else if (config.keepAlive === true) {
          this.keepalives = 1;
        }
        if (typeof config.keepAliveInitialDelayMillis === "number") {
          this.keepalives_idle = Math.floor(config.keepAliveInitialDelayMillis / 1e3);
        }
      }
      getLibpqConnectionString(cb) {
        const params = [];
        add(params, this, "user");
        add(params, this, "password");
        add(params, this, "port");
        add(params, this, "application_name");
        add(params, this, "fallback_application_name");
        add(params, this, "connect_timeout");
        add(params, this, "options");
        const ssl = typeof this.ssl === "object" ? this.ssl : this.ssl ? { sslmode: this.ssl } : {};
        add(params, ssl, "sslmode");
        add(params, ssl, "sslca");
        add(params, ssl, "sslkey");
        add(params, ssl, "sslcert");
        add(params, ssl, "sslrootcert");
        if (this.database) {
          params.push("dbname=" + quoteParamValue(this.database));
        }
        if (this.replication) {
          params.push("replication=" + quoteParamValue(this.replication));
        }
        if (this.host) {
          params.push("host=" + quoteParamValue(this.host));
        }
        if (this.isDomainSocket) {
          return cb(null, params.join(" "));
        }
        if (this.client_encoding) {
          params.push("client_encoding=" + quoteParamValue(this.client_encoding));
        }
        dns.lookup(this.host, function(err, address) {
          if (err) return cb(err, null);
          params.push("hostaddr=" + quoteParamValue(address));
          return cb(null, params.join(" "));
        });
      }
    };
    module.exports = ConnectionParameters;
  }
});

// node_modules/pg/lib/result.js
var require_result = __commonJS({
  "node_modules/pg/lib/result.js"(exports, module) {
    "use strict";
    init_modules_watch_stub();
    var types2 = require_pg_types();
    var matchRegexp = /^([A-Za-z]+)(?: (\d+))?(?: (\d+))?/;
    var Result2 = class {
      static {
        __name(this, "Result");
      }
      constructor(rowMode, types3) {
        this.command = null;
        this.rowCount = null;
        this.oid = null;
        this.rows = [];
        this.fields = [];
        this._parsers = void 0;
        this._types = types3;
        this.RowCtor = null;
        this.rowAsArray = rowMode === "array";
        if (this.rowAsArray) {
          this.parseRow = this._parseRowAsArray;
        }
        this._prebuiltEmptyResultObject = null;
      }
      // adds a command complete message
      addCommandComplete(msg) {
        let match;
        if (msg.text) {
          match = matchRegexp.exec(msg.text);
        } else {
          match = matchRegexp.exec(msg.command);
        }
        if (match) {
          this.command = match[1];
          if (match[3]) {
            this.oid = parseInt(match[2], 10);
            this.rowCount = parseInt(match[3], 10);
          } else if (match[2]) {
            this.rowCount = parseInt(match[2], 10);
          }
        }
      }
      _parseRowAsArray(rowData) {
        const row = new Array(rowData.length);
        for (let i = 0, len = rowData.length; i < len; i++) {
          const rawValue = rowData[i];
          if (rawValue !== null) {
            row[i] = this._parsers[i](rawValue);
          } else {
            row[i] = null;
          }
        }
        return row;
      }
      parseRow(rowData) {
        const row = { ...this._prebuiltEmptyResultObject };
        for (let i = 0, len = rowData.length; i < len; i++) {
          const rawValue = rowData[i];
          const field = this.fields[i].name;
          if (rawValue !== null) {
            const v = this.fields[i].format === "binary" ? Buffer.from(rawValue) : rawValue;
            row[field] = this._parsers[i](v);
          } else {
            row[field] = null;
          }
        }
        return row;
      }
      addRow(row) {
        this.rows.push(row);
      }
      addFields(fieldDescriptions) {
        this.fields = fieldDescriptions;
        if (this.fields.length) {
          this._parsers = new Array(fieldDescriptions.length);
        }
        const row = {};
        for (let i = 0; i < fieldDescriptions.length; i++) {
          const desc = fieldDescriptions[i];
          row[desc.name] = null;
          if (this._types) {
            this._parsers[i] = this._types.getTypeParser(desc.dataTypeID, desc.format || "text");
          } else {
            this._parsers[i] = types2.getTypeParser(desc.dataTypeID, desc.format || "text");
          }
        }
        this._prebuiltEmptyResultObject = { ...row };
      }
    };
    module.exports = Result2;
  }
});

// node_modules/pg/lib/query.js
var require_query = __commonJS({
  "node_modules/pg/lib/query.js"(exports, module) {
    "use strict";
    init_modules_watch_stub();
    var { EventEmitter } = require_events();
    var Result2 = require_result();
    var utils = require_utils();
    var Query2 = class extends EventEmitter {
      static {
        __name(this, "Query");
      }
      constructor(config, values, callback) {
        super();
        config = utils.normalizeQueryConfig(config, values, callback);
        this.text = config.text;
        this.values = config.values;
        this.rows = config.rows;
        this.types = config.types;
        this.name = config.name;
        this.queryMode = config.queryMode;
        this.binary = config.binary;
        this.portal = config.portal || "";
        this.callback = config.callback;
        this._rowMode = config.rowMode;
        if (process.domain && config.callback) {
          this.callback = process.domain.bind(config.callback);
        }
        this._result = new Result2(this._rowMode, this.types);
        this._results = this._result;
        this._canceledDueToError = false;
      }
      requiresPreparation() {
        if (this.queryMode === "extended") {
          return true;
        }
        if (this.name) {
          return true;
        }
        if (this.rows) {
          return true;
        }
        if (!this.text) {
          return false;
        }
        if (!this.values) {
          return false;
        }
        return this.values.length > 0;
      }
      _checkForMultirow() {
        if (this._result.command) {
          if (!Array.isArray(this._results)) {
            this._results = [this._result];
          }
          this._result = new Result2(this._rowMode, this._result._types);
          this._results.push(this._result);
        }
      }
      // associates row metadata from the supplied
      // message with this query object
      // metadata used when parsing row results
      handleRowDescription(msg) {
        this._checkForMultirow();
        this._result.addFields(msg.fields);
        this._accumulateRows = this.callback || !this.listeners("row").length;
      }
      handleDataRow(msg) {
        let row;
        if (this._canceledDueToError) {
          return;
        }
        try {
          row = this._result.parseRow(msg.fields);
        } catch (err) {
          this._canceledDueToError = err;
          return;
        }
        this.emit("row", row, this._result);
        if (this._accumulateRows) {
          this._result.addRow(row);
        }
      }
      handleCommandComplete(msg, connection) {
        this._checkForMultirow();
        this._result.addCommandComplete(msg);
        if (this.rows) {
          connection.sync();
        }
      }
      // if a named prepared statement is created with empty query text
      // the backend will send an emptyQuery message but *not* a command complete message
      // since we pipeline sync immediately after execute we don't need to do anything here
      // unless we have rows specified, in which case we did not pipeline the initial sync call
      handleEmptyQuery(connection) {
        if (this.rows) {
          connection.sync();
        }
      }
      handleError(err, connection) {
        if (this._canceledDueToError) {
          err = this._canceledDueToError;
          this._canceledDueToError = false;
        }
        if (this.callback) {
          return this.callback(err);
        }
        this.emit("error", err);
      }
      handleReadyForQuery(con) {
        if (this._canceledDueToError) {
          return this.handleError(this._canceledDueToError, con);
        }
        if (this.callback) {
          try {
            this.callback(null, this._results);
          } catch (err) {
            process.nextTick(() => {
              throw err;
            });
          }
        }
        this.emit("end", this._results);
      }
      submit(connection) {
        if (typeof this.text !== "string" && typeof this.name !== "string") {
          return new Error("A query must have either text or a name. Supplying neither is unsupported.");
        }
        const previous = connection.parsedStatements[this.name];
        if (this.text && previous && this.text !== previous) {
          return new Error(`Prepared statements must be unique - '${this.name}' was used for a different statement`);
        }
        if (this.values && !Array.isArray(this.values)) {
          return new Error("Query values must be an array");
        }
        if (this.requiresPreparation()) {
          connection.stream.cork && connection.stream.cork();
          try {
            this.prepare(connection);
          } finally {
            connection.stream.uncork && connection.stream.uncork();
          }
        } else {
          connection.query(this.text);
        }
        return null;
      }
      hasBeenParsed(connection) {
        return this.name && connection.parsedStatements[this.name];
      }
      handlePortalSuspended(connection) {
        this._getRows(connection, this.rows);
      }
      _getRows(connection, rows) {
        connection.execute({
          portal: this.portal,
          rows
        });
        if (!rows) {
          connection.sync();
        } else {
          connection.flush();
        }
      }
      // http://developer.postgresql.org/pgdocs/postgres/protocol-flow.html#PROTOCOL-FLOW-EXT-QUERY
      prepare(connection) {
        if (!this.hasBeenParsed(connection)) {
          connection.parse({
            text: this.text,
            name: this.name,
            types: this.types
          });
        }
        try {
          connection.bind({
            portal: this.portal,
            statement: this.name,
            values: this.values,
            binary: this.binary,
            valueMapper: utils.prepareValue
          });
        } catch (err) {
          this.handleError(err, connection);
          return;
        }
        connection.describe({
          type: "P",
          name: this.portal || ""
        });
        this._getRows(connection, this.rows);
      }
      handleCopyInResponse(connection) {
        connection.sendCopyFail("No source stream defined");
      }
      handleCopyData(msg, connection) {
      }
    };
    module.exports = Query2;
  }
});

// node_modules/pg-protocol/dist/messages.js
var require_messages = __commonJS({
  "node_modules/pg-protocol/dist/messages.js"(exports) {
    "use strict";
    init_modules_watch_stub();
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.NoticeMessage = exports.DataRowMessage = exports.CommandCompleteMessage = exports.ReadyForQueryMessage = exports.NotificationResponseMessage = exports.BackendKeyDataMessage = exports.AuthenticationMD5Password = exports.ParameterStatusMessage = exports.ParameterDescriptionMessage = exports.RowDescriptionMessage = exports.Field = exports.CopyResponse = exports.CopyDataMessage = exports.DatabaseError = exports.copyDone = exports.emptyQuery = exports.replicationStart = exports.portalSuspended = exports.noData = exports.closeComplete = exports.bindComplete = exports.parseComplete = void 0;
    exports.parseComplete = {
      name: "parseComplete",
      length: 5
    };
    exports.bindComplete = {
      name: "bindComplete",
      length: 5
    };
    exports.closeComplete = {
      name: "closeComplete",
      length: 5
    };
    exports.noData = {
      name: "noData",
      length: 5
    };
    exports.portalSuspended = {
      name: "portalSuspended",
      length: 5
    };
    exports.replicationStart = {
      name: "replicationStart",
      length: 4
    };
    exports.emptyQuery = {
      name: "emptyQuery",
      length: 4
    };
    exports.copyDone = {
      name: "copyDone",
      length: 4
    };
    var DatabaseError2 = class extends Error {
      static {
        __name(this, "DatabaseError");
      }
      constructor(message, length, name) {
        super(message);
        this.length = length;
        this.name = name;
      }
    };
    exports.DatabaseError = DatabaseError2;
    var CopyDataMessage = class {
      static {
        __name(this, "CopyDataMessage");
      }
      constructor(length, chunk) {
        this.length = length;
        this.chunk = chunk;
        this.name = "copyData";
      }
    };
    exports.CopyDataMessage = CopyDataMessage;
    var CopyResponse = class {
      static {
        __name(this, "CopyResponse");
      }
      constructor(length, name, binary, columnCount) {
        this.length = length;
        this.name = name;
        this.binary = binary;
        this.columnTypes = new Array(columnCount);
      }
    };
    exports.CopyResponse = CopyResponse;
    var Field = class {
      static {
        __name(this, "Field");
      }
      constructor(name, tableID, columnID, dataTypeID, dataTypeSize, dataTypeModifier, format) {
        this.name = name;
        this.tableID = tableID;
        this.columnID = columnID;
        this.dataTypeID = dataTypeID;
        this.dataTypeSize = dataTypeSize;
        this.dataTypeModifier = dataTypeModifier;
        this.format = format;
      }
    };
    exports.Field = Field;
    var RowDescriptionMessage = class {
      static {
        __name(this, "RowDescriptionMessage");
      }
      constructor(length, fieldCount) {
        this.length = length;
        this.fieldCount = fieldCount;
        this.name = "rowDescription";
        this.fields = new Array(this.fieldCount);
      }
    };
    exports.RowDescriptionMessage = RowDescriptionMessage;
    var ParameterDescriptionMessage = class {
      static {
        __name(this, "ParameterDescriptionMessage");
      }
      constructor(length, parameterCount) {
        this.length = length;
        this.parameterCount = parameterCount;
        this.name = "parameterDescription";
        this.dataTypeIDs = new Array(this.parameterCount);
      }
    };
    exports.ParameterDescriptionMessage = ParameterDescriptionMessage;
    var ParameterStatusMessage = class {
      static {
        __name(this, "ParameterStatusMessage");
      }
      constructor(length, parameterName, parameterValue) {
        this.length = length;
        this.parameterName = parameterName;
        this.parameterValue = parameterValue;
        this.name = "parameterStatus";
      }
    };
    exports.ParameterStatusMessage = ParameterStatusMessage;
    var AuthenticationMD5Password = class {
      static {
        __name(this, "AuthenticationMD5Password");
      }
      constructor(length, salt) {
        this.length = length;
        this.salt = salt;
        this.name = "authenticationMD5Password";
      }
    };
    exports.AuthenticationMD5Password = AuthenticationMD5Password;
    var BackendKeyDataMessage = class {
      static {
        __name(this, "BackendKeyDataMessage");
      }
      constructor(length, processID, secretKey) {
        this.length = length;
        this.processID = processID;
        this.secretKey = secretKey;
        this.name = "backendKeyData";
      }
    };
    exports.BackendKeyDataMessage = BackendKeyDataMessage;
    var NotificationResponseMessage = class {
      static {
        __name(this, "NotificationResponseMessage");
      }
      constructor(length, processId, channel, payload) {
        this.length = length;
        this.processId = processId;
        this.channel = channel;
        this.payload = payload;
        this.name = "notification";
      }
    };
    exports.NotificationResponseMessage = NotificationResponseMessage;
    var ReadyForQueryMessage = class {
      static {
        __name(this, "ReadyForQueryMessage");
      }
      constructor(length, status) {
        this.length = length;
        this.status = status;
        this.name = "readyForQuery";
      }
    };
    exports.ReadyForQueryMessage = ReadyForQueryMessage;
    var CommandCompleteMessage = class {
      static {
        __name(this, "CommandCompleteMessage");
      }
      constructor(length, text) {
        this.length = length;
        this.text = text;
        this.name = "commandComplete";
      }
    };
    exports.CommandCompleteMessage = CommandCompleteMessage;
    var DataRowMessage = class {
      static {
        __name(this, "DataRowMessage");
      }
      constructor(length, fields) {
        this.length = length;
        this.fields = fields;
        this.name = "dataRow";
        this.fieldCount = fields.length;
      }
    };
    exports.DataRowMessage = DataRowMessage;
    var NoticeMessage = class {
      static {
        __name(this, "NoticeMessage");
      }
      constructor(length, message) {
        this.length = length;
        this.message = message;
        this.name = "notice";
      }
    };
    exports.NoticeMessage = NoticeMessage;
  }
});

// node_modules/pg-protocol/dist/buffer-writer.js
var require_buffer_writer = __commonJS({
  "node_modules/pg-protocol/dist/buffer-writer.js"(exports) {
    "use strict";
    init_modules_watch_stub();
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Writer = void 0;
    var Writer = class {
      static {
        __name(this, "Writer");
      }
      constructor(size = 256) {
        this.size = size;
        this.offset = 5;
        this.headerPosition = 0;
        this.buffer = Buffer.allocUnsafe(size);
      }
      ensure(size) {
        const remaining = this.buffer.length - this.offset;
        if (remaining < size) {
          const oldBuffer = this.buffer;
          const newSize = oldBuffer.length + (oldBuffer.length >> 1) + size;
          this.buffer = Buffer.allocUnsafe(newSize);
          oldBuffer.copy(this.buffer);
        }
      }
      addInt32(num) {
        this.ensure(4);
        this.buffer[this.offset++] = num >>> 24 & 255;
        this.buffer[this.offset++] = num >>> 16 & 255;
        this.buffer[this.offset++] = num >>> 8 & 255;
        this.buffer[this.offset++] = num >>> 0 & 255;
        return this;
      }
      addInt16(num) {
        this.ensure(2);
        this.buffer[this.offset++] = num >>> 8 & 255;
        this.buffer[this.offset++] = num >>> 0 & 255;
        return this;
      }
      addCString(string) {
        if (!string) {
          this.ensure(1);
        } else {
          const len = Buffer.byteLength(string);
          this.ensure(len + 1);
          this.buffer.write(string, this.offset, "utf-8");
          this.offset += len;
        }
        this.buffer[this.offset++] = 0;
        return this;
      }
      addString(string = "") {
        const len = Buffer.byteLength(string);
        this.ensure(len);
        this.buffer.write(string, this.offset);
        this.offset += len;
        return this;
      }
      add(otherBuffer) {
        this.ensure(otherBuffer.length);
        otherBuffer.copy(this.buffer, this.offset);
        this.offset += otherBuffer.length;
        return this;
      }
      join(code) {
        if (code) {
          this.buffer[this.headerPosition] = code;
          const length = this.offset - (this.headerPosition + 1);
          this.buffer.writeInt32BE(length, this.headerPosition + 1);
        }
        return this.buffer.slice(code ? 0 : 5, this.offset);
      }
      flush(code) {
        const result = this.join(code);
        this.offset = 5;
        this.headerPosition = 0;
        this.buffer = Buffer.allocUnsafe(this.size);
        return result;
      }
    };
    exports.Writer = Writer;
  }
});

// node_modules/pg-protocol/dist/serializer.js
var require_serializer = __commonJS({
  "node_modules/pg-protocol/dist/serializer.js"(exports) {
    "use strict";
    init_modules_watch_stub();
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.serialize = void 0;
    var buffer_writer_1 = require_buffer_writer();
    var writer = new buffer_writer_1.Writer();
    var startup = /* @__PURE__ */ __name((opts) => {
      writer.addInt16(3).addInt16(0);
      for (const key of Object.keys(opts)) {
        writer.addCString(key).addCString(opts[key]);
      }
      writer.addCString("client_encoding").addCString("UTF8");
      const bodyBuffer = writer.addCString("").flush();
      const length = bodyBuffer.length + 4;
      return new buffer_writer_1.Writer().addInt32(length).add(bodyBuffer).flush();
    }, "startup");
    var requestSsl = /* @__PURE__ */ __name(() => {
      const response = Buffer.allocUnsafe(8);
      response.writeInt32BE(8, 0);
      response.writeInt32BE(80877103, 4);
      return response;
    }, "requestSsl");
    var password = /* @__PURE__ */ __name((password2) => {
      return writer.addCString(password2).flush(
        112
        /* code.startup */
      );
    }, "password");
    var sendSASLInitialResponseMessage = /* @__PURE__ */ __name(function(mechanism, initialResponse) {
      writer.addCString(mechanism).addInt32(Buffer.byteLength(initialResponse)).addString(initialResponse);
      return writer.flush(
        112
        /* code.startup */
      );
    }, "sendSASLInitialResponseMessage");
    var sendSCRAMClientFinalMessage = /* @__PURE__ */ __name(function(additionalData) {
      return writer.addString(additionalData).flush(
        112
        /* code.startup */
      );
    }, "sendSCRAMClientFinalMessage");
    var query2 = /* @__PURE__ */ __name((text) => {
      return writer.addCString(text).flush(
        81
        /* code.query */
      );
    }, "query");
    var emptyArray = [];
    var parse = /* @__PURE__ */ __name((query3) => {
      const name = query3.name || "";
      if (name.length > 63) {
        console.error("Warning! Postgres only supports 63 characters for query names.");
        console.error("You supplied %s (%s)", name, name.length);
        console.error("This can cause conflicts and silent errors executing queries");
      }
      const types2 = query3.types || emptyArray;
      const len = types2.length;
      const buffer = writer.addCString(name).addCString(query3.text).addInt16(len);
      for (let i = 0; i < len; i++) {
        buffer.addInt32(types2[i]);
      }
      return writer.flush(
        80
        /* code.parse */
      );
    }, "parse");
    var paramWriter = new buffer_writer_1.Writer();
    var writeValues = /* @__PURE__ */ __name(function(values, valueMapper) {
      for (let i = 0; i < values.length; i++) {
        const mappedVal = valueMapper ? valueMapper(values[i], i) : values[i];
        if (mappedVal == null) {
          writer.addInt16(
            0
            /* ParamType.STRING */
          );
          paramWriter.addInt32(-1);
        } else if (mappedVal instanceof Buffer) {
          writer.addInt16(
            1
            /* ParamType.BINARY */
          );
          paramWriter.addInt32(mappedVal.length);
          paramWriter.add(mappedVal);
        } else {
          writer.addInt16(
            0
            /* ParamType.STRING */
          );
          paramWriter.addInt32(Buffer.byteLength(mappedVal));
          paramWriter.addString(mappedVal);
        }
      }
    }, "writeValues");
    var bind = /* @__PURE__ */ __name((config = {}) => {
      const portal = config.portal || "";
      const statement = config.statement || "";
      const binary = config.binary || false;
      const values = config.values || emptyArray;
      const len = values.length;
      writer.addCString(portal).addCString(statement);
      writer.addInt16(len);
      writeValues(values, config.valueMapper);
      writer.addInt16(len);
      writer.add(paramWriter.flush());
      writer.addInt16(1);
      writer.addInt16(
        binary ? 1 : 0
        /* ParamType.STRING */
      );
      return writer.flush(
        66
        /* code.bind */
      );
    }, "bind");
    var emptyExecute = Buffer.from([69, 0, 0, 0, 9, 0, 0, 0, 0, 0]);
    var execute = /* @__PURE__ */ __name((config) => {
      if (!config || !config.portal && !config.rows) {
        return emptyExecute;
      }
      const portal = config.portal || "";
      const rows = config.rows || 0;
      const portalLength = Buffer.byteLength(portal);
      const len = 4 + portalLength + 1 + 4;
      const buff = Buffer.allocUnsafe(1 + len);
      buff[0] = 69;
      buff.writeInt32BE(len, 1);
      buff.write(portal, 5, "utf-8");
      buff[portalLength + 5] = 0;
      buff.writeUInt32BE(rows, buff.length - 4);
      return buff;
    }, "execute");
    var cancel = /* @__PURE__ */ __name((processID, secretKey) => {
      const buffer = Buffer.allocUnsafe(16);
      buffer.writeInt32BE(16, 0);
      buffer.writeInt16BE(1234, 4);
      buffer.writeInt16BE(5678, 6);
      buffer.writeInt32BE(processID, 8);
      buffer.writeInt32BE(secretKey, 12);
      return buffer;
    }, "cancel");
    var cstringMessage = /* @__PURE__ */ __name((code, string) => {
      const stringLen = Buffer.byteLength(string);
      const len = 4 + stringLen + 1;
      const buffer = Buffer.allocUnsafe(1 + len);
      buffer[0] = code;
      buffer.writeInt32BE(len, 1);
      buffer.write(string, 5, "utf-8");
      buffer[len] = 0;
      return buffer;
    }, "cstringMessage");
    var emptyDescribePortal = writer.addCString("P").flush(
      68
      /* code.describe */
    );
    var emptyDescribeStatement = writer.addCString("S").flush(
      68
      /* code.describe */
    );
    var describe = /* @__PURE__ */ __name((msg) => {
      return msg.name ? cstringMessage(68, `${msg.type}${msg.name || ""}`) : msg.type === "P" ? emptyDescribePortal : emptyDescribeStatement;
    }, "describe");
    var close = /* @__PURE__ */ __name((msg) => {
      const text = `${msg.type}${msg.name || ""}`;
      return cstringMessage(67, text);
    }, "close");
    var copyData = /* @__PURE__ */ __name((chunk) => {
      return writer.add(chunk).flush(
        100
        /* code.copyFromChunk */
      );
    }, "copyData");
    var copyFail = /* @__PURE__ */ __name((message) => {
      return cstringMessage(102, message);
    }, "copyFail");
    var codeOnlyBuffer = /* @__PURE__ */ __name((code) => Buffer.from([code, 0, 0, 0, 4]), "codeOnlyBuffer");
    var flushBuffer = codeOnlyBuffer(
      72
      /* code.flush */
    );
    var syncBuffer = codeOnlyBuffer(
      83
      /* code.sync */
    );
    var endBuffer = codeOnlyBuffer(
      88
      /* code.end */
    );
    var copyDoneBuffer = codeOnlyBuffer(
      99
      /* code.copyDone */
    );
    var serialize = {
      startup,
      password,
      requestSsl,
      sendSASLInitialResponseMessage,
      sendSCRAMClientFinalMessage,
      query: query2,
      parse,
      bind,
      execute,
      describe,
      close,
      flush: /* @__PURE__ */ __name(() => flushBuffer, "flush"),
      sync: /* @__PURE__ */ __name(() => syncBuffer, "sync"),
      end: /* @__PURE__ */ __name(() => endBuffer, "end"),
      copyData,
      copyDone: /* @__PURE__ */ __name(() => copyDoneBuffer, "copyDone"),
      copyFail,
      cancel
    };
    exports.serialize = serialize;
  }
});

// node_modules/pg-protocol/dist/buffer-reader.js
var require_buffer_reader = __commonJS({
  "node_modules/pg-protocol/dist/buffer-reader.js"(exports) {
    "use strict";
    init_modules_watch_stub();
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.BufferReader = void 0;
    var BufferReader = class {
      static {
        __name(this, "BufferReader");
      }
      constructor(offset = 0) {
        this.offset = offset;
        this.buffer = Buffer.allocUnsafe(0);
        this.encoding = "utf-8";
      }
      setBuffer(offset, buffer) {
        this.offset = offset;
        this.buffer = buffer;
      }
      int16() {
        const result = this.buffer.readInt16BE(this.offset);
        this.offset += 2;
        return result;
      }
      byte() {
        const result = this.buffer[this.offset];
        this.offset++;
        return result;
      }
      int32() {
        const result = this.buffer.readInt32BE(this.offset);
        this.offset += 4;
        return result;
      }
      uint32() {
        const result = this.buffer.readUInt32BE(this.offset);
        this.offset += 4;
        return result;
      }
      string(length) {
        const result = this.buffer.toString(this.encoding, this.offset, this.offset + length);
        this.offset += length;
        return result;
      }
      cstring() {
        const start = this.offset;
        let end = start;
        while (this.buffer[end++] !== 0) {
        }
        this.offset = end;
        return this.buffer.toString(this.encoding, start, end - 1);
      }
      bytes(length) {
        const result = this.buffer.slice(this.offset, this.offset + length);
        this.offset += length;
        return result;
      }
    };
    exports.BufferReader = BufferReader;
  }
});

// node_modules/pg-protocol/dist/parser.js
var require_parser = __commonJS({
  "node_modules/pg-protocol/dist/parser.js"(exports) {
    "use strict";
    init_modules_watch_stub();
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Parser = void 0;
    var messages_1 = require_messages();
    var buffer_reader_1 = require_buffer_reader();
    var CODE_LENGTH = 1;
    var LEN_LENGTH = 4;
    var HEADER_LENGTH = CODE_LENGTH + LEN_LENGTH;
    var LATEINIT_LENGTH = -1;
    var emptyBuffer = Buffer.allocUnsafe(0);
    var Parser = class {
      static {
        __name(this, "Parser");
      }
      constructor(opts) {
        this.buffer = emptyBuffer;
        this.bufferLength = 0;
        this.bufferOffset = 0;
        this.reader = new buffer_reader_1.BufferReader();
        if ((opts === null || opts === void 0 ? void 0 : opts.mode) === "binary") {
          throw new Error("Binary mode not supported yet");
        }
        this.mode = (opts === null || opts === void 0 ? void 0 : opts.mode) || "text";
      }
      parse(buffer, callback) {
        this.mergeBuffer(buffer);
        const bufferFullLength = this.bufferOffset + this.bufferLength;
        let offset = this.bufferOffset;
        while (offset + HEADER_LENGTH <= bufferFullLength) {
          const code = this.buffer[offset];
          const length = this.buffer.readUInt32BE(offset + CODE_LENGTH);
          const fullMessageLength = CODE_LENGTH + length;
          if (fullMessageLength + offset <= bufferFullLength) {
            const message = this.handlePacket(offset + HEADER_LENGTH, code, length, this.buffer);
            callback(message);
            offset += fullMessageLength;
          } else {
            break;
          }
        }
        if (offset === bufferFullLength) {
          this.buffer = emptyBuffer;
          this.bufferLength = 0;
          this.bufferOffset = 0;
        } else {
          this.bufferLength = bufferFullLength - offset;
          this.bufferOffset = offset;
        }
      }
      mergeBuffer(buffer) {
        if (this.bufferLength > 0) {
          const newLength = this.bufferLength + buffer.byteLength;
          const newFullLength = newLength + this.bufferOffset;
          if (newFullLength > this.buffer.byteLength) {
            let newBuffer;
            if (newLength <= this.buffer.byteLength && this.bufferOffset >= this.bufferLength) {
              newBuffer = this.buffer;
            } else {
              let newBufferLength = this.buffer.byteLength * 2;
              while (newLength >= newBufferLength) {
                newBufferLength *= 2;
              }
              newBuffer = Buffer.allocUnsafe(newBufferLength);
            }
            this.buffer.copy(newBuffer, 0, this.bufferOffset, this.bufferOffset + this.bufferLength);
            this.buffer = newBuffer;
            this.bufferOffset = 0;
          }
          buffer.copy(this.buffer, this.bufferOffset + this.bufferLength);
          this.bufferLength = newLength;
        } else {
          this.buffer = buffer;
          this.bufferOffset = 0;
          this.bufferLength = buffer.byteLength;
        }
      }
      handlePacket(offset, code, length, bytes) {
        const { reader } = this;
        reader.setBuffer(offset, bytes);
        let message;
        switch (code) {
          case 50:
            message = messages_1.bindComplete;
            break;
          case 49:
            message = messages_1.parseComplete;
            break;
          case 51:
            message = messages_1.closeComplete;
            break;
          case 110:
            message = messages_1.noData;
            break;
          case 115:
            message = messages_1.portalSuspended;
            break;
          case 99:
            message = messages_1.copyDone;
            break;
          case 87:
            message = messages_1.replicationStart;
            break;
          case 73:
            message = messages_1.emptyQuery;
            break;
          case 68:
            message = parseDataRowMessage(reader);
            break;
          case 67:
            message = parseCommandCompleteMessage(reader);
            break;
          case 90:
            message = parseReadyForQueryMessage(reader);
            break;
          case 65:
            message = parseNotificationMessage(reader);
            break;
          case 82:
            message = parseAuthenticationResponse(reader, length);
            break;
          case 83:
            message = parseParameterStatusMessage(reader);
            break;
          case 75:
            message = parseBackendKeyData(reader);
            break;
          case 69:
            message = parseErrorMessage(reader, "error");
            break;
          case 78:
            message = parseErrorMessage(reader, "notice");
            break;
          case 84:
            message = parseRowDescriptionMessage(reader);
            break;
          case 116:
            message = parseParameterDescriptionMessage(reader);
            break;
          case 71:
            message = parseCopyInMessage(reader);
            break;
          case 72:
            message = parseCopyOutMessage(reader);
            break;
          case 100:
            message = parseCopyData(reader, length);
            break;
          default:
            return new messages_1.DatabaseError("received invalid response: " + code.toString(16), length, "error");
        }
        reader.setBuffer(0, emptyBuffer);
        message.length = length;
        return message;
      }
    };
    exports.Parser = Parser;
    var parseReadyForQueryMessage = /* @__PURE__ */ __name((reader) => {
      const status = reader.string(1);
      return new messages_1.ReadyForQueryMessage(LATEINIT_LENGTH, status);
    }, "parseReadyForQueryMessage");
    var parseCommandCompleteMessage = /* @__PURE__ */ __name((reader) => {
      const text = reader.cstring();
      return new messages_1.CommandCompleteMessage(LATEINIT_LENGTH, text);
    }, "parseCommandCompleteMessage");
    var parseCopyData = /* @__PURE__ */ __name((reader, length) => {
      const chunk = reader.bytes(length - 4);
      return new messages_1.CopyDataMessage(LATEINIT_LENGTH, chunk);
    }, "parseCopyData");
    var parseCopyInMessage = /* @__PURE__ */ __name((reader) => parseCopyMessage(reader, "copyInResponse"), "parseCopyInMessage");
    var parseCopyOutMessage = /* @__PURE__ */ __name((reader) => parseCopyMessage(reader, "copyOutResponse"), "parseCopyOutMessage");
    var parseCopyMessage = /* @__PURE__ */ __name((reader, messageName) => {
      const isBinary = reader.byte() !== 0;
      const columnCount = reader.int16();
      const message = new messages_1.CopyResponse(LATEINIT_LENGTH, messageName, isBinary, columnCount);
      for (let i = 0; i < columnCount; i++) {
        message.columnTypes[i] = reader.int16();
      }
      return message;
    }, "parseCopyMessage");
    var parseNotificationMessage = /* @__PURE__ */ __name((reader) => {
      const processId = reader.int32();
      const channel = reader.cstring();
      const payload = reader.cstring();
      return new messages_1.NotificationResponseMessage(LATEINIT_LENGTH, processId, channel, payload);
    }, "parseNotificationMessage");
    var parseRowDescriptionMessage = /* @__PURE__ */ __name((reader) => {
      const fieldCount = reader.int16();
      const message = new messages_1.RowDescriptionMessage(LATEINIT_LENGTH, fieldCount);
      for (let i = 0; i < fieldCount; i++) {
        message.fields[i] = parseField(reader);
      }
      return message;
    }, "parseRowDescriptionMessage");
    var parseField = /* @__PURE__ */ __name((reader) => {
      const name = reader.cstring();
      const tableID = reader.uint32();
      const columnID = reader.int16();
      const dataTypeID = reader.uint32();
      const dataTypeSize = reader.int16();
      const dataTypeModifier = reader.int32();
      const mode = reader.int16() === 0 ? "text" : "binary";
      return new messages_1.Field(name, tableID, columnID, dataTypeID, dataTypeSize, dataTypeModifier, mode);
    }, "parseField");
    var parseParameterDescriptionMessage = /* @__PURE__ */ __name((reader) => {
      const parameterCount = reader.int16();
      const message = new messages_1.ParameterDescriptionMessage(LATEINIT_LENGTH, parameterCount);
      for (let i = 0; i < parameterCount; i++) {
        message.dataTypeIDs[i] = reader.int32();
      }
      return message;
    }, "parseParameterDescriptionMessage");
    var parseDataRowMessage = /* @__PURE__ */ __name((reader) => {
      const fieldCount = reader.int16();
      const fields = new Array(fieldCount);
      for (let i = 0; i < fieldCount; i++) {
        const len = reader.int32();
        fields[i] = len === -1 ? null : reader.string(len);
      }
      return new messages_1.DataRowMessage(LATEINIT_LENGTH, fields);
    }, "parseDataRowMessage");
    var parseParameterStatusMessage = /* @__PURE__ */ __name((reader) => {
      const name = reader.cstring();
      const value = reader.cstring();
      return new messages_1.ParameterStatusMessage(LATEINIT_LENGTH, name, value);
    }, "parseParameterStatusMessage");
    var parseBackendKeyData = /* @__PURE__ */ __name((reader) => {
      const processID = reader.int32();
      const secretKey = reader.int32();
      return new messages_1.BackendKeyDataMessage(LATEINIT_LENGTH, processID, secretKey);
    }, "parseBackendKeyData");
    var parseAuthenticationResponse = /* @__PURE__ */ __name((reader, length) => {
      const code = reader.int32();
      const message = {
        name: "authenticationOk",
        length
      };
      switch (code) {
        case 0:
          break;
        case 3:
          if (message.length === 8) {
            message.name = "authenticationCleartextPassword";
          }
          break;
        case 5:
          if (message.length === 12) {
            message.name = "authenticationMD5Password";
            const salt = reader.bytes(4);
            return new messages_1.AuthenticationMD5Password(LATEINIT_LENGTH, salt);
          }
          break;
        case 10:
          {
            message.name = "authenticationSASL";
            message.mechanisms = [];
            let mechanism;
            do {
              mechanism = reader.cstring();
              if (mechanism) {
                message.mechanisms.push(mechanism);
              }
            } while (mechanism);
          }
          break;
        case 11:
          message.name = "authenticationSASLContinue";
          message.data = reader.string(length - 8);
          break;
        case 12:
          message.name = "authenticationSASLFinal";
          message.data = reader.string(length - 8);
          break;
        default:
          throw new Error("Unknown authenticationOk message type " + code);
      }
      return message;
    }, "parseAuthenticationResponse");
    var parseErrorMessage = /* @__PURE__ */ __name((reader, name) => {
      const fields = {};
      let fieldType = reader.string(1);
      while (fieldType !== "\0") {
        fields[fieldType] = reader.cstring();
        fieldType = reader.string(1);
      }
      const messageValue = fields.M;
      const message = name === "notice" ? new messages_1.NoticeMessage(LATEINIT_LENGTH, messageValue) : new messages_1.DatabaseError(messageValue, LATEINIT_LENGTH, name);
      message.severity = fields.S;
      message.code = fields.C;
      message.detail = fields.D;
      message.hint = fields.H;
      message.position = fields.P;
      message.internalPosition = fields.p;
      message.internalQuery = fields.q;
      message.where = fields.W;
      message.schema = fields.s;
      message.table = fields.t;
      message.column = fields.c;
      message.dataType = fields.d;
      message.constraint = fields.n;
      message.file = fields.F;
      message.line = fields.L;
      message.routine = fields.R;
      return message;
    }, "parseErrorMessage");
  }
});

// node_modules/pg-protocol/dist/index.js
var require_dist = __commonJS({
  "node_modules/pg-protocol/dist/index.js"(exports) {
    "use strict";
    init_modules_watch_stub();
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.DatabaseError = exports.serialize = exports.parse = void 0;
    var messages_1 = require_messages();
    Object.defineProperty(exports, "DatabaseError", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return messages_1.DatabaseError;
    }, "get") });
    var serializer_1 = require_serializer();
    Object.defineProperty(exports, "serialize", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return serializer_1.serialize;
    }, "get") });
    var parser_1 = require_parser();
    function parse(stream, callback) {
      const parser = new parser_1.Parser();
      stream.on("data", (buffer) => parser.parse(buffer, callback));
      return new Promise((resolve) => stream.on("end", () => resolve()));
    }
    __name(parse, "parse");
    exports.parse = parse;
  }
});

// node-built-in-modules:net
import libDefault6 from "net";
var require_net = __commonJS({
  "node-built-in-modules:net"(exports, module) {
    init_modules_watch_stub();
    module.exports = libDefault6;
  }
});

// node-built-in-modules:tls
import libDefault7 from "tls";
var require_tls = __commonJS({
  "node-built-in-modules:tls"(exports, module) {
    init_modules_watch_stub();
    module.exports = libDefault7;
  }
});

// node_modules/pg-cloudflare/dist/index.js
var require_dist2 = __commonJS({
  "node_modules/pg-cloudflare/dist/index.js"(exports) {
    "use strict";
    init_modules_watch_stub();
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CloudflareSocket = void 0;
    var events_1 = require_events();
    var CloudflareSocket = class extends events_1.EventEmitter {
      static {
        __name(this, "CloudflareSocket");
      }
      constructor(ssl) {
        super();
        this.ssl = ssl;
        this.writable = false;
        this.destroyed = false;
        this._upgrading = false;
        this._upgraded = false;
        this._cfSocket = null;
        this._cfWriter = null;
        this._cfReader = null;
      }
      setNoDelay() {
        return this;
      }
      setKeepAlive() {
        return this;
      }
      ref() {
        return this;
      }
      unref() {
        return this;
      }
      async connect(port, host, connectListener) {
        try {
          log("connecting");
          if (connectListener)
            this.once("connect", connectListener);
          const options = this.ssl ? { secureTransport: "starttls" } : {};
          const mod = await import("cloudflare:sockets");
          const connect = mod.connect;
          this._cfSocket = connect(`${host}:${port}`, options);
          this._cfWriter = this._cfSocket.writable.getWriter();
          this._addClosedHandler();
          this._cfReader = this._cfSocket.readable.getReader();
          if (this.ssl) {
            this._listenOnce().catch((e) => this.emit("error", e));
          } else {
            this._listen().catch((e) => this.emit("error", e));
          }
          await this._cfWriter.ready;
          log("socket ready");
          this.writable = true;
          this.emit("connect");
          return this;
        } catch (e) {
          this.emit("error", e);
        }
      }
      async _listen() {
        while (true) {
          log("awaiting receive from CF socket");
          const { done, value } = await this._cfReader.read();
          log("CF socket received:", done, value);
          if (done) {
            log("done");
            break;
          }
          this.emit("data", Buffer.from(value));
        }
      }
      async _listenOnce() {
        log("awaiting first receive from CF socket");
        const { done, value } = await this._cfReader.read();
        log("First CF socket received:", done, value);
        this.emit("data", Buffer.from(value));
      }
      write(data, encoding = "utf8", callback = () => {
      }) {
        if (data.length === 0)
          return callback();
        if (typeof data === "string")
          data = Buffer.from(data, encoding);
        log("sending data direct:", data);
        this._cfWriter.write(data).then(() => {
          log("data sent");
          callback();
        }, (err) => {
          log("send error", err);
          callback(err);
        });
        return true;
      }
      end(data = Buffer.alloc(0), encoding = "utf8", callback = () => {
      }) {
        log("ending CF socket");
        this.write(data, encoding, (err) => {
          this._cfSocket.close();
          if (callback)
            callback(err);
        });
        return this;
      }
      destroy(reason) {
        log("destroying CF socket", reason);
        this.destroyed = true;
        return this.end();
      }
      startTls(options) {
        if (this._upgraded) {
          this.emit("error", "Cannot call `startTls()` more than once on a socket");
          return;
        }
        this._cfWriter.releaseLock();
        this._cfReader.releaseLock();
        this._upgrading = true;
        this._cfSocket = this._cfSocket.startTls(options);
        this._cfWriter = this._cfSocket.writable.getWriter();
        this._cfReader = this._cfSocket.readable.getReader();
        this._addClosedHandler();
        this._listen().catch((e) => this.emit("error", e));
      }
      _addClosedHandler() {
        this._cfSocket.closed.then(() => {
          if (!this._upgrading) {
            log("CF socket closed");
            this._cfSocket = null;
            this.emit("close");
          } else {
            this._upgrading = false;
            this._upgraded = true;
          }
        }).catch((e) => this.emit("error", e));
      }
    };
    exports.CloudflareSocket = CloudflareSocket;
    var debug = false;
    function dump(data) {
      if (data instanceof Uint8Array || data instanceof ArrayBuffer) {
        const hex = Buffer.from(data).toString("hex");
        const str = new TextDecoder().decode(data);
        return `
>>> STR: "${str.replace(/\n/g, "\\n")}"
>>> HEX: ${hex}
`;
      } else {
        return data;
      }
    }
    __name(dump, "dump");
    function log(...args) {
      debug && console.log(...args.map(dump));
    }
    __name(log, "log");
  }
});

// node_modules/pg/lib/stream.js
var require_stream = __commonJS({
  "node_modules/pg/lib/stream.js"(exports, module) {
    init_modules_watch_stub();
    var { getStream, getSecureStream } = getStreamFuncs();
    module.exports = {
      /**
       * Get a socket stream compatible with the current runtime environment.
       * @returns {Duplex}
       */
      getStream,
      /**
       * Get a TLS secured socket, compatible with the current environment,
       * using the socket and other settings given in `options`.
       * @returns {Duplex}
       */
      getSecureStream
    };
    function getNodejsStreamFuncs() {
      function getStream2(ssl) {
        const net = require_net();
        return new net.Socket();
      }
      __name(getStream2, "getStream");
      function getSecureStream2(options) {
        const tls = require_tls();
        return tls.connect(options);
      }
      __name(getSecureStream2, "getSecureStream");
      return {
        getStream: getStream2,
        getSecureStream: getSecureStream2
      };
    }
    __name(getNodejsStreamFuncs, "getNodejsStreamFuncs");
    function getCloudflareStreamFuncs() {
      function getStream2(ssl) {
        const { CloudflareSocket } = require_dist2();
        return new CloudflareSocket(ssl);
      }
      __name(getStream2, "getStream");
      function getSecureStream2(options) {
        options.socket.startTls(options);
        return options.socket;
      }
      __name(getSecureStream2, "getSecureStream");
      return {
        getStream: getStream2,
        getSecureStream: getSecureStream2
      };
    }
    __name(getCloudflareStreamFuncs, "getCloudflareStreamFuncs");
    function isCloudflareRuntime() {
      if (typeof navigator === "object" && navigator !== null && true) {
        return true;
      }
      if (typeof Response === "function") {
        const resp = new Response(null, { cf: { thing: true } });
        if (typeof resp.cf === "object" && resp.cf !== null && resp.cf.thing) {
          return true;
        }
      }
      return false;
    }
    __name(isCloudflareRuntime, "isCloudflareRuntime");
    function getStreamFuncs() {
      if (isCloudflareRuntime()) {
        return getCloudflareStreamFuncs();
      }
      return getNodejsStreamFuncs();
    }
    __name(getStreamFuncs, "getStreamFuncs");
  }
});

// node_modules/pg/lib/connection.js
var require_connection = __commonJS({
  "node_modules/pg/lib/connection.js"(exports, module) {
    "use strict";
    init_modules_watch_stub();
    var EventEmitter = require_events().EventEmitter;
    var { parse, serialize } = require_dist();
    var { getStream, getSecureStream } = require_stream();
    var flushBuffer = serialize.flush();
    var syncBuffer = serialize.sync();
    var endBuffer = serialize.end();
    var Connection2 = class extends EventEmitter {
      static {
        __name(this, "Connection");
      }
      constructor(config) {
        super();
        config = config || {};
        this.stream = config.stream || getStream(config.ssl);
        if (typeof this.stream === "function") {
          this.stream = this.stream(config);
        }
        this._keepAlive = config.keepAlive;
        this._keepAliveInitialDelayMillis = config.keepAliveInitialDelayMillis;
        this.parsedStatements = {};
        this.ssl = config.ssl || false;
        this._ending = false;
        this._emitMessage = false;
        const self = this;
        this.on("newListener", function(eventName) {
          if (eventName === "message") {
            self._emitMessage = true;
          }
        });
      }
      connect(port, host) {
        const self = this;
        this._connecting = true;
        this.stream.setNoDelay(true);
        this.stream.connect(port, host);
        this.stream.once("connect", function() {
          if (self._keepAlive) {
            self.stream.setKeepAlive(true, self._keepAliveInitialDelayMillis);
          }
          self.emit("connect");
        });
        const reportStreamError = /* @__PURE__ */ __name(function(error) {
          if (self._ending && (error.code === "ECONNRESET" || error.code === "EPIPE")) {
            return;
          }
          self.emit("error", error);
        }, "reportStreamError");
        this.stream.on("error", reportStreamError);
        this.stream.on("close", function() {
          self.emit("end");
        });
        if (!this.ssl) {
          return this.attachListeners(this.stream);
        }
        this.stream.once("data", function(buffer) {
          const responseCode = buffer.toString("utf8");
          switch (responseCode) {
            case "S":
              break;
            case "N":
              self.stream.end();
              return self.emit("error", new Error("The server does not support SSL connections"));
            default:
              self.stream.end();
              return self.emit("error", new Error("There was an error establishing an SSL connection"));
          }
          const options = {
            socket: self.stream
          };
          if (self.ssl !== true) {
            Object.assign(options, self.ssl);
            if ("key" in self.ssl) {
              options.key = self.ssl.key;
            }
          }
          const net = require_net();
          if (net.isIP && net.isIP(host) === 0) {
            options.servername = host;
          }
          try {
            self.stream = getSecureStream(options);
          } catch (err) {
            return self.emit("error", err);
          }
          self.attachListeners(self.stream);
          self.stream.on("error", reportStreamError);
          self.emit("sslconnect");
        });
      }
      attachListeners(stream) {
        parse(stream, (msg) => {
          const eventName = msg.name === "error" ? "errorMessage" : msg.name;
          if (this._emitMessage) {
            this.emit("message", msg);
          }
          this.emit(eventName, msg);
        });
      }
      requestSsl() {
        this.stream.write(serialize.requestSsl());
      }
      startup(config) {
        this.stream.write(serialize.startup(config));
      }
      cancel(processID, secretKey) {
        this._send(serialize.cancel(processID, secretKey));
      }
      password(password) {
        this._send(serialize.password(password));
      }
      sendSASLInitialResponseMessage(mechanism, initialResponse) {
        this._send(serialize.sendSASLInitialResponseMessage(mechanism, initialResponse));
      }
      sendSCRAMClientFinalMessage(additionalData) {
        this._send(serialize.sendSCRAMClientFinalMessage(additionalData));
      }
      _send(buffer) {
        if (!this.stream.writable) {
          return false;
        }
        return this.stream.write(buffer);
      }
      query(text) {
        this._send(serialize.query(text));
      }
      // send parse message
      parse(query2) {
        this._send(serialize.parse(query2));
      }
      // send bind message
      bind(config) {
        this._send(serialize.bind(config));
      }
      // send execute message
      execute(config) {
        this._send(serialize.execute(config));
      }
      flush() {
        if (this.stream.writable) {
          this.stream.write(flushBuffer);
        }
      }
      sync() {
        this._ending = true;
        this._send(syncBuffer);
      }
      ref() {
        this.stream.ref();
      }
      unref() {
        this.stream.unref();
      }
      end() {
        this._ending = true;
        if (!this._connecting || !this.stream.writable) {
          this.stream.end();
          return;
        }
        return this.stream.write(endBuffer, () => {
          this.stream.end();
        });
      }
      close(msg) {
        this._send(serialize.close(msg));
      }
      describe(msg) {
        this._send(serialize.describe(msg));
      }
      sendCopyFromChunk(chunk) {
        this._send(serialize.copyData(chunk));
      }
      endCopyFrom() {
        this._send(serialize.copyDone());
      }
      sendCopyFail(msg) {
        this._send(serialize.copyFail(msg));
      }
    };
    module.exports = Connection2;
  }
});

// node-built-in-modules:path
import libDefault8 from "path";
var require_path = __commonJS({
  "node-built-in-modules:path"(exports, module) {
    init_modules_watch_stub();
    module.exports = libDefault8;
  }
});

// node-built-in-modules:stream
import libDefault9 from "stream";
var require_stream2 = __commonJS({
  "node-built-in-modules:stream"(exports, module) {
    init_modules_watch_stub();
    module.exports = libDefault9;
  }
});

// node-built-in-modules:string_decoder
import libDefault10 from "string_decoder";
var require_string_decoder = __commonJS({
  "node-built-in-modules:string_decoder"(exports, module) {
    init_modules_watch_stub();
    module.exports = libDefault10;
  }
});

// node_modules/split2/index.js
var require_split2 = __commonJS({
  "node_modules/split2/index.js"(exports, module) {
    "use strict";
    init_modules_watch_stub();
    var { Transform } = require_stream2();
    var { StringDecoder } = require_string_decoder();
    var kLast = /* @__PURE__ */ Symbol("last");
    var kDecoder = /* @__PURE__ */ Symbol("decoder");
    function transform(chunk, enc, cb) {
      let list;
      if (this.overflow) {
        const buf = this[kDecoder].write(chunk);
        list = buf.split(this.matcher);
        if (list.length === 1) return cb();
        list.shift();
        this.overflow = false;
      } else {
        this[kLast] += this[kDecoder].write(chunk);
        list = this[kLast].split(this.matcher);
      }
      this[kLast] = list.pop();
      for (let i = 0; i < list.length; i++) {
        try {
          push(this, this.mapper(list[i]));
        } catch (error) {
          return cb(error);
        }
      }
      this.overflow = this[kLast].length > this.maxLength;
      if (this.overflow && !this.skipOverflow) {
        cb(new Error("maximum buffer reached"));
        return;
      }
      cb();
    }
    __name(transform, "transform");
    function flush(cb) {
      this[kLast] += this[kDecoder].end();
      if (this[kLast]) {
        try {
          push(this, this.mapper(this[kLast]));
        } catch (error) {
          return cb(error);
        }
      }
      cb();
    }
    __name(flush, "flush");
    function push(self, val) {
      if (val !== void 0) {
        self.push(val);
      }
    }
    __name(push, "push");
    function noop(incoming) {
      return incoming;
    }
    __name(noop, "noop");
    function split(matcher, mapper, options) {
      matcher = matcher || /\r?\n/;
      mapper = mapper || noop;
      options = options || {};
      switch (arguments.length) {
        case 1:
          if (typeof matcher === "function") {
            mapper = matcher;
            matcher = /\r?\n/;
          } else if (typeof matcher === "object" && !(matcher instanceof RegExp) && !matcher[Symbol.split]) {
            options = matcher;
            matcher = /\r?\n/;
          }
          break;
        case 2:
          if (typeof matcher === "function") {
            options = mapper;
            mapper = matcher;
            matcher = /\r?\n/;
          } else if (typeof mapper === "object") {
            options = mapper;
            mapper = noop;
          }
      }
      options = Object.assign({}, options);
      options.autoDestroy = true;
      options.transform = transform;
      options.flush = flush;
      options.readableObjectMode = true;
      const stream = new Transform(options);
      stream[kLast] = "";
      stream[kDecoder] = new StringDecoder("utf8");
      stream.matcher = matcher;
      stream.mapper = mapper;
      stream.maxLength = options.maxLength;
      stream.skipOverflow = options.skipOverflow || false;
      stream.overflow = false;
      stream._destroy = function(err, cb) {
        this._writableState.errorEmitted = false;
        cb(err);
      };
      return stream;
    }
    __name(split, "split");
    module.exports = split;
  }
});

// node_modules/pgpass/lib/helper.js
var require_helper = __commonJS({
  "node_modules/pgpass/lib/helper.js"(exports, module) {
    "use strict";
    init_modules_watch_stub();
    var path = require_path();
    var Stream = require_stream2().Stream;
    var split = require_split2();
    var util = require_util();
    var defaultPort = 5432;
    var isWin = process.platform === "win32";
    var warnStream = process.stderr;
    var S_IRWXG = 56;
    var S_IRWXO = 7;
    var S_IFMT = 61440;
    var S_IFREG = 32768;
    function isRegFile(mode) {
      return (mode & S_IFMT) == S_IFREG;
    }
    __name(isRegFile, "isRegFile");
    var fieldNames = ["host", "port", "database", "user", "password"];
    var nrOfFields = fieldNames.length;
    var passKey = fieldNames[nrOfFields - 1];
    function warn() {
      var isWritable = warnStream instanceof Stream && true === warnStream.writable;
      if (isWritable) {
        var args = Array.prototype.slice.call(arguments).concat("\n");
        warnStream.write(util.format.apply(util, args));
      }
    }
    __name(warn, "warn");
    Object.defineProperty(module.exports, "isWin", {
      get: /* @__PURE__ */ __name(function() {
        return isWin;
      }, "get"),
      set: /* @__PURE__ */ __name(function(val) {
        isWin = val;
      }, "set")
    });
    module.exports.warnTo = function(stream) {
      var old = warnStream;
      warnStream = stream;
      return old;
    };
    module.exports.getFileName = function(rawEnv) {
      var env = rawEnv || process.env;
      var file = env.PGPASSFILE || (isWin ? path.join(env.APPDATA || "./", "postgresql", "pgpass.conf") : path.join(env.HOME || "./", ".pgpass"));
      return file;
    };
    module.exports.usePgPass = function(stats, fname) {
      if (Object.prototype.hasOwnProperty.call(process.env, "PGPASSWORD")) {
        return false;
      }
      if (isWin) {
        return true;
      }
      fname = fname || "<unkn>";
      if (!isRegFile(stats.mode)) {
        warn('WARNING: password file "%s" is not a plain file', fname);
        return false;
      }
      if (stats.mode & (S_IRWXG | S_IRWXO)) {
        warn('WARNING: password file "%s" has group or world access; permissions should be u=rw (0600) or less', fname);
        return false;
      }
      return true;
    };
    var matcher = module.exports.match = function(connInfo, entry) {
      return fieldNames.slice(0, -1).reduce(function(prev, field, idx) {
        if (idx == 1) {
          if (Number(connInfo[field] || defaultPort) === Number(entry[field])) {
            return prev && true;
          }
        }
        return prev && (entry[field] === "*" || entry[field] === connInfo[field]);
      }, true);
    };
    module.exports.getPassword = function(connInfo, stream, cb) {
      var pass;
      var lineStream = stream.pipe(split());
      function onLine(line) {
        var entry = parseLine(line);
        if (entry && isValidEntry(entry) && matcher(connInfo, entry)) {
          pass = entry[passKey];
          lineStream.end();
        }
      }
      __name(onLine, "onLine");
      var onEnd = /* @__PURE__ */ __name(function() {
        stream.destroy();
        cb(pass);
      }, "onEnd");
      var onErr = /* @__PURE__ */ __name(function(err) {
        stream.destroy();
        warn("WARNING: error on reading file: %s", err);
        cb(void 0);
      }, "onErr");
      stream.on("error", onErr);
      lineStream.on("data", onLine).on("end", onEnd).on("error", onErr);
    };
    var parseLine = module.exports.parseLine = function(line) {
      if (line.length < 11 || line.match(/^\s+#/)) {
        return null;
      }
      var curChar = "";
      var prevChar = "";
      var fieldIdx = 0;
      var startIdx = 0;
      var endIdx = 0;
      var obj = {};
      var isLastField = false;
      var addToObj = /* @__PURE__ */ __name(function(idx, i0, i1) {
        var field = line.substring(i0, i1);
        if (!Object.hasOwnProperty.call(process.env, "PGPASS_NO_DEESCAPE")) {
          field = field.replace(/\\([:\\])/g, "$1");
        }
        obj[fieldNames[idx]] = field;
      }, "addToObj");
      for (var i = 0; i < line.length - 1; i += 1) {
        curChar = line.charAt(i + 1);
        prevChar = line.charAt(i);
        isLastField = fieldIdx == nrOfFields - 1;
        if (isLastField) {
          addToObj(fieldIdx, startIdx);
          break;
        }
        if (i >= 0 && curChar == ":" && prevChar !== "\\") {
          addToObj(fieldIdx, startIdx, i + 1);
          startIdx = i + 2;
          fieldIdx += 1;
        }
      }
      obj = Object.keys(obj).length === nrOfFields ? obj : null;
      return obj;
    };
    var isValidEntry = module.exports.isValidEntry = function(entry) {
      var rules = {
        // host
        0: function(x) {
          return x.length > 0;
        },
        // port
        1: function(x) {
          if (x === "*") {
            return true;
          }
          x = Number(x);
          return isFinite(x) && x > 0 && x < 9007199254740992 && Math.floor(x) === x;
        },
        // database
        2: function(x) {
          return x.length > 0;
        },
        // username
        3: function(x) {
          return x.length > 0;
        },
        // password
        4: function(x) {
          return x.length > 0;
        }
      };
      for (var idx = 0; idx < fieldNames.length; idx += 1) {
        var rule = rules[idx];
        var value = entry[fieldNames[idx]] || "";
        var res = rule(value);
        if (!res) {
          return false;
        }
      }
      return true;
    };
  }
});

// node_modules/pgpass/lib/index.js
var require_lib = __commonJS({
  "node_modules/pgpass/lib/index.js"(exports, module) {
    "use strict";
    init_modules_watch_stub();
    var path = require_path();
    var fs = require_fs();
    var helper = require_helper();
    module.exports = function(connInfo, cb) {
      var file = helper.getFileName();
      fs.stat(file, function(err, stat) {
        if (err || !helper.usePgPass(stat, file)) {
          return cb(void 0);
        }
        var st = fs.createReadStream(file);
        helper.getPassword(connInfo, st, cb);
      });
    };
    module.exports.warnTo = helper.warnTo;
  }
});

// node_modules/pg/lib/client.js
var require_client = __commonJS({
  "node_modules/pg/lib/client.js"(exports, module) {
    init_modules_watch_stub();
    var EventEmitter = require_events().EventEmitter;
    var utils = require_utils();
    var nodeUtils = require_util();
    var sasl = require_sasl();
    var TypeOverrides2 = require_type_overrides();
    var ConnectionParameters = require_connection_parameters();
    var Query2 = require_query();
    var defaults2 = require_defaults();
    var Connection2 = require_connection();
    var crypto2 = require_utils2();
    var activeQueryDeprecationNotice = nodeUtils.deprecate(
      () => {
      },
      "Client.activeQuery is deprecated and will be removed in pg@9.0"
    );
    var queryQueueDeprecationNotice = nodeUtils.deprecate(
      () => {
      },
      "Client.queryQueue is deprecated and will be removed in pg@9.0."
    );
    var pgPassDeprecationNotice = nodeUtils.deprecate(
      () => {
      },
      "pgpass support is deprecated and will be removed in pg@9.0. You can provide an async function as the password property to the Client/Pool constructor that returns a password instead. Within this function you can call the pgpass module in your own code."
    );
    var byoPromiseDeprecationNotice = nodeUtils.deprecate(
      () => {
      },
      "Passing a custom Promise implementation to the Client/Pool constructor is deprecated and will be removed in pg@9.0."
    );
    var queryQueueLengthDeprecationNotice = nodeUtils.deprecate(
      () => {
      },
      "Calling client.query() when the client is already executing a query is deprecated and will be removed in pg@9.0. Use async/await or an external async flow control mechanism instead."
    );
    var Client2 = class extends EventEmitter {
      static {
        __name(this, "Client");
      }
      constructor(config) {
        super();
        this.connectionParameters = new ConnectionParameters(config);
        this.user = this.connectionParameters.user;
        this.database = this.connectionParameters.database;
        this.port = this.connectionParameters.port;
        this.host = this.connectionParameters.host;
        Object.defineProperty(this, "password", {
          configurable: true,
          enumerable: false,
          writable: true,
          value: this.connectionParameters.password
        });
        this.replication = this.connectionParameters.replication;
        const c = config || {};
        if (c.Promise) {
          byoPromiseDeprecationNotice();
        }
        this._Promise = c.Promise || global.Promise;
        this._types = new TypeOverrides2(c.types);
        this._ending = false;
        this._ended = false;
        this._connecting = false;
        this._connected = false;
        this._connectionError = false;
        this._queryable = true;
        this._activeQuery = null;
        this.enableChannelBinding = Boolean(c.enableChannelBinding);
        this.connection = c.connection || new Connection2({
          stream: c.stream,
          ssl: this.connectionParameters.ssl,
          keepAlive: c.keepAlive || false,
          keepAliveInitialDelayMillis: c.keepAliveInitialDelayMillis || 0,
          encoding: this.connectionParameters.client_encoding || "utf8"
        });
        this._queryQueue = [];
        this.binary = c.binary || defaults2.binary;
        this.processID = null;
        this.secretKey = null;
        this.ssl = this.connectionParameters.ssl || false;
        if (this.ssl && this.ssl.key) {
          Object.defineProperty(this.ssl, "key", {
            enumerable: false
          });
        }
        this._connectionTimeoutMillis = c.connectionTimeoutMillis || 0;
      }
      get activeQuery() {
        activeQueryDeprecationNotice();
        return this._activeQuery;
      }
      set activeQuery(val) {
        activeQueryDeprecationNotice();
        this._activeQuery = val;
      }
      _getActiveQuery() {
        return this._activeQuery;
      }
      _errorAllQueries(err) {
        const enqueueError = /* @__PURE__ */ __name((query2) => {
          process.nextTick(() => {
            query2.handleError(err, this.connection);
          });
        }, "enqueueError");
        const activeQuery = this._getActiveQuery();
        if (activeQuery) {
          enqueueError(activeQuery);
          this._activeQuery = null;
        }
        this._queryQueue.forEach(enqueueError);
        this._queryQueue.length = 0;
      }
      _connect(callback) {
        const self = this;
        const con = this.connection;
        this._connectionCallback = callback;
        if (this._connecting || this._connected) {
          const err = new Error("Client has already been connected. You cannot reuse a client.");
          process.nextTick(() => {
            callback(err);
          });
          return;
        }
        this._connecting = true;
        if (this._connectionTimeoutMillis > 0) {
          this.connectionTimeoutHandle = setTimeout(() => {
            con._ending = true;
            con.stream.destroy(new Error("timeout expired"));
          }, this._connectionTimeoutMillis);
          if (this.connectionTimeoutHandle.unref) {
            this.connectionTimeoutHandle.unref();
          }
        }
        if (this.host && this.host.indexOf("/") === 0) {
          con.connect(this.host + "/.s.PGSQL." + this.port);
        } else {
          con.connect(this.port, this.host);
        }
        con.on("connect", function() {
          if (self.ssl) {
            con.requestSsl();
          } else {
            con.startup(self.getStartupConf());
          }
        });
        con.on("sslconnect", function() {
          con.startup(self.getStartupConf());
        });
        this._attachListeners(con);
        con.once("end", () => {
          const error = this._ending ? new Error("Connection terminated") : new Error("Connection terminated unexpectedly");
          clearTimeout(this.connectionTimeoutHandle);
          this._errorAllQueries(error);
          this._ended = true;
          if (!this._ending) {
            if (this._connecting && !this._connectionError) {
              if (this._connectionCallback) {
                this._connectionCallback(error);
              } else {
                this._handleErrorEvent(error);
              }
            } else if (!this._connectionError) {
              this._handleErrorEvent(error);
            }
          }
          process.nextTick(() => {
            this.emit("end");
          });
        });
      }
      connect(callback) {
        if (callback) {
          this._connect(callback);
          return;
        }
        return new this._Promise((resolve, reject) => {
          this._connect((error) => {
            if (error) {
              reject(error);
            } else {
              resolve(this);
            }
          });
        });
      }
      _attachListeners(con) {
        con.on("authenticationCleartextPassword", this._handleAuthCleartextPassword.bind(this));
        con.on("authenticationMD5Password", this._handleAuthMD5Password.bind(this));
        con.on("authenticationSASL", this._handleAuthSASL.bind(this));
        con.on("authenticationSASLContinue", this._handleAuthSASLContinue.bind(this));
        con.on("authenticationSASLFinal", this._handleAuthSASLFinal.bind(this));
        con.on("backendKeyData", this._handleBackendKeyData.bind(this));
        con.on("error", this._handleErrorEvent.bind(this));
        con.on("errorMessage", this._handleErrorMessage.bind(this));
        con.on("readyForQuery", this._handleReadyForQuery.bind(this));
        con.on("notice", this._handleNotice.bind(this));
        con.on("rowDescription", this._handleRowDescription.bind(this));
        con.on("dataRow", this._handleDataRow.bind(this));
        con.on("portalSuspended", this._handlePortalSuspended.bind(this));
        con.on("emptyQuery", this._handleEmptyQuery.bind(this));
        con.on("commandComplete", this._handleCommandComplete.bind(this));
        con.on("parseComplete", this._handleParseComplete.bind(this));
        con.on("copyInResponse", this._handleCopyInResponse.bind(this));
        con.on("copyData", this._handleCopyData.bind(this));
        con.on("notification", this._handleNotification.bind(this));
      }
      _getPassword(cb) {
        const con = this.connection;
        if (typeof this.password === "function") {
          this._Promise.resolve().then(() => this.password(this.connectionParameters)).then((pass) => {
            if (pass !== void 0) {
              if (typeof pass !== "string") {
                con.emit("error", new TypeError("Password must be a string"));
                return;
              }
              this.connectionParameters.password = this.password = pass;
            } else {
              this.connectionParameters.password = this.password = null;
            }
            cb();
          }).catch((err) => {
            con.emit("error", err);
          });
        } else if (this.password !== null) {
          cb();
        } else {
          try {
            const pgPass = require_lib();
            pgPass(this.connectionParameters, (pass) => {
              if (void 0 !== pass) {
                pgPassDeprecationNotice();
                this.connectionParameters.password = this.password = pass;
              }
              cb();
            });
          } catch (e) {
            this.emit("error", e);
          }
        }
      }
      _handleAuthCleartextPassword(msg) {
        this._getPassword(() => {
          this.connection.password(this.password);
        });
      }
      _handleAuthMD5Password(msg) {
        this._getPassword(async () => {
          try {
            const hashedPassword = await crypto2.postgresMd5PasswordHash(this.user, this.password, msg.salt);
            this.connection.password(hashedPassword);
          } catch (e) {
            this.emit("error", e);
          }
        });
      }
      _handleAuthSASL(msg) {
        this._getPassword(() => {
          try {
            this.saslSession = sasl.startSession(msg.mechanisms, this.enableChannelBinding && this.connection.stream);
            this.connection.sendSASLInitialResponseMessage(this.saslSession.mechanism, this.saslSession.response);
          } catch (err) {
            this.connection.emit("error", err);
          }
        });
      }
      async _handleAuthSASLContinue(msg) {
        try {
          await sasl.continueSession(
            this.saslSession,
            this.password,
            msg.data,
            this.enableChannelBinding && this.connection.stream
          );
          this.connection.sendSCRAMClientFinalMessage(this.saslSession.response);
        } catch (err) {
          this.connection.emit("error", err);
        }
      }
      _handleAuthSASLFinal(msg) {
        try {
          sasl.finalizeSession(this.saslSession, msg.data);
          this.saslSession = null;
        } catch (err) {
          this.connection.emit("error", err);
        }
      }
      _handleBackendKeyData(msg) {
        this.processID = msg.processID;
        this.secretKey = msg.secretKey;
      }
      _handleReadyForQuery(msg) {
        if (this._connecting) {
          this._connecting = false;
          this._connected = true;
          clearTimeout(this.connectionTimeoutHandle);
          if (this._connectionCallback) {
            this._connectionCallback(null, this);
            this._connectionCallback = null;
          }
          this.emit("connect");
        }
        const activeQuery = this._getActiveQuery();
        this._activeQuery = null;
        this.readyForQuery = true;
        if (activeQuery) {
          activeQuery.handleReadyForQuery(this.connection);
        }
        this._pulseQueryQueue();
      }
      // if we receive an error event or error message
      // during the connection process we handle it here
      _handleErrorWhileConnecting(err) {
        if (this._connectionError) {
          return;
        }
        this._connectionError = true;
        clearTimeout(this.connectionTimeoutHandle);
        if (this._connectionCallback) {
          return this._connectionCallback(err);
        }
        this.emit("error", err);
      }
      // if we're connected and we receive an error event from the connection
      // this means the socket is dead - do a hard abort of all queries and emit
      // the socket error on the client as well
      _handleErrorEvent(err) {
        if (this._connecting) {
          return this._handleErrorWhileConnecting(err);
        }
        this._queryable = false;
        this._errorAllQueries(err);
        this.emit("error", err);
      }
      // handle error messages from the postgres backend
      _handleErrorMessage(msg) {
        if (this._connecting) {
          return this._handleErrorWhileConnecting(msg);
        }
        const activeQuery = this._getActiveQuery();
        if (!activeQuery) {
          this._handleErrorEvent(msg);
          return;
        }
        this._activeQuery = null;
        activeQuery.handleError(msg, this.connection);
      }
      _handleRowDescription(msg) {
        const activeQuery = this._getActiveQuery();
        if (activeQuery == null) {
          const error = new Error("Received unexpected rowDescription message from backend.");
          this._handleErrorEvent(error);
          return;
        }
        activeQuery.handleRowDescription(msg);
      }
      _handleDataRow(msg) {
        const activeQuery = this._getActiveQuery();
        if (activeQuery == null) {
          const error = new Error("Received unexpected dataRow message from backend.");
          this._handleErrorEvent(error);
          return;
        }
        activeQuery.handleDataRow(msg);
      }
      _handlePortalSuspended(msg) {
        const activeQuery = this._getActiveQuery();
        if (activeQuery == null) {
          const error = new Error("Received unexpected portalSuspended message from backend.");
          this._handleErrorEvent(error);
          return;
        }
        activeQuery.handlePortalSuspended(this.connection);
      }
      _handleEmptyQuery(msg) {
        const activeQuery = this._getActiveQuery();
        if (activeQuery == null) {
          const error = new Error("Received unexpected emptyQuery message from backend.");
          this._handleErrorEvent(error);
          return;
        }
        activeQuery.handleEmptyQuery(this.connection);
      }
      _handleCommandComplete(msg) {
        const activeQuery = this._getActiveQuery();
        if (activeQuery == null) {
          const error = new Error("Received unexpected commandComplete message from backend.");
          this._handleErrorEvent(error);
          return;
        }
        activeQuery.handleCommandComplete(msg, this.connection);
      }
      _handleParseComplete() {
        const activeQuery = this._getActiveQuery();
        if (activeQuery == null) {
          const error = new Error("Received unexpected parseComplete message from backend.");
          this._handleErrorEvent(error);
          return;
        }
        if (activeQuery.name) {
          this.connection.parsedStatements[activeQuery.name] = activeQuery.text;
        }
      }
      _handleCopyInResponse(msg) {
        const activeQuery = this._getActiveQuery();
        if (activeQuery == null) {
          const error = new Error("Received unexpected copyInResponse message from backend.");
          this._handleErrorEvent(error);
          return;
        }
        activeQuery.handleCopyInResponse(this.connection);
      }
      _handleCopyData(msg) {
        const activeQuery = this._getActiveQuery();
        if (activeQuery == null) {
          const error = new Error("Received unexpected copyData message from backend.");
          this._handleErrorEvent(error);
          return;
        }
        activeQuery.handleCopyData(msg, this.connection);
      }
      _handleNotification(msg) {
        this.emit("notification", msg);
      }
      _handleNotice(msg) {
        this.emit("notice", msg);
      }
      getStartupConf() {
        const params = this.connectionParameters;
        const data = {
          user: params.user,
          database: params.database
        };
        const appName = params.application_name || params.fallback_application_name;
        if (appName) {
          data.application_name = appName;
        }
        if (params.replication) {
          data.replication = "" + params.replication;
        }
        if (params.statement_timeout) {
          data.statement_timeout = String(parseInt(params.statement_timeout, 10));
        }
        if (params.lock_timeout) {
          data.lock_timeout = String(parseInt(params.lock_timeout, 10));
        }
        if (params.idle_in_transaction_session_timeout) {
          data.idle_in_transaction_session_timeout = String(parseInt(params.idle_in_transaction_session_timeout, 10));
        }
        if (params.options) {
          data.options = params.options;
        }
        return data;
      }
      cancel(client, query2) {
        if (client.activeQuery === query2) {
          const con = this.connection;
          if (this.host && this.host.indexOf("/") === 0) {
            con.connect(this.host + "/.s.PGSQL." + this.port);
          } else {
            con.connect(this.port, this.host);
          }
          con.on("connect", function() {
            con.cancel(client.processID, client.secretKey);
          });
        } else if (client._queryQueue.indexOf(query2) !== -1) {
          client._queryQueue.splice(client._queryQueue.indexOf(query2), 1);
        }
      }
      setTypeParser(oid, format, parseFn) {
        return this._types.setTypeParser(oid, format, parseFn);
      }
      getTypeParser(oid, format) {
        return this._types.getTypeParser(oid, format);
      }
      // escapeIdentifier and escapeLiteral moved to utility functions & exported
      // on PG
      // re-exported here for backwards compatibility
      escapeIdentifier(str) {
        return utils.escapeIdentifier(str);
      }
      escapeLiteral(str) {
        return utils.escapeLiteral(str);
      }
      _pulseQueryQueue() {
        if (this.readyForQuery === true) {
          this._activeQuery = this._queryQueue.shift();
          const activeQuery = this._getActiveQuery();
          if (activeQuery) {
            this.readyForQuery = false;
            this.hasExecuted = true;
            const queryError = activeQuery.submit(this.connection);
            if (queryError) {
              process.nextTick(() => {
                activeQuery.handleError(queryError, this.connection);
                this.readyForQuery = true;
                this._pulseQueryQueue();
              });
            }
          } else if (this.hasExecuted) {
            this._activeQuery = null;
            this.emit("drain");
          }
        }
      }
      query(config, values, callback) {
        let query2;
        let result;
        let readTimeout;
        let readTimeoutTimer;
        let queryCallback;
        if (config === null || config === void 0) {
          throw new TypeError("Client was passed a null or undefined query");
        } else if (typeof config.submit === "function") {
          readTimeout = config.query_timeout || this.connectionParameters.query_timeout;
          result = query2 = config;
          if (!query2.callback) {
            if (typeof values === "function") {
              query2.callback = values;
            } else if (callback) {
              query2.callback = callback;
            }
          }
        } else {
          readTimeout = config.query_timeout || this.connectionParameters.query_timeout;
          query2 = new Query2(config, values, callback);
          if (!query2.callback) {
            result = new this._Promise((resolve, reject) => {
              query2.callback = (err, res) => err ? reject(err) : resolve(res);
            }).catch((err) => {
              Error.captureStackTrace(err);
              throw err;
            });
          }
        }
        if (readTimeout) {
          queryCallback = query2.callback || (() => {
          });
          readTimeoutTimer = setTimeout(() => {
            const error = new Error("Query read timeout");
            process.nextTick(() => {
              query2.handleError(error, this.connection);
            });
            queryCallback(error);
            query2.callback = () => {
            };
            const index = this._queryQueue.indexOf(query2);
            if (index > -1) {
              this._queryQueue.splice(index, 1);
            }
            this._pulseQueryQueue();
          }, readTimeout);
          query2.callback = (err, res) => {
            clearTimeout(readTimeoutTimer);
            queryCallback(err, res);
          };
        }
        if (this.binary && !query2.binary) {
          query2.binary = true;
        }
        if (query2._result && !query2._result._types) {
          query2._result._types = this._types;
        }
        if (!this._queryable) {
          process.nextTick(() => {
            query2.handleError(new Error("Client has encountered a connection error and is not queryable"), this.connection);
          });
          return result;
        }
        if (this._ending) {
          process.nextTick(() => {
            query2.handleError(new Error("Client was closed and is not queryable"), this.connection);
          });
          return result;
        }
        if (this._queryQueue.length > 0) {
          queryQueueLengthDeprecationNotice();
        }
        this._queryQueue.push(query2);
        this._pulseQueryQueue();
        return result;
      }
      ref() {
        this.connection.ref();
      }
      unref() {
        this.connection.unref();
      }
      end(cb) {
        this._ending = true;
        if (!this.connection._connecting || this._ended) {
          if (cb) {
            cb();
          } else {
            return this._Promise.resolve();
          }
        }
        if (this._getActiveQuery() || !this._queryable) {
          this.connection.stream.destroy();
        } else {
          this.connection.end();
        }
        if (cb) {
          this.connection.once("end", cb);
        } else {
          return new this._Promise((resolve) => {
            this.connection.once("end", resolve);
          });
        }
      }
      get queryQueue() {
        queryQueueDeprecationNotice();
        return this._queryQueue;
      }
    };
    Client2.Query = Query2;
    module.exports = Client2;
  }
});

// node_modules/pg-pool/index.js
var require_pg_pool = __commonJS({
  "node_modules/pg-pool/index.js"(exports, module) {
    "use strict";
    init_modules_watch_stub();
    var EventEmitter = require_events().EventEmitter;
    var NOOP = /* @__PURE__ */ __name(function() {
    }, "NOOP");
    var removeWhere = /* @__PURE__ */ __name((list, predicate) => {
      const i = list.findIndex(predicate);
      return i === -1 ? void 0 : list.splice(i, 1)[0];
    }, "removeWhere");
    var IdleItem = class {
      static {
        __name(this, "IdleItem");
      }
      constructor(client, idleListener, timeoutId) {
        this.client = client;
        this.idleListener = idleListener;
        this.timeoutId = timeoutId;
      }
    };
    var PendingItem = class {
      static {
        __name(this, "PendingItem");
      }
      constructor(callback) {
        this.callback = callback;
      }
    };
    function throwOnDoubleRelease() {
      throw new Error("Release called on client which has already been released to the pool.");
    }
    __name(throwOnDoubleRelease, "throwOnDoubleRelease");
    function promisify(Promise2, callback) {
      if (callback) {
        return { callback, result: void 0 };
      }
      let rej;
      let res;
      const cb = /* @__PURE__ */ __name(function(err, client) {
        err ? rej(err) : res(client);
      }, "cb");
      const result = new Promise2(function(resolve, reject) {
        res = resolve;
        rej = reject;
      }).catch((err) => {
        Error.captureStackTrace(err);
        throw err;
      });
      return { callback: cb, result };
    }
    __name(promisify, "promisify");
    function makeIdleListener(pool2, client) {
      return /* @__PURE__ */ __name(function idleListener(err) {
        err.client = client;
        client.removeListener("error", idleListener);
        client.on("error", () => {
          pool2.log("additional client error after disconnection due to error", err);
        });
        pool2._remove(client);
        pool2.emit("error", err, client);
      }, "idleListener");
    }
    __name(makeIdleListener, "makeIdleListener");
    var Pool2 = class extends EventEmitter {
      static {
        __name(this, "Pool");
      }
      constructor(options, Client2) {
        super();
        this.options = Object.assign({}, options);
        if (options != null && "password" in options) {
          Object.defineProperty(this.options, "password", {
            configurable: true,
            enumerable: false,
            writable: true,
            value: options.password
          });
        }
        if (options != null && options.ssl && options.ssl.key) {
          Object.defineProperty(this.options.ssl, "key", {
            enumerable: false
          });
        }
        this.options.max = this.options.max || this.options.poolSize || 10;
        this.options.min = this.options.min || 0;
        this.options.maxUses = this.options.maxUses || Infinity;
        this.options.allowExitOnIdle = this.options.allowExitOnIdle || false;
        this.options.maxLifetimeSeconds = this.options.maxLifetimeSeconds || 0;
        this.log = this.options.log || function() {
        };
        this.Client = this.options.Client || Client2 || require_lib2().Client;
        this.Promise = this.options.Promise || global.Promise;
        if (typeof this.options.idleTimeoutMillis === "undefined") {
          this.options.idleTimeoutMillis = 1e4;
        }
        this._clients = [];
        this._idle = [];
        this._expired = /* @__PURE__ */ new WeakSet();
        this._pendingQueue = [];
        this._endCallback = void 0;
        this.ending = false;
        this.ended = false;
      }
      _promiseTry(f) {
        const Promise2 = this.Promise;
        if (typeof Promise2.try === "function") {
          return Promise2.try(f);
        }
        return new Promise2((resolve) => resolve(f()));
      }
      _isFull() {
        return this._clients.length >= this.options.max;
      }
      _isAboveMin() {
        return this._clients.length > this.options.min;
      }
      _pulseQueue() {
        this.log("pulse queue");
        if (this.ended) {
          this.log("pulse queue ended");
          return;
        }
        if (this.ending) {
          this.log("pulse queue on ending");
          if (this._idle.length) {
            this._idle.slice().map((item) => {
              this._remove(item.client);
            });
          }
          if (!this._clients.length) {
            this.ended = true;
            this._endCallback();
          }
          return;
        }
        if (!this._pendingQueue.length) {
          this.log("no queued requests");
          return;
        }
        if (!this._idle.length && this._isFull()) {
          return;
        }
        const pendingItem = this._pendingQueue.shift();
        if (this._idle.length) {
          const idleItem = this._idle.pop();
          clearTimeout(idleItem.timeoutId);
          const client = idleItem.client;
          client.ref && client.ref();
          const idleListener = idleItem.idleListener;
          return this._acquireClient(client, pendingItem, idleListener, false);
        }
        if (!this._isFull()) {
          return this.newClient(pendingItem);
        }
        throw new Error("unexpected condition");
      }
      _remove(client, callback) {
        const removed = removeWhere(this._idle, (item) => item.client === client);
        if (removed !== void 0) {
          clearTimeout(removed.timeoutId);
        }
        this._clients = this._clients.filter((c) => c !== client);
        const context = this;
        client.end(() => {
          context.emit("remove", client);
          if (typeof callback === "function") {
            callback();
          }
        });
      }
      connect(cb) {
        if (this.ending) {
          const err = new Error("Cannot use a pool after calling end on the pool");
          return cb ? cb(err) : this.Promise.reject(err);
        }
        const response = promisify(this.Promise, cb);
        const result = response.result;
        if (this._isFull() || this._idle.length) {
          if (this._idle.length) {
            process.nextTick(() => this._pulseQueue());
          }
          if (!this.options.connectionTimeoutMillis) {
            this._pendingQueue.push(new PendingItem(response.callback));
            return result;
          }
          const queueCallback = /* @__PURE__ */ __name((err, res, done) => {
            clearTimeout(tid);
            response.callback(err, res, done);
          }, "queueCallback");
          const pendingItem = new PendingItem(queueCallback);
          const tid = setTimeout(() => {
            removeWhere(this._pendingQueue, (i) => i.callback === queueCallback);
            pendingItem.timedOut = true;
            response.callback(new Error("timeout exceeded when trying to connect"));
          }, this.options.connectionTimeoutMillis);
          if (tid.unref) {
            tid.unref();
          }
          this._pendingQueue.push(pendingItem);
          return result;
        }
        this.newClient(new PendingItem(response.callback));
        return result;
      }
      newClient(pendingItem) {
        const client = new this.Client(this.options);
        this._clients.push(client);
        const idleListener = makeIdleListener(this, client);
        this.log("checking client timeout");
        let tid;
        let timeoutHit = false;
        if (this.options.connectionTimeoutMillis) {
          tid = setTimeout(() => {
            if (client.connection) {
              this.log("ending client due to timeout");
              timeoutHit = true;
              client.connection.stream.destroy();
            } else if (!client.isConnected()) {
              this.log("ending client due to timeout");
              timeoutHit = true;
              client.end();
            }
          }, this.options.connectionTimeoutMillis);
        }
        this.log("connecting new client");
        client.connect((err) => {
          if (tid) {
            clearTimeout(tid);
          }
          client.on("error", idleListener);
          if (err) {
            this.log("client failed to connect", err);
            this._clients = this._clients.filter((c) => c !== client);
            if (timeoutHit) {
              err = new Error("Connection terminated due to connection timeout", { cause: err });
            }
            this._pulseQueue();
            if (!pendingItem.timedOut) {
              pendingItem.callback(err, void 0, NOOP);
            }
          } else {
            this.log("new client connected");
            if (this.options.onConnect) {
              this._promiseTry(() => this.options.onConnect(client)).then(
                () => {
                  this._afterConnect(client, pendingItem, idleListener);
                },
                (hookErr) => {
                  this._clients = this._clients.filter((c) => c !== client);
                  client.end(() => {
                    this._pulseQueue();
                    if (!pendingItem.timedOut) {
                      pendingItem.callback(hookErr, void 0, NOOP);
                    }
                  });
                }
              );
              return;
            }
            return this._afterConnect(client, pendingItem, idleListener);
          }
        });
      }
      _afterConnect(client, pendingItem, idleListener) {
        if (this.options.maxLifetimeSeconds !== 0) {
          const maxLifetimeTimeout = setTimeout(() => {
            this.log("ending client due to expired lifetime");
            this._expired.add(client);
            const idleIndex = this._idle.findIndex((idleItem) => idleItem.client === client);
            if (idleIndex !== -1) {
              this._acquireClient(
                client,
                new PendingItem((err, client2, clientRelease) => clientRelease()),
                idleListener,
                false
              );
            }
          }, this.options.maxLifetimeSeconds * 1e3);
          maxLifetimeTimeout.unref();
          client.once("end", () => clearTimeout(maxLifetimeTimeout));
        }
        return this._acquireClient(client, pendingItem, idleListener, true);
      }
      // acquire a client for a pending work item
      _acquireClient(client, pendingItem, idleListener, isNew) {
        if (isNew) {
          this.emit("connect", client);
        }
        this.emit("acquire", client);
        client.release = this._releaseOnce(client, idleListener);
        client.removeListener("error", idleListener);
        if (!pendingItem.timedOut) {
          if (isNew && this.options.verify) {
            this.options.verify(client, (err) => {
              if (err) {
                client.release(err);
                return pendingItem.callback(err, void 0, NOOP);
              }
              pendingItem.callback(void 0, client, client.release);
            });
          } else {
            pendingItem.callback(void 0, client, client.release);
          }
        } else {
          if (isNew && this.options.verify) {
            this.options.verify(client, client.release);
          } else {
            client.release();
          }
        }
      }
      // returns a function that wraps _release and throws if called more than once
      _releaseOnce(client, idleListener) {
        let released = false;
        return (err) => {
          if (released) {
            throwOnDoubleRelease();
          }
          released = true;
          this._release(client, idleListener, err);
        };
      }
      // release a client back to the poll, include an error
      // to remove it from the pool
      _release(client, idleListener, err) {
        client.on("error", idleListener);
        client._poolUseCount = (client._poolUseCount || 0) + 1;
        this.emit("release", err, client);
        if (err || this.ending || !client._queryable || client._ending || client._poolUseCount >= this.options.maxUses) {
          if (client._poolUseCount >= this.options.maxUses) {
            this.log("remove expended client");
          }
          return this._remove(client, this._pulseQueue.bind(this));
        }
        const isExpired = this._expired.has(client);
        if (isExpired) {
          this.log("remove expired client");
          this._expired.delete(client);
          return this._remove(client, this._pulseQueue.bind(this));
        }
        let tid;
        if (this.options.idleTimeoutMillis && this._isAboveMin()) {
          tid = setTimeout(() => {
            if (this._isAboveMin()) {
              this.log("remove idle client");
              this._remove(client, this._pulseQueue.bind(this));
            }
          }, this.options.idleTimeoutMillis);
          if (this.options.allowExitOnIdle) {
            tid.unref();
          }
        }
        if (this.options.allowExitOnIdle) {
          client.unref();
        }
        this._idle.push(new IdleItem(client, idleListener, tid));
        this._pulseQueue();
      }
      query(text, values, cb) {
        if (typeof text === "function") {
          const response2 = promisify(this.Promise, text);
          setImmediate(function() {
            return response2.callback(new Error("Passing a function as the first parameter to pool.query is not supported"));
          });
          return response2.result;
        }
        if (typeof values === "function") {
          cb = values;
          values = void 0;
        }
        const response = promisify(this.Promise, cb);
        cb = response.callback;
        this.connect((err, client) => {
          if (err) {
            return cb(err);
          }
          let clientReleased = false;
          const onError = /* @__PURE__ */ __name((err2) => {
            if (clientReleased) {
              return;
            }
            clientReleased = true;
            client.release(err2);
            cb(err2);
          }, "onError");
          client.once("error", onError);
          this.log("dispatching query");
          try {
            client.query(text, values, (err2, res) => {
              this.log("query dispatched");
              client.removeListener("error", onError);
              if (clientReleased) {
                return;
              }
              clientReleased = true;
              client.release(err2);
              if (err2) {
                return cb(err2);
              }
              return cb(void 0, res);
            });
          } catch (err2) {
            client.release(err2);
            return cb(err2);
          }
        });
        return response.result;
      }
      end(cb) {
        this.log("ending");
        if (this.ending) {
          const err = new Error("Called end on pool more than once");
          return cb ? cb(err) : this.Promise.reject(err);
        }
        this.ending = true;
        const promised = promisify(this.Promise, cb);
        this._endCallback = promised.callback;
        this._pulseQueue();
        return promised.result;
      }
      get waitingCount() {
        return this._pendingQueue.length;
      }
      get idleCount() {
        return this._idle.length;
      }
      get expiredCount() {
        return this._clients.reduce((acc, client) => acc + (this._expired.has(client) ? 1 : 0), 0);
      }
      get totalCount() {
        return this._clients.length;
      }
    };
    module.exports = Pool2;
  }
});

// node_modules/pg/lib/native/query.js
var require_query2 = __commonJS({
  "node_modules/pg/lib/native/query.js"(exports, module) {
    "use strict";
    init_modules_watch_stub();
    var EventEmitter = require_events().EventEmitter;
    var util = require_util();
    var utils = require_utils();
    var NativeQuery = module.exports = function(config, values, callback) {
      EventEmitter.call(this);
      config = utils.normalizeQueryConfig(config, values, callback);
      this.text = config.text;
      this.values = config.values;
      this.name = config.name;
      this.queryMode = config.queryMode;
      this.callback = config.callback;
      this.state = "new";
      this._arrayMode = config.rowMode === "array";
      this._emitRowEvents = false;
      this.on(
        "newListener",
        function(event) {
          if (event === "row") this._emitRowEvents = true;
        }.bind(this)
      );
    };
    util.inherits(NativeQuery, EventEmitter);
    var errorFieldMap = {
      sqlState: "code",
      statementPosition: "position",
      messagePrimary: "message",
      context: "where",
      schemaName: "schema",
      tableName: "table",
      columnName: "column",
      dataTypeName: "dataType",
      constraintName: "constraint",
      sourceFile: "file",
      sourceLine: "line",
      sourceFunction: "routine"
    };
    NativeQuery.prototype.handleError = function(err) {
      const fields = this.native.pq.resultErrorFields();
      if (fields) {
        for (const key in fields) {
          const normalizedFieldName = errorFieldMap[key] || key;
          err[normalizedFieldName] = fields[key];
        }
      }
      if (this.callback) {
        this.callback(err);
      } else {
        this.emit("error", err);
      }
      this.state = "error";
    };
    NativeQuery.prototype.then = function(onSuccess, onFailure) {
      return this._getPromise().then(onSuccess, onFailure);
    };
    NativeQuery.prototype.catch = function(callback) {
      return this._getPromise().catch(callback);
    };
    NativeQuery.prototype._getPromise = function() {
      if (this._promise) return this._promise;
      this._promise = new Promise(
        function(resolve, reject) {
          this._once("end", resolve);
          this._once("error", reject);
        }.bind(this)
      );
      return this._promise;
    };
    NativeQuery.prototype.submit = function(client) {
      this.state = "running";
      const self = this;
      this.native = client.native;
      client.native.arrayMode = this._arrayMode;
      let after = /* @__PURE__ */ __name(function(err, rows, results) {
        client.native.arrayMode = false;
        setImmediate(function() {
          self.emit("_done");
        });
        if (err) {
          return self.handleError(err);
        }
        if (self._emitRowEvents) {
          if (results.length > 1) {
            rows.forEach((rowOfRows, i) => {
              rowOfRows.forEach((row) => {
                self.emit("row", row, results[i]);
              });
            });
          } else {
            rows.forEach(function(row) {
              self.emit("row", row, results);
            });
          }
        }
        self.state = "end";
        self.emit("end", results);
        if (self.callback) {
          self.callback(null, results);
        }
      }, "after");
      if (process.domain) {
        after = process.domain.bind(after);
      }
      if (this.name) {
        if (this.name.length > 63) {
          console.error("Warning! Postgres only supports 63 characters for query names.");
          console.error("You supplied %s (%s)", this.name, this.name.length);
          console.error("This can cause conflicts and silent errors executing queries");
        }
        const values = (this.values || []).map(utils.prepareValue);
        if (client.namedQueries[this.name]) {
          if (this.text && client.namedQueries[this.name] !== this.text) {
            const err = new Error(`Prepared statements must be unique - '${this.name}' was used for a different statement`);
            return after(err);
          }
          return client.native.execute(this.name, values, after);
        }
        return client.native.prepare(this.name, this.text, values.length, function(err) {
          if (err) return after(err);
          client.namedQueries[self.name] = self.text;
          return self.native.execute(self.name, values, after);
        });
      } else if (this.values) {
        if (!Array.isArray(this.values)) {
          const err = new Error("Query values must be an array");
          return after(err);
        }
        const vals = this.values.map(utils.prepareValue);
        client.native.query(this.text, vals, after);
      } else if (this.queryMode === "extended") {
        client.native.query(this.text, [], after);
      } else {
        client.native.query(this.text, after);
      }
    };
  }
});

// node_modules/pg/lib/native/client.js
var require_client2 = __commonJS({
  "node_modules/pg/lib/native/client.js"(exports, module) {
    init_modules_watch_stub();
    var nodeUtils = require_util();
    var Native;
    try {
      Native = __require("pg-native");
    } catch (e) {
      throw e;
    }
    var TypeOverrides2 = require_type_overrides();
    var EventEmitter = require_events().EventEmitter;
    var util = require_util();
    var ConnectionParameters = require_connection_parameters();
    var NativeQuery = require_query2();
    var queryQueueLengthDeprecationNotice = nodeUtils.deprecate(
      () => {
      },
      "Calling client.query() when the client is already executing a query is deprecated and will be removed in pg@9.0. Use async/await or an external async flow control mechanism instead."
    );
    var Client2 = module.exports = function(config) {
      EventEmitter.call(this);
      config = config || {};
      this._Promise = config.Promise || global.Promise;
      this._types = new TypeOverrides2(config.types);
      this.native = new Native({
        types: this._types
      });
      this._queryQueue = [];
      this._ending = false;
      this._connecting = false;
      this._connected = false;
      this._queryable = true;
      const cp = this.connectionParameters = new ConnectionParameters(config);
      if (config.nativeConnectionString) cp.nativeConnectionString = config.nativeConnectionString;
      this.user = cp.user;
      Object.defineProperty(this, "password", {
        configurable: true,
        enumerable: false,
        writable: true,
        value: cp.password
      });
      this.database = cp.database;
      this.host = cp.host;
      this.port = cp.port;
      this.namedQueries = {};
    };
    Client2.Query = NativeQuery;
    util.inherits(Client2, EventEmitter);
    Client2.prototype._errorAllQueries = function(err) {
      const enqueueError = /* @__PURE__ */ __name((query2) => {
        process.nextTick(() => {
          query2.native = this.native;
          query2.handleError(err);
        });
      }, "enqueueError");
      if (this._hasActiveQuery()) {
        enqueueError(this._activeQuery);
        this._activeQuery = null;
      }
      this._queryQueue.forEach(enqueueError);
      this._queryQueue.length = 0;
    };
    Client2.prototype._connect = function(cb) {
      const self = this;
      if (this._connecting) {
        process.nextTick(() => cb(new Error("Client has already been connected. You cannot reuse a client.")));
        return;
      }
      this._connecting = true;
      this.connectionParameters.getLibpqConnectionString(function(err, conString) {
        if (self.connectionParameters.nativeConnectionString) conString = self.connectionParameters.nativeConnectionString;
        if (err) return cb(err);
        self.native.connect(conString, function(err2) {
          if (err2) {
            self.native.end();
            return cb(err2);
          }
          self._connected = true;
          self.native.on("error", function(err3) {
            self._queryable = false;
            self._errorAllQueries(err3);
            self.emit("error", err3);
          });
          self.native.on("notification", function(msg) {
            self.emit("notification", {
              channel: msg.relname,
              payload: msg.extra
            });
          });
          self.emit("connect");
          self._pulseQueryQueue(true);
          cb(null, this);
        });
      });
    };
    Client2.prototype.connect = function(callback) {
      if (callback) {
        this._connect(callback);
        return;
      }
      return new this._Promise((resolve, reject) => {
        this._connect((error) => {
          if (error) {
            reject(error);
          } else {
            resolve(this);
          }
        });
      });
    };
    Client2.prototype.query = function(config, values, callback) {
      let query2;
      let result;
      let readTimeout;
      let readTimeoutTimer;
      let queryCallback;
      if (config === null || config === void 0) {
        throw new TypeError("Client was passed a null or undefined query");
      } else if (typeof config.submit === "function") {
        readTimeout = config.query_timeout || this.connectionParameters.query_timeout;
        result = query2 = config;
        if (typeof values === "function") {
          config.callback = values;
        }
      } else {
        readTimeout = config.query_timeout || this.connectionParameters.query_timeout;
        query2 = new NativeQuery(config, values, callback);
        if (!query2.callback) {
          let resolveOut, rejectOut;
          result = new this._Promise((resolve, reject) => {
            resolveOut = resolve;
            rejectOut = reject;
          }).catch((err) => {
            Error.captureStackTrace(err);
            throw err;
          });
          query2.callback = (err, res) => err ? rejectOut(err) : resolveOut(res);
        }
      }
      if (readTimeout) {
        queryCallback = query2.callback || (() => {
        });
        readTimeoutTimer = setTimeout(() => {
          const error = new Error("Query read timeout");
          process.nextTick(() => {
            query2.handleError(error, this.connection);
          });
          queryCallback(error);
          query2.callback = () => {
          };
          const index = this._queryQueue.indexOf(query2);
          if (index > -1) {
            this._queryQueue.splice(index, 1);
          }
          this._pulseQueryQueue();
        }, readTimeout);
        query2.callback = (err, res) => {
          clearTimeout(readTimeoutTimer);
          queryCallback(err, res);
        };
      }
      if (!this._queryable) {
        query2.native = this.native;
        process.nextTick(() => {
          query2.handleError(new Error("Client has encountered a connection error and is not queryable"));
        });
        return result;
      }
      if (this._ending) {
        query2.native = this.native;
        process.nextTick(() => {
          query2.handleError(new Error("Client was closed and is not queryable"));
        });
        return result;
      }
      if (this._queryQueue.length > 0) {
        queryQueueLengthDeprecationNotice();
      }
      this._queryQueue.push(query2);
      this._pulseQueryQueue();
      return result;
    };
    Client2.prototype.end = function(cb) {
      const self = this;
      this._ending = true;
      if (!this._connected) {
        this.once("connect", this.end.bind(this, cb));
      }
      let result;
      if (!cb) {
        result = new this._Promise(function(resolve, reject) {
          cb = /* @__PURE__ */ __name((err) => err ? reject(err) : resolve(), "cb");
        });
      }
      this.native.end(function() {
        self._connected = false;
        self._errorAllQueries(new Error("Connection terminated"));
        process.nextTick(() => {
          self.emit("end");
          if (cb) cb();
        });
      });
      return result;
    };
    Client2.prototype._hasActiveQuery = function() {
      return this._activeQuery && this._activeQuery.state !== "error" && this._activeQuery.state !== "end";
    };
    Client2.prototype._pulseQueryQueue = function(initialConnection) {
      if (!this._connected) {
        return;
      }
      if (this._hasActiveQuery()) {
        return;
      }
      const query2 = this._queryQueue.shift();
      if (!query2) {
        if (!initialConnection) {
          this.emit("drain");
        }
        return;
      }
      this._activeQuery = query2;
      query2.submit(this);
      const self = this;
      query2.once("_done", function() {
        self._pulseQueryQueue();
      });
    };
    Client2.prototype.cancel = function(query2) {
      if (this._activeQuery === query2) {
        this.native.cancel(function() {
        });
      } else if (this._queryQueue.indexOf(query2) !== -1) {
        this._queryQueue.splice(this._queryQueue.indexOf(query2), 1);
      }
    };
    Client2.prototype.ref = function() {
    };
    Client2.prototype.unref = function() {
    };
    Client2.prototype.setTypeParser = function(oid, format, parseFn) {
      return this._types.setTypeParser(oid, format, parseFn);
    };
    Client2.prototype.getTypeParser = function(oid, format) {
      return this._types.getTypeParser(oid, format);
    };
    Client2.prototype.isConnected = function() {
      return this._connected;
    };
  }
});

// node_modules/pg/lib/native/index.js
var require_native = __commonJS({
  "node_modules/pg/lib/native/index.js"(exports, module) {
    "use strict";
    init_modules_watch_stub();
    module.exports = require_client2();
  }
});

// node_modules/pg/lib/index.js
var require_lib2 = __commonJS({
  "node_modules/pg/lib/index.js"(exports, module) {
    "use strict";
    init_modules_watch_stub();
    var Client2 = require_client();
    var defaults2 = require_defaults();
    var Connection2 = require_connection();
    var Result2 = require_result();
    var utils = require_utils();
    var Pool2 = require_pg_pool();
    var TypeOverrides2 = require_type_overrides();
    var { DatabaseError: DatabaseError2 } = require_dist();
    var { escapeIdentifier: escapeIdentifier2, escapeLiteral: escapeLiteral2 } = require_utils();
    var poolFactory = /* @__PURE__ */ __name((Client3) => {
      return class BoundPool extends Pool2 {
        static {
          __name(this, "BoundPool");
        }
        constructor(options) {
          super(options, Client3);
        }
      };
    }, "poolFactory");
    var PG = /* @__PURE__ */ __name(function(clientConstructor2) {
      this.defaults = defaults2;
      this.Client = clientConstructor2;
      this.Query = this.Client.Query;
      this.Pool = poolFactory(this.Client);
      this._pools = [];
      this.Connection = Connection2;
      this.types = require_pg_types();
      this.DatabaseError = DatabaseError2;
      this.TypeOverrides = TypeOverrides2;
      this.escapeIdentifier = escapeIdentifier2;
      this.escapeLiteral = escapeLiteral2;
      this.Result = Result2;
      this.utils = utils;
    }, "PG");
    var clientConstructor = Client2;
    var forceNative = false;
    try {
      forceNative = !!process.env.NODE_PG_FORCE_NATIVE;
    } catch {
    }
    if (forceNative) {
      clientConstructor = require_native();
    }
    module.exports = new PG(clientConstructor);
    Object.defineProperty(module.exports, "native", {
      configurable: true,
      enumerable: false,
      get() {
        let native = null;
        try {
          native = new PG(require_native());
        } catch (err) {
          if (err.code !== "MODULE_NOT_FOUND") {
            throw err;
          }
        }
        Object.defineProperty(module.exports, "native", {
          value: native
        });
        return native;
      }
    });
  }
});

// node-built-in-modules:node:module
import libDefault11 from "node:module";
var require_node_module = __commonJS({
  "node-built-in-modules:node:module"(exports, module) {
    init_modules_watch_stub();
    module.exports = libDefault11;
  }
});

// .wrangler/tmp/bundle-PcxN5B/middleware-loader.entry.ts
init_modules_watch_stub();

// .wrangler/tmp/bundle-PcxN5B/middleware-insertion-facade.js
init_modules_watch_stub();

// worker/index.ts
init_modules_watch_stub();

// db.ts
init_modules_watch_stub();

// node_modules/pg/esm/index.mjs
init_modules_watch_stub();
var import_lib = __toESM(require_lib2(), 1);
var Client = import_lib.default.Client;
var Pool = import_lib.default.Pool;
var Connection = import_lib.default.Connection;
var types = import_lib.default.types;
var Query = import_lib.default.Query;
var DatabaseError = import_lib.default.DatabaseError;
var escapeIdentifier = import_lib.default.escapeIdentifier;
var escapeLiteral = import_lib.default.escapeLiteral;
var Result = import_lib.default.Result;
var TypeOverrides = import_lib.default.TypeOverrides;
var defaults = import_lib.default.defaults;

// db.ts
var pool = null;
var overrideConnectionString = null;
var nodeEnvironmentPrepared = false;
function configureDatabase(connectionString) {
  const next = connectionString?.trim();
  if (!next || next === overrideConnectionString) return;
  overrideConnectionString = next;
  if (pool) {
    void pool.end().catch(() => {
    });
    pool = null;
  }
}
__name(configureDatabase, "configureDatabase");
function prepareNodeEnvironment() {
  if (nodeEnvironmentPrepared) return;
  nodeEnvironmentPrepared = true;
  if (typeof process === "undefined" || !process.versions?.node) return;
  try {
    const { createRequire } = require_node_module();
    const nodeRequire = createRequire(import.meta.url);
    nodeRequire("dotenv").config();
    nodeRequire("node:dns").setDefaultResultOrder("ipv4first");
  } catch {
  }
}
__name(prepareNodeEnvironment, "prepareNodeEnvironment");
function resolveConnectionString() {
  if (overrideConnectionString) return overrideConnectionString;
  prepareNodeEnvironment();
  const env = typeof process !== "undefined" ? process.env : {};
  const direct = env.SUPABASE_DB_URL?.trim();
  const pooler = env.SUPABASE_POOLER_URL?.trim();
  const vercelPostgres = env.POSTGRES_URL?.trim();
  const generic = env.DATABASE_URL?.trim();
  const connectionString = pooler || vercelPostgres || generic || direct;
  if (!connectionString) {
    throw new Error(
      "Missing DB connection string. Set SUPABASE_POOLER_URL (preferred), POSTGRES_URL, DATABASE_URL, or SUPABASE_DB_URL in .env, or call configureDatabase() with the Hyperdrive connection string on Cloudflare Workers."
    );
  }
  const isSupabaseDirectHost = !pooler && !vercelPostgres && !generic && direct?.includes("@db.") && direct.includes(".supabase.co");
  if (isSupabaseDirectHost && env.ALLOW_SUPABASE_DIRECT_URL !== "true") {
    const message = "[db] SUPABASE_DB_URL is using Supabase direct host (db.<ref>.supabase.co), which is IPv6-only on many projects.\n[db] Set SUPABASE_POOLER_URL (Session Pooler, port 5432) from Supabase Dashboard -> Connect.\n[db] If your machine has working IPv6 and you intentionally want direct DB host, set ALLOW_SUPABASE_DIRECT_URL=true.";
    if (env.NODE_ENV === "production") throw new Error(message);
    console.warn(message);
  }
  return connectionString;
}
__name(resolveConnectionString, "resolveConnectionString");
function getPool() {
  if (pool) return pool;
  const env = typeof process !== "undefined" ? process.env : {};
  const onWorkers = Boolean(overrideConnectionString);
  pool = new Pool({
    connectionString: resolveConnectionString(),
    ssl: onWorkers ? void 0 : { rejectUnauthorized: false },
    connectionTimeoutMillis: Number(env.DB_CONNECTION_TIMEOUT_MS || 8e3),
    // Supabase's transaction pooler (pgbouncer, port 6543) — and network devices in front of it —
    // silently drop connections that sit idle. keepAlive sends TCP probes so drops are detected
    // immediately instead of surfacing as "Connection terminated unexpectedly" on the next query, and
    // idleTimeoutMillis proactively recycles idle clients before the pooler does it for us.
    keepAlive: !onWorkers,
    keepAliveInitialDelayMillis: 1e4,
    idleTimeoutMillis: 2e4,
    // Each serverless instance gets its OWN pool, and Vercel runs many instances
    // concurrently. A max of 10 means two warm instances alone can exhaust a
    // Supabase session-mode pooler (pool_size 15) and every query starts failing
    // with EMAXCONNSESSION. One connection per instance is the correct shape here;
    // concurrency comes from more instances, not a bigger pool inside each.
    max: Number(env.DB_POOL_MAX || (onWorkers || env.VERCEL ? 1 : 10))
  });
  pool.on("error", (error) => {
    console.error("Unexpected PostgreSQL client error", error);
  });
  return pool;
}
__name(getPool, "getPool");
var isTransientConnectionError = /* @__PURE__ */ __name((error) => {
  const message = error instanceof Error ? error.message : String(error);
  const code = error?.code;
  return /connection terminated/i.test(message) || /timeout/i.test(message) || code === "ECONNRESET" || code === "57P01";
}, "isTransientConnectionError");
async function query(text, params = []) {
  try {
    const result = await getPool().query(text, params);
    return result.rows;
  } catch (error) {
    if (!isTransientConnectionError(error)) throw error;
    console.warn("Retrying query after transient DB connection error", error);
    const result = await getPool().query(text, params);
    return result.rows;
  }
}
__name(query, "query");
async function queryOne(text, params = []) {
  const rows = await query(text, params);
  return rows[0] ?? null;
}
__name(queryOne, "queryOne");
var lazyPool = {
  connect: /* @__PURE__ */ __name(() => getPool().connect(), "connect"),
  end: /* @__PURE__ */ __name(async () => {
    if (!pool) return;
    const current = pool;
    pool = null;
    await current.end();
  }, "end")
};
var db_default = lazyPool;

// server/renderSnapshot.ts
init_modules_watch_stub();

// seoSnapshot.ts
init_modules_watch_stub();

// src/lib/contact.ts
init_modules_watch_stub();
var PHONE_NUMBERS = [
  { e164: "918369724730", display: "+91 83697 24730", whatsapp: true },
  { e164: "918097653930", display: "+91 80976 53930", whatsapp: true },
  { e164: "918169182418", display: "+91 81691 82418", whatsapp: true }
];
var EMAIL_ADDRESSES = [
  "mayank@ramanisteel.com",
  "ramanioffice@gmail.com"
];
var POSTAL_ADDRESS = {
  // From the company's own 4-page brochure ("65/73, C.P. Tank Road, Mumbai - 400 004,
  // Maharashtra, India"). This was "Marine Lines East" — a locality, not a street address,
  // which is why the SEO audit's Local SEO check could not identify an address on the page.
  streetAddress: "65/73, C.P. Tank Road",
  addressLocality: "Mumbai",
  addressRegion: "Maharashtra",
  postalCode: "400004",
  addressCountry: "IN",
  countryName: "India",
  /** "65/73, C.P. Tank Road, Mumbai, Maharashtra 400004, India" - for prose and one-line rendering. */
  get oneLine() {
    return `${this.streetAddress}, ${this.addressLocality}, ${this.addressRegion} ${this.postalCode}, ${this.countryName}`;
  }
};
var PRIMARY_CALL = PHONE_NUMBERS[0];
var PRIMARY_WHATSAPP = PHONE_NUMBERS[1];
var PRIMARY_EMAIL = EMAIL_ADDRESSES[0];

// src/lib/answerBlock.ts
init_modules_watch_stub();
var ANSWER_BLOCK_QUESTION = "What is a nickel busbar?";
var ANSWER_BLOCK = "Nickel busbar is a high-conductivity interconnect that joins lithium-ion cells into battery packs. Ramani Steel House (nickelbusbar.com), an ISO 9001-compliant Indian manufacturer since 1974, supplies 99.8% pure nickel strip and busbar in 0.10\u20130.50 mm thickness and 2\u201350 mm width for EV packs, power tools and energy storage, shipping PAN India and to 17+ countries.";

// src/lib/returnPolicy.ts
init_modules_watch_stub();
var APPLICABLE_COUNTRY = "IN";
var RETURN_POLICY_SCHEMA = {
  "@type": "MerchantReturnPolicy",
  applicableCountry: APPLICABLE_COUNTRY,
  returnPolicyCategory: "https://schema.org/MerchantReturnNotPermitted"
};
var RETURN_POLICY_HEADING = "Returns & material guarantee";
var RETURN_POLICY_LINES = [
  "Nickel strip and busbar are slit to the width, thickness and temper of each order, so change-of-mind returns are not accepted.",
  "Material that fails its test certificate, or is supplied off-specification, is replaced at our cost. Raise it with your sales contact quoting the batch number on the material test certificate."
];

// src/lib/landingPages.ts
init_modules_watch_stub();

// src/lib/heritage.ts
init_modules_watch_stub();
var FOUNDED_YEAR = 1974;
var FOUNDING_MONTH = 9;
var IST_OFFSET_MS = 5.5 * 60 * 60 * 1e3;
function countYearsInBusiness(now = /* @__PURE__ */ new Date()) {
  const india = new Date(now.getTime() + IST_OFFSET_MS);
  const monthInIndia = india.getUTCMonth() + 1;
  return india.getUTCFullYear() - FOUNDED_YEAR + (monthInIndia >= FOUNDING_MONTH ? 1 : 0);
}
__name(countYearsInBusiness, "countYearsInBusiness");
var YEARS_IN_BUSINESS = countYearsInBusiness();

// src/lib/stripSizes.ts
init_modules_watch_stub();
var STANDARD_THICKNESSES_MM = ["0.10", "0.12", "0.15", "0.20", "0.25", "0.30"];
var WIDTH_RANGE_MM = { min: 2, max: 50 };
var CELL_FORMATS = [
  "14500",
  "18650",
  "21700",
  "26650",
  "32650",
  "32700",
  "4680",
  "Prismatic",
  "Pouch",
  "Other"
];

// src/lib/landingPages.ts
var SPEC_BULLETS = [
  "Nickel purity 99.8%, with material test certificates on request",
  `Thickness ${STANDARD_THICKNESSES_MM.join(", ")} mm standard, other thicknesses to order`,
  `Width ${WIDTH_RANGE_MM.min}\u2013${WIDTH_RANGE_MM.max} mm, cut to your drawing`,
  `For ${CELL_FORMATS.filter((cell) => /^\d/.test(cell)).join(", ")} cells and custom pack layouts`,
  "Pure nickel and nickel-plated steel, in strip, coil and busbar form",
  "Custom slitting, pitch and hole patterns to your cell layout"
];
var H_TYPE_PAGE = {
  slug: "h-type-nickel-strip",
  title: "H Type Nickel Strip Manufacturer in India | Supplier",
  description: "H type nickel strip manufacturer in India. Pure nickel H type strip for 18650, 21700, 32650 and 32700 packs, in 2P, 3P and 4P layouts. Bulk and export supply.",
  h1: "H Type Nickel Strip Manufacturer in India",
  intro: "Ramani Steel House is an H type nickel strip manufacturer in India, producing pure nickel H type strip for lithium-ion battery packs from its Mumbai works since 1974. H type strip is supplied for 18650, 21700, 32650 and 32700 cells in 2P, 3P and 4P layouts, in plain, fuse-type and honeycomb patterns, with PAN India despatch and export to 17+ countries.",
  keywords: [
    "H Type Nickel Strip Manufacturer in India",
    "H Type Nickel Strip",
    "H Type Nickel Strip Supplier",
    "H Type Nickel Strip Price",
    "H Type Nickel Strip for 18650 Battery",
    "21700 H Type Nickel Strip",
    "Pure Nickel H Type Strip",
    "H Type Busbar Nickel Strip"
  ],
  sections: [
    {
      heading: "What is an H type nickel strip?",
      body: "An H type nickel strip is a pre-formed battery interconnect whose repeating cut-out resembles the letter H, leaving a narrow neck of nickel between each pair of cell contacts. The neck concentrates heat at the weld so the spot weld forms cleanly without drawing heat into neighbouring cells, and on fuse-type variants that same neck acts as a deliberate weak point that opens if a cell draws fault current. Because the pattern is cut to the cell pitch, the strip drops onto the pack without hand alignment, which is why H type strip is the standard interconnect for volume 18650 and 21700 assembly."
    },
    {
      heading: "H type nickel strip specifications",
      bullets: SPEC_BULLETS
    },
    {
      heading: "Cell formats and layouts supplied",
      bullets: [
        "18650 in 2P, 3P and 4P \u2014 plain, fuse-type and honeycomb patterns",
        "21700 in 2P and 4P, including double-fuse",
        "32650 and 32700 in 2P, zig-zag and honeycomb",
        "Custom pitch, neck width and hole pattern against your pack drawing"
      ]
    },
    {
      heading: "Why buyers source H type nickel strip from Ramani Steel House",
      bullets: [
        `${YEARS_IN_BUSINESS} years of metallurgical manufacturing, ISO 9001 compliant processes`,
        "Pure nickel rather than nickel-plated steel where conductivity is critical",
        "Batch-wise conductivity and tensile testing, with traceable certificates",
        "Bulk capacity with export documentation prepared in-house"
      ]
    }
  ],
  faqs: [
    {
      question: "What is H type nickel strip used for?",
      answer: "H type nickel strip connects cells in parallel and series inside lithium-ion battery packs. The H-shaped cut-out concentrates heat at the weld point, giving a clean spot weld without heating the adjacent cell, which is why it is used for 18650 and 21700 pack assembly in EVs, power tools and energy storage."
    },
    {
      question: "What is the difference between H type and fuse type nickel strip?",
      answer: "Both share the H-shaped pattern. On a fuse-type strip the neck between the cell contacts is deliberately narrowed so it melts and opens the circuit if a single cell draws fault current, isolating that cell from the pack. A plain H type strip carries full current with no intended fusing point."
    },
    {
      question: "Do you supply H type nickel strip in bulk and for export?",
      answer: "Yes. H type nickel strip is supplied in bulk across India and exported to 17+ countries, with material test certificates, HS code classification and export documentation prepared in-house. Send your cell format, layout and quantity for a quotation."
    },
    {
      question: "What thicknesses does H type nickel strip come in?",
      answer: `H type nickel strip is made in ${STANDARD_THICKNESSES_MM.join(", ")} mm as standard, and in other thicknesses to order. 0.15 mm suits most 18650 packs; heavier packs move to 0.20 mm or thicker. The minimum order is 5 kg, and a size not listed on a product page can still be ordered \u2014 enter it on the product page or send your drawing.`
    },
    {
      question: "Can you make H type nickel strip to a custom pitch?",
      answer: "Yes. Pitch, neck width, strip width, thickness and hole pattern are all cut to your pack drawing or cell layout. Send the drawing and we quote against your exact geometry rather than a nearest standard size."
    }
  ],
  productSearch: "h type",
  breadcrumbName: "H Type Nickel Strip"
};
var STATE_FACTS = [
  {
    slug: "tamil-nadu",
    name: "Tamil Nadu",
    cities: ["Chennai", "Hosur", "Coimbatore", "Krishnagiri", "Sriperumbudur"],
    clusters: "Tamil Nadu carries the largest concentration of electric two- and three-wheeler assembly in India, running from the Hosur belt on the Karnataka border through Krishnagiri, with vehicle and component plants clustered around Sriperumbudur and Oragadam outside Chennai and a motor and pump manufacturing base at Coimbatore.",
    note: "Consignments move by road on the Mumbai\u2013Bengaluru\u2013Hosur corridor, and export lots for southern customers can be routed through Chennai port instead of Nhava Sheva where that suits the buyer."
  },
  {
    slug: "karnataka",
    name: "Karnataka",
    cities: ["Bengaluru", "Mysuru", "Hubballi", "Kolar", "Tumakuru"],
    clusters: "Karnataka holds much of the country\u2019s battery pack engineering and electronics design base, concentrated in Bengaluru and the Kolar and Narasapura industrial belts, where EV powertrain firms, energy storage integrators and contract electronics manufacturers build packs in prototype and pilot volumes as well as at scale.",
    note: "Bengaluru\u2019s pack builders order small, frequent lots against fast-changing cell layouts, so custom slitting and short-run H type patterns are quoted as readily as bulk coil."
  },
  {
    slug: "maharashtra",
    name: "Maharashtra",
    cities: ["Mumbai", "Pune", "Nashik", "Aurangabad", "Chakan"],
    clusters: "Maharashtra\u2019s automotive and engineering base runs from the Chakan and Talegaon belts outside Pune through Nashik and Aurangabad, covering vehicle assembly, auto components, power tools and industrial equipment, alongside a dense trading and fabrication market in Mumbai itself.",
    note: "This is our home state \u2014 the works and office are in Mumbai, so Maharashtra orders ship from the same city and small or urgent quantities can be collected directly."
  },
  {
    slug: "gujarat",
    name: "Gujarat",
    cities: ["Ahmedabad", "Sanand", "Vadodara", "Surat", "Rajkot"],
    clusters: "Gujarat combines vehicle assembly at Sanand and Halol with a large chemicals, electricals and engineering base around Vadodara, Ahmedabad and Rajkot, and hosts several of the country\u2019s announced cell and energy storage manufacturing investments.",
    note: "Road transit from Mumbai into Gujarat is short, and export consignments for Gujarat buyers can be handed over at Mundra or Kandla as easily as at Nhava Sheva."
  },
  {
    slug: "haryana",
    name: "Haryana",
    cities: ["Gurugram", "Manesar", "Faridabad", "Bawal", "Rewari"],
    clusters: "The Gurugram\u2013Manesar\u2013Bawal corridor is one of India\u2019s densest automotive component clusters, supplying vehicle assembly across the National Capital Region, with a matching base of power tool, appliance and electrical manufacturers at Faridabad.",
    note: "Haryana buyers are typically tier-1 and tier-2 component makers working to a released drawing, so material test certificates and dimensional traceability are supplied with every batch as standard."
  },
  {
    slug: "uttar-pradesh",
    name: "Uttar Pradesh",
    cities: ["Noida", "Greater Noida", "Ghaziabad", "Lucknow", "Kanpur"],
    clusters: "Noida and Greater Noida host the largest mobile handset, consumer electronics and appliance manufacturing base in the country, along with a growing set of battery pack assemblers serving electric two- and three-wheeler makers across the state.",
    note: "Electronics assembly in this belt runs to tight incoming-quality gates, so strip is despatched with batch conductivity and tensile results rather than a certificate of conformity alone."
  },
  {
    slug: "telangana",
    name: "Telangana",
    cities: ["Hyderabad", "Medak", "Sangareddy", "Zaheerabad"],
    clusters: "Telangana\u2019s manufacturing base around Hyderabad spans electronics, aerospace, pharmaceutical equipment and electrical machinery, with battery pack and energy storage assembly growing alongside the state\u2019s electronics manufacturing clusters.",
    note: "Hyderabad consignments move on the same southern road corridor as Karnataka and can be consolidated with Bengaluru despatches where a buyer runs plants in both."
  },
  {
    slug: "andhra-pradesh",
    name: "Andhra Pradesh",
    cities: ["Sri City", "Tirupati", "Visakhapatnam", "Anantapur"],
    clusters: "Sri City and the Tirupati electronics cluster host large-scale contract electronics and appliance manufacturing, while Visakhapatnam and Anantapur carry heavier engineering and automotive investment, both of which draw on battery pack assembly.",
    note: "Sri City\u2019s tenants work to import-substitution schedules with fixed delivery windows, so despatch dates are committed at order confirmation rather than at production."
  },
  {
    slug: "rajasthan",
    name: "Rajasthan",
    cities: ["Jaipur", "Neemrana", "Bhiwadi", "Alwar", "Jodhpur"],
    clusters: "The Neemrana, Bhiwadi and Alwar belt along the Delhi\u2013Jaipur corridor carries automotive components, electricals and light engineering, including several Japanese-invested plants, with a separate engineering and metals base around Jodhpur and Jaipur.",
    note: "Rajasthan deliveries run on the Mumbai\u2013Delhi highway corridor and are frequently consolidated with Haryana and NCR consignments on the same vehicle."
  },
  {
    slug: "west-bengal",
    name: "West Bengal",
    cities: ["Kolkata", "Howrah", "Durgapur", "Haldia", "Kharagpur"],
    clusters: "West Bengal\u2019s engineering and metals base is concentrated in Howrah, Durgapur and Haldia, with battery, inverter and electrical equipment manufacturing serving eastern India from the Kolkata industrial belt.",
    note: "Eastern India orders are quoted with the longest road transit of any mainland despatch, so buyers on repeat schedules usually take larger consolidated lots at a lower frequency."
  }
];
var DESCRIPTION_MAX = 160;
var stateDescription = /* @__PURE__ */ __name((state) => {
  const base = `Nickel strip manufacturer supplying ${state.name}: pure nickel strip, H type nickel strip and nickel busbar for battery packs.`;
  const chosen = [];
  let description = base;
  for (const city of state.cities) {
    const candidate = `${base} Despatch to ${[...chosen, city].join(", ")}.`;
    if (candidate.length > DESCRIPTION_MAX) break;
    chosen.push(city);
    description = candidate;
  }
  return description;
}, "stateDescription");
var stateLandingPage = /* @__PURE__ */ __name((state) => ({
  slug: `nickel-strip-manufacturer-in-${state.slug}`,
  // "| Ramani Steel" rather than "| Supplier": it keeps every state's title inside the 50-60
  // character window and puts the brand in the SERP line.
  title: `Nickel Strip Manufacturer in ${state.name} | Ramani Steel`,
  description: stateDescription(state),
  h1: `Nickel Strip Manufacturer Supplying ${state.name}`,
  intro: `Ramani Steel House supplies nickel strip to battery pack makers, electronics manufacturers and engineering firms across ${state.name} from its Mumbai works. Pure nickel strip, H type nickel strip and nickel busbar are despatched to ${state.cities.slice(0, -1).join(", ")} and ${state.cities[state.cities.length - 1]}, cut to the cell format and pack layout you build to.`,
  keywords: [
    `Nickel Strip Manufacturer in ${state.name}`,
    `Nickel Strip Supplier in ${state.name}`,
    `Nickel Strips Manufacturer in ${state.name}`,
    `H Type Nickel Strip ${state.name}`,
    `Battery Nickel Strip Supplier ${state.name}`,
    ...state.cities.map((city) => `Nickel Strip Supplier in ${city}`)
  ],
  sections: [
    {
      heading: `Battery and electronics manufacturing in ${state.name}`,
      body: state.clusters
    },
    {
      heading: `Supplying ${state.name}`,
      body: state.note
    },
    {
      heading: "What is supplied",
      bullets: SPEC_BULLETS
    },
    {
      heading: `Cities served in ${state.name}`,
      bullets: state.cities
    }
  ],
  faqs: [
    {
      question: `Do you supply nickel strip in ${state.name}?`,
      answer: `Yes. Nickel strip, H type nickel strip and nickel busbar are despatched from our Mumbai works to customers across ${state.name}, including ${state.cities.slice(0, 3).join(", ")}. Send your cell format, thickness, width and quantity for a quotation.`
    },
    {
      question: `What is the minimum order for ${state.name} deliveries?`,
      answer: "Order quantity depends on thickness, width and whether the pattern is standard or cut to your drawing. Both trial lots for a new pack design and repeat bulk schedules are quoted \u2014 send the specification and we confirm the minimum against it."
    },
    {
      question: "Are material test certificates provided?",
      answer: "Yes, on request. A material test certificate with batch-wise conductivity and tensile results is issued when you ask for one, and the batch remains traceable after delivery."
    }
  ],
  productSearch: "nickel strip",
  breadcrumbName: `Nickel Strip in ${state.name}`
}), "stateLandingPage");
var MUMBAI_PAGE = {
  slug: "nickel-strip-manufacturer-in-mumbai",
  title: "Nickel Strip Manufacturer in Mumbai | Supplier & Exporter",
  description: "Nickel strip manufacturer, supplier and exporter in Mumbai since 1974. Pure nickel strip, H type strip and busbar from our C.P. Tank Road works.",
  h1: "Nickel Strip Manufacturer, Supplier & Exporter in Mumbai",
  intro: `Ramani Steel House is a nickel strip manufacturer, supplier and exporter in Mumbai, working from ${POSTAL_ADDRESS.streetAddress} since 1974. Pure nickel strip, H type nickel strip and nickel busbar are slit and despatched from the same premises, so Mumbai buyers can collect in person rather than wait on a courier, and export consignments load through Nhava Sheva.`,
  keywords: [
    "Nickel Strip Manufacturer in Mumbai",
    "Nickel Strips Suppliers in Mumbai",
    "Nickel Strips Exporters in Mumbai",
    "Nickel Strips Stockists in Mumbai",
    "Nickel Busbar Manufacturer Mumbai",
    "H Type Nickel Strip Mumbai",
    "Pure Nickel Strip Supplier Mumbai"
  ],
  sections: [
    {
      heading: "Nickel strip suppliers in Mumbai",
      body: `The works and office are at ${POSTAL_ADDRESS.oneLine}, in the C.P. Tank metals market that has supplied Mumbai's fabricators and traders for decades. Buying from a manufacturer in the same city removes the freight leg and the lead time that comes with it: stock widths can be collected the same day, and custom slitting is quoted against your drawing rather than against a catalogue.`
    },
    {
      heading: "Nickel strip exporters in Mumbai",
      body: "Export consignments are packed at the Mumbai works and loaded through Nhava Sheva (JNPT), the port that handles most of western India's container traffic. Commercial invoice, packing list, certificate of origin and material test certificates are prepared with the shipment, and nickel strip and busbar have shipped to buyers in 17+ countries."
    },
    {
      heading: "Nickel strip stockists in Mumbai",
      body: "Common thicknesses and widths in pure nickel are held as coil and slit to order, so an ordinary 0.15mm or 0.20mm requirement does not wait on a mill run. Non-standard widths, pitches and hole patterns are cut to your cell layout, and a sample strip can be provided before a bulk lot is committed."
    },
    {
      heading: "What is supplied",
      bullets: SPEC_BULLETS
    }
  ],
  faqs: [
    {
      question: "Who supplies nickel strips in Mumbai?",
      answer: `Ramani Steel House manufactures and supplies nickel strip in Mumbai from ${POSTAL_ADDRESS.streetAddress}, and has done since 1974. Pure nickel strip, H type nickel strip, fuse-type and zig-zag patterns and nickel busbar are all made in-house rather than bought in.`
    },
    {
      question: "Do you export nickel strips from Mumbai?",
      answer: "Yes. Export lots are packed at the Mumbai works and shipped through Nhava Sheva with full documentation, including certificate of origin and material test certificates. Send your specification, quantity and destination port for a quotation."
    },
    {
      question: "Can I collect nickel strip from your Mumbai office?",
      answer: `Yes. The works and office are at ${POSTAL_ADDRESS.oneLine}. Call ahead on ${PRIMARY_CALL.display} so the material is cut and ready when you arrive.`
    },
    {
      question: "What nickel strip sizes are stocked in Mumbai?",
      answer: "Thickness runs 0.10mm to 0.50mm and width 2mm to 50mm, in pure nickel and nickel-plated steel. Common sizes are held as coil and slit to order; anything outside that is cut to your drawing."
    }
  ],
  productSearch: "nickel strip",
  breadcrumbName: "Nickel Strip in Mumbai"
};
var TRADE_BUYER_PAGE = {
  slug: "nickel-strip-wholesaler-and-distributor",
  title: "Nickel Strip Wholesaler & Distributor India | 5 kg MOQ",
  description: "Nickel strip wholesaler, stockist and distributor backed by our own Mumbai manufacturing. 99.8% pure nickel from 5 kg for small battery makers and traders.",
  h1: "Nickel Strip Wholesaler, Stockist & Distributor in India",
  intro: "Ramani Steel House is a nickel strip manufacturer in Mumbai that also sells as a wholesaler, stockist and distributor. Manufacturing is the core of the business, and because the strip is made and slit in-house, the same 99.8% pure nickel is available in small lots: orders start at 5 kg, which suits small battery manufacturers, pack assemblers and traders as well as volume buyers.",
  keywords: [
    "Nickel Strip Wholesaler",
    "Nickel Strip Distributor",
    "Nickel Strip Stockist",
    "Nickel Strip Trader",
    "Nickel Strip Dealer",
    "Nickel Strip Wholesale Price",
    "Nickel Strip 5 kg MOQ",
    "Nickel Strip for Small Battery Manufacturers",
    "Battery Nickel Strip Wholesale Supplier India"
  ],
  sections: [
    {
      heading: "Why buy from a manufacturer that also wholesales",
      body: "A trader or distributor usually buys from a mill and resells, so the buyer is two steps from the material and the certificate. Buying from the manufacturer removes that step. The strip comes from the same production and slitting lines that supply volume orders, a material test certificate is available on request, and a question about thickness tolerance or weldability goes to the people who made the strip."
    },
    {
      heading: "Small lots for small battery manufacturers",
      body: "The minimum order is 5 kg. That is enough strip for a pack builder assembling a few hundred cells, a workshop building e-bike or power-tool packs, or a trader stocking a few common sizes, without committing to a mill-sized order. Pricing is quoted per kilogram."
    },
    {
      heading: "What is held in stock",
      body: "Common thicknesses in pure nickel, chiefly 0.15 mm and 0.20 mm, are held as coil and slit to the width you need, so an ordinary requirement does not wait on a mill run. Stock of a particular width is confirmed at quotation. Despatch is typically within 7 days, PAN India."
    },
    {
      heading: "New designs made to your drawing",
      body: "The listed sizes are only the most requested ones. If your pack needs a different thickness, width, pitch or hole pattern, it is made to your drawing, and tooling is developed for unique battery pack layouts. Send the drawing or cell arrangement with the enquiry and the quotation is made against it."
    },
    {
      heading: "At a glance",
      bullets: [
        "Manufacturer first, also stockist, wholesaler and distributor",
        "Minimum order 5 kg, despatch in about 7 days",
        ...SPEC_BULLETS
      ]
    }
  ],
  faqs: [
    {
      question: "What is the minimum order for nickel strip?",
      answer: "5 kg. The same material, certificates and slitting apply at 5 kg as at bulk quantities."
    },
    {
      question: "Are you a nickel strip manufacturer or a distributor?",
      answer: "Both. Manufacturing in Mumbai is the primary business, and the company also sells as a stockist, wholesaler, trader and distributor, so small buyers get manufacturer-direct material without a mill-sized order."
    },
    {
      question: "Can traders and distributors buy nickel strip from you for resale?",
      answer: "Yes. Traders and distributors buy by the kilogram in the common thicknesses and widths. Send the sizes and quantities you stock and a price is quoted per kilogram."
    },
    {
      question: "Do you make nickel strip in sizes that are not listed?",
      answer: "Yes. Thickness, width, pitch and hole pattern are made to your drawing, and tooling is developed for new battery pack designs. The minimum order still applies."
    }
  ],
  productSearch: "nickel strip",
  breadcrumbName: "Wholesale & Distribution"
};
var STRIP_SIZES = [
  {
    slug: "pure-nickel-strip-0-15mm-x-10mm",
    thickness: "0.15 mm",
    width: "10 mm",
    title: "Pure Nickel Strip 0.15mm x 10mm | Manufacturer",
    description: "Pure nickel strip 0.15mm thick x 10mm wide, 99.8% nickel, UNS N02201. Made in Mumbai for 18650 and 21700 battery pack welding. 5 kg MOQ, 7 day delivery.",
    suitedTo: "the most widely used gauge for 18650 pack assembly. It spot welds cleanly on a mid-range resistance welder without the electrode force a thicker strip needs, which is why it is the size most builders standardise on for 2P and 3P layouts.",
    cellFormats: "18650, 21700"
  },
  {
    slug: "pure-nickel-strip-0-20mm-x-15mm",
    thickness: "0.20 mm",
    width: "15 mm",
    title: "Pure Nickel Strip 0.20mm x 15mm | Manufacturer",
    description: "Pure nickel strip 0.20mm x 15mm wide, 99.8% nickel, UNS N02201. Higher current capacity for 21700 and 32700 packs. 5 kg MOQ, 7 day delivery from Mumbai.",
    suitedTo: "packs that draw more current per cell than 0.15 mm comfortably carries. The larger cross-section \u2014 thicker and wider \u2014 lowers resistance through the interconnect, at the cost of needing more weld energy than a 0.15 mm strip.",
    cellFormats: "21700, 32650, 32700"
  }
];
var stripSizePage = /* @__PURE__ */ __name((size) => ({
  slug: size.slug,
  title: size.title,
  description: size.description,
  h1: `Pure Nickel Strip ${size.thickness} \xD7 ${size.width}`,
  intro: `Pure nickel strip in ${size.thickness} thickness and ${size.width} width, manufactured by Ramani Steel House in Mumbai since 1974. Supplied at 99.8% nickel to UNS N02201, slit to width from coil, for battery pack builders working with ${size.cellFormats} cells. Minimum order 5 kg, despatched in 7 days PAN India and exported to 17+ countries.`,
  keywords: [
    `Pure Nickel Strip ${size.thickness} x ${size.width}`,
    `Nickel Strip ${size.thickness}`,
    `${size.width} Nickel Strip`,
    `Nickel Strip ${size.thickness} x ${size.width} Price`,
    "Pure Nickel Strip Manufacturer India",
    "Battery Nickel Strip Supplier"
  ],
  sections: [
    {
      heading: `Specification \u2014 ${size.thickness} \xD7 ${size.width}`,
      bullets: [
        `Thickness ${size.thickness}, width ${size.width}`,
        "Purity 99.8% pure nickel",
        "Grade Nickel 201, UNS N02201 (DIN 2.4068)",
        `Suited to ${size.cellFormats} cell formats`,
        "Supplied as strip or coil, slit to width",
        "Minimum order 5 kg \xB7 despatch in 7 days",
        "Material test certificate on request"
      ]
    },
    {
      heading: "What this size is used for",
      body: `This gauge is ${size.suitedTo}`
    },
    {
      heading: "Ordering this size",
      body: `${size.thickness} \xD7 ${size.width} is a stocked size, so it ships from coil rather than being rolled to order. If your pack needs a different width, the same 99.8% material is slit to any width from 2 mm to 50 mm against your drawing \u2014 send the pitch and cell layout and it is cut to that instead.`
    }
  ],
  faqs: [
    {
      question: `What is pure nickel strip ${size.thickness} \xD7 ${size.width} used for?`,
      answer: `It is used as a cell interconnect and battery tab in lithium-ion packs built from ${size.cellFormats} cells, spot welded onto the cell terminals to join cells in parallel and series.`
    },
    {
      question: `Is ${size.thickness} \xD7 ${size.width} nickel strip pure nickel or nickel-plated steel?`,
      answer: "Pure nickel, at 99.8%, to UNS N02201. Nickel-plated steel is supplied separately and is a different material \u2014 it is cheaper but has substantially higher resistance, so it is not interchangeable where conductivity matters."
    },
    {
      question: `What is the minimum order for ${size.thickness} \xD7 ${size.width} strip?`,
      answer: "5 kg. Both trial quantities for qualifying a new pack design and repeat bulk schedules are quoted from the same stock."
    },
    {
      question: "Can this size be supplied as a coil rather than cut strip?",
      answer: "Yes. The same material is supplied as coil or as cut lengths. Say which you need with the enquiry, along with the coil weight or the cut length."
    }
  ],
  productSearch: "nickel strip",
  breadcrumbName: `${size.thickness} \xD7 ${size.width} Nickel Strip`
}), "stripSizePage");
var APPLICATION_PAGES = [
  {
    slug: "nickel-strip-for-battery-pack-welding",
    title: "Nickel Strip for Battery Pack Welding | Supplier",
    description: "Nickel strip for battery pack spot welding: 99.8% pure nickel, 0.10-0.50mm, cut to cell pitch. Welds cleanly on 18650, 21700 and 32700 packs. Made in Mumbai.",
    h1: "Nickel Strip for Battery Pack Welding",
    intro: "Nickel strip for battery pack welding, manufactured in Mumbai by Ramani Steel House. Spot welding is what the material has to survive: 99.8% pure nickel takes a weld nugget cleanly at moderate electrode force, and the strip is slit and cut to your cell pitch so it seats on the pack without hand alignment.",
    keywords: [
      "Nickel Strip for Battery Pack Welding",
      "Spot Welding Nickel Strip",
      "Battery Tab Welding Strip",
      "Nickel Strip for Spot Welder",
      "Battery Pack Welding Strip Supplier India"
    ],
    sections: [
      {
        heading: "Why pure nickel welds better than plated steel",
        body: "A spot weld forms where resistance concentrates. Pure nickel has low, predictable bulk resistance, so the heat forms at the interface between strip and cell terminal, which is where the joint is wanted. Nickel-plated steel puts a thin conductive layer over a resistive core, so weld behaviour varies with how the plating sits and the joint is harder to make repeatable across a production run."
      },
      {
        heading: "What we supply for welding",
        bullets: [
          "Purity 99.8% pure nickel, Nickel 201 / UNS N02201",
          "Thickness 0.10mm \u2013 0.50mm; 0.15mm is the common welding gauge",
          "Width 2mm \u2013 50mm, slit to your drawing",
          "H-type, zig-zag, honeycomb, fuse-type and plain patterns",
          "Cut to the cell pitch of your pack layout",
          "Minimum order 5 kg \xB7 despatch in 7 days"
        ]
      },
      {
        heading: "Matching thickness to your welder",
        body: "Thicker strip carries more current but needs more weld energy. A resistance welder comfortable with 0.15 mm may produce shallow, high-resistance joints on 0.25 mm without a change in settings or hardware. Tell us the welder and the per-cell current when enquiring and the gauge is recommended against both, rather than against the current alone."
      }
    ],
    faqs: [
      {
        question: "What thickness nickel strip is best for spot welding?",
        answer: "0.15 mm is the most widely used for 18650 pack assembly \u2014 it carries useful current and welds on a mid-range resistance welder. Heavier packs move to 0.20 mm or 0.25 mm, but only if the welder can deliver the extra energy."
      },
      {
        question: "Can nickel-plated steel strip be spot welded the same way?",
        answer: "It can be welded, but not with the same settings or the same consistency. The plated layer over a resistive core makes the joint less repeatable across a run, which is why pure nickel is preferred where weld quality is being controlled."
      },
      {
        question: "Do you cut nickel strip to our cell pitch?",
        answer: "Yes. Pitch, neck width, strip width and hole pattern are all cut to your pack drawing rather than to a nearest standard size. Send the drawing or the cell layout with the enquiry."
      }
    ],
    productSearch: "nickel strip",
    breadcrumbName: "Battery Pack Welding"
  },
  {
    slug: "nickel-strip-for-lithium-ion-battery-manufacturers",
    title: "Nickel Strip for Lithium-Ion Battery Manufacturers",
    description: "Bulk nickel strip for lithium-ion battery manufacturers: 99.8% pure nickel, custom slitting, test certificates, PAN India supply and export to 17+ countries.",
    h1: "Nickel Strip for Lithium-Ion Battery Manufacturers",
    intro: "Ramani Steel House supplies nickel strip to lithium-ion battery manufacturers across India and in 17+ export markets, from its Mumbai works. What a manufacturer needs beyond the material itself is repeatability, traceable batches and a supplier who can hold a delivery schedule \u2014 the strip is slit in-house, tested batch-wise, and despatched in 7 days.",
    keywords: [
      "Nickel Strip for Lithium-Ion Battery Manufacturers",
      "Bulk Nickel Strip Supplier India",
      "Lithium Battery Nickel Strip Manufacturer",
      "Battery Manufacturer Nickel Strip Supply",
      "OEM Nickel Strip Supplier"
    ],
    sections: [
      {
        heading: "What manufacturers buy on",
        bullets: [
          "Batch-to-batch consistency in thickness and temper",
          "Material test certificates, traceable to the batch, on request",
          "Repeat schedules held to a 7 day despatch",
          "Custom slitting to a released drawing rather than a standard size",
          "Bulk pricing, with a 5 kg minimum for qualification lots",
          "Export documentation prepared in-house for overseas plants"
        ]
      },
      {
        heading: "Qualification before volume",
        body: "Most manufacturers qualify a strip before committing to a schedule: a small lot, welded on the production line, checked for weld strength and contact resistance. The 5 kg minimum exists for exactly that \u2014 it is low enough to qualify a design without a mill-quantity commitment, and the same material and batch traceability applies to the trial lot as to the production one."
      },
      {
        heading: "Specification supplied",
        bullets: SPEC_BULLETS
      }
    ],
    faqs: [
      {
        question: "Do you supply nickel strip in production volumes?",
        answer: "Yes. The catalogue runs from 5 kg qualification lots up to repeat bulk schedules, slit from coil in Mumbai and despatched PAN India or exported."
      },
      {
        question: "Can you hold a delivery schedule for a production line?",
        answer: "Published despatch is 7 days. For repeat schedules, agree the call-off with the sales team at order confirmation so material is slit ahead of each release rather than on receipt of each order."
      },
      {
        question: "Will you supply against our drawing rather than a standard size?",
        answer: "Yes \u2014 width, thickness, pitch, neck width and hole pattern are cut to a released drawing. Send the drawing with the enquiry and the quotation is made against it."
      }
    ],
    productSearch: "nickel strip",
    breadcrumbName: "For Battery Manufacturers"
  },
  {
    slug: "nickel-busbar-for-battery-applications",
    title: "Nickel Busbar for Battery Applications | India",
    description: "Nickel busbar for battery applications: pure nickel interconnects for EV, storage and industrial packs. Custom width and thickness, made in Mumbai since 1974.",
    h1: "Nickel Busbar for Battery Applications",
    intro: "Nickel busbar for battery applications, manufactured in Mumbai by Ramani Steel House. Where a strip interconnects cells, a busbar carries the combined current of a module \u2014 so the cross-section, not the weld pattern, is the governing dimension. Supplied in pure nickel at 99.8%, cut to the width and thickness your module drawing calls for.",
    keywords: [
      "Nickel Busbar for Battery Applications",
      "Nickel Busbar Manufacturer India",
      "Battery Busbar Supplier",
      "Pure Nickel Busbar",
      "EV Battery Busbar India",
      "Energy Storage Busbar Supplier"
    ],
    sections: [
      {
        heading: "Busbar or strip \u2014 which your pack needs",
        body: "Nickel strip joins cells within a parallel group and carries the current of those cells only. A busbar joins groups or modules and carries their combined current, so it is sized on total current rather than per-cell current. Using strip where a busbar is needed is the more common error of the two, and it shows up as heating at the interconnect under load rather than as a failed weld."
      },
      {
        heading: "What we supply",
        bullets: [
          "Pure nickel busbar at 99.8% purity, Nickel 201 / UNS N02201",
          "Nickel-plated and copper busbar where conductivity or cost dictates",
          "Width and thickness cut to your module drawing",
          "Hole patterns and terminations to spec",
          "Minimum order 5 kg \xB7 despatch in 7 days",
          "Material test certificate on request"
        ]
      },
      {
        heading: "Applications",
        bullets: [
          "EV battery modules and packs",
          "Grid and commercial energy storage (BESS)",
          "Industrial and traction battery assemblies",
          "Power tool and light-EV packs"
        ]
      }
    ],
    faqs: [
      {
        question: "What is a nickel busbar used for in a battery pack?",
        answer: "It carries current between parallel groups or between modules, where the combined current is higher than a cell interconnect strip is sized for. It is specified on cross-section against the total current it must carry."
      },
      {
        question: "Nickel busbar or copper busbar \u2014 which is better?",
        answer: "Copper has higher conductivity for the same cross-section; nickel resists corrosion better and welds directly to cell terminals without plating. Many packs use both, with nickel at the cell interface and copper for the longer current paths."
      },
      {
        question: "Can nickel busbar be made to our module drawing?",
        answer: "Yes. Width, thickness, length, hole pattern and terminations are cut to the drawing supplied. Send the drawing and the quotation is made against it rather than against a nearest standard section."
      }
    ],
    productSearch: "busbar",
    breadcrumbName: "Nickel Busbar for Batteries"
  }
];
var LANDING_PAGES = [
  H_TYPE_PAGE,
  MUMBAI_PAGE,
  TRADE_BUYER_PAGE,
  ...STRIP_SIZES.map(stripSizePage),
  ...APPLICATION_PAGES,
  ...STATE_FACTS.map(stateLandingPage)
];
var LANDING_PAGES_BY_SLUG = new Map(LANDING_PAGES.map((page) => [page.slug, page]));
function getLandingPage(slug) {
  const clean2 = slug?.trim().replace(/^\/+|\/+$/g, "").toLowerCase();
  if (!clean2) return null;
  return LANDING_PAGES_BY_SLUG.get(clean2) ?? null;
}
__name(getLandingPage, "getLandingPage");
function getLandingPageByPathname(pathname) {
  return getLandingPage(pathname);
}
__name(getLandingPageByPathname, "getLandingPageByPathname");
function parentCategoryFor(product) {
  const haystack = `${product.name ?? ""} ${product.slug ?? ""}`;
  if (/\bh[\s-]?type\b/i.test(haystack)) {
    return { name: H_TYPE_PAGE.breadcrumbName, path: `/${H_TYPE_PAGE.slug}` };
  }
  return { name: "Products", path: "/products" };
}
__name(parentCategoryFor, "parentCategoryFor");
var LANDING_PATHS = LANDING_PAGES.map((page) => `/${page.slug}`);
var STATE_LANDING_PAGES = STATE_FACTS.map(
  (state) => ({ path: `/nickel-strip-manufacturer-in-${state.slug}`, name: state.name })
);

// src/lib/blogCta.ts
init_modules_watch_stub();
var RULES = [
  {
    match: /weld/,
    cta: {
      topic: "Nickel strip for spot welding",
      teaser: "Need strip that welds cleanly? 5 kg MOQ, any size.",
      heading: "Nickel strip for spot welding, in the size you need",
      body: "99.8% pure nickel that forms a clean weld at moderate electrode force, slit to your width and cut to your cell pitch. Orders start at 5 kg.",
      link: { label: "See nickel strip for battery pack welding", path: "/nickel-strip-for-battery-pack-welding" }
    }
  },
  {
    match: /busbar/,
    cta: {
      topic: "Nickel busbar",
      teaser: "Need a busbar made to your module drawing? 5 kg MOQ.",
      heading: "Nickel busbar made to your module drawing",
      body: "Pure nickel busbar in the width and thickness your current and cross-section call for, with tooling developed for new pack layouts.",
      link: { label: "See nickel busbar for battery applications", path: "/nickel-busbar-for-battery-applications" }
    }
  },
  {
    match: /fuse|h-type|zig-zag|2p-vs|18650|21700|pattern/,
    cta: {
      topic: "H type / fuse-type nickel strip",
      teaser: "Ready to order H type or fuse-type strip? Choose your size.",
      heading: "H type and fuse-type nickel strip, cut to your cell pitch",
      body: "Plain, fuse-type, honeycomb and zig-zag patterns for 18650, 21700, 32650 and 32700 cells, in 0.10\u20130.30 mm standard thicknesses or any size to order. 5 kg minimum order.",
      link: { label: "See H type nickel strip sizes and prices", path: "/h-type-nickel-strip" }
    }
  },
  {
    match: /price|pricing|moq|minimum-order|wholesal|choose/,
    cta: {
      topic: "Nickel strip wholesale / small lots",
      teaser: "Buying in small lots? Orders start at 5 kg.",
      heading: "Manufacturer-direct nickel strip from 5 kg",
      body: "The same 99.8% pure nickel and test certificates at 5 kg as at bulk quantities, supplied as manufacturer, stockist, wholesaler and distributor.",
      link: { label: "See wholesale and small-lot supply", path: "/nickel-strip-wholesaler-and-distributor" }
    }
  },
  {
    match: /export|uk-|-uk/,
    cta: {
      topic: "Nickel strip export",
      teaser: "Importing nickel strip? Get an export quotation.",
      heading: "Export quotation for nickel strip and busbar",
      body: "Commercial invoice, packing list, certificate of origin and material test certificates prepared with the shipment, to 17+ countries.",
      link: { label: "Send an export enquiry", path: "/export-enquiry" }
    }
  },
  {
    // (^|-)ess(-|$), not a bare "ess", which would also match "thickness" and "process".
    match: /electric-vehicle|lithium|(^|-)ess(-|$)|purity|energy-storage/,
    cta: {
      topic: "Nickel strip for lithium-ion packs",
      teaser: "Building lithium-ion packs? Get strip in your exact size.",
      heading: "Pure nickel strip for lithium-ion battery packs",
      body: "99.8% pure nickel strip and busbar for EV, energy storage and power-tool packs, made to your thickness, width and cell layout. 5 kg minimum order.",
      link: { label: "See nickel strip for lithium-ion battery makers", path: "/nickel-strip-for-lithium-ion-battery-manufacturers" }
    }
  }
];
var DEFAULT_CTA = {
  topic: "Nickel strip",
  teaser: "Know the size you need? 5 kg MOQ, made to order.",
  heading: "Order nickel strip in your exact size",
  body: "Standard thicknesses from 0.10 to 0.30 mm and widths from 2 to 50 mm, or any size made to your drawing. Orders start at 5 kg.",
  link: { label: "Browse nickel strip and choose your size", path: "/products" }
};
function blogCtaFor(slug) {
  const key = slug.toLowerCase();
  const { topic, ...cta } = RULES.find((rule) => rule.match.test(key))?.cta ?? DEFAULT_CTA;
  return { ...cta, enquiryLabel: `${topic} (from article: ${slug})` };
}
__name(blogCtaFor, "blogCtaFor");

// src/lib/productFaq.ts
init_modules_watch_stub();

// src/lib/productSpecs.ts
init_modules_watch_stub();
var NICKEL_PURITY_RANGE = "99.8% pure nickel";
var MTC_AVAILABILITY = "Material test certificate provided on request";
var MINIMUM_ORDER_QUANTITY = "5 kg";
var DELIVERY_TIME = "7 days";
function deriveGrade(unsValue) {
  const uns = (unsValue ?? "").toUpperCase();
  if (uns.includes("N02200")) return "Nickel 200";
  if (uns.includes("N02201")) return "Nickel 201";
  return null;
}
__name(deriveGrade, "deriveGrade");
function isNickelProduct(product) {
  const haystack = `${product.name ?? ""} ${product.astm_value ?? ""} ${product.uns_value ?? ""}`.toLowerCase();
  if (/copper|astm\s*b187|c1[01]\d{3}/.test(haystack)) return false;
  return /nickel|\bni\b|n022\d\d|astm\s*b1[678]\b|astm\s*b162/.test(haystack);
}
__name(isNickelProduct, "isNickelProduct");
function parseDimensions(dimensions) {
  const out = {};
  if (!dimensions) return out;
  for (const part of dimensions.split(",")) {
    const [rawLabel, ...rest] = part.split(":");
    if (!rest.length) continue;
    const label = rawLabel.trim();
    const value = rest.join(":").trim();
    if (label && value) out[label.toLowerCase()] = value;
  }
  return out;
}
__name(parseDimensions, "parseDimensions");
function derivePattern(name) {
  const n = name.toLowerCase();
  const parts = [];
  if (/h[-\s]?type/.test(n)) parts.push("H-type");
  if (/zig[-\s]?zag/.test(n)) parts.push("Zig-zag");
  if (/honeycomb/.test(n)) parts.push("Honeycomb");
  if (/fuse/.test(n)) parts.push(/no\s*fuse/.test(n) ? "No fuse" : "Fuse-type");
  if (/plain/.test(n)) parts.push("Plain");
  return parts.length ? parts.join(", ") : null;
}
__name(derivePattern, "derivePattern");
function deriveCellFormat(name) {
  const matches = [...name.matchAll(/\b(18650|21700|32650|32700)\b/g)].map((m) => m[1]);
  return matches.length ? [...new Set(matches)].join(", ") : null;
}
__name(deriveCellFormat, "deriveCellFormat");
function deriveConfiguration(name) {
  const match = name.match(/\b([234])P\b/i);
  return match ? `${match[1]}P` : null;
}
__name(deriveConfiguration, "deriveConfiguration");
function buildProductSpecs(product) {
  const name = product.name ?? "";
  const dims = parseDimensions(product.dimensions);
  const nickel = isNickelProduct(product);
  const rows = [
    ["Material", nickel ? "Pure nickel" : null],
    ["Grade", nickel ? deriveGrade(product.uns_value) : null],
    ["Purity", nickel ? NICKEL_PURITY_RANGE : null],
    // Silver is true of nickel and nickel-plated strip alike, and marketplace listings publish
    // it because buyers filter on it. Surface finish is deliberately absent: the catalogue is
    // supplied bright, matte and nickel-plated, and there is no per-product column saying
    // which — asserting "Bright" on all 17 would be a guess on the row most likely to be
    // checked against a sample.
    ["Colour", nickel ? "Silver" : null],
    ["Thickness", dims.thickness],
    ["Width", dims.width],
    // The listing records one size; the business makes many. Without these rows a buyer reading
    // "Thickness: 0.15mm" reasonably concludes 0.15 mm is all there is, and a search for
    // "0.12 mm nickel strip" finds nothing on the page to match. See lib/stripSizes.
    ["Available thicknesses", nickel ? `${STANDARD_THICKNESSES_MM.join(", ")} mm standard; other thicknesses to order` : null],
    ["Width range", nickel ? `${WIDTH_RANGE_MM.min}\u2013${WIDTH_RANGE_MM.max} mm standard; other widths to order` : null],
    ["Battery cell types", nickel ? `${CELL_FORMATS.filter((cell) => cell !== "Other").join(", ")}, or any custom cell pitch` : null],
    ["Custom design", nickel ? "Made to your drawing, with tooling developed for new battery pack layouts" : null],
    ["Cell format", deriveCellFormat(name)],
    ["Configuration", deriveConfiguration(name)],
    ["Pattern", derivePattern(name)],
    ["Standard", product.astm_value],
    ["UNS / DIN", product.uns_value],
    ["Minimum order", MINIMUM_ORDER_QUANTITY],
    ["Delivery time", DELIVERY_TIME],
    // Packaging is deliberately absent, for the same reason minimum order is absent from
    // PRODUCT_EXPORT_TERMS: that block already carries an "Export packing" row, on the same
    // page and in the same additionalProperty array, and it says more than "standard export
    // packing" does. Two rows for one attribute is a duplicate claim, not a stronger one.
    ["Test certificate", MTC_AVAILABILITY],
    ["Country of origin", "India"]
  ];
  return rows.filter((row) => Boolean(row[1])).map(([label, value]) => ({ label, value }));
}
__name(buildProductSpecs, "buildProductSpecs");

// src/lib/productFaq.ts
var spec = /* @__PURE__ */ __name((rows, label) => rows.find((row) => row.label === label)?.value ?? null, "spec");
function buildProductFaqs(product) {
  const name = (product.name ?? "").trim();
  if (!name) return [];
  const rows = buildProductSpecs(product);
  const nickel = isNickelProduct(product);
  const thickness = spec(rows, "Thickness");
  const width = spec(rows, "Width");
  const cellFormat = spec(rows, "Cell format");
  const pattern = spec(rows, "Pattern");
  const configuration = spec(rows, "Configuration");
  const grade = spec(rows, "Grade");
  const purity = spec(rows, "Purity");
  const standard = spec(rows, "Standard");
  const faqs = [];
  const identity = [
    purity ? `${purity} strip` : "a battery interconnect",
    thickness ? `${thickness} thick` : null,
    width ? `${width} wide` : null,
    // "in the H-type pattern", not "in a h-type pattern": the value is a proper name and the
    // article would have to change with it.
    pattern ? `in the ${pattern} pattern` : null,
    cellFormat ? `for ${cellFormat} cells` : null,
    configuration ? `in a ${configuration} layout` : null
  ].filter(Boolean);
  faqs.push({
    question: `What is ${name}?`,
    answer: `${name} is ${identity.join(", ")}. It is manufactured by Ramani Steel House in Mumbai, India and supplied PAN India and for export, from a ${MINIMUM_ORDER_QUANTITY} minimum order with despatch in about ${DELIVERY_TIME}.`
  });
  if (nickel) {
    faqs.push({
      question: thickness ? `What thickness is ${name}?` : `What thicknesses is ${name} available in?`,
      answer: `${thickness ? `${name} is supplied in ${thickness}. ` : ""}Other thicknesses are made to order: ${STANDARD_THICKNESSES_MM.join(", ")} mm are standard, and widths run ${WIDTH_RANGE_MM.min}\u2013${WIDTH_RANGE_MM.max} mm. Send your thickness and width with the enquiry and it is cut to that size.`
    });
  }
  if (nickel && purity) {
    faqs.push({
      question: `Is ${name} pure nickel or nickel-plated steel?`,
      answer: `It is ${purity}${grade ? `, ${grade}` : ""}${standard ? `, to ${standard}` : ""} \u2014 not nickel-plated steel. Pure nickel carries more current for the same cross-section and welds more consistently. A material test certificate is provided on request.`
    });
  }
  if (nickel) faqs.push({
    question: `Which battery cells does ${name} fit?`,
    answer: cellFormat ? `It is cut for ${cellFormat} cells${configuration ? ` in a ${configuration} arrangement` : ""}. Strip for other formats \u2014 ${CELL_FORMATS.filter((cell) => /^\d/.test(cell)).join(", ")} \u2014 and for any custom cell pitch is made to your pack drawing.` : `It is cut to the cell pitch of your pack. ${CELL_FORMATS.filter((cell) => /^\d/.test(cell)).join(", ")} and custom layouts are all supplied \u2014 send the cell arrangement or drawing with your enquiry.`
  });
  faqs.push({
    question: `What is the minimum order for ${name}?`,
    answer: `The minimum order is ${MINIMUM_ORDER_QUANTITY}, and despatch is typically ${DELIVERY_TIME}. The same material, slitting and test certificates apply at ${MINIMUM_ORDER_QUANTITY} as at bulk quantities, so small battery manufacturers and traders can buy manufacturer-direct without a mill-sized order.`
  });
  faqs.push({
    question: `Can ${name} be made in a custom size or pattern?`,
    answer: `Yes. Thickness, width, length, pitch and hole pattern are cut to your drawing, and tooling is developed for unique battery pack layouts. Send the drawing or cell arrangement and the quotation is made against it rather than against a nearest standard size.`
  });
  return faqs;
}
__name(buildProductFaqs, "buildProductFaqs");
var productFaqJsonLd = /* @__PURE__ */ __name((faqs) => faqs.length ? {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((faq) => ({
    "@type": "Question",
    name: faq.question,
    acceptedAnswer: { "@type": "Answer", text: faq.answer }
  }))
} : null, "productFaqJsonLd");

// src/lib/showcaseVideo.ts
init_modules_watch_stub();
var SHOWCASE_VIDEO = {
  src: "/video/nickel-strip-busbar-showcase.mp4",
  name: "Ramani Steel House nickel strip and busbar showcase",
  description: "A short showcase of the pure nickel strip and nickel busbar made by Ramani Steel House in Mumbai: H-type, zig-zag, fuse-type and plain strip for 18650, 21700, 32650 and 32700 battery packs, plus nickel busbar for modules.",
  /** Read from the file's own mvhd box: 33 seconds. */
  duration: "PT33S",
  durationLabel: "33-second",
  /** The date the reel was published to the site. */
  uploadDate: "2026-09-26",
  thumbnailAlt: "Pure nickel H type strip for 18650 battery packs, made by Ramani Steel House in Mumbai \u2014 video thumbnail",
  width: 1080,
  height: 1920
};
var showcaseVideoJsonLd = /* @__PURE__ */ __name((siteUrl, thumbnailPath) => ({
  "@context": "https://schema.org",
  "@type": "VideoObject",
  name: SHOWCASE_VIDEO.name,
  description: SHOWCASE_VIDEO.description,
  thumbnailUrl: [`${siteUrl.replace(/\/+$/, "")}${thumbnailPath}`],
  uploadDate: SHOWCASE_VIDEO.uploadDate,
  duration: SHOWCASE_VIDEO.duration,
  contentUrl: `${siteUrl.replace(/\/+$/, "")}${SHOWCASE_VIDEO.src}`,
  width: SHOWCASE_VIDEO.width,
  height: SHOWCASE_VIDEO.height,
  publisher: {
    "@type": "Organization",
    name: "Ramani Steel House",
    url: siteUrl
  }
}), "showcaseVideoJsonLd");

// src/lib/productImage.ts
init_modules_watch_stub();

// src/lib/productImageLocal.ts
init_modules_watch_stub();
var LOCAL_PRODUCT_IMAGE_FILES = /* @__PURE__ */ new Map([
  ["21700-2p-h-type-precision", "21700-2p-h-type-precision-nickel-strip"],
  ["Copper-Busbar", "copper-busbar"],
  ["Plain-Nickel-Strips", "plain-nickel-strips"],
  ["ni-18650-2p-h-type", "ni-18650-2p-h-type-nickel-strip"],
  ["ni-18650-2p-h-type-fuse-type", "ni-18650-2p-h-type-nickel-strip-fuse"],
  ["ni-18650-2p-zig-zag-no-fuse-type", "ni-18650-2p-zig-zag-no-fuse-type-nickel-strip"],
  ["ni-18650-3p-h-type", "ni-18650-3p-h-type-nickel-strip"],
  ["ni-18650-4p-h-type", "ni-18650-4p-h-type-nickel-strip"],
  ["ni-21700-2p-h-type-v3", "ni-21700-2p-h-type-nickel-strip-v3"],
  ["ni-21700-4p-h-type", "ni-21700-4p-h-type-nickel-strip"],
  ["ni-32650-2p-h-type", "ni-32650-2p-h-type-nickel-strip"],
  ["ni-custom-custom", "ni-custom-nickel-strip"],
  ["ni-customizable", "ni-custom-customizable-nickel-strip"],
  ["ni-fuse-type-18650-2p-h-type-honeycomb", "ni-fuse-type-18650-h-type-honeycomb-2p-nickel-strip"],
  ["ni-fuse-type-18650-2p-zig-zag-honeycomb", "ni-fuse-type-18650-zig-zag-honeycomb-2p-nickel-strip"],
  ["ni-fuse-type-21700-2p-h-type-double-fuse", "ni-fuse-type-21700-2p-h-double-nickel-strip"],
  ["ni-fuse-type-32700-2p-zig-zag-honeycomb", "ni-fuse-type-32700-2p-zig-zag-honeycomb-nickel-strip"]
]);
var LOCAL_PRODUCT_IMAGE_SLUGS = new Set(
  LOCAL_PRODUCT_IMAGE_FILES.keys()
);
function localProductImagePath(slug) {
  const clean2 = slug?.trim();
  if (!clean2) return null;
  const file = LOCAL_PRODUCT_IMAGE_FILES.get(clean2);
  return file ? `/img/products/${file}.webp` : null;
}
__name(localProductImagePath, "localProductImagePath");

// src/lib/productImage.ts
var PRODUCT_IMAGE_ROUTE = "/api/product-image";
var PRODUCT_IMAGE_PLACEHOLDER = "/img/product-placeholder.webp";
var IMAGE_EXTENSION_PATTERN = /\.(jpe?g|png|webp|avif|gif)(?:$|\?)/i;
function imageExtension(sourceUrl) {
  const match = IMAGE_EXTENSION_PATTERN.exec(sourceUrl || "");
  if (!match) return "jpg";
  const extension = match[1].toLowerCase();
  return extension === "jpeg" ? "jpg" : extension;
}
__name(imageExtension, "imageExtension");
function productImagePath(slug, sourceUrl) {
  const cleanSlug = slug?.trim();
  if (!cleanSlug) return PRODUCT_IMAGE_PLACEHOLDER;
  return localProductImagePath(cleanSlug) ?? `${PRODUCT_IMAGE_ROUTE}/${encodeURIComponent(cleanSlug)}.${imageExtension(sourceUrl)}`;
}
__name(productImagePath, "productImagePath");
function productImageUrl(siteUrl, slug, sourceUrl) {
  return `${siteUrl.replace(/\/+$/, "")}${productImagePath(slug, sourceUrl)}`;
}
__name(productImageUrl, "productImageUrl");

// src/lib/productSeo.ts
init_modules_watch_stub();
var PRODUCT_KEYWORD_BLOCKS = {
  // Already ranks first for "Ni Fuse type 21700"; this targets the commercial query the same
  // product answers. The phrase appears twice (heading + opening sentence) and once in the
  // photo's alt text - enough to be unambiguous, short of the repetition Google reads as
  // stuffing.
  "ni-fuse-type-21700-2p-h-type-double-fuse": {
    heading: "H Type Nickel Strips Price",
    metaDescription: "{name}: double-fuse H type nickel strip for 21700 battery packs. H type nickel strips price {price} per kg from Ramani Steel House, Mumbai.",
    paragraphs: [
      "The H type nickel strips price for {name} is {price} per kg, the standard rate for this double-fuse 21700 strip in pure nickel.",
      "Rates move with thickness, width, pitch and order quantity, so bulk and export lots are quoted separately. Send your pack drawing or cell layout and Ramani Steel House will quote your exact H type nickel strip."
    ],
    keywords: [
      "H Type Nickel Strips Price",
      "H Type Nickel Strip",
      "21700 H Type Nickel Strip Price",
      "Nickel Fuse Strip Price",
      "Ni Fuse Type 21700"
    ]
  }
};
function getProductKeywordBlock(slug) {
  const cleanSlug = slug?.trim();
  return cleanSlug && PRODUCT_KEYWORD_BLOCKS[cleanSlug] || null;
}
__name(getProductKeywordBlock, "getProductKeywordBlock");
var cleanList = /* @__PURE__ */ __name((value) => Array.isArray(value) ? value.map((entry) => entry?.trim()).filter((entry) => !!entry) : [], "cleanList");
function resolveProductKeywordBlock(product) {
  const heading = product.seo_heading?.trim();
  if (!heading) return getProductKeywordBlock(product.slug);
  const paragraphs = cleanList(product.seo_paragraphs);
  const keywords = cleanList(product.seo_keywords);
  const metaDescription = product.seo_meta_description?.trim();
  const fallback = getProductKeywordBlock(product.slug);
  return {
    heading,
    // An empty meta description means "no override"; keywordMetaDescription() returning the
    // generic product description is better than publishing an empty one.
    metaDescription: metaDescription || fallback?.metaDescription || "",
    paragraphs: paragraphs.length ? paragraphs : fallback?.paragraphs ?? [],
    keywords: keywords.length ? keywords : fallback?.keywords ?? []
  };
}
__name(resolveProductKeywordBlock, "resolveProductKeywordBlock");
var TITLE_MAX = 60;
var TITLE_SUFFIXES = [
  " | Manufacturer, Exporter & Wholesaler",
  " | Nickel Strip Manufacturer & Exporter",
  " | Manufacturer & Wholesale Supplier",
  " | Manufacturer & Exporter",
  " | Exporter India",
  " | Exporter"
];
var BUYER_ROLE_KEYWORDS = [
  "Nickel Strip Manufacturer",
  "Nickel Strip Exporter",
  "Nickel Strip Stockist",
  "Nickel Strip Wholesaler",
  "Nickel Strip Distributor",
  "Nickel Strip Dealer",
  "Nickel Strip Trader",
  "Nickel Strip Supplier",
  "Bulk Nickel Strip Supplier"
];
function productPageTitle(name, block) {
  if (!block) {
    const suffix = TITLE_SUFFIXES.find((option) => name.length + option.length <= TITLE_MAX);
    return suffix ? `${name}${suffix}` : name;
  }
  const branded = `${block.heading} | Ramani Steel House`;
  return branded.length <= TITLE_MAX ? branded : block.heading;
}
__name(productPageTitle, "productPageTitle");
var fill = /* @__PURE__ */ __name((text, values) => text.replace(/\{name\}/g, () => values.name).replace(/\{price\}/g, () => values.price ?? ""), "fill");
function fillKeywordParagraphs(block, values) {
  return block.paragraphs.filter((paragraph) => values.price !== null || !paragraph.includes("{price}")).map((paragraph) => fill(paragraph, values));
}
__name(fillKeywordParagraphs, "fillKeywordParagraphs");
function keywordMetaDescription(block, values) {
  if (values.price === null && block.metaDescription.includes("{price}")) return null;
  return fill(block.metaDescription, values).slice(0, 160);
}
__name(keywordMetaDescription, "keywordMetaDescription");
function productImageAltSubject(name, block) {
  return block ? `${name} - ${block.heading}` : name;
}
__name(productImageAltSubject, "productImageAltSubject");

// src/lib/utils.ts
init_modules_watch_stub();

// node_modules/clsx/dist/clsx.mjs
init_modules_watch_stub();

// src/lib/utils.ts
var IMAGE_ALT_SITE_SUFFIX = "Ramani Steel House, nickel strip manufacturer in Mumbai, India";
function buildImageAlt(subject, kind = "product") {
  const cleanSubject = subject?.trim();
  const label = cleanSubject || `Nickel strip ${kind}`;
  return `${label} - ${IMAGE_ALT_SITE_SUFFIX}`;
}
__name(buildImageAlt, "buildImageAlt");

// src/lib/brochure.ts
init_modules_watch_stub();
var BROCHURE = {
  path: "/docs/ramani-steel-house-company-brochure.pdf",
  label: "Company brochure",
  /** Shown next to the link. Update if the file is replaced. */
  sizeLabel: "PDF, 3.3 MB",
  /** What the brochure actually covers — used for the link's accessible description. */
  description: "Ramani Steel House company profile: product range, industries served, the Nippon Steel Stainless Corporation partnership, and contact details."
};

// src/lib/groupSites.ts
init_modules_watch_stub();
var GROUP_SITES = [
  { href: "https://www.ramanisteel.com/", label: "ramanisteel.com" },
  { href: "https://www.ramanialloys.com/", label: "ramanialloys.com" },
  { href: "https://www.ramanisteelhouse.com/", label: "ramanisteelhouse.com" }
];

// src/lib/productLinks.ts
init_modules_watch_stub();
var PRODUCT_LINKS = [
  { slug: "21700-2p-h-type-precision", name: "21700 2P H-type" },
  { slug: "Copper-Busbar", name: "Copper Busbar" },
  { slug: "ni-18650-2p-h-type", name: "Ni 18650 2P H-Type Nickel Strip (ASTM B16)" },
  { slug: "ni-18650-2p-h-type-fuse-type", name: "Ni 18650 2P H-Type Nickel Strip (ASTM B17)" },
  { slug: "ni-18650-2p-zig-zag-no-fuse-type", name: "Ni 18650 2P ZIG-ZAG" },
  { slug: "ni-18650-3p-h-type", name: "Ni 18650 3P H-type" },
  { slug: "ni-18650-4p-h-type", name: "Ni 18650 4P H-type" },
  { slug: "ni-21700-2p-h-type-v3", name: "Ni 21700 2P H-Type Nickel Strip" },
  { slug: "ni-21700-4p-h-type", name: "Ni 21700 4P H-type" },
  { slug: "ni-32650-2p-h-type", name: "Ni 32650 2P H-type" },
  { slug: "ni-customizable", name: "Ni Custom" },
  { slug: "ni-fuse-type-21700-2p-h-type-double-fuse", name: "Ni Fuse type 21700" },
  { slug: "ni-fuse-type-32700-2p-zig-zag-honeycomb", name: "Ni Fuse Type 32700" },
  { slug: "ni-fuse-type-18650-2p-h-type-honeycomb", name: "Ni Fuse-Type 18650 \u2014 H-Type Honeycomb" },
  { slug: "ni-fuse-type-18650-2p-zig-zag-honeycomb", name: "Ni Fuse-Type 18650 \u2014 Zig-Zag Honeycomb" },
  { slug: "Plain-Nickel-Strips", name: "Plain Nickel Strips" }
];

// src/lib/homeContent.ts
init_modules_watch_stub();
var HERO_PRODUCT_SLUG = "ni-18650-2p-h-type";
var HOME_SEO = {
  title: "Nickel Strip Manufacturer & Stockist India | 5 kg MOQ",
  description: "Nickel strip and busbar manufacturer in Mumbai, also a stockist, wholesaler and distributor. 99.8% pure nickel from 5 kg MOQ, custom made to your drawing.",
  socialDescription: "Manufacturer of pure nickel strip, H type strip and nickel busbar since 1974, also a stockist, wholesaler and distributor. 5 kg MOQ; custom strips and tooling to your drawing.",
  keywords: [
    "Nickel Strip Manufacturer India",
    "Nickel Strip Stockist",
    "Nickel Strip Wholesaler",
    "Nickel Strip Distributor",
    "Nickel Strip Trader",
    "Nickel Strip Supplier",
    "Nickel Strip 5 kg MOQ",
    "Custom Nickel Strip as per Drawing",
    "Pure Nickel Strip",
    "H Type Nickel Strip",
    "Nickel Busbar",
    "Nickel Strip for 18650 Battery",
    "Nickel Strip Exporter"
  ].join(", ")
};
var HOME_HERO = {
  h1Lead: "Nickel Strip Manufacturer",
  h1Main: "& Stockist in India",
  offers: ["5 kg minimum order", "Sample before bulk order", "Any size, made to your drawing"]
};
var TRADE_ROLES_SECTION = {
  heading: "Manufacturer first, also stockist, wholesaler and distributor",
  paragraphs: [
    "Ramani Steel House manufactures nickel strip and nickel busbar in Mumbai, and that is the core of the business. Because the strip is made and slit in-house, the same material is also sold the way traders and smaller buyers need it: as a stockist of the common sizes, and as a wholesaler and distributor to small battery manufacturers, pack builders and traders.",
    "Orders start at 5 kg. That is small enough for a pack assembler building a few hundred cells, not only for volume manufacturers, and the material and certificates are the same at 5 kg as at 500.",
    "Listed sizes are only the most common ones. New designs are made to your drawing: strip thickness, width, pitch and hole pattern, plus tooling for unique battery pack layouts. Send the drawing or the cell arrangement and the quotation is made against it."
  ],
  bullets: [
    "Manufacturer: in-house production and slitting in Mumbai since 1974",
    "Stockist: common thicknesses and widths for quick despatch",
    "Wholesaler and distributor: 5 kg MOQ for small battery makers and traders",
    "Custom: made to your drawing, with tooling for new pack designs"
  ]
};
var applications = [
  "Lithium-ion Batteries",
  "EV Battery Packs",
  "Power Tools",
  "Energy Storage Systems"
];
var industries = [
  "Electric Vehicles (EV)",
  "Consumer Electronics",
  "Renewable Energy",
  "Industrial Battery Manufacturers"
];
var whyChooseUs = [
  { title: `${YEARS_IN_BUSINESS} Years Manufacturing Experience`, detail: "Legacy of metallurgical excellence and precision engineering." },
  { title: "Consistent Quality & Precision", detail: "Strict ISO processes and multi-stage QA for every batch." },
  { title: "Bulk Supply Capability", detail: "Scalable production with ready export documentation." },
  { title: "Custom Manufacturing Options", detail: "Widths, thickness, and surface finishes tailored to spec." },
  { title: "Fast Delivery & Global Shipping", detail: "Reliable lead times with worldwide logistics coverage." }
];
var qualityPoints = [
  "ISO 9001 compliant manufacturing & traceability",
  "High purity nickel with certified material reports",
  "Automated slitting, edge conditioning, and surface inspection",
  "Batch-wise conductivity and tensile testing"
];
var productSpecifications = [
  { label: "Nickel Purity", value: "99.8%" },
  { label: "Thickness Range", value: "0.10mm \u2013 0.50mm" },
  { label: "Width Range", value: "2mm \u2013 50mm" },
  { label: "Surface Finish", value: "Bright, matte, nickel-plated" },
  { label: "Typical Use", value: "Battery tabs, busbars, welding strips" }
];
var productVariants = [
  {
    title: "Pure Nickel Strips",
    spec: "99.8% purity | 0.10mm - 0.50mm",
    note: "High conductivity for battery tabs and precision welding.",
    cta: "/products?search=pure+nickel+strip"
  },
  {
    title: "Nickel Plated Strips",
    spec: "Low resistance | 0.15mm x 8mm",
    note: "Cost-effective performance for high-volume manufacturing.",
    cta: "/products?search=nickel+plated+strip"
  },
  {
    title: "Custom Sizes & Coils",
    spec: "Width 2mm - 50mm | Custom slitting",
    note: "Built to your cell design, welding process, and load specs.",
    cta: "/products?search=custom+nickel+strip"
  }
];
var faqItems = [
  {
    question: "What is nickel strip used for?",
    answer: "Nickel strip is used as a battery tab and connector in lithium-ion cells, EV packs, power tools, and energy storage systems because of its conductivity and weldability."
  },
  {
    question: "How do I choose the right nickel strip thickness?",
    answer: "Choose thickness based on current rating, welding method, and cell design. Thin strips suit compact packs; thicker strip supports higher current and durability."
  },
  {
    question: "Can you supply custom nickel strips for EV battery assembly?",
    answer: "Yes, we offer custom slitting, width, and surface preparation for nickel strips used in EV battery modules and high-performance battery systems."
  }
];

// src/lib/exportEnquiry.ts
init_modules_watch_stub();
var EXPORT_PATH = "/export-enquiry";
var EXPORT_TITLE = "Nickel Strip & Busbar Export Enquiry | India & Worldwide";
var EXPORT_DESCRIPTION = "Export enquiry for pure nickel strip and nickel busbar from Mumbai, India. Bulk supply PAN India and export to 17+ countries on FOB, CIF and CIP terms.";
var EXPORT_H1 = "Nickel Strip & Nickel Busbar Export Enquiry";
var EXPORT_LEAD = "Ramani Steel House (nickelbusbar.com) has manufactured nickel strip and nickel busbar in Mumbai, India since 1974. We supply lithium-ion battery, EV and energy storage manufacturers PAN India and export to 17+ countries, shipping on EXW, FOB, CIF or CIP terms with mill test certificates and complete export documentation. Send your specification below and receive a quotation within one business day.";
var EXPORT_REGIONS = [
  { region: "Asia-Pacific", detail: "Battery pack assemblers, cell integrators and power-tool OEMs." },
  { region: "Middle East", detail: "Energy storage integrators and industrial fabricators." },
  { region: "Europe", detail: "EV module builders working to ASTM B16 / DIN 2.4068 specifications." },
  { region: "Africa", detail: "Solar and off-grid storage assemblers sourcing in bulk." },
  { region: "North & South America", detail: "Battery pack manufacturers and distributors." }
];
var INDIA_HIGHLIGHTS = [
  "PAN India dispatch from our Mumbai manufacturing unit",
  "GST invoicing, with material test certificates issued on request",
  "Bulk and repeat-order pricing for Indian battery pack manufacturers",
  "Custom widths and thicknesses slit to your drawing"
];
var EXPORT_HIGHLIGHTS = [
  "Export to 17+ countries with sea and air freight support",
  "EXW, FOB, CIF and CIP terms quoted on request",
  "Export-grade, moisture-protected packing for sea freight",
  "Full documentation set prepared for customs clearance"
];
var EXPORT_PRODUCT_FORMS = [
  "Pure nickel strip",
  "H-type nickel strip",
  "Fuse-type / honeycomb nickel strip",
  "Zig-zag nickel strip",
  "Nickel coil",
  "Nickel busbar"
];
var EXPORT_SPECS = [
  { label: "Purity", value: "99.8% pure nickel" },
  { label: "Thickness", value: "0.10 - 0.50 mm" },
  { label: "Width", value: "2 - 50 mm (custom slitting available)" },
  { label: "Standards", value: "ASTM B16 / UNS N02201 / DIN 2.4068" },
  { label: "Forms", value: EXPORT_PRODUCT_FORMS.join(", ") },
  { label: "Quality system", value: "ISO 9001-compliant manufacturing, in-house slitting and QC" }
];
var EXPORT_DOCUMENTS = [
  "Commercial invoice",
  "Packing list",
  "Certificate of Origin",
  "Mill Test Certificate (MTC) / material test report",
  "HS classification for the shipped grade",
  "Bill of Lading or Air Waybill",
  "Insurance certificate (on CIF / CIP terms)"
];
var HS_CODES = [
  {
    code: "7506.10",
    covers: "Nickel (not alloyed) plates, sheets, strip and foil - pure nickel strip and busbar strip"
  },
  { code: "7506.20", covers: "Nickel alloy plates, sheets, strip and foil" },
  { code: "7505.11", covers: "Nickel (not alloyed) bars, rods and profiles - solid busbar sections" }
];
var INCOTERMS = ["EXW", "FOB", "CIF", "CIP"];
var LOADING_PORTS = "Nhava Sheva (JNPT) and Mumbai";
var PRODUCT_EXPORT_TERMS = [
  { label: "HS code", value: `${HS_CODES[0].code} (pure nickel strip and busbar strip)` },
  { label: "Incoterms", value: INCOTERMS.join(", ") },
  { label: "Port of loading", value: LOADING_PORTS },
  { label: "Export packing", value: "Moisture-protected, export-grade packing for sea freight" },
  { label: "Ships to", value: "17+ countries, plus PAN India despatch" },
  { label: "Quoted in", value: "INR for domestic orders, USD for export" }
];
var PRODUCT_EXPORT_LEAD = "Manufactured in Mumbai and shipped worldwide. Export orders are quoted on EXW, FOB, CIF or CIP terms with the full documentation set prepared in-house.";
var EXPORT_FAQS = [
  {
    llms: true,
    question: "Do you export nickel strip and nickel busbar from India?",
    answer: "Yes. Ramani Steel House manufactures nickel strip and nickel busbar in Mumbai, India and exports to 17+ countries, alongside PAN India supply. Manufacturing is our primary business, so export orders ship from our own production and slitting lines."
  },
  {
    llms: true,
    question: "What is the HS code for nickel strip exported from India?",
    answer: "Pure nickel strip and busbar strip fall under HS 7506.10 (nickel, not alloyed - plates, sheets, strip and foil). Nickel alloy strip falls under 7506.20, and solid nickel bars, rods and profiles under 7505.11. Import tariff lines vary by destination, so confirm the exact line with your customs broker."
  },
  {
    question: "Which Incoterms and ports do you ship on?",
    answer: "We quote EXW, FOB, CIF and CIP. Sea freight loads at " + LOADING_PORTS + ", and air freight is available for samples and urgent lots. The Incoterm you select on the enquiry form is priced into the quotation."
  },
  {
    question: "What is your minimum order quantity for export?",
    answer: "We support low minimum order quantities for trial and qualification lots as well as bulk and repeat production volumes. The exact MOQ depends on the width, thickness and pattern you need and is confirmed with your quotation."
  },
  {
    question: "What export documentation do you provide?",
    answer: "Every export shipment is supported with a commercial invoice, packing list, Certificate of Origin, Mill Test Certificate, HS classification for the shipped grade, and the Bill of Lading or Air Waybill. An insurance certificate is included on CIF and CIP terms."
  },
  {
    question: "Do you supply nickel strip within India as well?",
    answer: "Yes. We dispatch PAN India from our Mumbai unit with GST invoicing, issue material test certificates on request, and offer bulk and repeat-order pricing to Indian battery pack manufacturers. Use the same form and select supply within India."
  },
  {
    question: "How quickly will I receive a quotation?",
    answer: "Our team responds to export and bulk enquiries within one business day. Lead times and freight cost are confirmed at the time of quotation, based on the specification, quantity and destination you provide."
  }
];

// src/lib/snapshotRoutes.ts
init_modules_watch_stub();

// seoSnapshot.ts
var SITE_URL = "https://www.nickelbusbar.com";
var SITE_NAME = "Ramani Steel House";
var SITE_LOGO_URL = `${SITE_URL}/img/logo.png`;
var SITE_OG_IMAGE_URL = `${SITE_URL}/img/og-image.png`;
var escapeHtml = /* @__PURE__ */ __name((value) => String(value ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;"), "escapeHtml");
var escapeAttr = /* @__PURE__ */ __name((value) => escapeHtml(value), "escapeAttr");
var inrFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0
});
var formatInr = /* @__PURE__ */ __name((amount) => inrFormatter.format(amount), "formatInr");
var replaceOnce = /* @__PURE__ */ __name((html, pattern, replacement) => html.replace(pattern, () => replacement), "replaceOnce");
var injectHead = /* @__PURE__ */ __name((template, head) => {
  let html = template;
  html = replaceOnce(
    html,
    /<title[^>]*>[\s\S]*?<\/title>/,
    `<title data-ssr-head="true">${escapeHtml(head.title)}</title>`
  );
  html = replaceOnce(
    html,
    /<meta name="description"[^>]*>/,
    `<meta name="description" data-ssr-head="true" content="${escapeAttr(head.description)}" />`
  );
  html = replaceOnce(
    html,
    /<link rel="canonical"[^>]*>/,
    `<link rel="canonical" data-ssr-head="true" href="${escapeAttr(head.canonical)}" />`
  );
  html = replaceOnce(
    html,
    /<link rel="alternate" hreflang="en"[^>]*>\s*<link rel="alternate" hreflang="x-default"[^>]*>/,
    `<link rel="alternate" hreflang="en" href="${escapeAttr(head.canonical)}" />
  <link rel="alternate" hreflang="x-default" href="${escapeAttr(head.canonical)}" />`
  );
  if (head.robots) {
    html = replaceOnce(
      html,
      /<meta name="robots"[^>]*>/,
      `<meta name="robots" data-ssr-head="true" content="${escapeAttr(head.robots)}" />`
    );
  }
  if (head.keywords?.length) {
    html = replaceOnce(
      html,
      /<meta name="keywords"[\s\S]*?>/,
      `<meta name="keywords" data-ssr-head="true" content="${escapeAttr(head.keywords.join(", "))}" />`
    );
  }
  html = html.replace(/<meta property="og:description"[^>]*>/, "");
  html = html.replace(/<meta property="og:url"[^>]*>/, "");
  html = html.replace(/<meta property="og:image"[^>]*>/, "");
  html = html.replace(/<meta name="twitter:title"[^>]*>/, "");
  html = html.replace(/<meta name="twitter:description"[^>]*>/, "");
  html = html.replace(/<meta name="twitter:image"[^>]*>/, "");
  const ogTags = [
    `<meta property="og:title" data-ssr-head="true" content="${escapeAttr(head.title)}" />`,
    `<meta property="og:description" data-ssr-head="true" content="${escapeAttr(head.description)}" />`,
    `<meta property="og:url" data-ssr-head="true" content="${escapeAttr(head.canonical)}" />`,
    head.ogImage ? `<meta property="og:image" data-ssr-head="true" content="${escapeAttr(head.ogImage)}" />` : "",
    `<meta name="twitter:title" data-ssr-head="true" content="${escapeAttr(head.title)}" />`,
    `<meta name="twitter:description" data-ssr-head="true" content="${escapeAttr(head.description)}" />`,
    head.ogImage ? `<meta name="twitter:image" data-ssr-head="true" content="${escapeAttr(head.ogImage)}" />` : ""
  ].filter(Boolean).join("\n  ");
  html = replaceOnce(html, /<meta property="og:title"[^>]*>/, ogTags);
  const jsonLdScripts = head.jsonLd.map(
    (entry) => `<script type="application/ld+json" data-ssr-head="true">${JSON.stringify(entry).replace(/</g, "\\u003c")}<\/script>`
  ).join("\n  ");
  html = replaceOnce(
    html,
    '<div id="root"></div>',
    `<div id="root">${head.snapshotBody ?? ""}</div>
  ${jsonLdScripts}`
  );
  return html;
}, "injectHead");
var productCardHtml = /* @__PURE__ */ __name((product) => {
  const slug = String(product.slug ?? "");
  const name = String(product.name ?? "");
  if (!slug || !name) return "";
  const href = `${SITE_URL}/product/${encodeURIComponent(slug)}`;
  const src = productImageUrl(SITE_URL, slug, product.image ?? null);
  const alt = buildImageAlt(
    product.seo_heading ? `${name} - ${String(product.seo_heading)}` : name
  );
  const detail = product.dimensions ? ` &mdash; ${escapeHtml(String(product.dimensions))}` : "";
  return `<li><a href="${escapeAttr(href)}"><img src="${escapeAttr(src)}" alt="${escapeAttr(alt)}" width="600" height="600" loading="lazy" decoding="async" />${escapeHtml(name)}</a>${detail}</li>`;
}, "productCardHtml");
var productListHtml = /* @__PURE__ */ __name((products) => products.map(productCardHtml).filter(Boolean).join(""), "productListHtml");
var groupSitesHtml = /* @__PURE__ */ __name(() => `<h2>Part of Ramani Steel House</h2>
    <p>NickelBusbar.com is the nickel strip and nickel busbar catalogue of Ramani Steel House, Mumbai, established 1974. Company websites: ${GROUP_SITES.map(
  (site) => `<a href="${site.href}">${escapeHtml(site.label)}</a>`
).join(", ")}.</p>`, "groupSitesHtml");
var breadcrumbJsonLd = /* @__PURE__ */ __name((trail) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [{ name: "Home", url: SITE_URL }, ...trail].map((crumb, index) => ({
    "@type": "ListItem",
    position: index + 1,
    name: crumb.name,
    item: crumb.url
  }))
}), "breadcrumbJsonLd");
var priceValidUntil = /* @__PURE__ */ __name(() => {
  const until = new Date(Date.now() + 30 * 24 * 60 * 60 * 1e3);
  return until.toISOString().slice(0, 10);
}, "priceValidUntil");
function renderUnavailableShell(template, pathname) {
  const html = injectHead(template, {
    title: "Temporarily Unavailable | Ramani Steel House",
    description: "This page is temporarily unavailable while we restore service. Please try again shortly.",
    canonical: `${SITE_URL}${pathname === "/" ? "/" : pathname}`,
    ogImage: SITE_OG_IMAGE_URL,
    jsonLd: [],
    snapshotBody: ""
  });
  return { status: 503, html };
}
__name(renderUnavailableShell, "renderUnavailableShell");
async function renderBlogSnapshot(template, slug) {
  const post = await queryOne(
    `SELECT title, slug, excerpt, content, cover_image_url, author_name, meta_title,
            meta_description, faq_items, key_answer, social_post_url, published_at, created_at, updated_at
     FROM blog_posts
     WHERE lower(slug) = lower($1) AND status = 'published' AND (published_at IS NULL OR published_at <= now())
     LIMIT 1`,
    [slug]
  );
  if (post && String(post.slug) !== slug) {
    return {
      status: 301,
      location: `${SITE_URL}/blog/${encodeURIComponent(String(post.slug))}`,
      html: ""
    };
  }
  if (!post) {
    const canonical2 = `${SITE_URL}/blog/${encodeURIComponent(slug)}`;
    const html2 = injectHead(template, {
      title: "404 | Article Not Found",
      description: "This article may be unpublished or moved to another URL.",
      canonical: canonical2,
      robots: "noindex,follow,noarchive",
      jsonLd: [],
      snapshotBody: ""
    });
    return { status: 404, html: html2 };
  }
  const title = post.meta_title || post.title;
  const description = post.meta_description || post.excerpt || `Technical insights from ${SITE_NAME}.`;
  const canonical = `${SITE_URL}/blog/${encodeURIComponent(post.slug)}`;
  const coverImageUrl = post.cover_image_url || "";
  const publishedIso = post.published_at || post.created_at || null;
  const modifiedIso = post.updated_at || publishedIso;
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description,
    ...coverImageUrl ? { image: [coverImageUrl] } : {},
    author: { "@type": "Organization", name: post.author_name || SITE_NAME, url: SITE_URL },
    publisher: { "@type": "Organization", name: SITE_NAME, logo: { "@type": "ImageObject", url: SITE_LOGO_URL } },
    mainEntityOfPage: { "@type": "WebPage", "@id": canonical },
    ...publishedIso ? { datePublished: publishedIso } : {},
    ...modifiedIso ? { dateModified: modifiedIso } : {}
  };
  let faqItems2 = [];
  try {
    const raw = post.faq_items;
    const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
    if (Array.isArray(parsed)) {
      faqItems2 = parsed.filter(
        (item) => item && typeof item.question === "string" && typeof item.answer === "string"
      );
    }
  } catch {
    faqItems2 = [];
  }
  const faqJsonLd = faqItems2.length ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems2.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer }
    }))
  } : null;
  const faqHtml = faqItems2.length ? `<section><h2>Frequently Asked Questions</h2>${faqItems2.map((item) => `<h3>${escapeHtml(item.question)}</h3><p>${escapeHtml(item.answer)}</p>`).join("")}</section>` : "";
  const titleTokens = String(post.title ?? "").toLowerCase().split(/[^a-z0-9]+/).filter(
    (token) => token.length >= 3 && // Words every product name contains carry no signal, and matching on them would rank
    // the catalogue in its default order on every article.
    !["nickel", "strip", "strips", "the", "and", "for", "with", "your", "what", "how", "vs"].includes(token)
  );
  let relatedProducts = [];
  let relatedPosts = [];
  try {
    [relatedProducts, relatedPosts] = await Promise.all([
      query(
        // Ordered by how many of the article's distinctive words appear in the product name, so
        // a piece about 21700 packs leads with 21700 strip. Falls back to featured order when
        // nothing matches, which keeps the links present rather than dropping the section.
        `SELECT p.slug, p.name, p.image, p.dimensions, p.seo_heading
           FROM products p
          ORDER BY (
            SELECT count(*) FROM unnest($1::text[]) AS token
             WHERE regexp_replace(lower(coalesce(p.name, '')), '[^a-z0-9]+', ' ', 'g')
                   LIKE '%' || token || '%'
          ) DESC, p.is_featured DESC, p.name
          LIMIT 4`,
        [titleTokens]
      ),
      query(
        `SELECT slug, title
           FROM blog_posts
          WHERE lower(slug) <> lower($1)
            AND status = 'published' AND (published_at IS NULL OR published_at <= now())
          ORDER BY (
            SELECT count(*) FROM unnest($2::text[]) AS token
             WHERE regexp_replace(lower(coalesce(title, '')), '[^a-z0-9]+', ' ', 'g')
                   LIKE '%' || token || '%'
          ) DESC, published_at DESC NULLS LAST, id DESC
          LIMIT 4`,
        [slug, titleTokens]
      )
    ]);
  } catch (error) {
    console.warn(`[snapshot] Related links unavailable for /blog/${slug}.`, error);
  }
  const relatedProductsHtml = relatedProducts.length ? `<h2>Products covered in this article</h2><ul>${productListHtml(relatedProducts)}</ul>` : "";
  const relatedPostsHtml = relatedPosts.length ? `<h2>Related guides</h2><ul>${relatedPosts.map(
    (item) => `<li><a href="${SITE_URL}/blog/${encodeURIComponent(item.slug)}">${escapeHtml(item.title)}</a></li>`
  ).join("")}</ul>` : "";
  const coverImageHtml = coverImageUrl ? `<img src="${escapeAttr(coverImageUrl)}" alt="${escapeAttr(
    buildImageAlt(String(post.title ?? ""))
  )}" width="1200" height="675" fetchpriority="high" />` : "";
  const cta = blogCtaFor(String(post.slug ?? slug));
  const ctaHtml = `<section><h2>${escapeHtml(cta.heading)}</h2><p>${escapeHtml(cta.body)}</p><p><a href="${SITE_URL}${cta.link.path}">${escapeHtml(cta.link.label)}</a></p></section>`;
  const keyAnswer = typeof post.key_answer === "string" ? post.key_answer.trim() : "";
  const keyAnswerHtml = keyAnswer ? `<p><strong>${escapeHtml(keyAnswer)}</strong></p>` : "";
  const snapshotBody = `<article>
    <h1>${escapeHtml(post.title)}</h1>
    ${keyAnswerHtml}
    ${coverImageHtml}
    ${post.content || ""}
    ${ctaHtml}
    ${faqHtml}
    ${typeof post.social_post_url === "string" && /^https?:\/\//i.test(post.social_post_url) ? `<p><a href="${escapeAttr(post.social_post_url)}" rel="noopener">See this on LinkedIn</a></p>` : ""}
    ${relatedProductsHtml}
    ${relatedPostsHtml}
    <p><a href="${SITE_URL}/blog">All nickel strip guides and technical articles</a> &middot; <a href="${SITE_URL}/products">Nickel strip and busbar products</a></p>
  </article>`;
  const html = injectHead(template, {
    title,
    description,
    canonical,
    ogImage: coverImageUrl || void 0,
    jsonLd: [
      articleJsonLd,
      ...faqJsonLd ? [faqJsonLd] : [],
      breadcrumbJsonLd([
        { name: "Blog", url: `${SITE_URL}/blog` },
        { name: String(post.title ?? ""), url: canonical }
      ])
    ],
    snapshotBody
  });
  return { status: 200, html };
}
__name(renderBlogSnapshot, "renderBlogSnapshot");
async function renderNickelStripsLithiumSnapshot(template) {
  const canonical = `${SITE_URL}/blog/nickel-strips-lithium-batteries`;
  const title = "Nickel Strips for Lithium-Ion Batteries | Manufacturer Guide";
  const description = "We are a manufacturer of nickel strips used in lithium-ion batteries, delivering consistent quality and competitive pricing for battery manufacturers.";
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "Nickel Strips for Lithium-Ion Batteries: Why Manufacturers Choose Us",
    description,
    author: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
    publisher: { "@type": "Organization", name: SITE_NAME, logo: { "@type": "ImageObject", url: SITE_LOGO_URL } },
    mainEntityOfPage: { "@type": "WebPage", "@id": canonical },
    datePublished: "2026-05-14"
  };
  const snapshotBody = `<article>
    <h1>Nickel Strips for Lithium-Ion Batteries: Why Manufacturers Choose Us</h1>
    <p>Nickel strips are a critical component in lithium-ion battery packs because they provide strong conductivity, stable weldability, and reliable performance under demanding charging cycles.</p>
    <p>As a dedicated manufacturer of nickel strips used in lithium-ion batteries, we produce precision strips for battery manufacturers across India and selected global markets. Our production focus is consistency in thickness, controlled purity, and dependable electrical performance.</p>
    <p>We support lithium-ion battery manufacturers with competitive pricing by combining scalable manufacturing, disciplined quality control, and efficient supply planning. This helps customers reduce procurement risk while maintaining product quality in high-volume battery assembly.</p>
    <p>Whether your requirement is for EV battery packs, consumer electronics, or energy storage systems, we provide technically aligned nickel strip solutions with timely delivery and responsive support.</p>
  </article>`;
  const html = injectHead(template, {
    title,
    description,
    canonical,
    jsonLd: [articleJsonLd],
    snapshotBody
  });
  return { status: 200, html };
}
__name(renderNickelStripsLithiumSnapshot, "renderNickelStripsLithiumSnapshot");
async function renderProductListSnapshot(template, isCategoriesRoute) {
  const canonical = `${SITE_URL}/products`;
  const title = isCategoriesRoute ? "Nickel Strip Categories | Pure Nickel & Plated Strips" : "Nickel Strip Products | Manufacturer & Exporter India";
  const description = isCategoriesRoute ? "Browse nickel strip categories from Ramani Steel House: pure nickel, nickel-plated strips, battery tabs, busbars and custom coils. Manufactured in Mumbai, supplied PAN India and exported worldwide." : "Shop nickel strips, nickel-plated strips, and battery tabs manufactured in Mumbai, India. PAN India supply and export to 17+ countries. Request bulk and custom quotes.";
  let products = [];
  try {
    products = await query(
      `SELECT p.slug, p.name, p.image, p.dimensions, p.seo_heading
         FROM products p
        ORDER BY p.is_featured DESC, p.name`
    );
  } catch (error) {
    console.warn("[snapshot] Product list unavailable for /products; rendering copy only.", error);
  }
  const collectionJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: title,
    description,
    url: canonical,
    ...products.length ? {
      mainEntity: {
        "@type": "ItemList",
        numberOfItems: products.length,
        itemListElement: products.map((product, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: String(product.name ?? ""),
          url: `${SITE_URL}/product/${encodeURIComponent(String(product.slug ?? ""))}`
        }))
      }
    } : {}
  };
  const productsHtml = products.length ? `<h2>Nickel strip and busbar products</h2><ul>${productListHtml(products)}</ul>` : "";
  const html = injectHead(template, {
    title,
    description,
    canonical,
    jsonLd: [collectionJsonLd, breadcrumbJsonLd([{ name: "Products", url: SITE_URL + "/products" }])],
    snapshotBody: `<article>
    <h1>${escapeHtml(isCategoriesRoute ? "Nickel Strip Categories" : "Nickel Strip Products")}</h1>
    <p>${escapeHtml(description)}</p>
    ${productsHtml}
    <h2>Browse by type</h2>
    <ul>
      <li><a href="${SITE_URL}/h-type-nickel-strip">H type nickel strip manufacturer in India</a></li>
      <li><a href="${SITE_URL}/calculator">Nickel strip weight calculator</a></li>
      <li><a href="${SITE_URL}${EXPORT_PATH}">Nickel strip and busbar export enquiry</a></li>
    </ul>
  </article>`
  });
  return { status: 200, html };
}
__name(renderProductListSnapshot, "renderProductListSnapshot");
var STATIC_ROUTE_SEO = {
  // The homepage is the first URL an answer engine fetches and was the last content route
  // with no snapshot at all: vercel.json sent "/" straight to the static dist/index.html,
  // whose body is an empty <div id="root">. Its head was already correct - what a crawler
  // that runs no JavaScript could not see was a single sentence of the answer. The title and
  // description below therefore mirror index.html's own head and HomePage's <Helmet> exactly;
  // all three change together.
  //
  // The body carries the whole of the page's factual copy, not just the answer block. The SEO
  // audit measured this URL's rendering ratio at 1272%: nearly everything a model could cite -
  // the specification table, what the strip is used for, who buys it - existed only in the
  // React tree. Both surfaces now read from src/lib/homeContent.ts, so a crawler that runs no
  // JavaScript and a visitor who does are shown the same claims.
  //
  // The FAQPage carries all four questions and HomePage's <Helmet> no longer publishes its own.
  // Previously each published a different subset, so a rendering crawler saw two FAQPage
  // entities on one URL - two competing copies of the same claim.
  "/": {
    title: HOME_SEO.title,
    description: HOME_SEO.description,
    jsonLd: [
      // The showcase reel, so Google can index it as a video result in its own right.
      showcaseVideoJsonLd(SITE_URL, productImagePath(HERO_PRODUCT_SLUG)),
      {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "@id": `${SITE_URL}/#faq`,
        mainEntity: [
          {
            "@type": "Question",
            name: ANSWER_BLOCK_QUESTION,
            acceptedAnswer: { "@type": "Answer", text: ANSWER_BLOCK }
          },
          ...faqItems.map((item) => ({
            "@type": "Question",
            name: item.question,
            acceptedAnswer: { "@type": "Answer", text: item.answer }
          }))
        ]
      }
      // Deliberately no Product entity here.
      //
      // Search Console flagged this URL with "Either offers, review, or aggregateRating should
      // be specified". The Product it was describing - "Nickel Strips for Lithium-Ion
      // Batteries" - is a category, not something anyone can buy: it has no SKU, no single
      // price, and no offer to state. The honest fix is to stop claiming the homepage is a
      // product page rather than to attach an offer to an abstraction.
      //
      // Nothing is lost. Every real SKU publishes a complete Product with an Offer on its own
      // page, and the specification table this entity carried in `additionalProperty` is still
      // rendered as a visible <table> in the body below, which is what a reader or a model
      // actually quotes from. The homepage keeps the entities that are true of it:
      // Organization/LocalBusiness and WebSite from index.html, and the FAQPage above.
    ],
    body: `<article>
    <h1>${escapeHtml(`${HOME_HERO.h1Lead} ${HOME_HERO.h1Main}`)}</h1>
    <ul>${HOME_HERO.offers.map((offer) => `<li>${escapeHtml(offer)}</li>`).join("")}</ul>
    <!-- The hero photograph, as a real element with real dimensions and alt text. Google
         Images will not index a picture that only exists once the bundle has run, and this is
         the one product photo on the site's most-linked URL. Mirrors the <img> HomePage
         renders in the hero card. -->
    <img src="${productImageUrl(SITE_URL, HERO_PRODUCT_SLUG)}" alt="${escapeAttr(
      buildImageAlt("H type nickel strip for 18650 battery packs, cut to cell pitch")
    )}" width="900" height="900" fetchpriority="high" />
    <h2>${ANSWER_BLOCK_QUESTION}</h2>
    <p>${ANSWER_BLOCK}</p>
    <p>Looking for a specific pattern? <a href="${SITE_URL}/h-type-nickel-strip">H type nickel strip manufacturer in India</a> \u2014 pure nickel H type strip for 18650, 21700, 32650 and 32700 packs in 2P, 3P and 4P layouts.</p>
    <h2>${escapeHtml(TRADE_ROLES_SECTION.heading)}</h2>
    ${TRADE_ROLES_SECTION.paragraphs.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join("")}
    <ul>${TRADE_ROLES_SECTION.bullets.map((bullet) => `<li>${escapeHtml(bullet)}</li>`).join("")}</ul>
    <p>Buying to resell or in small lots? <a href="${SITE_URL}/nickel-strip-wholesaler-and-distributor">Nickel strip wholesaler and distributor</a> \u2014 stock sizes, 5 kg MOQ and trade enquiries.</p>
    <h2>${escapeHtml(SHOWCASE_VIDEO.name)}</h2>
    <p>${escapeHtml(SHOWCASE_VIDEO.description)}</p>
    <video src="${SITE_URL}${SHOWCASE_VIDEO.src}" poster="${productImageUrl(SITE_URL, HERO_PRODUCT_SLUG)}" width="${SHOWCASE_VIDEO.width}" height="${SHOWCASE_VIDEO.height}" controls preload="none"></video>
    <h2>Nickel strip specifications</h2>
    <table>
      <tbody>${productSpecifications.map(
      (spec2) => `<tr><th>${escapeHtml(spec2.label)}</th><td>${escapeHtml(spec2.value)}</td></tr>`
    ).join("")}</tbody>
    </table>
    <h2>Product range</h2>
    <ul>${productVariants.map(
      (variant) => `<li><a href="${SITE_URL}${escapeAttr(variant.cta)}"><strong>${escapeHtml(variant.title)}</strong></a> \u2014 ${escapeHtml(variant.spec)}. ${escapeHtml(variant.note)}</li>`
    ).join("")}</ul>
    <h2>Applications</h2>
    <ul>${applications.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
    <h2>Industries served</h2>
    <ul>${industries.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
    <h2>Why buyers choose Ramani Steel House</h2>
    <ul>${whyChooseUs.map(
      (item) => `<li><strong>${escapeHtml(item.title)}</strong> \u2014 ${escapeHtml(item.detail)}</li>`
    ).join("")}</ul>
    <h2>Quality and certifications</h2>
    <ul>${qualityPoints.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
    <h2>Frequently asked questions</h2>
    ${faqItems.map(
      (item) => `<h3>${escapeHtml(item.question)}</h3><p>${escapeHtml(item.answer)}</p>`
    ).join("\n    ")}
    <h2>Send your enquiry</h2>
    <p>Share the specification, quantity and destination and we respond with a quotation within 1 business day.</p>
    <p>Email: ${EMAIL_ADDRESSES.join(" / ")}</p>
    <p>Phone: ${PHONE_NUMBERS.map((n) => n.display).join(" / ")}</p>
    <p>Ramani Steel House, ${escapeHtml(POSTAL_ADDRESS.oneLine)}</p>
    <h2>More from Ramani Steel House</h2>
    <ul>
      <li><a href="${SITE_URL}/products">Nickel strip and busbar products</a></li>
      <!-- /h-type-nickel-strip is deliberately absent: it is already linked from the product
           range copy above, where the surrounding sentence gives the anchor context. Google
           attributes the first anchor for a URL on a page, so a second link here would only
           repeat it with weaker placement. -->
      <li><a href="${SITE_URL}${EXPORT_PATH}">Nickel strip and busbar export enquiry</a></li>
      <li><a href="${SITE_URL}/calculator">Nickel strip weight calculator</a></li>
      <li><a href="${SITE_URL}/blog">Nickel strip guides and technical articles</a></li>
      <li><a href="${SITE_URL}/about">About Ramani Steel House</a></li>
      <li><a href="${SITE_URL}/contact">Contact the sales team</a></li>
    </ul>
    ${groupSitesHtml()}
  </article>`
  },
  "/about": {
    title: "About Us | Ramani Steel House - Nickel Strip Manufacturer",
    description: "Ramani Steel House has manufactured nickel strips for lithium-ion battery applications since 1974, serving PAN India and 17+ international markets.",
    jsonLd: [
      {
        "@context": "https://schema.org",
        "@type": "AboutPage",
        name: "About Ramani Steel House",
        url: `${SITE_URL}/about`,
        about: { "@type": "Organization", name: SITE_NAME, url: SITE_URL, foundingDate: "1974" }
      },
      breadcrumbJsonLd([{ name: "About", url: `${SITE_URL}/about` }])
    ],
    // Was two sentences. /about is one of the pages a buyer checks before enquiring and one of
    // the few an answer engine reads to decide what this company is, and it said almost nothing
    // that could be quoted. Every claim below is already published elsewhere on the site — the
    // specification table, the quality points, the cell formats — so nothing here is a new
    // assertion, it is the same facts on the page that exists to state them.
    body: `<article>
    <h1>Trusted Nickel Strip Manufacturer Since 1974</h1>
    <p>Ramani Steel House has manufactured nickel strip in Mumbai since 1974. Over ${YEARS_IN_BUSINESS} years the work has narrowed to what it is now known for: pure nickel strip, H type nickel strip and nickel busbar for lithium-ion battery packs, supplied to pack builders, EV manufacturers and energy storage integrators across India and in 17+ export markets.</p>
    <p>Strip is slit, cut and finished at our own works at ${escapeHtml(POSTAL_ADDRESS.oneLine)} rather than bought in and resold, which is what makes custom pitch, width and hole patterns a normal order rather than a special case.</p>
    <h2>What we manufacture</h2>
    <table>
      <tbody>${productSpecifications.map(
      (spec2) => `<tr><th>${escapeHtml(spec2.label)}</th><td>${escapeHtml(spec2.value)}</td></tr>`
    ).join("")}</tbody>
    </table>
    <h2>Cell formats and patterns supplied</h2>
    <ul>
      <li>18650 in 2P, 3P and 4P \u2014 plain, fuse-type and honeycomb</li>
      <li>21700 in 2P and 4P, including double-fuse</li>
      <li>32650 and 32700 in 2P, zig-zag and honeycomb</li>
      <li>Custom pitch, neck width and hole pattern against your pack drawing</li>
    </ul>
    <h2>Quality and certification</h2>
    <ul>${qualityPoints.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
    <h2>Supply and export</h2>
    <p>Domestic consignments despatch from Mumbai to battery and electronics manufacturing across India. Export lots load through Nhava Sheva with commercial invoice, packing list, certificate of origin and material test certificates prepared alongside the shipment.</p>
    <h2>Where to go next</h2>
    <ul>
      <li><a href="${SITE_URL}/products">Nickel strip and busbar products</a></li>
      <li><a href="${SITE_URL}/h-type-nickel-strip">H type nickel strip manufacturer in India</a></li>
      <li><a href="${SITE_URL}/nickel-strip-manufacturer-in-mumbai">Nickel strip manufacturer, supplier and exporter in Mumbai</a></li>
      <li><a href="${SITE_URL}${EXPORT_PATH}">Nickel strip and busbar export enquiry</a></li>
      <li><a href="${SITE_URL}/contact">Contact the sales team</a></li>
    </ul>
    ${groupSitesHtml()}
  </article>`
  },
  "/contact": {
    title: "Contact Nickel Strip Manufacturer Mumbai | Ramani Steel",
    description: "Contact Ramani Steel House, nickel strip manufacturer and exporter in Mumbai, India, for nickel strip and nickel busbar enquiries and quotations.",
    jsonLd: [
      {
        "@context": "https://schema.org",
        "@type": "ContactPage",
        name: "Contact Ramani Steel House",
        url: `${SITE_URL}/contact`,
        about: {
          "@type": "Organization",
          name: SITE_NAME,
          email: PRIMARY_EMAIL,
          telephone: `+${PRIMARY_CALL.e164}`,
          contactPoint: PHONE_NUMBERS.map((number) => ({
            "@type": "ContactPoint",
            telephone: `+${number.e164}`,
            contactType: "sales",
            areaServed: "IN"
          }))
        }
      },
      breadcrumbJsonLd([{ name: "Contact", url: `${SITE_URL}/contact` }])
    ],
    body: `<article>
    <h1>Contact Ramani Steel House</h1>
    <p>For nickel strip and nickel busbar enquiries, custom slitting, bulk orders and export quotations. We respond with a quotation within 1 business day.</p>
    <h2>Nickel strip works and office</h2>
    <address>Ramani Steel House, ${escapeHtml(POSTAL_ADDRESS.oneLine)}</address>
    <p>Email: ${EMAIL_ADDRESSES.join(" / ")}</p>
    <p>Phone: ${PHONE_NUMBERS.map((n) => n.display).join(" / ")}</p>
    <p>Mumbai buyers can collect from the works; call ahead so the material is cut and ready.</p>
    <h2>What to include in an enquiry</h2>
    <p>The more of this a first message carries, the closer the first quotation is to a final price.</p>
    <ul>
      <li>Cell format and layout \u2014 18650, 21700, 32650 or 32700, in 2P, 3P or 4P</li>
      <li>Pattern \u2014 plain, H type, zig-zag or honeycomb, fuse or non-fuse</li>
      <li>Thickness and width, or the pack drawing to cut against</li>
      <li>Quantity in kilograms, and whether it is a one-off or a running requirement</li>
      <li>Destination \u2014 city for PAN India despatch, or port for export</li>
    </ul>
    <h2>Company literature</h2>
    <p><a href="${SITE_URL}${BROCHURE.path}">${escapeHtml(BROCHURE.label)}</a> (${escapeHtml(BROCHURE.sizeLabel)})</p>
    <h2>Where to go next</h2>
    <ul>
      <li><a href="${SITE_URL}/products">Nickel strip and busbar products</a></li>
      <li><a href="${SITE_URL}${EXPORT_PATH}">Nickel strip and busbar export enquiry</a></li>
      <li><a href="${SITE_URL}/calculator">Nickel strip weight and conversion calculator</a></li>
      <li><a href="${SITE_URL}/about">About Ramani Steel House</a></li>
    </ul>
  </article>`
  },
  // Search Console shows this page earning impressions for capabilities it never mentions:
  // "nickel alloy weight conversion calculator" (14 impressions, 0 clicks), "nickel strip
  // thickness calculator" (5) and "steel strip length calculator" (3). CalculatorPage already
  // does all three - its "Solve for" selector rearranges the weight formula for thickness,
  // width or length, and dimensionToCm/cmToDimension convert between mm and inch - but the
  // title and copy only ever said "weight". Google surfaced the page and the searcher never
  // saw their own word in it. Nothing here claims a feature the tool lacks.
  "/calculator": {
    title: "Free Nickel Strip & Alloy Weight Conversion Calculator",
    description: "Free calculator for nickel strip weight, thickness, width and length. Converts mm and inch, and solves for any dimension from a known weight.",
    jsonLd: [
      {
        "@context": "https://schema.org",
        "@type": "WebApplication",
        name: "Nickel Strip Weight Calculator",
        description: "A weight calculator for nickel strip and busbar: weight from size, or length, thickness and piece count from a known weight, with weight per metre.",
        url: `${SITE_URL}/calculator`,
        applicationCategory: "UtilitiesApplication",
        operatingSystem: "Any",
        publisher: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
        // Google asks a SoftwareApplication for one of offers/review/aggregateRating, which is
        // what Search Console flagged on this URL. `price: 0` is the documented way to say a
        // tool is free, and here it is simply true - the calculator is open to anyone.
        //
        // Note this is the opposite call from renderProductSnapshot, which omits the Offer
        // entirely for enquiry-only products rather than publishing `price: 0`. A zero price on
        // a physical product advertises it as free; on a free web tool it is the fact.
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "INR",
          availability: "https://schema.org/InStock"
        }
      },
      breadcrumbJsonLd([{ name: "Calculator", url: `${SITE_URL}/calculator` }])
    ],
    body: `<article>
    <h1>Nickel Strip Weight Calculator</h1>
    <p>Enter a size to get the weight, or enter a weight to find the length, thickness or number of pieces. Works in millimetres or inches, for pure nickel (Nickel 200 / 201) and nickel-plated steel.</p>
    <h2>Nickel strip weight per metre</h2>
    <p>For any thickness and width the calculator shows the weight per metre and per piece. A 0.15 mm &times; 8 mm pure nickel strip weighs about 10.7 g per metre, so 1 kg is roughly 94 metres.</p>
    <h2>Nickel strip length and thickness calculator</h2>
    <p>Choose Length, Thickness or Pieces, enter the total weight in kilograms and the other dimensions, and the calculator rearranges the weight formula to give the missing value.</p>
    <h2>How the weight is calculated</h2>
    <p>Weight = Thickness &times; Width &times; Length &times; Density &times; Quantity, with every dimension converted to centimetres first. Pure nickel is 8.89 g/cm&sup3;; nickel-plated steel is 7.85 g/cm&sup3;.</p>
    <h2>Once you have the weight</h2>
    <p>Nickel strip is priced per kilogram, so the figure this returns is what a quotation is built from. The minimum order is 5 kg.</p>
    <ul>
      <li><a href="${SITE_URL}/products">Nickel strip and busbar products, with prices per kg</a></li>
      <li><a href="${SITE_URL}/h-type-nickel-strip">H type nickel strip manufacturer in India</a></li>
      <li><a href="${SITE_URL}${EXPORT_PATH}">Nickel strip and busbar export enquiry</a></li>
      <li><a href="${SITE_URL}/contact">Send your specification for a quotation</a></li>
    </ul>
  </article>`
  },
  // The export landing page targets two audiences on one URL - Indian bulk buyers and
  // overseas importers - so both the copy and the structured data name India and worldwide
  // supply. Unlike /contact, this route publishes its JSON-LD *only* here: injectHead writes
  // these scripts outside #root, so React's mount does not remove them, and a second copy in
  // the page's <Helmet> would leave a rendering crawler with the same FAQ marked up twice.
  // Content comes from src/lib/exportEnquiry.ts, which the page component also reads.
  [EXPORT_PATH]: {
    title: EXPORT_TITLE,
    description: EXPORT_DESCRIPTION,
    jsonLd: [
      {
        "@context": "https://schema.org",
        "@type": "ContactPage",
        name: EXPORT_TITLE,
        description: EXPORT_DESCRIPTION,
        url: `${SITE_URL}${EXPORT_PATH}`,
        // index.html already publishes a site-wide Organization, WebSite and LocalBusiness on
        // every URL. A second top-level Organization node here would describe the same company
        // a second time on one page; nesting it under `about` (as /contact does) attaches the
        // export-specific areaServed and offer catalogue without splitting the entity.
        about: {
          "@type": "Organization",
          name: SITE_NAME,
          url: SITE_URL,
          logo: SITE_LOGO_URL,
          email: PRIMARY_EMAIL,
          telephone: `+${PRIMARY_CALL.e164}`,
          foundingDate: "1974",
          areaServed: ["IN", "Worldwide"],
          knowsAbout: [
            "Nickel Strip Export",
            "Nickel Busbar Manufacturing",
            "Lithium-Ion Battery Components Export"
          ],
          contactPoint: PHONE_NUMBERS.map((number) => ({
            "@type": "ContactPoint",
            telephone: `+${number.e164}`,
            email: PRIMARY_EMAIL,
            contactType: "sales",
            areaServed: ["IN", "Worldwide"],
            availableLanguage: ["en", "hi"]
          })),
          hasOfferCatalog: {
            "@type": "OfferCatalog",
            name: "Nickel strip and nickel busbar for export and PAN India supply",
            itemListElement: EXPORT_PRODUCT_FORMS.map((form) => ({
              "@type": "Offer",
              itemOffered: { "@type": "Product", name: form },
              eligibleRegion: ["IN", "Worldwide"]
            }))
          }
        }
      },
      {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: EXPORT_FAQS.map((faq) => ({
          "@type": "Question",
          name: faq.question,
          acceptedAnswer: { "@type": "Answer", text: faq.answer }
        }))
      },
      {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
          { "@type": "ListItem", position: 2, name: "Export Enquiry", item: `${SITE_URL}${EXPORT_PATH}` }
        ]
      }
    ],
    body: `<article>
    <h1>${escapeHtml(EXPORT_H1)}</h1>
    <p>${escapeHtml(EXPORT_LEAD)}</p>
    <h2>Supply within India</h2>
    <ul>${INDIA_HIGHLIGHTS.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
    <h2>Export worldwide</h2>
    <ul>${EXPORT_HIGHLIGHTS.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
    <h2>Export markets we serve</h2>
    <p>Exporting to 17+ countries from our Mumbai manufacturing unit, loading at ${escapeHtml(LOADING_PORTS)}.</p>
    <ul>${EXPORT_REGIONS.map((market) => `<li>${escapeHtml(market.region)} - ${escapeHtml(market.detail)}</li>`).join("")}</ul>
    <h2>Specification range</h2>
    <ul>${EXPORT_SPECS.map((spec2) => `<li>${escapeHtml(spec2.label)}: ${escapeHtml(spec2.value)}</li>`).join("")}</ul>
    <h2>Export documentation</h2>
    <ul>${EXPORT_DOCUMENTS.map((doc) => `<li>${escapeHtml(doc)}</li>`).join("")}</ul>
    <h2>HS codes</h2>
    <ul>${HS_CODES.map((entry) => `<li>${escapeHtml(entry.code)} - ${escapeHtml(entry.covers)}</li>`).join("")}</ul>
    <p>Incoterms quoted: ${escapeHtml(INCOTERMS.join(", "))}.</p>
    <h2>Export enquiry FAQs</h2>
    ${EXPORT_FAQS.map((faq) => `<h3>${escapeHtml(faq.question)}</h3>
    <p>${escapeHtml(faq.answer)}</p>`).join("\n    ")}
    <h2>Send your enquiry</h2>
    <p>Share the specification, quantity and destination and we respond with a quotation within 1 business day.</p>
    <p>Email: ${EMAIL_ADDRESSES.join(" / ")}</p>
    <p>Phone: ${PHONE_NUMBERS.map((n) => n.display).join(" / ")}</p>
    <p><a href="${SITE_URL}${BROCHURE.path}">${escapeHtml(BROCHURE.label)}</a> (${escapeHtml(BROCHURE.sizeLabel)})</p>
  </article>`
  }
};
var NOINDEX_ROUTES = {
  "/cart": {
    title: "Your Cart | Ramani Steel House",
    description: "Review the nickel strip and busbar items in your quote request."
  },
  "/checkout": {
    title: "Checkout | Ramani Steel House",
    description: "Complete your nickel strip and busbar quote request."
  },
  "/login": {
    title: "Sign In | Ramani Steel House",
    description: "Sign in to your Ramani Steel House account."
  }
};
function isNoindexSnapshotRoute(pathname) {
  return Object.prototype.hasOwnProperty.call(NOINDEX_ROUTES, pathname);
}
__name(isNoindexSnapshotRoute, "isNoindexSnapshotRoute");
function renderNoindexSnapshot(template, pathname) {
  const route = isNoindexSnapshotRoute(pathname) ? NOINDEX_ROUTES[pathname] : void 0;
  if (!route) return { status: 200, html: template };
  const html = injectHead(template, {
    title: route.title,
    description: route.description,
    canonical: `${SITE_URL}${pathname}`,
    robots: "noindex,follow",
    jsonLd: [],
    // No body snapshot: there is nothing here worth crawling, and the app renders the real
    // page on mount either way.
    snapshotBody: ""
  });
  return { status: 200, html };
}
__name(renderNoindexSnapshot, "renderNoindexSnapshot");
function isLandingSnapshotRoute(pathname) {
  return getLandingPageByPathname(pathname) !== null || /^\/nickel-strip-manufacturer-in-[a-z0-9-]+$/.test(pathname);
}
__name(isLandingSnapshotRoute, "isLandingSnapshotRoute");
async function renderLandingSnapshot(template, pathname) {
  const page = getLandingPageByPathname(pathname);
  if (!page) {
    const html2 = injectHead(template, {
      title: "404 | Page Not Found",
      description: "This page does not exist. Browse the nickel strip range or contact us.",
      canonical: `${SITE_URL}${pathname}`,
      robots: "noindex,follow,noarchive",
      jsonLd: [],
      snapshotBody: ""
    });
    return { status: 404, html: html2 };
  }
  const canonical = `${SITE_URL}/${page.slug}`;
  let products = [];
  if (page.productSearch) {
    try {
      const tokens = page.productSearch.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
      products = await query(
        `SELECT p.name, p.slug, p.dimensions, p.image, p.seo_heading
           FROM products p
          WHERE (
            SELECT bool_and(
              regexp_replace(lower(coalesce(p.name, '')), '[^a-z0-9]+', ' ', 'g') LIKE '%' || token || '%'
            )
            FROM unnest($1::text[]) AS token
          )
          ORDER BY p.name
          LIMIT 6`,
        [tokens]
      );
    } catch (error) {
      console.warn(`[snapshot] Product list unavailable for ${pathname}; rendering copy only.`, error);
    }
  }
  const sectionsHtml = page.sections.map((section) => {
    const body = section.body ? `<p>${escapeHtml(section.body)}</p>` : "";
    const bullets = section.bullets?.length ? `<ul>${section.bullets.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>` : "";
    return `<h2>${escapeHtml(section.heading)}</h2>${body}${bullets}`;
  }).join("\n    ");
  const productsHtml = products.length ? `<h2>Products</h2>
    <ul>${productListHtml(products)}</ul>` : "";
  const faqHtml = `<h2>Frequently asked questions</h2>
    ${page.faqs.map((faq) => `<h3>${escapeHtml(faq.question)}</h3><p>${escapeHtml(faq.answer)}</p>`).join("\n    ")}`;
  const crossLinksHtml = `<h2>Also supplying</h2>
    <ul>${STATE_LANDING_PAGES.filter((state) => state.path !== `/${page.slug}`).map((state) => `<li><a href="${SITE_URL}${state.path}">${escapeHtml(state.name)}</a></li>`).join("")}</ul>`;
  const html = injectHead(template, {
    title: page.title,
    description: page.description,
    canonical,
    ogImage: SITE_OG_IMAGE_URL,
    keywords: [...page.keywords],
    jsonLd: [
      {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "@id": `${canonical}#page`,
        name: page.title,
        description: page.description,
        url: canonical,
        inLanguage: "en",
        isPartOf: { "@id": `${SITE_URL}/#website` },
        about: { "@id": `${SITE_URL}/#organization` },
        provider: { "@id": `${SITE_URL}/#organization` }
      },
      {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
          { "@type": "ListItem", position: 2, name: page.breadcrumbName, item: canonical }
        ]
      },
      {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "@id": `${canonical}#faq`,
        mainEntity: page.faqs.map((faq) => ({
          "@type": "Question",
          name: faq.question,
          acceptedAnswer: { "@type": "Answer", text: faq.answer }
        }))
      }
    ],
    snapshotBody: `<article>
    <h1>${escapeHtml(page.h1)}</h1>
    <p>${escapeHtml(page.intro)}</p>
    ${sectionsHtml}
    ${productsHtml}
    ${faqHtml}
    ${crossLinksHtml}
    <h2>Contact</h2>
    <p>Ramani Steel House, ${escapeHtml(POSTAL_ADDRESS.oneLine)}</p>
    <p>Email: ${EMAIL_ADDRESSES.join(" / ")}</p>
    <p>Phone: ${PHONE_NUMBERS.map((n) => n.display).join(" / ")}</p>
  </article>`
  });
  return { status: 200, html };
}
__name(renderLandingSnapshot, "renderLandingSnapshot");
function isStaticSnapshotRoute(pathname) {
  return Object.prototype.hasOwnProperty.call(STATIC_ROUTE_SEO, pathname);
}
__name(isStaticSnapshotRoute, "isStaticSnapshotRoute");
async function renderStaticRouteSnapshot(template, pathname) {
  const route = isStaticSnapshotRoute(pathname) ? STATIC_ROUTE_SEO[pathname] : void 0;
  if (!route) {
    return { status: 200, html: template };
  }
  const html = injectHead(template, {
    title: route.title,
    description: route.description,
    canonical: `${SITE_URL}${pathname}`,
    ogImage: SITE_OG_IMAGE_URL,
    jsonLd: route.jsonLd,
    snapshotBody: route.body
  });
  return { status: 200, html };
}
__name(renderStaticRouteSnapshot, "renderStaticRouteSnapshot");
async function renderBlogListSnapshot(template) {
  const canonical = `${SITE_URL}/blog`;
  const title = "Nickel Strip Blog | Battery Material Guides & Specs";
  const description = "Read technical guides and industry insights from Ramani Steel House on nickel strips, battery tabs, and lithium manufacturing.";
  let posts = [];
  try {
    posts = await query(
      `SELECT title, slug, excerpt, cover_image_url FROM blog_posts
       WHERE status = 'published' AND (published_at IS NULL OR published_at <= now())
         AND slug IS NOT NULL AND slug <> ''
       ORDER BY published_at DESC NULLS LAST, id DESC
       LIMIT 20`
    );
  } catch (error) {
    console.warn("[seo] Blog list snapshot could not load posts; rendering heading only.", error);
  }
  const postsHtml = posts.length ? `<ul>${posts.map((post) => {
    const cover = post.cover_image_url ? `<img src="${escapeAttr(post.cover_image_url)}" alt="${escapeAttr(
      buildImageAlt(post.title)
    )}" width="600" height="338" loading="lazy" decoding="async" />` : "";
    return `<li><a href="${SITE_URL}/blog/${encodeURIComponent(post.slug)}">${cover}${escapeHtml(post.title)}</a>${post.excerpt ? ` \u2014 ${escapeHtml(post.excerpt)}` : ""}</li>`;
  }).join("")}</ul>` : "";
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: title,
      description,
      url: canonical
    },
    breadcrumbJsonLd([{ name: "Blog", url: SITE_URL + "/blog" }])
  ];
  if (posts.length) {
    jsonLd.push({
      "@context": "https://schema.org",
      "@type": "ItemList",
      itemListElement: posts.map((post, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: post.title,
        url: `${SITE_URL}/blog/${encodeURIComponent(post.slug)}`
      }))
    });
  }
  const html = injectHead(template, {
    title,
    description,
    canonical,
    ogImage: SITE_OG_IMAGE_URL,
    jsonLd,
    snapshotBody: `<article>
    <h1>Latest Blog Articles</h1>
    <p>${escapeHtml(description)}</p>
    ${postsHtml}
  </article>`
  });
  return { status: 200, html };
}
__name(renderBlogListSnapshot, "renderBlogListSnapshot");
async function renderProductSnapshot(template, slug) {
  const product = await queryOne(
    // LEFT JOIN: products.category_id is ON DELETE SET NULL, so an inner join would 404 a
    // live product page (and mark it noindex) as soon as its category was removed.
    `SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.slug = $1`,
    [slug]
  );
  if (!product) {
    const canonical2 = `${SITE_URL}/product/${encodeURIComponent(slug)}`;
    const html2 = injectHead(template, {
      title: "404 | Product Not Found",
      description: "The product page you requested is not available. Explore our full nickel strip catalog.",
      canonical: canonical2,
      robots: "noindex,follow,noarchive",
      jsonLd: [],
      snapshotBody: ""
    });
    return { status: 404, html: html2 };
  }
  const name = product.name;
  const productSlug = product.slug;
  const keywordBlock = resolveProductKeywordBlock(product);
  const title = productPageTitle(name, keywordBlock);
  const rawDescription = `${name} by ${SITE_NAME}. ${product.description || "Industrial-grade nickel strip for lithium-ion battery and precision applications."}`;
  const canonical = `${SITE_URL}/product/${encodeURIComponent(productSlug)}`;
  const imageUrl = productImageUrl(SITE_URL, productSlug, product.image);
  const applications2 = Array.isArray(product.applications) ? product.applications : [];
  const numericPrice = Number(product.price);
  const hasPrice = Number.isFinite(numericPrice) && numericPrice > 0;
  const keywordValues = { name, price: hasPrice ? formatInr(numericPrice) : null };
  const description = keywordBlock && keywordMetaDescription(keywordBlock, keywordValues) || rawDescription.slice(0, 160);
  const productSpecs = buildProductSpecs(product);
  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name,
    description: product.description || description,
    image: [imageUrl],
    brand: { "@type": "Brand", name: SITE_NAME },
    category: product.category_name || "Nickel Strips",
    // mpn alongside sku: these are own-manufactured goods with no GS1 barcode, so brand +
    // mpn is the identifier pair Google looks for when gtin is absent.
    sku: product.slug,
    mpn: product.slug,
    countryOfOrigin: "IN",
    // The export terms as machine-readable attributes, matching the visible table below.
    // additionalProperty is the field Google and answer engines read specifications out of, so
    // an "HS code for nickel strip" or "what Incoterms" question can be answered from the
    // product page itself rather than only from /export-enquiry.
    // Exactly the rows the visible table renders, so the markup and the page agree - Google
    // discounts structured data that states attributes the page does not show.
    additionalProperty: [...productSpecs, ...PRODUCT_EXPORT_TERMS].map((row) => ({
      "@type": "PropertyValue",
      name: row.label,
      value: row.value
    })),
    ...hasPrice ? {
      offers: {
        "@type": "Offer",
        priceCurrency: "INR",
        price: numericPrice,
        availability: Number(product.stock) > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
        // Without this Google warns on the Offer and can stop showing the price it is
        // already displaying. Computed per render, never stored - see priceValidUntil().
        priceValidUntil: priceValidUntil(),
        url: canonical,
        // Answers Search Console's "Missing field hasMerchantReturnPolicy (in offers)".
        // The copy backing this claim is rendered below, in the snapshot body.
        hasMerchantReturnPolicy: RETURN_POLICY_SCHEMA,
        // Points at the Organization @id published in index.html rather than repeating the
        // company as a second, rival entity.
        seller: { "@id": `${SITE_URL}/#organization` },
        // IN, not Worldwide. This price is in INR and the return policy above is scoped to
        // India, because export is quoted separately in USD against an Incoterm. Marking
        // the offer valid worldwide would advertise the domestic rupee price to overseas
        // buyers and contradict its own return policy. The worldwide supply claim belongs
        // on the entity that is true of - the Organization, which already carries
        // areaServed: Worldwide - and on the product's export terms below.
        eligibleRegion: { "@type": "Country", name: "IN" }
      }
    } : {}
  };
  const parent = parentCategoryFor({ name, slug: productSlug });
  const breadcrumbJsonLd2 = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: parent.name, item: `${SITE_URL}${parent.path}` },
      { "@type": "ListItem", position: 3, name, item: canonical }
    ]
  };
  const specRows = [...productSpecs, ...PRODUCT_EXPORT_TERMS].map(
    (row) => `<tr><th>${escapeHtml(row.label)}</th><td>${escapeHtml(row.value)}</td></tr>`
  ).join("");
  const imageAlt = buildImageAlt(productImageAltSubject(name, keywordBlock));
  const imageTag = `<img src="${escapeAttr(imageUrl)}" alt="${escapeAttr(imageAlt)}" width="1000" height="1000" fetchpriority="high" />`;
  const keywordSection = keywordBlock ? `<h2>${escapeHtml(keywordBlock.heading)}</h2>${fillKeywordParagraphs(keywordBlock, keywordValues).map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join("")}` : "";
  let related = [];
  try {
    related = await query(
      // Same category first, then fill from the rest of the catalogue rather than filtering to
      // it. Restricting to the category left "Plain Nickel Strips" and "Copper Busbar" with no
      // related products at all - each is the only item in its category - so the two pages that
      // most needed a way onward were the two that stayed dead ends.
      //
      // IS NOT DISTINCT FROM, not `=`: a product with no category would otherwise compare NULL
      // to NULL, get NULL rather than true, and lose its own category grouping.
      `SELECT p.slug, p.name, p.image, p.dimensions, p.seo_heading
         FROM products p
        WHERE p.slug <> $1
        ORDER BY (p.category_id IS NOT DISTINCT FROM $2::bigint) DESC,
                 p.is_featured DESC,
                 p.name
        LIMIT 6`,
      [productSlug, product.category_id ?? null]
    );
  } catch (error) {
    console.warn(`[snapshot] Related products unavailable for ${productSlug}.`, error);
  }
  const relatedHtml = related.length ? `<h2>Related nickel strip products</h2><ul>${productListHtml(related)}</ul>` : "";
  const catalogueLinks = PRODUCT_LINKS.filter((entry) => entry.slug !== productSlug);
  const catalogueHtml = catalogueLinks.length ? `<h2>Full nickel strip and busbar catalogue</h2><ul>${catalogueLinks.map(
    (entry) => `<li><a href="${SITE_URL}/product/${encodeURIComponent(entry.slug)}">${escapeHtml(entry.name)}</a></li>`
  ).join("")}</ul>` : "";
  const productFaqs = buildProductFaqs(product);
  const productFaqHtml = productFaqs.length ? `<h2>Frequently asked questions</h2>${productFaqs.map((faq) => `<h3>${escapeHtml(faq.question)}</h3><p>${escapeHtml(faq.answer)}</p>`).join("")}` : "";
  const snapshotBody = `<article>
    <nav aria-label="Breadcrumb"><a href="${SITE_URL}/">Home</a> \u203A <a href="${SITE_URL}${parent.path}">${escapeHtml(parent.name)}</a> \u203A ${escapeHtml(name)}</nav>
    <h1>${escapeHtml(name)}</h1>
    ${imageTag}
    <p>${escapeHtml(product.description || "")}</p>
    ${keywordSection}
    ${specRows ? `<h2>Specifications and export terms</h2><table><tbody>${specRows}</tbody></table>` : ""}
    ${applications2.length ? `<h2>Applications</h2><ul>${applications2.map((app) => `<li>${escapeHtml(app)}</li>`).join("")}</ul>` : ""}
    ${productFaqHtml}
    <h2>Export supply</h2>
    <p>${escapeHtml(PRODUCT_EXPORT_LEAD)}</p>
    <p><a href="${SITE_URL}${EXPORT_PATH}">Nickel strip and busbar export enquiry</a> &mdash; send your specification, quantity and destination port for a quotation.</p>
    <h2>${escapeHtml(RETURN_POLICY_HEADING)}</h2>
    ${RETURN_POLICY_LINES.map((line) => `<p>${escapeHtml(line)}</p>`).join("")}
    ${relatedHtml}
    ${catalogueHtml}
    <p><a href="${SITE_URL}/products">All nickel strip and busbar products</a></p>
  </article>`;
  const html = injectHead(template, {
    title,
    description,
    canonical,
    ogImage: imageUrl,
    keywords: [...keywordBlock?.keywords ?? [], ...BUYER_ROLE_KEYWORDS],
    jsonLd: [productJsonLd, breadcrumbJsonLd2, ...productFaqJsonLd(productFaqs) ? [productFaqJsonLd(productFaqs)] : []],
    snapshotBody
  });
  return { status: 200, html };
}
__name(renderProductSnapshot, "renderProductSnapshot");

// server/renderSnapshot.ts
var INDEXABLE_CACHE = "public, max-age=0, s-maxage=600, stale-while-revalidate=86400";
var NOT_FOUND_CACHE = "public, max-age=0, s-maxage=60";
var NO_STORE = "private, no-store, max-age=0";
async function renderSnapshotResponse(pathname, template) {
  try {
    const result = await renderForPath(pathname, template);
    if (result.location) {
      return { ...result, cacheControl: INDEXABLE_CACHE };
    }
    if (result.status === 404) {
      return { ...result, cacheControl: NOT_FOUND_CACHE, noindex: true };
    }
    return {
      ...result,
      cacheControl: isNoindexSnapshotRoute(pathname) ? NO_STORE : INDEXABLE_CACHE
    };
  } catch (error) {
    console.error("SSR snapshot render failed; serving 503 rather than a shell that canonicalises to the homepage", error);
    const { status, html } = renderUnavailableShell(template, pathname);
    return { status, html, cacheControl: NO_STORE };
  }
}
__name(renderSnapshotResponse, "renderSnapshotResponse");
async function renderForPath(pathname, template) {
  let result;
  {
    if (isNoindexSnapshotRoute(pathname)) {
      result = renderNoindexSnapshot(template, pathname);
    } else if (pathname === "/blog/nickel-strips-lithium-batteries") {
      result = await renderNickelStripsLithiumSnapshot(template);
    } else if (pathname === "/products" || pathname === "/categories") {
      result = await renderProductListSnapshot(template, pathname === "/categories");
    } else if (pathname === "/blog") {
      result = await renderBlogListSnapshot(template);
    } else if (isStaticSnapshotRoute(pathname)) {
      result = await renderStaticRouteSnapshot(template, pathname);
    } else if (isLandingSnapshotRoute(pathname)) {
      result = await renderLandingSnapshot(template, pathname);
    } else {
      const blogMatch = pathname.match(/^\/blog\/([^/]+)$/);
      const productMatch = pathname.match(/^\/product\/([^/]+)$/);
      if (blogMatch) {
        result = await renderBlogSnapshot(template, decodeURIComponent(blogMatch[1]));
      } else if (productMatch) {
        result = await renderProductSnapshot(template, decodeURIComponent(productMatch[1]));
      } else {
        result = { status: 200, html: template };
      }
    }
    return result;
  }
}
__name(renderForPath, "renderForPath");

// server/legacyRedirects.ts
init_modules_watch_stub();
var LEGACY_REDIRECTS = [
  ["/blog/Why-99.6-Purity-Matters", "/blog/why-nickel-purity-matters"],
  ["/blog/Manufacturers-Guide", "/blog/sourcing-custom-stamped-nickel-busbars"],
  ["/blog/Nickel-Strip-Manufacturer-for-UK-Battery-Industry", "/blog/nickel-strip-manufacturer-uk-battery-industry"],
  [
    "/blog/Pure-Nickel-Strip-vs-Nickel-Plated-Steel-Strip:-Complete-Comparison",
    "/blog/pure-nickel-strip-vs-nickel-plated-steel-strip"
  ],
  [
    "/blog/Pure-Nickel-Strip-vs-Nickel-Plated-Steel-Strip%3A-Complete-Comparison",
    "/blog/pure-nickel-strip-vs-nickel-plated-steel-strip"
  ]
];
function legacyRedirectFor(pathname) {
  const candidates = /* @__PURE__ */ new Set([pathname]);
  try {
    candidates.add(decodeURIComponent(pathname));
  } catch {
  }
  for (const [from, to] of LEGACY_REDIRECTS) {
    if (candidates.has(from)) return to;
  }
  return null;
}
__name(legacyRedirectFor, "legacyRedirectFor");

// server/catalog.ts
init_modules_watch_stub();

// server/rows.ts
init_modules_watch_stub();
var toFiniteNumber = /* @__PURE__ */ __name((value, fallback = 0) => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string") {
    const normalized = value.trim().replace(/,/g, "");
    const parsed = Number(normalized);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }
  return fallback;
}, "toFiniteNumber");
var toFiniteInteger = /* @__PURE__ */ __name((value, fallback = 0) => {
  const parsed = toFiniteNumber(value, fallback);
  return Number.isFinite(parsed) ? Math.trunc(parsed) : fallback;
}, "toFiniteInteger");
var normalizeImageSource = /* @__PURE__ */ __name((value) => {
  if (typeof value !== "string") {
    return "";
  }
  const compact = value.replace(/\u0000/g, "").trim();
  if (!compact) {
    return "";
  }
  const candidates = compact.split(/[\r\n]+/).map((entry) => entry.trim()).filter(Boolean);
  const firstUsable = candidates.find((entry) => /^https?:\/\//i.test(entry) || entry.startsWith("/")) || candidates[0] || "";
  const cleaned = firstUsable.trim();
  if (cleaned.includes("images.unsplash.com/photo-1535813548-6601f6945379")) {
    return "/img/icon-logo.jpg";
  }
  if (/^https?:\/\//i.test(cleaned) || cleaned.startsWith("/")) {
    return cleaned;
  }
  return `/${encodeURI(cleaned)}`;
}, "normalizeImageSource");
var normalizeStringArray = /* @__PURE__ */ __name((value) => {
  const raw = typeof value === "string" ? (() => {
    try {
      return JSON.parse(value);
    } catch {
      return null;
    }
  })() : value;
  if (!Array.isArray(raw)) return null;
  const items = raw.map((item) => typeof item === "string" ? item.trim() : "").filter((item) => item.length > 0);
  return items.length > 0 ? items : null;
}, "normalizeStringArray");
var normalizeProductRow = /* @__PURE__ */ __name((row) => ({
  ...row,
  id: toFiniteInteger(row.id, 0),
  category_id: toFiniteInteger(row.category_id, 0),
  price: toFiniteNumber(row.price, 0),
  stock: toFiniteInteger(row.stock, 0),
  image: normalizeImageSource(row.image),
  applications: normalizeStringArray(row.applications)
}), "normalizeProductRow");
var SEARCH_TOKEN_SEPARATORS = /[^a-z0-9]+/g;
var toSearchTokens = /* @__PURE__ */ __name((value) => value.toLowerCase().replace(SEARCH_TOKEN_SEPARATORS, " ").trim().split(" ").filter(Boolean), "toSearchTokens");
var searchHaystackSql = /* @__PURE__ */ __name((columns) => `regexp_replace(lower(${columns.map((column) => `coalesce(${column}::text, '')`).join(" || ' ' || ")}), '[^a-z0-9]+', ' ', 'g')`, "searchHaystackSql");
var normalizeAdRow = /* @__PURE__ */ __name((row) => ({
  ...row,
  id: toFiniteInteger(row.id, 0),
  priority: toFiniteInteger(row.priority, 0),
  discount_percent: row.discount_percent == null ? null : toFiniteInteger(row.discount_percent, 0),
  image_url: normalizeImageSource(row.image_url)
}), "normalizeAdRow");
var normalizeFaqItems = /* @__PURE__ */ __name((value) => {
  const raw = typeof value === "string" ? (() => {
    try {
      return JSON.parse(value);
    } catch {
      return null;
    }
  })() : value;
  if (!Array.isArray(raw)) return null;
  const items = raw.map((item) => {
    if (!item || typeof item !== "object") return null;
    const question = String(item.question || "").trim();
    const answer = String(item.answer || "").trim();
    if (!question || !answer) return null;
    return { question, answer };
  }).filter((item) => item !== null);
  return items.length > 0 ? items : null;
}, "normalizeFaqItems");
var normalizeBlogRow = /* @__PURE__ */ __name((row) => ({
  ...row,
  id: toFiniteInteger(row.id, 0),
  title: String(row.title || "").trim(),
  slug: String(row.slug || "").trim(),
  excerpt: row.excerpt == null ? null : String(row.excerpt),
  content: row.content == null ? null : String(row.content),
  cover_image_url: normalizeImageSource(row.cover_image_url),
  cover_image_alt: row.cover_image_alt == null ? null : String(row.cover_image_alt).trim() || null,
  author_name: row.author_name == null ? null : String(row.author_name),
  status: row.status == null ? null : String(row.status),
  meta_title: row.meta_title == null ? null : String(row.meta_title),
  meta_description: row.meta_description == null ? null : String(row.meta_description),
  key_answer: row.key_answer == null ? null : String(row.key_answer).trim() || null,
  social_post_url: row.social_post_url == null ? null : String(row.social_post_url).trim() || null,
  faq_items: normalizeFaqItems(row.faq_items)
}), "normalizeBlogRow");

// server/catalog.ts
async function listProducts(filters) {
  let sql = "SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE 1=1";
  const params = [];
  const category = typeof filters.category === "string" ? filters.category.trim() : "";
  if (category) {
    params.push(category);
    sql += ` AND c.slug = $${params.length}`;
  }
  if (filters.featured) {
    sql += " AND p.is_featured = true";
  }
  const search = typeof filters.search === "string" ? filters.search.trim() : "";
  if (search) {
    const tokens = toSearchTokens(search);
    if (!tokens.length) return null;
    params.push(tokens);
    const tokensParam = `$${params.length}`;
    const haystack = searchHaystackSql([
      "p.name",
      "p.description",
      "p.astm_value",
      "p.uns_value",
      "p.dimensions",
      "p.price",
      "c.name"
    ]);
    sql += ` AND (
          SELECT bool_and(${haystack} LIKE '%' || token || '%')
          FROM unnest(${tokensParam}::text[]) AS token
        )`;
  }
  const rows = await query(sql, params);
  return rows.map((row) => normalizeProductRow(row));
}
__name(listProducts, "listProducts");
async function getProductBySlug(slug) {
  const product = await queryOne(
    "SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.slug = $1",
    [slug]
  );
  return product ? normalizeProductRow(product) : null;
}
__name(getProductBySlug, "getProductBySlug");
async function getRelatedProducts(slug) {
  const product = await queryOne(
    "SELECT category_id FROM products WHERE slug = $1",
    [slug]
  );
  if (!product) return null;
  return query(
    // Same category first, then fill from the rest of the catalogue rather than filtering to
    // it: "Plain Nickel Strips" and "Copper Busbar" are each alone in their category, so a
    // category-only filter left the two pages that most needed a way onward as dead ends.
    //
    // IS NOT DISTINCT FROM, not `=`: a product with no category would otherwise compare NULL
    // to NULL, get NULL rather than true, and lose its own category grouping.
    `SELECT p.slug, p.name, p.image, p.dimensions, p.seo_heading
           FROM products p
          WHERE p.slug <> $1
          ORDER BY (p.category_id IS NOT DISTINCT FROM $2::bigint) DESC,
                   p.is_featured DESC,
                   p.name
          LIMIT 6`,
    [slug, product.category_id ?? null]
  );
}
__name(getRelatedProducts, "getRelatedProducts");
async function getProductSuggestions(rawQuery, limit = 8) {
  const tokens = toSearchTokens(rawQuery.trim());
  if (!tokens.length) return [];
  const nameHaystack = searchHaystackSql(["p.name"]);
  const prefixPattern = `${tokens.join(" ")}%`;
  return query(
    `SELECT
          p.id,
          p.slug,
          p.name,
          p.image,
          c.name AS category_name
         FROM products p
         LEFT JOIN categories c ON c.id = p.category_id
         WHERE (
           SELECT bool_and(${nameHaystack} LIKE '%' || token || '%')
           FROM unnest($1::text[]) AS token
         )
         ORDER BY
           CASE WHEN ${nameHaystack} LIKE $2 THEN 0 ELSE 1 END,
           p.name ASC
         LIMIT $3`,
    [tokens, prefixPattern, limit]
  );
}
__name(getProductSuggestions, "getProductSuggestions");
async function listCategories() {
  return query("SELECT * FROM categories ORDER BY id");
}
__name(listCategories, "listCategories");
async function listBlogPosts(limit = 6) {
  const posts = await query(
    `SELECT
          id,
          title,
          slug,
          -- The backslash must be doubled: this SQL lives in a JS template literal, where a
          -- lone \\s collapses to a bare "s" and Postgres would strip the letter s from every
          -- generated excerpt instead of collapsing whitespace.
          COALESCE(NULLIF(excerpt, ''), LEFT(REGEXP_REPLACE(content, '\\s+', ' ', 'g'), 180)) AS excerpt,
          cover_image_url,
          cover_image_alt,
          author_name,
          status,
          meta_title,
          meta_description,
          published_at,
          created_at,
          updated_at
         FROM blog_posts
         WHERE status = 'published'
           AND (published_at IS NULL OR published_at <= now())
         ORDER BY published_at DESC NULLS LAST, created_at DESC
         LIMIT $1`,
    [limit]
  );
  return posts.map((post) => normalizeBlogRow(post));
}
__name(listBlogPosts, "listBlogPosts");
async function getBlogPostBySlug(slug) {
  const post = await queryOne(
    `SELECT
          id,
          title,
          slug,
          excerpt,
          content,
          cover_image_url,
          cover_image_alt,
          author_name,
          status,
          meta_title,
          meta_description,
          key_answer,
          social_post_url,
          faq_items,
          published_at,
          created_at,
          updated_at
         FROM blog_posts
         WHERE slug = $1
           AND status = 'published'
           AND (published_at IS NULL OR published_at <= now())`,
    [slug]
  );
  return post ? normalizeBlogRow(post) : null;
}
__name(getBlogPostBySlug, "getBlogPostBySlug");
async function getActiveAds() {
  try {
    const ads = await query(
      `SELECT *
         FROM ads
         WHERE is_active = true
           AND (start_at IS NULL OR start_at <= now())
           AND (end_at IS NULL OR end_at >= now())
         ORDER BY priority DESC, created_at DESC`
    );
    return ads.map((ad) => normalizeAdRow(ad));
  } catch (error) {
    if (error?.code === "42P01") return [];
    throw error;
  }
}
__name(getActiveAds, "getActiveAds");

// server/quotes.ts
init_modules_watch_stub();

// src/lib/stripSpec.ts
init_modules_watch_stub();
var MAX_FIELD = 40;
var MAX_NOTES = 500;
var clean = /* @__PURE__ */ __name((value, max = MAX_FIELD) => typeof value === "string" ? value.replace(/\s+/g, " ").trim().slice(0, max) : "", "clean");
function millimetres(raw) {
  const match = /(\d+(?:\.\d+)?)/.exec(raw ?? "");
  return match ? match[1] : "";
}
__name(millimetres, "millimetres");
function normaliseThickness(raw) {
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? n.toFixed(2) : raw;
}
__name(normaliseThickness, "normaliseThickness");
function normaliseSpec(input) {
  const raw = input && typeof input === "object" ? input : {};
  const thickness = clean(raw.thickness);
  return {
    thickness: thickness ? normaliseThickness(millimetres(thickness) || thickness) : "",
    width: millimetres(clean(raw.width)) || clean(raw.width),
    adviseWidth: raw.adviseWidth === true,
    form: clean(raw.form),
    length: clean(raw.length),
    cellFormat: clean(raw.cellFormat),
    customDesign: raw.customDesign === true,
    notes: clean(raw.notes, MAX_NOTES)
  };
}
__name(normaliseSpec, "normaliseSpec");
function formatSpec(spec2) {
  if (!spec2) return "Size not specified";
  const s = normaliseSpec(spec2);
  const parts = [];
  const size = [
    s.thickness ? `${s.thickness} mm` : "thickness ?",
    s.adviseWidth ? "width to be recommended" : s.width ? `${s.width} mm` : "width ?"
  ].join(" \xD7 ");
  parts.push(size);
  if (s.form) parts.push(s.form === "Cut lengths" && s.length ? `Cut lengths of ${s.length} mm` : s.form);
  if (s.cellFormat) parts.push(/^\d/.test(s.cellFormat) ? `${s.cellFormat} cells` : s.cellFormat);
  if (s.customDesign) parts.push("New design / tooling");
  return parts.join(" \xB7 ");
}
__name(formatSpec, "formatSpec");

// server/quotes.ts
var MAX_QUOTE_ITEMS = 200;
function validateQuoteBody(body) {
  const items = body?.items;
  if (!Array.isArray(items) || items.length === 0) return { error: "Cart items are required." };
  if (items.length > MAX_QUOTE_ITEMS) {
    return { error: `A quote cannot contain more than ${MAX_QUOTE_ITEMS} items.` };
  }
  return null;
}
__name(validateQuoteBody, "validateQuoteBody");
async function createQuoteRequest(body, userId) {
  const customer = body.customer ?? {};
  const items = body.items ?? [];
  const summary = body.summary ?? {};
  const meta = body.meta ?? {};
  const itemsCount = items.reduce((acc, item) => acc + (Number(item.quantity) || 0), 0);
  const client = await db_default.connect();
  try {
    await client.query("BEGIN");
    const quoteResult = await client.query(
      // full_name and email are stored, not just forwarded to the notification. Checkout
      // makes both mandatory, and for an anonymous buyer there is no users row to recover
      // them from later — without these columns the request landed in the table with no way
      // to reply to it except the WhatsApp thread.
      `INSERT INTO quote_requests
          (user_id, full_name, email, phone_country_code, phone_number, phone_full, gst_number, pin_code,
           shipping_option, subtotal, gst, total, currency, locale, items_count, source, user_agent)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
         RETURNING id`,
      [
        userId ?? null,
        customer.full_name ?? null,
        customer.email ?? null,
        customer.phone_country_code ?? null,
        customer.phone_number ?? null,
        customer.phone_full ?? null,
        customer.gst_number ?? null,
        customer.pin_code ?? null,
        body.shipping_option ?? null,
        summary.subtotal ?? null,
        summary.gst ?? null,
        summary.total ?? null,
        summary.currency ?? null,
        summary.locale ?? null,
        itemsCount,
        meta.source ?? null,
        meta.user_agent ?? null
      ]
    );
    const quote = quoteResult.rows[0];
    if (!quote) throw new Error("Failed to create quote request");
    for (const item of items) {
      await client.query(
        `INSERT INTO quote_request_items
            (quote_request_id, product_id, product_name, category_name, quantity, unit_price, line_total, spec, spec_summary)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [
          quote.id,
          item.product_id ?? null,
          item.product_name ?? null,
          item.category_name ?? null,
          item.quantity ?? null,
          item.unit_price ?? null,
          item.line_total ?? null,
          // The size the buyer chose, sanitised here rather than trusted: it is free text from
          // a browser and it ends up in the sales team's view of the order.
          item.spec ? JSON.stringify(normaliseSpec(item.spec)) : null,
          item.spec ? formatSpec(normaliseSpec(item.spec)) : null
        ]
      );
    }
    await client.query("COMMIT");
    const account = userId ? await queryOne("SELECT name, email FROM users WHERE id = $1", [userId]) : null;
    const leadBody = {
      ...body,
      customer: {
        ...customer,
        full_name: customer.full_name ?? account?.name ?? null,
        email: customer.email ?? account?.email ?? null
      }
    };
    return { id: quote.id, itemsCount, leadBody };
  } catch (error) {
    try {
      await client.query("ROLLBACK");
    } catch (rollbackError) {
      console.error("Failed to roll back quote request transaction", rollbackError);
    }
    throw error;
  } finally {
    client.release();
  }
}
__name(createQuoteRequest, "createQuoteRequest");

// server/notifyMessages.ts
init_modules_watch_stub();
var formatQuoteMessage = /* @__PURE__ */ __name((payload) => {
  const { customer, items, summary } = payload;
  const lines = [
    `New quote / cart request received (#${payload.id})`,
    `Name: ${customer.full_name || "N/A"}`,
    `Email: ${customer.email || "N/A"}`,
    `Phone: ${customer.phone_full || customer.phone_number || "N/A"}`,
    `GST Number: ${customer.gst_number || "N/A"}`,
    `Pin Code: ${customer.pin_code || "N/A"}`,
    ``,
    `Items:`,
    ...items.map(
      (item) => `- ${item.product_name || "Unnamed product"} | Size: ${item.spec ? formatSpec(normaliseSpec(item.spec)) : "not given"} | Qty: ${item.quantity ?? "N/A"} | Unit Price: ${item.unit_price ?? "N/A"} | Total: ${item.line_total ?? "N/A"}`
    ),
    ``,
    `Subtotal: ${summary.subtotal ?? "N/A"}`,
    `GST: ${summary.gst ?? "N/A"}`,
    `Total: ${summary.total ?? "N/A"} ${summary.currency ?? ""}`.trim(),
    `Received at: ${(/* @__PURE__ */ new Date()).toISOString()}`
  ];
  return lines.join("\n");
}, "formatQuoteMessage");

// server/notify.ts
init_modules_watch_stub();
var recipients = /* @__PURE__ */ __name((value) => (value || "").split(",").map((entry) => entry.trim()).filter(Boolean), "recipients");
async function sendWithResend(env, message, to) {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from: env.SMTP_FROM || "noreply@nickelbusbar.com",
      to,
      subject: message.subject,
      text: message.text
    })
  });
  if (!response.ok) {
    throw new Error(`Resend returned ${response.status}: ${(await response.text()).slice(0, 300)}`);
  }
}
__name(sendWithResend, "sendWithResend");
async function sendWithSendgrid(env, message, to) {
  const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.SENDGRID_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      personalizations: [{ to: to.map((email) => ({ email })) }],
      from: { email: env.SMTP_FROM || "noreply@nickelbusbar.com" },
      subject: message.subject,
      content: [{ type: "text/plain", value: message.text }]
    })
  });
  if (!response.ok) {
    throw new Error(`SendGrid returned ${response.status}: ${(await response.text()).slice(0, 300)}`);
  }
}
__name(sendWithSendgrid, "sendWithSendgrid");
async function sendNotificationEmail(env, message) {
  const to = recipients(env.ENQUIRY_NOTIFY_EMAILS);
  if (!to.length) return false;
  if (env.RESEND_API_KEY) {
    await sendWithResend(env, message, to);
    return true;
  }
  if (env.SENDGRID_API_KEY) {
    await sendWithSendgrid(env, message, to);
    return true;
  }
  console.warn(
    "[notify] No RESEND_API_KEY or SENDGRID_API_KEY set; email notification skipped. SMTP is not available on this runtime."
  );
  return false;
}
__name(sendNotificationEmail, "sendNotificationEmail");
async function sendNotificationWhatsApp(env, body) {
  const sid = env.TWILIO_ACCOUNT_SID;
  const token = env.TWILIO_AUTH_TOKEN;
  const from = env.TWILIO_WHATSAPP_FROM;
  const to = recipients(env.ENQUIRY_NOTIFY_WHATSAPP);
  if (!sid || !token || !from || !to.length) return false;
  const form = /* @__PURE__ */ __name((recipient) => new URLSearchParams({
    From: from.startsWith("whatsapp:") ? from : `whatsapp:${from}`,
    To: recipient.startsWith("whatsapp:") ? recipient : `whatsapp:${recipient}`,
    Body: body
  }), "form");
  for (const recipient of to) {
    const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${btoa(`${sid}:${token}`)}`,
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: form(recipient).toString()
    });
    if (!response.ok) {
      throw new Error(`Twilio returned ${response.status}: ${(await response.text()).slice(0, 300)}`);
    }
  }
  return true;
}
__name(sendNotificationWhatsApp, "sendNotificationWhatsApp");
async function notifyOrder(env, message) {
  const results = await Promise.allSettled([
    sendNotificationEmail(env, message),
    sendNotificationWhatsApp(env, message.text)
  ]);
  for (const result of results) {
    if (result.status === "rejected") console.error("[notify] notification failed", result.reason);
  }
}
__name(notifyOrder, "notifyOrder");

// worker/index.ts
var UNPORTED_API_PREFIXES = [
  "/api/enquiries",
  "/api/cart",
  "/api/auth",
  "/api/user",
  "/api/analytics",
  "/api/calls",
  "/api/admin",
  "/api/ai",
  "/api/crm",
  "/api/localization",
  "/merchant-feed.xml"
];
var json = /* @__PURE__ */ __name((body, status = 200, cacheControl = "public, max-age=0, s-maxage=60") => new Response(JSON.stringify(body), {
  status,
  headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": cacheControl }
}), "json");
var PRODUCT_IMAGE_EXTENSION = /\.(jpe?g|png|webp|avif|gif)$/i;
var PRODUCT_IMAGE_CONTENT_TYPES = /* @__PURE__ */ new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/gif"
]);
var PRODUCT_IMAGE_MAX_BYTES = 8 * 1024 * 1024;
var seeOther = /* @__PURE__ */ __name((location) => new Response(null, { status: 302, headers: { Location: location, "Cache-Control": "public, max-age=0, s-maxage=60" } }), "seeOther");
async function handleProductImage(file) {
  const slug = file.replace(PRODUCT_IMAGE_EXTENSION, "");
  if (!slug) return seeOther(PRODUCT_IMAGE_PLACEHOLDER);
  const fallback = localProductImagePath(slug) ?? PRODUCT_IMAGE_PLACEHOLDER;
  let product = null;
  try {
    product = await queryOne("SELECT image FROM products WHERE slug = $1", [slug]);
  } catch (error) {
    console.error(`[product-image] product lookup failed for ${slug}; serving local copy`, error);
    return seeOther(fallback);
  }
  const source = product?.image?.trim();
  if (!source) return seeOther(fallback);
  if (!/^https?:\/\//i.test(source)) return seeOther(source.startsWith("/") ? source : fallback);
  let upstream;
  try {
    upstream = await fetch(source, { redirect: "follow" });
  } catch (error) {
    console.error(`[product-image] upstream fetch failed for ${slug}; serving local copy`, error);
    return seeOther(fallback);
  }
  const contentType = (upstream.headers.get("content-type") || "").split(";")[0].trim().toLowerCase();
  if (!upstream.ok || !PRODUCT_IMAGE_CONTENT_TYPES.has(contentType)) {
    console.warn(`[product-image] upstream returned ${upstream.status} ${contentType || "(no type)"} for ${slug}`);
    return seeOther(fallback);
  }
  const declaredLength = Number(upstream.headers.get("content-length"));
  if (Number.isFinite(declaredLength) && declaredLength > PRODUCT_IMAGE_MAX_BYTES) return seeOther(source);
  const body = await upstream.arrayBuffer();
  if (body.byteLength > PRODUCT_IMAGE_MAX_BYTES) return seeOther(source);
  return new Response(body, {
    headers: {
      "Content-Type": contentType,
      "Content-Length": String(body.byteLength),
      // The header this route exists to set: the Supabase original says "none".
      "X-Robots-Tag": "all",
      "Cache-Control": "public, max-age=86400, s-maxage=31536000, stale-while-revalidate=604800",
      "Cross-Origin-Resource-Policy": "cross-origin"
    }
  });
}
__name(handleProductImage, "handleProductImage");
var templateCache = null;
async function loadTemplate(env, request) {
  if (templateCache) return templateCache;
  const response = await env.ASSETS.fetch(new URL("/index.html", request.url));
  if (!response.ok) throw new Error(`Could not read /index.html from the asset store: ${response.status}`);
  templateCache = await response.text();
  return templateCache;
}
__name(loadTemplate, "loadTemplate");
function isSnapshotRoute(pathname) {
  return pathname === "/" || pathname === "/products" || pathname === "/categories" || pathname === "/blog" || isStaticSnapshotRoute(pathname) || isNoindexSnapshotRoute(pathname) || isLandingSnapshotRoute(pathname) || /^\/blog\/[^/]+$/.test(pathname) || /^\/product\/[^/]+$/.test(pathname);
}
__name(isSnapshotRoute, "isSnapshotRoute");
async function handleApi(pathname, url, request, env, ctx) {
  if (pathname === "/api/quotes" && request.method === "POST") {
    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object") return json({ error: "Invalid request body" }, 400, "no-store");
    const invalid = validateQuoteBody(body);
    if (invalid) return json({ error: invalid.error }, 400, "no-store");
    const result = await createQuoteRequest(body, null);
    ctx.waitUntil(
      notifyOrder(env, {
        subject: `New Quote Request #${result.id}`,
        text: formatQuoteMessage({
          id: result.id,
          customer: result.leadBody.customer,
          items: body.items ?? [],
          summary: body.summary ?? {}
        })
      })
    );
    return json({ id: result.id }, 201, "no-store");
  }
  const number = /* @__PURE__ */ __name((value, fallback, min, max) => Math.min(Math.max(Number(value) || fallback, min), max), "number");
  if (pathname === "/api/health") return json({ ok: true, runtime: "cloudflare-worker" });
  if (pathname === "/api/products") {
    const products = await listProducts({
      category: url.searchParams.get("category"),
      featured: url.searchParams.has("featured"),
      search: url.searchParams.get("search")
    });
    return json(products ?? []);
  }
  if (pathname === "/api/products/suggestions") {
    const q = (url.searchParams.get("q") || "").trim();
    if (!q) return json([]);
    return json(await getProductSuggestions(q, number(url.searchParams.get("limit"), 8, 1, 20)));
  }
  const image = pathname.match(/^\/api\/product-image\/(.+)$/);
  if (image) return handleProductImage(decodeURIComponent(image[1]));
  if (pathname === "/api/categories") return json(await listCategories());
  if (pathname === "/api/ads/active") return json(await getActiveAds());
  if (pathname === "/api/blog-posts") {
    return json(await listBlogPosts(number(url.searchParams.get("limit"), 6, 1, 50)));
  }
  const blogPost = pathname.match(/^\/api\/blog-posts\/([^/]+)$/);
  if (blogPost) {
    let slug = blogPost[1];
    try {
      slug = decodeURIComponent(slug);
    } catch {
    }
    const post = await getBlogPostBySlug(slug);
    return post ? json(post) : json({ error: "Blog post not found" }, 404);
  }
  const related = pathname.match(/^\/api\/products\/([^/]+)\/related$/);
  if (related) {
    const rows = await getRelatedProducts(decodeURIComponent(related[1]));
    return rows === null ? json({ error: "Product not found" }, 404) : json(rows);
  }
  const product = pathname.match(/^\/api\/products\/([^/]+)$/);
  if (product) {
    const row = await getProductBySlug(decodeURIComponent(product[1]));
    return row ? json(row) : json({ error: "Product not found" }, 404);
  }
  if (UNPORTED_API_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    return json(
      { error: "This endpoint is not available on the Cloudflare deployment yet.", endpoint: pathname },
      501,
      "no-store"
    );
  }
  return null;
}
__name(handleApi, "handleApi");
var worker_default = {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const pathname = url.pathname.replace(/\/+$/, "") || "/";
    if (env.HYPERDRIVE?.connectionString) configureDatabase(env.HYPERDRIVE.connectionString);
    const legacy = legacyRedirectFor(pathname);
    if (legacy) {
      return new Response(null, {
        status: 301,
        headers: { Location: `${url.origin}${legacy}`, "Cache-Control": "public, max-age=0, s-maxage=600" }
      });
    }
    if (pathname.startsWith("/api/") || pathname === "/merchant-feed.xml") {
      try {
        const response = await handleApi(pathname, url, request, env, ctx);
        if (response) return response;
        return json({ error: "Not found" }, 404, "no-store");
      } catch (error) {
        console.error("Worker API request failed", error);
        return json({ error: "Request failed" }, 500, "no-store");
      }
    }
    if (isSnapshotRoute(pathname)) {
      const template = await loadTemplate(env, request);
      const result = await renderSnapshotResponse(pathname, template);
      const headers = new Headers({ "Cache-Control": result.cacheControl });
      if (result.noindex) headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
      if (result.location) {
        headers.set("Location", result.location);
        return new Response(null, { status: result.status, headers });
      }
      if (result.status === 503) headers.set("Retry-After", "120");
      headers.set("Content-Type", "text/html; charset=utf-8");
      return new Response(result.html, { status: result.status, headers });
    }
    const asset = await env.ASSETS.fetch(request);
    if (asset.status !== 404) return asset;
    const legacyImage = pathname.match(/^\/img\/products\/([^/]+\.webp)$/i);
    if (legacyImage) {
      return new Response(null, {
        status: 301,
        headers: {
          Location: `${url.origin}/api/product-image/${legacyImage[1]}`,
          "Cache-Control": "public, max-age=0, s-maxage=600"
        }
      });
    }
    const notFound = await env.ASSETS.fetch(new URL("/404.html", request.url));
    return new Response(await notFound.text(), {
      status: 404,
      headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "public, max-age=0, s-maxage=60" }
    });
  }
};

// node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
init_modules_watch_stub();
var drainBody = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default = drainBody;

// node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
init_modules_watch_stub();
function reduceError(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError(e.cause)
  };
}
__name(reduceError, "reduceError");
var jsonError = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } catch (e) {
    const error = reduceError(e);
    const body = JSON.stringify(error);
    const headers = {
      "Content-Type": "application/json",
      "MF-Experimental-Error-Stack": "true"
    };
    const encoded = encodeURIComponent(body);
    if (encoded.length <= 8192) {
      headers["MF-Experimental-Error-Stack-Payload"] = encoded;
    }
    return new Response(body, { status: 500, headers });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default = jsonError;

// .wrangler/tmp/bundle-PcxN5B/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = worker_default;

// node_modules/wrangler/templates/middleware/common.ts
init_modules_watch_stub();
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
__name(__facade_register__, "__facade_register__");
function __facade_invokeChain__(request, env, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env, ctx, middlewareCtx);
}
__name(__facade_invokeChain__, "__facade_invokeChain__");
function __facade_invoke__(request, env, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}
__name(__facade_invoke__, "__facade_invoke__");

// .wrangler/tmp/bundle-PcxN5B/middleware-loader.entry.ts
var __Facade_ScheduledController__ = class ___Facade_ScheduledController__ {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  static {
    __name(this, "__Facade_ScheduledController__");
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof ___Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
function wrapExportedHandler(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name(function(request, env, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env, ctx) {
      const dispatcher = /* @__PURE__ */ __name(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__(request, env, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler, "wrapExportedHandler");
function wrapWorkerEntrypoint(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  return class extends klass {
    #fetchDispatcher = /* @__PURE__ */ __name((request, env, ctx) => {
      this.env = env;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    }, "#fetchDispatcher");
    #dispatcher = /* @__PURE__ */ __name((type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    }, "#dispatcher");
    fetch(request) {
      return __facade_invoke__(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;
export {
  __INTERNAL_WRANGLER_MIDDLEWARE__,
  middleware_loader_entry_default as default
};
//# sourceMappingURL=index.js.map
