const { Writable } = require('stream');

const toMs = (end, start) => {
	const ms = (1000 * (end[0] - start[0])) + ((end[1] - start[1]) / 1000000);
	return Math.round(ms * 1000) / 1000;
};

class LogWritable extends Writable {
	constructor(eventcollector, logLevel) {
		super({
			decodeStrings: false,
			objectMode: true
		});
		this.collector = eventcollector;
		this.logLevel = logLevel;
	}

	_write(chunk, encoding, callback) {
		this.collector.log(this.logLevel, chunk);
		callback();
	}
}

class EventCollector {
	constructor(meta) {
		this.event = {
			meta: meta || {},
			time_epoch: Date.now(),
			time_date: new Date(),
			jobs: {},
			errors: [],
			errorCount: 0
		}
		this.start_hr = process.hrtime();
		this.duplicateIds = {};
		this.logs = [];
	}

	addMeta(meta) {
		Object.assign(this.event.meta, meta);
	}

	addError(error) {
		console.log(error);
		this.event.errors.push({message: error.message, stack: error.stack });
		this.event.errorCount++
	}

	_getId(type) {
		if(this.event.jobs[type]) {
		    // Initialise or update duplicate id count for 'type'
		    this.duplicateIds[type] = !this.duplicateIds[type] ? 1 : this.duplicateIds[type] + 1;
			return `${type}-${this.duplicateIds[type]}`;
		} else {
			return type;
		}
	}

	startJob(type, meta) {
		const start_hr = process.hrtime();
		const job = { start_hr, startAtMs: toMs(start_hr, this.start_hr) };
		Object.assign(job, meta);
		const id = this._getId(type);
		this.event.jobs[id] = job
		return id;
	}

	endJob(id, meta) {
		const job = this.event.jobs[id];
		if(job) {
			job.durationInMs = toMs(process.hrtime(), job.start_hr);
			delete job.start_hr;
		} else {
			this.addError(`EventCollector - Job: '${id}' was not started`);
		}
	}

	logStdOut(){
		return new LogWritable(this, 'LOG');
	}

	logStdErr(){
		return new LogWritable(this, 'ERR');
	}

	log(logLevel, log) {
		const atMs = toMs(process.hrtime(), this.start_hr);
		this.logs.push({logLevel, atMs, log});
	}

	getEvent() {
		return this.event;
	}

	getLogs() {
		return this.logs;
	}

	end(meta) {
		this.totalDuration = toMs(process.hrtime(), this.start_hr);
		Object.assign(this.event.meta, meta);
	}
}

EventCollector.express = require('./express-eventcollector')(EventCollector);

module.exports = EventCollector;
