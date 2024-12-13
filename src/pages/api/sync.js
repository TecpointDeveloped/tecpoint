// import { collection, getDocs } from 'firebase/firestore';
// import { index } from '../../lib/algolia';
// import { db } from '../../database/Config';

// export default async function handler(req, res) {
//   if (req.method !== 'POST') {
//     return res.status(405).json({ message: 'Método no permitido' });
//   }

//   try {
//     const snapshot = await getDocs(collection(db, 'Products'));
//     const records = [];

//     snapshot.forEach(doc => {
//       records.push({
//         objectID: doc.id, // Algolia usa `objectID` como identificador único
//         ...doc.data(),
//       });
//     });

//     await index.saveObjects(records);
//     res.status(200).json({ message: 'Datos sincronizados con Algolia' });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Error al sincronizar datos' });
//   }
// }


import { algoliasearch } from "algoliasearch";

export async function AlgoliaApp() {

  const appID = "E9MIR9GQF9";
  const apiKey = "563897a19bfe1f4dccee5a19752ff25a";
  const indexName = "search_tecpoint_products";

  const client = algoliasearch(appID, apiKey);

  const record = { objectID: "object-1", name: "test record" };

  // Add record to an index
  const { taskID } = await client.saveObject({
    indexName,
    body: record,
  });

  // Wait until indexing is done
  await client.waitForTask({
    indexName,
    taskID,
  });

  // Search for "test"
  const { results } = await client.search({
    requests: [
      {
        indexName,
        query: "test",
      },
    ],
  });

  console.log(JSON.stringify(results));

  return (
    <div>
      <h1>algolia search</h1>
    </div>
  )
}