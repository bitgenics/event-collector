const { Writable } = require('stream');

const toMs = (end, start) => {
	const ms = (1000 * (end[0] - start[0])) + ((end[1] - start[1])/1000000);
	return Math.round(ms*1000)/1000;
}

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
		this.meta = meta;
		this.time_epoch = Date.now();
		this.time_date = new Date();
		this.start_hr = process.hrtime();
		this.jobs = {};
		this.errors = [];
		this.errorCount = 0;
		this.duplicateIds = {};
		this.logs = [];
	}

	addMeta(meta) {
		Object.assign(this.meta, meta);
	}

	addError(error) {
		this.errors.push(error);
		this.errorCount++
	}

	_getId(type) {
		if(this.jobs[type]) {
			const counter = duplicateIds[type] ? 1 : duplicateIds[type]++;
			duplicateIds[type] = counter;
			return `${type}-${counter}`;
		} else {
			return type;
		}
	}

	startJob(type, meta) {
		const start_hr = process.hrtime();
		const job = {start_hr, startAtMs: toMs(start_hr, this.start_hr)};
		Object.assign(job, meta);
		const id = this._getId(type);
		this.jobs[id] = job
		return id;
	}

	endJob(id, meta) {
		const job = this.jobs[id];
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

	end(meta) {
		this.totalDuration = toMs(process.hrtime(), this.start_hr);
		Object.assign(this.meta, meta);
		delete this.start_hr;
		delete this.duplicateIds;
	}
}

EventCollector.express = require('./express-eventcollector')(EventCollector);

module.exports = EventCollector;