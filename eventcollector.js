const toMs = (end, start) => {
	const ms = (1000 * (end[0] - start[0])) + ((end[1] - start[1])/1000000);
	return Math.round(ms*1000)/1000;
}

class EventCollector {
	constructor(meta) {
		this.meta = meta;
		this.time = Date.now();
		this.start_hr = process.hrtime();
		this.jobs = {};
		this.errs = [];
		this.errorCount = 0;
	}

	addMeta(meta) {
		Object.assign(this.meta, meta);
	}

	addError(error) {
		this.errs.push(error);
		this.errorCount++
	}

	startJob(type, meta) {
		const start_hr = process.hrtime();
		if(this.jobs[type]) {
			this.addError(`EventCollector - Job: '${type}' was already started`);
		} else {
			const job = {start_hr, startAtMs: toMs(start_hr, this.start_hr)};
			Object.assign(job, meta);
			this.jobs[type] = job
		}
	}

	endJob(type, meta) {
		const job = this.jobs[type];
		if(job) {
			job.durationInMs = toMs(process.hrtime(), job.start_hr);
			delete job.start_hr;
		} else {
			this.addError(`EventCollector - Job: '${type}' was not started`);
		}
	}

	end(meta) {
		this.totalDuration = toMs(process.hrtime(), this.start_hr);
		Object.assign(this.meta, meta);
		delete this.start_hr;
	}
}

EventCollector.express = require('./express-eventcollector')(EventCollector);

module.exports = EventCollector;