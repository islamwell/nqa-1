const algoliasearch = require('algoliasearch');
const fs = require('fs');
const path = require('path');

// Extract the raw json from output.js since it uses ES6 export syntax which Node might not like if run as CommonJS
let rawOutput = fs.readFileSync(path.join(__dirname, '../src/db/output.js'), 'utf8');
rawOutput = rawOutput.replace('export const json = ', '');
let audios = [];
try {
  audios = JSON.parse(rawOutput);
} catch (e) {
  // If parsing fails due to trailing semicolon
  if (rawOutput.trim().endsWith(';')) {
    audios = JSON.parse(rawOutput.trim().slice(0, -1));
  }
}

const categoriesNested = require('../src/data/category-strcture.json');

const APP_ID = 'US5O0H0FC3';
const API_KEY = '53c62e1b31cb0b40e8f3ff20596f5727'; // Admin API Key (hopefully)

const client = algoliasearch(APP_ID, API_KEY);
const audioIndex = client.initIndex('dev_audios');
const categoryIndex = client.initIndex('dev_categories');

// Flatten categories
function flattenCategories(categories) {
  let flat = [];
  categories.forEach(cat => {
    let { subCategories, ...rest } = cat;
    rest.objectID = rest.id.toString(); // Algolia requires string objectID
    flat.push(rest);
    if (subCategories && subCategories.length > 0) {
      flat = flat.concat(flattenCategories(subCategories));
    }
  });
  return flat;
}

const flatCategories = flattenCategories(categoriesNested);

// Map audios for Algolia
const algoliaAudios = audios.map(audio => {
  return {
    ...audio,
    objectID: audio.id.toString()
  };
});

async function sync() {
  try {
    console.log(`Syncing ${flatCategories.length} categories to Algolia...`);
    await categoryIndex.saveObjects(flatCategories);
    console.log('Categories synced successfully!');

    console.log(`Syncing ${algoliaAudios.length} audios to Algolia...`);
    // Split audios into chunks if too large, but saveObjects handles chunking implicitly up to a limit
    await audioIndex.saveObjects(algoliaAudios);
    console.log('Audios synced successfully!');

    // Configure indexes
    await categoryIndex.setSettings({
        searchableAttributes: ['name'],
    });

    await audioIndex.setSettings({
        searchableAttributes: ['name'],
    });
    console.log('Index settings configured!');

  } catch (error) {
    console.error('Error syncing to Algolia:', error);
  }
}

sync();
