
var 
	fs = require('fs'), 
	path = require('path'), 
	Stream = require('stream').Stream,
	util = require('util');

/**
 *
 *
 *
 */
function Log(context, providers, level) {
	Stream.call(this);

	this.context = context || process;
	this.writable = true;

	if (!Array.isArray(providers))
		providers = [ providers ];
	
	this.providers = providers.filter(function(provider) {
		switch(typeof provider) {
		case "object":
			return provider instanceof Log.Logger;
		default:
			return false;
		}
	});

	this.providers.forEach(function(provider) {
		this.pipe(provider);
	}, this);

	this.level = level || Log.All;
	
}
util.inherits(Log, Stream);

/**
 * Create a new log. Just a convenience wrapper around
 * the log constructor function.
 *
 */
Log.create = function(context, providers, level) {
	if (arguments.length === 1) {
		providers = context;
		context = undefined;
	}
	return new Log(context, providers, level);
}

/**
 * Logger base class. Doesn't really do much except
 * wrap the stream object and mark itself as writable.
 *
 */
Log.Logger = function() {
	Stream.call(this);
	this.writable = true;
}
util.inherits(Log.Logger, Stream);


Log.All = 0;
Log.Debug = 10;
Log.Informative = 20;
Log.Warning = 30;
Log.Error = 40;

/**
 * Create a sub-logger with a new context and log level.
 *
 *
 */
Log.prototype.instance = function(context, level) {
	return new Log(context, [ this ], level);
}

/**
 * Write a message object to the loggers. 
 *
 *
 */
Log.prototype.write = function(msg) {
	if (msg.level < this.level)
		return;
	msg.context = this.context;
	this.emit("data", msg);
}

/**
 * Log an informative message.
 *
 *
 */
Log.prototype.info = function(msg) {
	this.write({
		timestamp: new Date(),
		message: msg,
		level: Log.Informative
	})
}

/**
 * Log a warning message.
 *
 *
 */
Log.prototype.warn = function(msg) {
	this.write({
		timestamp: new Date(),
		message: msg,
		level: Log.Warning
	})
}

/**
 * Log a debug message.
 *
 *
 */
Log.prototype.debug = function(msg) {
	this.write({
		timestamp: new Date(),
		message: msg,
		level: Log.Debug
	})
}

/**
 * Log an error message.
 * 
 *
 */
Log.prototype.error = function(msg) {
	this.write({
		timestamp: new Date(),
		message: msg,
		level: Log.Error
	})
}

module.exports = Log;