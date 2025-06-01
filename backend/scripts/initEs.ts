import { Client, estypes } from "@elastic/elasticsearch"; // Import estypes for explicit typing
import { inspect } from "util"; // For better console logging of objects
import * as dotenv from 'dotenv';

dotenv.config(); // Load environment variables from .env file, ensure .env is in the same directory or adjust path

// --- Configuration ---
const ELASTICSEARCH_NODE_URL = process.env.ELASTICSEARCH_NODE_URL || 'http://localhost:9200'; // Fallback to localhost if not set
const ELASTICSEARCH_API_KEY = process.env.ELASTICSEARCH_API_KEY || ''; // Fallback to empty string if not set
const INDEX_NAME = "search-avnu";

// --- Define your index mapping ---
// Define the mappings with explicit types from the Elasticsearch client library
const esIndexMappings: estypes.MappingTypeMapping = {
  properties: {
    text: { type: "text" as const } // Use 'as const' for literal type
    // Example fields (customize as needed):
    // title: { type: "text" as const },
    // product_id: { type: "keyword" as const },
    // price: { type: "float" as const },
    // tags: { type: "keyword" },
    // created_at: { type: "date" }
  }
};

// --- Sample documents for ingestion ---
const sampleDocuments = [
  {
    text: "Yellowstone National Park is one of the largest national parks in the United States. It ranges from the Wyoming to Montana and Idaho, and contains an area of 2,219,791 acress across three different states. Its most famous for hosting the geyser Old Faithful and is centered on the Yellowstone Caldera, the largest super volcano on the American continent. Yellowstone is host to hundreds of species of animal, many of which are endangered or threatened. Most notably, it contains free-ranging herds of bison and elk, alongside bears, cougars and wolves. The national park receives over 4.5 million visitors annually and is a UNESCO World Heritage Site."
  },
  {
    text: "Yosemite National Park is a United States National Park, covering over 750,000 acres of land in California. A UNESCO World Heritage Site, the park is best known for its granite cliffs, waterfalls and giant sequoia trees. Yosemite hosts over four million visitors in most years, with a peak of five million visitors in 2016. The park is home to a diverse range of wildlife, including mule deer, black bears, and the endangered Sierra Nevada bighorn sheep. The park has 1,200 square miles of wilderness, and is a popular destination for rock climbers, with over 3,000 feet of vertical granite to climb. Its most famous and cliff is the El Capitan, a 3,000 feet monolith along its tallest face."
  },
  {
    text: "Rocky Mountain National Park  is one of the most popular national parks in the United States. It receives over 4.5 million visitors annually, and is known for its mountainous terrain, including Longs Peak, which is the highest peak in the park. The park is home to a variety of wildlife, including elk, mule deer, moose, and bighorn sheep. The park is also home to a variety of ecosystems, including montane, subalpine, and alpine tundra. The park is a popular destination for hiking, camping, and wildlife viewing, and is a UNESCO World Heritage Site."
  }
];

// --- Elasticsearch Client Initialization ---
const client = new Client({
  node: ELASTICSEARCH_NODE_URL,
  auth: {
    apiKey: ELASTICSEARCH_API_KEY
  }
});

// --- Main function to setup index and ingest data ---
async function initializeElasticsearch() {
  try {
    console.log(`Connecting to Elasticsearch node: ${ELASTICSEARCH_NODE_URL}`);
    // 1. Check if the index exists
    // Fix 1: client.indices.exists() in v8+ returns Promise<boolean> directly.
    const indexActuallyExists = await client.indices.exists({ index: INDEX_NAME });

    if (!indexActuallyExists) {
      console.log(`Index \"${INDEX_NAME}\" does not exist. Creating index with mapping...`);
      // Fix 2: Correct the structure for mappings in client.indices.create
      await client.indices.create({
        index: INDEX_NAME,
        body: {
          mappings: esIndexMappings // Use the explicitly typed variable
        }
      });
      console.log(`Index \"${INDEX_NAME}\" created successfully with mapping.`);
    } else {
      console.log(`Index \"${INDEX_NAME}\" already exists.`);
      // Optionally, update mapping if needed (be cautious with existing data)
      // console.log(`Updating mapping for index \"${INDEX_NAME}\"...`);
      // await client.indices.putMapping({
      //   index: INDEX_NAME,
      //   body: esIndexMappings // Use the explicitly typed variable
      // });
      // console.log(`Mapping updated for index \"${INDEX_NAME}\".`);
    }

    // 2. Verify current mapping (optional)
    console.log(`Attempting to get mapping for index: ${INDEX_NAME}`);
    const fullGetMappingResponse = await client.indices.getMapping({ index: INDEX_NAME });
    console.log(`Full getMapping() response object for \"${INDEX_NAME}\":`, inspect(fullGetMappingResponse, false, 5, true)); // Increased depth for inspect

    // The fullGetMappingResponse itself is the data payload (Record<IndexName, IndexState>).
    // There's no separate '.body' property for this specific client method's response.
    console.log(`Using fullGetMappingResponse directly as mapping data.`);

    if (!fullGetMappingResponse) {
      console.warn(`The getMapping response (fullGetMappingResponse) was undefined or null. This is unexpected.`);
    } else {
      // Assert the type of the response to handle dynamic index name key.
      const typedMappingData = fullGetMappingResponse as unknown as Record<string, { mappings?: estypes.MappingTypeMapping }>;

      // Check if the response and the specific index mapping exist
      if (typedMappingData && typedMappingData[INDEX_NAME] && typedMappingData[INDEX_NAME].mappings) {
        console.log(`Current mapping for \"${INDEX_NAME}\":`, inspect(typedMappingData[INDEX_NAME].mappings, false, null, true));
      } else {
        console.warn(`Could not retrieve or parse mapping for index \"${INDEX_NAME}\" from the getMapping response. Response content was:`, inspect(typedMappingData, false, null, true));
      }
    }

    // 3. Bulk ingest documents
    console.log(`\nIngesting ${sampleDocuments.length} documents into \"${INDEX_NAME}\"...`);
    const bulkResponse = await client.helpers.bulk({
      datasource: sampleDocuments,
      onDocument(_doc) {
        return {
          index: { _index: INDEX_NAME }
        };
      },
    });

    console.log("\nBulk ingestion summary:");
    console.log(`Successfully ingested: ${bulkResponse.successful}`);
    console.log(`Failed: ${bulkResponse.failed}`);
    if (bulkResponse.failed > 0) {
        console.warn("Some documents failed to ingest. Check Elasticsearch logs or onDrop handler for details if implemented.");
    }

    console.log(`\n${bulkResponse.successful} documents ingested into \"${INDEX_NAME}\".`);

  } catch (error: any) {
    console.error("\nAn error occurred during Elasticsearch initialization:");
    if (error.meta && error.meta.body) {
      console.error("Elasticsearch error details:", inspect(error.meta.body, false, null, true));
    } else {
      console.error(inspect(error, false, null, true));
    }
    process.exitCode = 1; // Indicate failure
  }
}

// --- Run the initialization ---
initializeElasticsearch();
