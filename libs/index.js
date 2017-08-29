'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.getRecursiveResult = exports.getRecursiveProperties = exports.prepareAPI = undefined;

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var chromeLauncher = require('chrome-launcher');
var chromeRemoteInterface = require('chrome-remote-interface');

var prepareAPI = function prepareAPI() {
    var config = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    var _config$host = config.host,
        host = _config$host === undefined ? 'localhost' : _config$host,
        _config$port = config.port,
        port = _config$port === undefined ? 9222 : _config$port,
        _config$autoSelectChr = config.autoSelectChrome,
        autoSelectChrome = _config$autoSelectChr === undefined ? true : _config$autoSelectChr,
        _config$headless = config.headless,
        headless = _config$headless === undefined ? true : _config$headless;

    var wrapperEntry = chromeLauncher.launch({
        host: host,
        port: port,
        autoSelectChrome: autoSelectChrome,
        additionalFlags: ['--disable-gpu', headless ? '--headless' : '']
    }).then(function (chromeInstance) {
        var remoteInterface = chromeRemoteInterface(config).then(function (chromeAPI) {
            return chromeAPI;
        }).catch(function (err) {
            throw err;
        });
        return Promise.all([chromeInstance, remoteInterface]);
    }).catch(function (err) {
        throw err;
    });

    return wrapperEntry;
};

var getRecursiveProperties = function getRecursiveProperties(remoteInterface, metaInfo) {
    var depth = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : -1;

    if (!remoteInterface || !metaInfo) {
        return Promise.reject(new Error('invalid params'));
    }

    var metaObj = void 0;

    //the returned object by evaluate
    if ('result' in metaInfo) {
        var result = metaInfo.result,
            exceptionDetails = metaInfo.exceptionDetails;

        if (!exceptionDetails) {
            metaObj = result;
        }
    }
    // the result property of the returned object by evaluate
    if ('objectId' in metaInfo) {
        metaObj = metaInfo;
    }

    if (!metaObj) {
        var name = metaInfo.name,
            value = metaInfo.value;

        return _defineProperty({}, name, value && value.value);
    }

    var Runtime = remoteInterface.Runtime;

    return Runtime.getProperties(metaObj).then(function () {
        var _ref2 = _asyncToGenerator(_regenerator2.default.mark(function _callee(resultObj) {
            var result, exceptionDetails, retObj, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, propObj, _name, _value;

            return _regenerator2.default.wrap(function _callee$(_context) {
                while (1) {
                    switch (_context.prev = _context.next) {
                        case 0:
                            result = resultObj.result, exceptionDetails = resultObj.exceptionDetails;

                            if (exceptionDetails) {
                                _context.next = 40;
                                break;
                            }

                            if (!Array.isArray(result)) {
                                _context.next = 39;
                                break;
                            }

                            retObj = {};
                            _iteratorNormalCompletion = true;
                            _didIteratorError = false;
                            _iteratorError = undefined;
                            _context.prev = 7;
                            _iterator = result[Symbol.iterator]();

                        case 9:
                            if (_iteratorNormalCompletion = (_step = _iterator.next()).done) {
                                _context.next = 22;
                                break;
                            }

                            propObj = _step.value;
                            _name = propObj.name, _value = propObj.value;

                            if (!_value) {
                                _context.next = 18;
                                break;
                            }

                            _context.next = 15;
                            return getRecursiveProperties(remoteInterface, _value);

                        case 15:
                            retObj[_name] = _context.sent;
                            _context.next = 19;
                            break;

                        case 18:
                            retObj[_name] = _value;

                        case 19:
                            _iteratorNormalCompletion = true;
                            _context.next = 9;
                            break;

                        case 22:
                            _context.next = 28;
                            break;

                        case 24:
                            _context.prev = 24;
                            _context.t0 = _context['catch'](7);
                            _didIteratorError = true;
                            _iteratorError = _context.t0;

                        case 28:
                            _context.prev = 28;
                            _context.prev = 29;

                            if (!_iteratorNormalCompletion && _iterator.return) {
                                _iterator.return();
                            }

                        case 31:
                            _context.prev = 31;

                            if (!_didIteratorError) {
                                _context.next = 34;
                                break;
                            }

                            throw _iteratorError;

                        case 34:
                            return _context.finish(31);

                        case 35:
                            return _context.finish(28);

                        case 36:
                            return _context.abrupt('return', Promise.resolve(retObj));

                        case 39:
                            return _context.abrupt('return', getRecursiveProperties(remoteInterface, result, --depth));

                        case 40:
                        case 'end':
                            return _context.stop();
                    }
                }
            }, _callee, undefined, [[7, 24, 28, 36], [29,, 31, 35]]);
        }));

        return function (_x3) {
            return _ref2.apply(this, arguments);
        };
    }());
};

var getRecursiveResult = function getRecursiveResult(remoteInterface, expression) {
    var depth = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : -1;

    if (!remoteInterface || !expression) {
        return Promise.reject(new Error('invalid params'));
    }

    var Runtime = remoteInterface.Runtime;

    return Runtime.evaluate({
        expression: expression
    }).then(function (resultObj) {
        return getRecursiveProperties(remoteInterface, resultObj);
    });
};

exports.prepareAPI = prepareAPI;
exports.getRecursiveProperties = getRecursiveProperties;
exports.getRecursiveResult = getRecursiveResult;
exports.default = {
    prepareAPI: prepareAPI,
    getRecursiveProperties: getRecursiveProperties,
    getRecursiveResult: getRecursiveResult
};


module.exports = {
    prepareAPI: prepareAPI,
    getRecursiveProperties: getRecursiveProperties,
    getRecursiveResult: getRecursiveResult
};