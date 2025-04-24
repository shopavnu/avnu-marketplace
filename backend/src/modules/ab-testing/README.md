# A/B Testing Module

This module provides comprehensive A/B testing capabilities for the av | nu marketplace, enabling systematic experimentation and optimization of search algorithms, personalization, recommendations, and UI components.

## Features

### Experiment Management
- Create, update, and manage experiments with multiple variants
- Control experiment lifecycle (draft, running, paused, completed, archived)
- Configure audience targeting and traffic allocation
- Set experiment duration and goals

### Variant Assignment
- Random assignment of users to experiment variants
- Consistent assignment across sessions
- Support for audience percentage control
- Flexible variant configuration via JSON

### Tracking and Analytics
- Track impressions, interactions, and conversions
- Record custom events and revenue data
- Calculate key metrics (conversion rates, click-through rates)
- Time-series analysis of experiment performance

### Statistical Analysis
- Calculate statistical significance of results
- Determine confidence levels for variant performance
- Estimate required sample sizes for experiments
- Predict time to completion based on traffic

## Usage Examples

### Creating an Experiment

```graphql
mutation {
  createExperiment(createExperimentDto: {
    name: "Product Sort Order Experiment",
    description: "Testing different product sorting algorithms",
    type: SEARCH_ALGORITHM,
    audiencePercentage: 50,
    variants: [
      {
        name: "Control",
        description: "Current sorting algorithm",
        isControl: true,
        configuration: "{\"algorithm\":\"default\",\"boost_new\":false}"
      },
      {
        name: "Personalized Sort",
        description: "Personalized sorting based on user preferences",
        isControl: false,
        configuration: "{\"algorithm\":\"personalized\",\"boost_new\":true}"
      }
    ]
  }) {
    id
    name
    status
    variants {
      id
      name
      isControl
    }
  }
}
```

### Getting Experiment Variants for a User

```graphql
query {
  searchExperiments {
    experiments {
      variantId
      configuration
      assignmentId
    }
  }
}
```

### Tracking Conversions

```graphql
mutation {
  trackConversion(
    assignmentId: "assignment-uuid",
    value: 49.99,
    context: "purchase"
  )
}
```

### Analyzing Results

```graphql
query {
  experimentResults(id: "experiment-uuid") {
    experimentName
    variants {
      variantName
      impressions
      conversions
      conversionRate
      isControl
      isWinner
    }
  }
}
```

## Integration with Other Modules

### Search Module
- Test different search algorithms, boosting strategies, and ranking factors
- Optimize relevance and discovery

### Personalization Module
- Experiment with different personalization approaches
- Test preference weighting and behavioral signals

### Analytics Module
- Feed experiment results into analytics dashboards
- Track long-term impact of winning variants

### UI Components
- Test different layouts, CTAs, and user flows
- Optimize for engagement and conversion

## Best Practices

1. **Define Clear Goals**: Each experiment should have a specific, measurable objective
2. **Sufficient Sample Size**: Ensure experiments run long enough to gather statistically significant data
3. **Limit Concurrent Experiments**: Avoid running too many overlapping experiments that could affect the same metrics
4. **Document Learnings**: Record insights from each experiment, even failed ones
5. **Implement Winners**: Have a clear process for implementing winning variants

## Architecture

The A/B testing module consists of the following components:

- **Entities**: Experiment, ExperimentVariant, ExperimentResult, UserExperimentAssignment
- **Services**: ExperimentService, ExperimentAssignmentService, ExperimentAnalysisService, AbTestingService
- **Resolvers**: ExperimentResolver, ExperimentAssignmentResolver
- **DTOs**: CreateExperimentDto, UpdateExperimentDto, etc.
- **Types**: Various GraphQL types for results and analysis
