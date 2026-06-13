import algoliasearch from "algoliasearch/lite";

// Use environment variables if available, otherwise use defaults
const APP_ID = process.env.REACT_APP_ALGOLIA_APP_ID || 'US5O0H0FC3';
const API_KEY = process.env.REACT_APP_ALGOLIA_SEARCH_KEY || '53c62e1b31cb0b40e8f3ff20596f5727';
const AUDIO_INDEX = process.env.REACT_APP_ALGOLIA_AUDIO_INDEX || 'dev_audios';
const CATEGORY_INDEX = process.env.REACT_APP_ALGOLIA_CATEGORY_INDEX || 'dev_categories';

const client = algoliasearch(APP_ID, API_KEY);

export const audioIndex = client.initIndex(AUDIO_INDEX);
export const categoryIndex = client.initIndex(CATEGORY_INDEX);
