import algoliasearch from 'algoliasearch/lite';

const ALGOLIA_APP_ID = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID;
const ALGOLIA_ADMIN_KEY = process.env.NEXT_PUBLIC_ALGOLIA_ADMIN_KEY;
const ALGOLIA_INDEX_NAME = process.env.NEXT_PUBLIC_ALGOLIA_INDEX_NAME;

// Configurar cliente de Algolia
const client = algoliasearch(ALGOLIA_APP_ID, ALGOLIA_ADMIN_KEY);

// Accede al índice de Algolia
export const index = client.initIndex(ALGOLIA_INDEX_NAME);
