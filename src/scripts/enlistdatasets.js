const model = require('../services/model/dataset');
const store = require('../services/mongo/store');
const registry = require('../services/databroker/registry');
const request = require('request');
const csv = require('csv-parser');

const CATEGORIES = {
  CATEGORY_HEALTH: 'health',
  CATEGORY_ENERGY: 'energy',
  CATEGORY_AGRICULTURE: 'agriculture',
  CATEGORY_ENVIRONMENT: 'environment'
};

const FILETYPES = {
  FILETYPE_CSV: 'csv',
  FILETYPE_JSON: 'json',
  FILETYPE_XLS: 'xls'
};

const rawDatasets = [
  {
    url:
      'https://datatank.stad.gent/4/milieuennatuur/inventarisstraatbomen1juli2011.json',
    name: 'Inventory streettrees Juli 2011',
    category: CATEGORIES.CATEGORY_ENVIRONMENT,
    filetype: FILETYPES.FILETYPE_JSON
  },
  {
    url:
      'http://statbel.fgov.be/sites/default/files/files/documents/landbouw/8.3%20Landbouwprijzen%20%28output-%20en%20input-%29/agriprices_nl-base2010.xls',
    name: 'Agriculture prizes',
    category: CATEGORIES.CATEGORY_AGRICULTURE,
    filetype: FILETYPES.FILETYPE_XLS
  },
  {
    url:
      'http://statbel.fgov.be/sites/default/files/files/documents/landbouw/8.5%20Slachtstatistieken/slaughtering_monthlyresults2017_nl_0.xls',
    name: 'Slaughtering monthly results 2017',
    category: CATEGORIES.CATEGORY_ENVIRONMENT,
    filetype: FILETYPES.FILETYPE_XLS
  },
  {
    url:
      'https://datatank.stad.gent/4/infrastructuur/windturbineshavengent.geojson',
    name: 'Windturbines Gent harbour',
    category: CATEGORIES.CATEGORY_ENERGY,
    filetype: FILETYPES.FILETYPE_JSON
  },
  {
    url:
      'https://datatank.stad.gent/4/milieuennatuur/besparingperwoningtype.csv?limit=-1',
    name: 'Savings per housing type',
    category: CATEGORIES.CATEGORY_ENVIRONMENT,
    filetype: FILETYPES.FILETYPE_CSV
  },
  {
    url: 'http://opendata.visitflanders.org/accessibility/reca/bars_v2.json',
    name: 'Accessibility in bars in Flanders',
    category: CATEGORIES.CATEGORY_HEALTH,
    filetype: FILETYPES.FILETYPE_JSON
  },
  {
    url:
      'http://portaal-stadantwerpen.opendata.arcgis.com/datasets/df01b45b79034ba5a8f6dc',
    name: 'Verbrandingsoven',
    category: CATEGORIES.CATEGORY_ENVIRONMENT,
    filetype: FILETYPES.FILETYPE_JSON
  },
  {
    url:
      'http://portaal-stadantwerpen.opendata.arcgis.com/datasets/2eb77c8aaf714b3aa7add0aef483298d_92.csv',
    name: 'Road management',
    category: CATEGORIES.CATEGORY_ENVIRONMENT,
    filetype: FILETYPES.FILETYPE_CSV
  },
  {
    url:
      'http://portaal-stadantwerpen.opendata.arcgis.com/datasets/763a06ba5dad4a13bc3c88d0976a7ce3_298.geojson',
    name: 'Accessibility of pharmacies',
    category: CATEGORIES.CATEGORY_HEALTH,
    filetype: FILETYPES.FILETYPE_JSON
  },
  {
    url:
      'http://opendata.visitflanders.org/accessibility/attractions/cementery_v2',
    name: 'Accessible burial sites in Flanders',
    category: CATEGORIES.CATEGORY_ENVIRONMENT,
    filetype: FILETYPES.FILETYPE_CSV
  },
  {
    url:
      'http://opendata.brussels.be/explore/dataset/public-hospitals/download/?format=xls',
    name: 'Public hospitals in Brussels',
    category: CATEGORIES.CATEGORY_ENVIRONMENT,
    filetype: FILETYPES.FILETYPE_XLS
  },
  {
    url:
      'http://opendata.brussels.be/explore/dataset/public-hospitals/download/?format=xls',
    name: 'Public hospitals',
    category: CATEGORIES.CATEGORY_ENVIRONMENT,
    filetype: FILETYPES.FILETYPE_XLS
  }
];

async function enlist() {
  for (let i = 0; i < rawDatasets.length; i++) {
    let dataset = await model.createDatasetListing(rawDatasets[i]);
    await ensureIsListed(i, dataset)
      .then(result => {
        console.log('OK');
      })
      .catch(error => {
        console.log(`Failed to enlist ${dataset.metadata.sensorid}, ${error}`);
      });
  }
  console.log('Done');
  process.exit(0);
}

async function ensureIsListed(i, dataset) {
  return new Promise((resolve, reject) => {
    console.log(
      `${i + 1}) Ensuring dataset ${dataset.metadata.sensorid} is enlisted`
    );
    store.isEnlisted(dataset.metadata.sensorid).then(isEnlisted => {
      if (isEnlisted) {
        return resolve(dataset.metadata.sensorid);
      }

      return registry
        .enlistSensor(dataset)
        .then(result => {
          resolve(result);
        })
        .catch(error => {
          reject(error);
        });
    });
  });
}

enlist();
