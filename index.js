const Promise = require("bluebird"),
	assert = require("assert"),
	_ = require("underscore");

module.exports = {
	while: function(predicate, action) {
		assert.ok(_.isFunction(predicate), "predicate must be function");
		assert.ok(_.isFunction(action), "action must be function");

		function loop() {
			if (!predicate()) return;
			return Promise.resolve(action()).then(loop);
		}
		return Promise.resolve().then(loop);
	},
	doWhile: function(action, predicate) {
		assert.ok(_.isFunction(predicate), "predicate must be function");
		assert.ok(_.isFunction(action), "action must be function");

		function loop() {
			return Promise.resolve(action()).then(function() {
				if(!predicate()) return;
				return loop();
			});
		}
		return Promise.resolve().then(loop);
	},
	setTimeout: function(delay) {
		return new Promise(function(resolve) {
			setTimeout(resolve, delay);
		});
	},
	slice: function(array, worker, perBatch=1, concurrency=1) {
		assert.ok(_.isArray(array), "array must be an array");
		assert.ok(_.isFunction(worker), "worker must be function");

		perBatch = perBatch|0;
		concurrency = concurrency|0;

		assert.ok(perBatch > 0, "perBatch must be a positive integer");
		assert.ok(concurrency > 0, "concurrency must be a positive integer");

		var chunks = _.range(array.length / perBatch).map(function(i) {
			return array.slice(i * perBatch, (i + 1) * perBatch);
		});

		if(concurrency > 1)
			return Promise.map(chunks, worker, { concurrency: concurrency });

		return Promise.each(chunks, worker);
	},
};
