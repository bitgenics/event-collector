# Event-Collector
Allows you to collect meta-data and time different phases in the context of one bigger event.

## Install

The usual `npm install event-collector --save` or `yarn add event-collector`

## Creating an EventCollector

### With Express
If you are using Express the easiest way to get started is with:
```javascript
const express = require('express');
const EventCollector = require('event-collector');

const app = express();
app.use(EventCollector.express({some: 'fixed metadata'}, (eventcollector) => {
  console.log(JSON.stringify(eventcollector, null, 2));
}));
```
This will create a new EventCollector at `request.eventcontroller` with fixed metadata that will be added to every event. Use this for things like hostnames, versions of your software etc. Use that to add meta-data and time jobs. It will automatically call `end` add the following metadata:

* request.hostname
* request.url
* request.method
* response.statusCode
* response.getHeader('content-type)
* response.getHeader('content-encoding
* response.getHeader('cache-control)

The callback passed into the constructor will be called when the request is finished and you can do something useful with all the information you just collected, like logging it, or sending it to 3rd parties like http://honeycomb.io

### Without Express
If you are not running Express you can easily create your own EventCollector with `const eventcollector = new EventCollector()`;

## Usage

### addMeta(meta)
Adds all the keys in meta to the existing meta-data. If one or more keys in `meta` were already present they will be overwritten.

### addError(error)
Adds the error to the `errors` array and increase `errorCount` by 1.

### startJob(type, _meta_)
Starts timing a new job with `type`. If a job already exists with that type a dash + counter is added. Optionally you can pass in `meta`, which will be added to this particular job. This method saves how many milliseconds into the event we are when the job is started. This is stored as `startAtMs`.
Returns the `id` of the job.

### endJob(id, _meta_)
Ends the job with the `id` and stores the duration of this particular job. Optionally you can pass in some `meta` to be added to the job.

### end(_meta_)
Ends the event and store the `totalDuration`

## Example output

```json
{
  "meta": {
    "hostname": "localhost",
    "url": "/cafes/opal-cafe",
    "method": "GET",
    "rendererVersion": "3.4.2",
    "renderProfile": "linc-profile-generic-react-redux-routerv3",
    "statusCode": 200,
    "contentType": "text/html",
    "contentEncoding": "gzip"
  },
  "time": 1494585065359,
  "jobs": {
    "rendering": {
      "startAtMs": 3.007,
      "durationInMs": 1069.266
    },
    "match": {
      "startAtMs": 3.315,
      "durationInMs": 9.811
    },
    "writeInitialHead": {
      "startAtMs": 13.317,
      "durationInMs": 10.305
    },
    "firstFlush": {
      "startAtMs": 23.147,
      "durationInMs": 0.259
    },
    "firstRenderPass": {
      "startAtMs": 23.819,
      "durationInMs": 44.122
    },
    "rendererInitialSetup": {
      "startAtMs": 23.847,
      "durationInMs": 2.825
    },
    "firstRender": {
      "startAtMs": 26.694,
      "durationInMs": 41.21
    },
    "secondRenderPass": {
      "startAtMs": 1063.935,
      "durationInMs": 6.895
    },
    "sendMainContent": {
      "startAtMs": 1070.966,
      "durationInMs": 1.322
    }
  },
  "errs": [],
  "errorCount": 0,
  "totalDuration": 1074.686
}
```
