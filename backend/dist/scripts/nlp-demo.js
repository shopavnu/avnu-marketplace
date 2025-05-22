class NlpProcessor {
  processQueryBasic(query) {
    const entities = [];
    const priceRangeRegex = /\$(\d+(?:\.\d+)?)\s*(?:to|-)\s*\$(\d+(?:\.\d+)?)/gi;
    const priceMatches = query.match(priceRangeRegex);
    if (priceMatches) {
      priceMatches.forEach(match => {
        const priceValues = match.match(/\$\d+(?:\.\d+)?/g);
        if (priceValues && priceValues.length === 2) {
          const minPrice = parseFloat(priceValues[0].substring(1));
          const maxPrice = parseFloat(priceValues[1].substring(1));
          entities.push({ type: 'priceRange', value: `${minPrice}-${maxPrice}` });
        }
      });
    }
    const singlePriceRegex = /(?:under|less than|below|above|over|more than)\s*\$(\d+(?:\.\d+)?)/gi;
    const singlePriceMatches = [...query.matchAll(singlePriceRegex)];
    singlePriceMatches.forEach(match => {
      const price = parseFloat(match[1]);
      const modifier =
        match[0].toLowerCase().includes('under') ||
        match[0].toLowerCase().includes('less than') ||
        match[0].toLowerCase().includes('below')
          ? 'max'
          : 'min';
      entities.push({
        type: 'price',
        value: modifier === 'max' ? `0-${price}` : `${price}-9999`,
      });
    });
    let intent = 'product_search';
    if (query.includes('compare') || query.includes('vs')) {
      intent = 'comparison';
    } else if (query.includes('recommend') || query.includes('best')) {
      intent = 'recommendation';
    }
    return {
      processedQuery: query,
      entities,
      intent,
    };
  }
  processQueryEnhanced(query) {
    const entities = this.extractEntities(query);
    const intent = this.detectIntent(query);
    const { expandedQuery, expansionTerms } = this.expandQuery(query);
    const searchParameters = this.generateSearchParameters(intent.primary, entities, query);
    return {
      originalQuery: query,
      processedQuery: this.buildProcessedQuery(query, entities),
      expandedQuery,
      entities,
      intent,
      expansionTerms,
      searchParameters,
    };
  }
  extractEntities(query) {
    const entities = [];
    if (query.includes('dress') || query.includes('dresses')) {
      entities.push({ type: 'category', value: 'dresses', confidence: 0.9 });
    }
    if (query.includes('t-shirt') || query.includes('tee') || query.includes('shirt')) {
      entities.push({ type: 'category', value: 'shirts', confidence: 0.85 });
    }
    if (query.includes('jeans') || query.includes('denim')) {
      entities.push({ type: 'category', value: 'jeans', confidence: 0.9 });
    }
    if (query.includes('eco collective')) {
      entities.push({ type: 'brand', value: 'eco collective', confidence: 0.95 });
    }
    if (query.includes('sustainable')) {
      entities.push({ type: 'value', value: 'sustainable', confidence: 0.9 });
    }
    if (query.includes('organic')) {
      entities.push({ type: 'value', value: 'organic', confidence: 0.9 });
    }
    if (query.includes('vegan')) {
      entities.push({ type: 'value', value: 'vegan', confidence: 0.9 });
    }
    if (query.includes('fair trade')) {
      entities.push({ type: 'value', value: 'fair trade', confidence: 0.9 });
    }
    if (query.includes('handmade')) {
      entities.push({ type: 'value', value: 'handmade', confidence: 0.9 });
    }
    if (query.includes('recycled')) {
      entities.push({ type: 'value', value: 'recycled', confidence: 0.9 });
    }
    if (query.includes('local')) {
      entities.push({ type: 'value', value: 'local', confidence: 0.8 });
    }
    if (query.includes('black')) {
      entities.push({ type: 'color', value: 'black', confidence: 0.95 });
    }
    if (query.includes('white')) {
      entities.push({ type: 'color', value: 'white', confidence: 0.95 });
    }
    if (query.includes('red')) {
      entities.push({ type: 'color', value: 'red', confidence: 0.95 });
    }
    if (query.includes('blue')) {
      entities.push({ type: 'color', value: 'blue', confidence: 0.95 });
    }
    if (query.includes('size')) {
      const sizeMatch = query.match(/size\s+(\d+)/i);
      if (sizeMatch && sizeMatch[1]) {
        entities.push({ type: 'size', value: sizeMatch[1], confidence: 0.9 });
      }
    }
    const priceRangeRegex = /\$(\d+(?:\.\d+)?)\s*(?:to|-)\s*\$(\d+(?:\.\d+)?)/gi;
    const priceMatches = query.match(priceRangeRegex);
    if (priceMatches) {
      priceMatches.forEach(match => {
        const priceValues = match.match(/\$\d+(?:\.\d+)?/g);
        if (priceValues && priceValues.length === 2) {
          const minPrice = parseFloat(priceValues[0].substring(1));
          const maxPrice = parseFloat(priceValues[1].substring(1));
          entities.push({ type: 'price', value: `${minPrice}-${maxPrice}`, confidence: 0.95 });
        }
      });
    }
    const singlePriceRegex = /(?:under|less than|below|above|over|more than)\s*\$(\d+(?:\.\d+)?)/gi;
    const singlePriceMatches = [...query.matchAll(singlePriceRegex)];
    singlePriceMatches.forEach(match => {
      const price = parseFloat(match[1]);
      const modifier =
        match[0].toLowerCase().includes('under') ||
        match[0].toLowerCase().includes('less than') ||
        match[0].toLowerCase().includes('below')
          ? 'max'
          : 'min';
      entities.push({
        type: 'price',
        value: modifier === 'max' ? `0-${price}` : `${price}-9999`,
        confidence: 0.9,
      });
    });
    if (query.includes('good reviews') || query.includes('well reviewed')) {
      entities.push({ type: 'rating', value: '4+', confidence: 0.8 });
    }
    if (query.includes('best rated') || query.includes('top rated')) {
      entities.push({ type: 'rating', value: '4.5+', confidence: 0.9 });
    }
    return entities;
  }
  detectIntent(query) {
    const intents = [];
    if (query.includes('find') || query.includes('search') || query.includes('looking for')) {
      intents.push({ intent: 'product_search', confidence: 0.8 });
    } else {
      intents.push({ intent: 'product_search', confidence: 0.6 });
    }
    if (query.includes('browse') || query.includes('explore') || query.includes('show me all')) {
      intents.push({ intent: 'category_browse', confidence: 0.85 });
    }
    if (query.includes('by ') || query.includes('from ') || query.includes('brand')) {
      intents.push({ intent: 'brand_specific', confidence: 0.85 });
    }
    if (
      query.includes('sustainable') ||
      query.includes('organic') ||
      query.includes('vegan') ||
      query.includes('fair trade') ||
      query.includes('handmade') ||
      query.includes('recycled') ||
      query.includes('local')
    ) {
      intents.push({ intent: 'value_driven', confidence: 0.85 });
    }
    if (
      query.includes('compare') ||
      query.includes('vs') ||
      query.includes('versus') ||
      query.includes('difference between')
    ) {
      intents.push({ intent: 'comparison', confidence: 0.9 });
    }
    if (
      query.includes('recommend') ||
      query.includes('suggest') ||
      query.includes('best') ||
      query.includes('top')
    ) {
      intents.push({ intent: 'recommendation', confidence: 0.9 });
    }
    if (
      query.includes('sort') ||
      query.includes('order by') ||
      query.includes('high to low') ||
      query.includes('low to high')
    ) {
      intents.push({ intent: 'sort', confidence: 0.9 });
    }
    if (
      query.includes('filter') ||
      query.includes('only show') ||
      query.includes('with') ||
      query.includes('that have')
    ) {
      intents.push({ intent: 'filter', confidence: 0.85 });
    }
    intents.sort((a, b) => b.confidence - a.confidence);
    return {
      primary: intents[0].intent,
      confidence: intents[0].confidence,
      secondary: intents.slice(1),
    };
  }
  expandQuery(query) {
    const expansionTerms = [];
    if (query.includes('sustainable')) {
      expansionTerms.push('eco-friendly', 'green', 'ethical');
    }
    if (query.includes('organic')) {
      expansionTerms.push('natural', 'chemical-free', 'pesticide-free');
    }
    if (query.includes('vegan')) {
      expansionTerms.push('plant-based', 'cruelty-free', 'animal-free');
    }
    if (query.includes('dress')) {
      expansionTerms.push('gown', 'frock', 'outfit');
    }
    if (query.includes('t-shirt') || query.includes('tee')) {
      expansionTerms.push('top', 'shirt', 'tee');
    }
    if (query.includes('jeans')) {
      expansionTerms.push('denim', 'pants', 'trousers');
    }
    if (query.includes('affordable') || query.includes('cheap')) {
      expansionTerms.push('budget', 'inexpensive', 'economical');
    }
    if (query.includes('premium') || query.includes('luxury')) {
      expansionTerms.push('high-end', 'designer', 'exclusive');
    }
    const uniqueTerms = [...new Set(expansionTerms)].slice(0, 5);
    const expandedQuery = `${query} ${uniqueTerms.join(' ')}`;
    return {
      expandedQuery,
      expansionTerms: uniqueTerms,
    };
  }
  generateSearchParameters(intent, entities, query) {
    const searchParams = {
      boost: {},
      sort: [],
      filters: {},
    };
    switch (intent) {
      case 'product_search':
        searchParams.boost = { name: 2.0, description: 1.0, categories: 1.5 };
        break;
      case 'category_browse':
        searchParams.boost = { categories: 3.0, name: 1.0, description: 0.5 };
        const categoryEntities = entities.filter(e => e.type === 'category');
        if (categoryEntities.length > 0) {
          searchParams.filters = {
            ...searchParams.filters,
            categories: categoryEntities.map(e => e.value),
          };
        }
        break;
      case 'brand_specific':
        searchParams.boost = { brand: 3.0, name: 1.0 };
        const brandEntities = entities.filter(e => e.type === 'brand');
        if (brandEntities.length > 0) {
          searchParams.filters = {
            ...searchParams.filters,
            brands: brandEntities.map(e => e.value),
          };
        }
        break;
      case 'value_driven':
        searchParams.boost = { values: 3.0, description: 2.0, name: 1.0 };
        const valueEntities = entities.filter(e => e.type === 'value');
        if (valueEntities.length > 0) {
          searchParams.filters = {
            ...searchParams.filters,
            values: valueEntities.map(e => e.value),
          };
        }
        break;
      case 'comparison':
        searchParams.boost = { name: 2.0, description: 1.0 };
        break;
      case 'recommendation':
        searchParams.sort.push({ field: 'rating', order: 'desc' });
        searchParams.boost = { rating: 2.0, reviewCount: 1.5, name: 1.0 };
        break;
      case 'sort':
        if (query.includes('price')) {
          if (query.includes('high to low')) {
            searchParams.sort.push({ field: 'price', order: 'desc' });
          } else {
            searchParams.sort.push({ field: 'price', order: 'asc' });
          }
        } else if (query.includes('rating') || query.includes('reviews')) {
          searchParams.sort.push({ field: 'rating', order: 'desc' });
        } else if (query.includes('new') || query.includes('recent')) {
          searchParams.sort.push({ field: 'createdAt', order: 'desc' });
        }
        break;
      case 'filter':
        break;
    }
    entities.forEach(entity => {
      switch (entity.type) {
        case 'price': {
          const priceValues = entity.value.split('-');
          if (priceValues.length === 2) {
            searchParams.filters = {
              ...searchParams.filters,
              priceMin: parseFloat(priceValues[0]),
              priceMax: parseFloat(priceValues[1]),
            };
          }
          break;
        }
        case 'color': {
          const colors = searchParams.filters.colors || [];
          searchParams.filters = {
            ...searchParams.filters,
            colors: [...colors, entity.value],
          };
          break;
        }
        case 'size': {
          const sizes = searchParams.filters.sizes || [];
          searchParams.filters = {
            ...searchParams.filters,
            sizes: [...sizes, entity.value],
          };
          break;
        }
        case 'rating': {
          if (entity.value.includes('+')) {
            searchParams.filters = {
              ...searchParams.filters,
              ratingMin: parseFloat(entity.value.replace('+', '')),
            };
          } else {
            searchParams.filters = {
              ...searchParams.filters,
              rating: parseFloat(entity.value),
            };
          }
          break;
        }
      }
    });
    return searchParams;
  }
  buildProcessedQuery(query, entities) {
    return query;
  }
}
const testQueries = [
  'sustainable dress under $100',
  'organic cotton t-shirts by eco collective',
  'vegan leather bags with good reviews',
  'recycled denim jeans size 32',
  'fair trade coffee from local brands',
  'compare bamboo and recycled plastic toothbrushes',
  'sort eco-friendly cleaning products by price low to high',
  'black dress with sustainable materials for summer',
  'handmade jewelry from small batch brands',
  'best rated organic skincare products under $50',
];
const nlpProcessor = new NlpProcessor();
console.log('NLP Enhancement Demo\n');
console.log('Running tests with basic NLP processing...\n');
for (const query of testQueries) {
  console.log(`Query: "${query}"`);
  const basicResult = nlpProcessor.processQueryBasic(query);
  console.log('Basic NLP Results:');
  console.log(`- Processed Query: ${basicResult.processedQuery}`);
  console.log(`- Entities: ${JSON.stringify(basicResult.entities)}`);
  console.log(`- Intent: ${basicResult.intent}`);
  console.log('');
}
console.log('\nRunning tests with enhanced NLP processing...\n');
for (const query of testQueries) {
  console.log(`Query: "${query}"`);
  const enhancedResult = nlpProcessor.processQueryEnhanced(query);
  console.log('Enhanced NLP Results:');
  console.log(`- Processed Query: ${enhancedResult.processedQuery}`);
  console.log(`- Expanded Query: ${enhancedResult.expandedQuery}`);
  console.log(
    `- Entities: ${JSON.stringify(enhancedResult.entities.slice(0, 3))}${enhancedResult.entities.length > 3 ? ` ...and ${enhancedResult.entities.length - 3} more` : ''}`,
  );
  console.log(
    `- Primary Intent: ${enhancedResult.intent.primary} (confidence: ${enhancedResult.intent.confidence.toFixed(2)})`,
  );
  if (enhancedResult.intent.secondary.length > 0) {
    console.log(
      `- Secondary Intents: ${enhancedResult.intent.secondary.map(i => `${i.intent} (${i.confidence.toFixed(2)})`).join(', ')}`,
    );
  }
  if (enhancedResult.expansionTerms.length > 0) {
    console.log(`- Expansion Terms: ${enhancedResult.expansionTerms.join(', ')}`);
  }
  console.log('- Search Parameters:');
  if (Object.keys(enhancedResult.searchParameters.boost).length > 0) {
    console.log(`  - Boost: ${JSON.stringify(enhancedResult.searchParameters.boost)}`);
  }
  if (enhancedResult.searchParameters.sort.length > 0) {
    console.log(`  - Sort: ${JSON.stringify(enhancedResult.searchParameters.sort)}`);
  }
  if (Object.keys(enhancedResult.searchParameters.filters).length > 0) {
    console.log(`  - Filters: ${JSON.stringify(enhancedResult.searchParameters.filters)}`);
  }
  console.log('');
}
console.log('NLP Enhancement Demo completed successfully');
//# sourceMappingURL=nlp-demo.js.map
