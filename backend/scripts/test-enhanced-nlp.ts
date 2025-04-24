import { NestFactory } from '@nestjs/core';
import { TestNlpModule } from './test-nlp.module';
import { EnhancedNlpService } from '../src/modules/nlp/services/enhanced-nlp.service';
import { NlpService } from '../src/modules/nlp/services/nlp.service';
import { Logger } from '@nestjs/common';

/**
 * Test script for demonstrating the enhanced NLP capabilities
 * This script compares the original NLP service with the enhanced version
 */
async function testEnhancedNlp() {
  const logger = new Logger('TestEnhancedNLP');
  logger.log('Starting Enhanced NLP Test...');

  try {
    // Create NestJS application with the simplified test module
    const app = await NestFactory.create(TestNlpModule, {
      logger: ['error', 'warn', 'log'],
    });

    // Get NLP services
    const originalNlpService = app.get(NlpService);
    const enhancedNlpService = app.get(EnhancedNlpService);

    // Test queries
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

    logger.log('Running tests with original NLP service...');
    for (const query of testQueries) {
      logger.log(`\nProcessing query: "${query}"`);
      
      // Process with original NLP service
      const originalResult = originalNlpService.processQuery(query);
      
      logger.log('Original NLP Results:');
      logger.log(`- Processed Query: ${originalResult.processedQuery}`);
      logger.log(`- Entities: ${JSON.stringify(originalResult.entities)}`);
      logger.log(`- Intent: ${originalResult.intent}`);
    }

    logger.log('\n\nRunning tests with enhanced NLP service...');
    for (const query of testQueries) {
      logger.log(`\nProcessing query: "${query}"`);
      
      // Process with enhanced NLP service
      const enhancedResult = await enhancedNlpService.processQuery(query);
      
      logger.log('Enhanced NLP Results:');
      logger.log(`- Processed Query: ${enhancedResult.processedQuery}`);
      logger.log(`- Expanded Query: ${enhancedResult.expandedQuery}`);
      logger.log(`- Entities: ${JSON.stringify(enhancedResult.entities.slice(0, 3))}${enhancedResult.entities.length > 3 ? ` ...and ${enhancedResult.entities.length - 3} more` : ''}`);
      logger.log(`- Primary Intent: ${enhancedResult.intent.primary} (confidence: ${enhancedResult.intent.confidence.toFixed(2)})`);
      
      if (enhancedResult.intent.secondary.length > 0) {
        logger.log(`- Secondary Intents: ${enhancedResult.intent.secondary.map(i => `${i.intent} (${i.confidence.toFixed(2)})`).join(', ')}`);
      }
      
      if (enhancedResult.expansionTerms.length > 0) {
        logger.log(`- Expansion Terms: ${enhancedResult.expansionTerms.join(', ')}`);
      }
      
      logger.log('- Search Parameters:');
      if (Object.keys(enhancedResult.searchParameters.boost).length > 0) {
        logger.log(`  - Boost: ${JSON.stringify(enhancedResult.searchParameters.boost)}`);
      }
      
      if (enhancedResult.searchParameters.sort.length > 0) {
        logger.log(`  - Sort: ${JSON.stringify(enhancedResult.searchParameters.sort)}`);
      }
      
      if (Object.keys(enhancedResult.searchParameters.filters).length > 0) {
        logger.log(`  - Filters: ${JSON.stringify(enhancedResult.searchParameters.filters)}`);
      }
    }

    // Test detailed analysis
    logger.log('\n\nDetailed Analysis Example:');
    const analysisQuery = 'sustainable dress under $100 with good reviews';
    logger.log(`Analyzing query: "${analysisQuery}"`);
    
    const analysis = await enhancedNlpService.analyzeQuery(analysisQuery);
    logger.log(JSON.stringify(analysis, null, 2));

    await app.close();
    logger.log('Enhanced NLP Test completed successfully');
  } catch (error) {
    logger.error(`Test failed: ${error.message}`);
    logger.error(error.stack);
    process.exit(1);
  }
}

// Run the test
testEnhancedNlp();
