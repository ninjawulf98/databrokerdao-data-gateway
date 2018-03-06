const client = require('../mongo/client');

async function getCronJobByName(name) {
  if (name === 'DEBUG') {
    return {
      name: 'DEBUG',
      schedule: '* * * * * *'
    };
  }

  let collection = await client.getCollection('cron');
  return collection.findOne({ name: name });
}

async function getCronJobs() {
  let collection = await client.getCollection('cron');
  return collection.find({ status: 'active' });
}

async function updateCronJob(job) {
  let collection = await client.getCollection('cron');
  return collection.replaceOne({ name: job.name }, job, { upsert: true });
}

module.exports = {
  getCronJobs,
  getCronJobByName,
  updateCronJob
};
