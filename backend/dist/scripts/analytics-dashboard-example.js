'use strict';
var __createBinding =
  (this && this.__createBinding) ||
  (Object.create
    ? function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        var desc = Object.getOwnPropertyDescriptor(m, k);
        if (!desc || ('get' in desc ? !m.__esModule : desc.writable || desc.configurable)) {
          desc = {
            enumerable: true,
            get: function () {
              return m[k];
            },
          };
        }
        Object.defineProperty(o, k2, desc);
      }
    : function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        o[k2] = m[k];
      });
var __setModuleDefault =
  (this && this.__setModuleDefault) ||
  (Object.create
    ? function (o, v) {
        Object.defineProperty(o, 'default', { enumerable: true, value: v });
      }
    : function (o, v) {
        o['default'] = v;
      });
var __importStar =
  (this && this.__importStar) ||
  (function () {
    var ownKeys = function (o) {
      ownKeys =
        Object.getOwnPropertyNames ||
        function (o) {
          var ar = [];
          for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
          return ar;
        };
      return ownKeys(o);
    };
    return function (mod) {
      if (mod && mod.__esModule) return mod;
      var result = {};
      if (mod != null)
        for (var k = ownKeys(mod), i = 0; i < k.length; i++)
          if (k[i] !== 'default') __createBinding(result, mod, k[i]);
      __setModuleDefault(result, mod);
      return result;
    };
  })();
Object.defineProperty(exports, '__esModule', { value: true });
const react_1 = __importStar(require('react'));
const client_1 = require('@apollo/client');
const chart_js_1 = require('chart.js');
const react_chartjs_2_1 = require('react-chartjs-2');
chart_js_1.Chart.register(
  chart_js_1.CategoryScale,
  chart_js_1.LinearScale,
  chart_js_1.PointElement,
  chart_js_1.LineElement,
  chart_js_1.BarElement,
  chart_js_1.ArcElement,
  chart_js_1.Title,
  chart_js_1.Tooltip,
  chart_js_1.Legend,
);
const DASHBOARD_OVERVIEW = (0, client_1.gql)`
  query DashboardOverview($period: Int) {
    dashboardOverview(period: $period)
  }
`;
const SEARCH_PERFORMANCE = (0, client_1.gql)`
  query SearchPerformance($period: Int) {
    searchPerformance(period: $period)
  }
`;
const USER_PREFERENCE_ANALYTICS = (0, client_1.gql)`
  query UserPreferenceAnalytics($limit: Int) {
    userPreferenceAnalytics(limit: $limit)
  }
`;
const AB_TESTING_ANALYTICS = (0, client_1.gql)`
  query ABTestingAnalytics {
    abTestingAnalytics
  }
`;
const PERSONALIZATION_EFFECTIVENESS = (0, client_1.gql)`
  query PersonalizationEffectiveness($period: Int) {
    personalizationEffectiveness(period: $period)
  }
`;
const AnalyticsDashboard = () => {
  const [period, setPeriod] = (0, react_1.useState)(30);
  const [activeTab, setActiveTab] = (0, react_1.useState)('overview');
  return (
    <div className="analytics-dashboard">
      <header className="dashboard-header">
        <h1>Avnu Marketplace Analytics</h1>
        <div className="period-selector">
          <label>Time Period:</label>
          <select value={period} onChange={e => setPeriod(parseInt(e.target.value))}>
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
            <option value={180}>Last 180 days</option>
          </select>
        </div>
      </header>

      <nav className="dashboard-nav">
        <ul>
          <li className={activeTab === 'overview' ? 'active' : ''}>
            <button onClick={() => setActiveTab('overview')}>Overview</button>
          </li>
          <li className={activeTab === 'search' ? 'active' : ''}>
            <button onClick={() => setActiveTab('search')}>Search Performance</button>
          </li>
          <li className={activeTab === 'preferences' ? 'active' : ''}>
            <button onClick={() => setActiveTab('preferences')}>User Preferences</button>
          </li>
          <li className={activeTab === 'personalization' ? 'active' : ''}>
            <button onClick={() => setActiveTab('personalization')}>Personalization</button>
          </li>
          <li className={activeTab === 'abtesting' ? 'active' : ''}>
            <button onClick={() => setActiveTab('abtesting')}>A/B Testing</button>
          </li>
        </ul>
      </nav>

      <main className="dashboard-content">
        {activeTab === 'overview' && <DashboardOverview period={period} />}
        {activeTab === 'search' && <SearchPerformance period={period} />}
        {activeTab === 'preferences' && <UserPreferences />}
        {activeTab === 'personalization' && <PersonalizationEffectiveness period={period} />}
        {activeTab === 'abtesting' && <ABTesting />}
      </main>
    </div>
  );
};
const DashboardOverview = ({ period }) => {
  const { loading, error, data } = (0, client_1.useQuery)(DASHBOARD_OVERVIEW, {
    variables: { period },
    fetchPolicy: 'network-only',
  });
  if (loading) return <div className="loading">Loading overview data...</div>;
  if (error) return <div className="error">Error loading overview: {error.message}</div>;
  const overview = data.dashboardOverview;
  return (
    <div className="dashboard-section">
      <h2>Dashboard Overview</h2>

      <div className="metrics-cards">
        <div className="metric-card">
          <h3>Search Conversion Rate</h3>
          <div className="metric-value">
            {(overview.searchMetrics.conversionRate * 100).toFixed(2)}%
          </div>
          <div className="metric-trend">
            {overview.personalizationImpact.conversionImprovement > 0 ? (
              <span className="positive">
                ↑ {overview.personalizationImpact.conversionImprovement.toFixed(2)}%
              </span>
            ) : (
              <span className="negative">
                ↓ {Math.abs(overview.personalizationImpact.conversionImprovement).toFixed(2)}%
              </span>
            )}
          </div>
        </div>

        <div className="metric-card">
          <h3>Click-Through Rate</h3>
          <div className="metric-value">
            {(overview.searchMetrics.clickThroughRate * 100).toFixed(2)}%
          </div>
          <div className="metric-trend">
            {overview.personalizationImpact.clickThroughImprovement > 0 ? (
              <span className="positive">
                ↑ {overview.personalizationImpact.clickThroughImprovement.toFixed(2)}%
              </span>
            ) : (
              <span className="negative">
                ↓ {Math.abs(overview.personalizationImpact.clickThroughImprovement).toFixed(2)}%
              </span>
            )}
          </div>
        </div>

        <div className="metric-card">
          <h3>User Preferences</h3>
          <div className="metric-value">{overview.userPreferenceMetrics.totalUsers}</div>
          <div className="metric-subtitle">Total Users with Preferences</div>
        </div>

        <div className="metric-card">
          <h3>A/B Tests</h3>
          <div className="metric-value">{overview.abTestingSummary.activeTests}</div>
          <div className="metric-subtitle">Active Tests</div>
        </div>
      </div>

      <div className="overview-charts">
        <div className="chart-container">
          <h3>Top Search Queries</h3>
          <react_chartjs_2_1.Bar
            data={{
              labels: overview.searchMetrics.topQueries.map(q => q.query),
              datasets: [
                {
                  label: 'Search Count',
                  data: overview.searchMetrics.topQueries.map(q => q.count),
                  backgroundColor: 'rgba(54, 162, 235, 0.6)',
                },
              ],
            }}
            options={{
              indexAxis: 'y',
              plugins: {
                legend: {
                  display: false,
                },
              },
            }}
          />
        </div>

        <div className="chart-container">
          <h3>Personalized vs Regular Search</h3>
          <react_chartjs_2_1.Pie
            data={{
              labels: ['Personalized', 'Regular'],
              datasets: [
                {
                  data: [
                    overview.searchMetrics.personalizedVsRegular.personalized.searches,
                    overview.searchMetrics.personalizedVsRegular.regular.searches,
                  ],
                  backgroundColor: ['rgba(54, 162, 235, 0.6)', 'rgba(255, 99, 132, 0.6)'],
                },
              ],
            }}
          />
        </div>
      </div>
    </div>
  );
};
const SearchPerformance = ({ period }) => {
  const { loading, error, data } = (0, client_1.useQuery)(SEARCH_PERFORMANCE, {
    variables: { period },
    fetchPolicy: 'network-only',
  });
  if (loading) return <div className="loading">Loading search performance data...</div>;
  if (error) return <div className="error">Error loading search performance: {error.message}</div>;
  const performance = data.searchPerformance;
  return (
    <div className="dashboard-section">
      <h2>Search Performance</h2>

      <div className="metrics-cards">
        <div className="metric-card">
          <h3>Conversion Rate</h3>
          <div className="metric-value">{(performance.conversionRate * 100).toFixed(2)}%</div>
        </div>

        <div className="metric-card">
          <h3>Click-Through Rate</h3>
          <div className="metric-value">{(performance.clickThroughRate * 100).toFixed(2)}%</div>
        </div>
      </div>

      <div className="search-charts">
        <div className="chart-container">
          <h3>Search Metrics Over Time</h3>
          <react_chartjs_2_1.Line
            data={{
              labels: performance.timeSeriesData.map(d => d.date),
              datasets: [
                {
                  label: 'Searches',
                  data: performance.timeSeriesData.map(d => d.searches),
                  borderColor: 'rgba(54, 162, 235, 0.8)',
                  backgroundColor: 'rgba(54, 162, 235, 0.2)',
                  yAxisID: 'y',
                },
                {
                  label: 'Clicks',
                  data: performance.timeSeriesData.map(d => d.clicks),
                  borderColor: 'rgba(255, 99, 132, 0.8)',
                  backgroundColor: 'rgba(255, 99, 132, 0.2)',
                  yAxisID: 'y',
                },
              ],
            }}
            options={{
              scales: {
                y: {
                  type: 'linear',
                  display: true,
                  position: 'left',
                },
              },
            }}
          />
        </div>

        <div className="chart-container">
          <h3>Zero Result Queries</h3>
          <react_chartjs_2_1.Bar
            data={{
              labels: performance.zeroResultQueries.map(q => q.query),
              datasets: [
                {
                  label: 'Search Count',
                  data: performance.zeroResultQueries.map(q => q.count),
                  backgroundColor: 'rgba(255, 99, 132, 0.6)',
                },
              ],
            }}
            options={{
              indexAxis: 'y',
              plugins: {
                legend: {
                  display: false,
                },
              },
            }}
          />
        </div>
      </div>

      <div className="chart-container full-width">
        <h3>NLP vs Regular Search Performance</h3>
        <react_chartjs_2_1.Bar
          data={{
            labels: ['Searches', 'Clicks', 'Conversions', 'Click-Through Rate', 'Conversion Rate'],
            datasets: [
              {
                label: 'NLP Enhanced',
                data: [
                  performance.nlpVsRegular.nlp.searches,
                  performance.nlpVsRegular.nlp.clicks,
                  performance.nlpVsRegular.nlp.conversions,
                  performance.nlpVsRegular.nlp.clickThroughRate * 100,
                  performance.nlpVsRegular.nlp.conversionRate * 100,
                ],
                backgroundColor: 'rgba(54, 162, 235, 0.6)',
              },
              {
                label: 'Regular',
                data: [
                  performance.nlpVsRegular.regular.searches,
                  performance.nlpVsRegular.regular.clicks,
                  performance.nlpVsRegular.regular.conversions,
                  performance.nlpVsRegular.regular.clickThroughRate * 100,
                  performance.nlpVsRegular.regular.conversionRate * 100,
                ],
                backgroundColor: 'rgba(255, 99, 132, 0.6)',
              },
            ],
          }}
        />
      </div>
    </div>
  );
};
const UserPreferences = () => {
  const { loading, error, data } = (0, client_1.useQuery)(USER_PREFERENCE_ANALYTICS, {
    variables: { limit: 10 },
    fetchPolicy: 'network-only',
  });
  if (loading) return <div className="loading">Loading user preference data...</div>;
  if (error) return <div className="error">Error loading user preferences: {error.message}</div>;
  const preferences = data.userPreferenceAnalytics;
  return (
    <div className="dashboard-section">
      <h2>User Preferences</h2>

      <div className="preference-charts">
        <div className="chart-container">
          <h3>Top Categories</h3>
          <react_chartjs_2_1.Bar
            data={{
              labels: preferences.topCategories.map(c => c.name),
              datasets: [
                {
                  label: 'User Count',
                  data: preferences.topCategories.map(c => c.count),
                  backgroundColor: 'rgba(54, 162, 235, 0.6)',
                },
              ],
            }}
            options={{
              indexAxis: 'y',
              plugins: {
                legend: {
                  display: false,
                },
              },
            }}
          />
        </div>

        <div className="chart-container">
          <h3>Top Brands</h3>
          <react_chartjs_2_1.Bar
            data={{
              labels: preferences.topBrands.map(b => b.name),
              datasets: [
                {
                  label: 'User Count',
                  data: preferences.topBrands.map(b => b.count),
                  backgroundColor: 'rgba(255, 99, 132, 0.6)',
                },
              ],
            }}
            options={{
              indexAxis: 'y',
              plugins: {
                legend: {
                  display: false,
                },
              },
            }}
          />
        </div>
      </div>

      <div className="preference-charts">
        <div className="chart-container">
          <h3>Price Range Distribution</h3>
          <react_chartjs_2_1.Line
            data={{
              labels: preferences.priceRangeDistribution
                .filter(p => p.type === 'min')
                .map(p => p.range),
              datasets: [
                {
                  label: 'Min Price',
                  data: preferences.priceRangeDistribution
                    .filter(p => p.type === 'min')
                    .map(p => p.count),
                  borderColor: 'rgba(54, 162, 235, 0.8)',
                  backgroundColor: 'rgba(54, 162, 235, 0.2)',
                },
                {
                  label: 'Max Price',
                  data: preferences.priceRangeDistribution
                    .filter(p => p.type === 'max')
                    .map(p => p.count),
                  borderColor: 'rgba(255, 99, 132, 0.8)',
                  backgroundColor: 'rgba(255, 99, 132, 0.2)',
                },
              ],
            }}
          />
        </div>

        <div className="chart-container">
          <h3>Preference Source</h3>
          <react_chartjs_2_1.Doughnut
            data={{
              labels: ['Survey', 'Behavior', 'Collaborative'],
              datasets: [
                {
                  data: [
                    preferences.preferenceSourceDistribution.survey.count,
                    preferences.preferenceSourceDistribution.behavior.count,
                    preferences.preferenceSourceDistribution.collaborative.count,
                  ],
                  backgroundColor: [
                    'rgba(54, 162, 235, 0.6)',
                    'rgba(255, 99, 132, 0.6)',
                    'rgba(255, 206, 86, 0.6)',
                  ],
                },
              ],
            }}
          />
        </div>
      </div>

      <div className="chart-container full-width">
        <h3>User Interactions Over Time</h3>
        <react_chartjs_2_1.Line
          data={{
            labels: preferences.interactionStats.interactionsOverTime.map(i => i.date),
            datasets: [
              {
                label: 'Interactions',
                data: preferences.interactionStats.interactionsOverTime.map(i => i.count),
                borderColor: 'rgba(54, 162, 235, 0.8)',
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
              },
            ],
          }}
        />
      </div>
    </div>
  );
};
const PersonalizationEffectiveness = ({ period }) => {
  const { loading, error, data } = (0, client_1.useQuery)(PERSONALIZATION_EFFECTIVENESS, {
    variables: { period },
    fetchPolicy: 'network-only',
  });
  if (loading) return <div className="loading">Loading personalization data...</div>;
  if (error) return <div className="error">Error loading personalization: {error.message}</div>;
  const personalization = data.personalizationEffectiveness;
  return (
    <div className="dashboard-section">
      <h2>Personalization Effectiveness</h2>

      <div className="metrics-cards">
        <div className="metric-card">
          <h3>CTR Improvement</h3>
          <div className="metric-value">
            {personalization.improvements.clickThroughImprovementPercentage.toFixed(2)}%
          </div>
          <div className="metric-subtitle">vs. Non-Personalized</div>
        </div>

        <div className="metric-card">
          <h3>Conversion Improvement</h3>
          <div className="metric-value">
            {personalization.improvements.conversionImprovementPercentage.toFixed(2)}%
          </div>
          <div className="metric-subtitle">vs. Non-Personalized</div>
        </div>

        <div className="metric-card">
          <h3>Personalization Rate</h3>
          <div className="metric-value">
            {personalization.personalizationUsage.personalizationRate.toFixed(2)}%
          </div>
          <div className="metric-subtitle">of Total Searches</div>
        </div>

        <div className="metric-card">
          <h3>Collaborative Rate</h3>
          <div className="metric-value">
            {personalization.personalizationUsage.collaborativeRate.toFixed(2)}%
          </div>
          <div className="metric-subtitle">of Personalized Searches</div>
        </div>
      </div>

      <div className="personalization-charts">
        <div className="chart-container">
          <h3>Personalized vs Regular Search</h3>
          <react_chartjs_2_1.Bar
            data={{
              labels: [
                'Searches',
                'Clicks',
                'Conversions',
                'Click-Through Rate',
                'Conversion Rate',
              ],
              datasets: [
                {
                  label: 'Personalized',
                  data: [
                    personalization.personalizedVsRegular.personalized.searches,
                    personalization.personalizedVsRegular.personalized.clicks,
                    personalization.personalizedVsRegular.personalized.conversions,
                    personalization.personalizedVsRegular.personalized.clickThroughRate * 100,
                    personalization.personalizedVsRegular.personalized.conversionRate * 100,
                  ],
                  backgroundColor: 'rgba(54, 162, 235, 0.6)',
                },
                {
                  label: 'Regular',
                  data: [
                    personalization.personalizedVsRegular.regular.searches,
                    personalization.personalizedVsRegular.regular.clicks,
                    personalization.personalizedVsRegular.regular.conversions,
                    personalization.personalizedVsRegular.regular.clickThroughRate * 100,
                    personalization.personalizedVsRegular.regular.conversionRate * 100,
                  ],
                  backgroundColor: 'rgba(255, 99, 132, 0.6)',
                },
              ],
            }}
          />
        </div>

        <div className="chart-container">
          <h3>Personalization Strength Distribution</h3>
          <react_chartjs_2_1.Bar
            data={{
              labels: personalization.personalizationUsage.strengthDistribution.map(s =>
                s.strength.toString(),
              ),
              datasets: [
                {
                  label: 'Search Count',
                  data: personalization.personalizationUsage.strengthDistribution.map(s => s.count),
                  backgroundColor: 'rgba(54, 162, 235, 0.6)',
                },
              ],
            }}
          />
        </div>
      </div>

      <div className="chart-container full-width">
        <h3>Collaborative Filtering Similarity Distribution</h3>
        <react_chartjs_2_1.Bar
          data={{
            labels: personalization.collaborativeFilteringStats.similarityDistribution.map(
              s => s.range,
            ),
            datasets: [
              {
                label: 'User Count',
                data: personalization.collaborativeFilteringStats.similarityDistribution.map(
                  s => s.count,
                ),
                backgroundColor: 'rgba(255, 206, 86, 0.6)',
              },
            ],
          }}
        />
      </div>
    </div>
  );
};
const ABTesting = () => {
  const { loading, error, data } = (0, client_1.useQuery)(AB_TESTING_ANALYTICS, {
    fetchPolicy: 'network-only',
  });
  if (loading) return <div className="loading">Loading A/B testing data...</div>;
  if (error) return <div className="error">Error loading A/B testing: {error.message}</div>;
  const tests = data.abTestingAnalytics;
  return (
    <div className="dashboard-section">
      <h2>A/B Testing</h2>

      {tests.map((test, index) => (
        <div key={test.testId} className="ab-test-card">
          <div className="test-header">
            <h3>{test.testName}</h3>
            <div className="test-status">
              {test.isActive ? (
                <span className="active-badge">Active</span>
              ) : (
                <span className="inactive-badge">Inactive</span>
              )}
            </div>
          </div>

          <div className="test-info">
            <div className="test-dates">
              <div>Started: {new Date(test.startDate).toLocaleDateString()}</div>
              {test.endDate && <div>Ends: {new Date(test.endDate).toLocaleDateString()}</div>}
              <div>Running: {test.runningDays} days</div>
              {test.remainingDays !== null && <div>Remaining: {test.remainingDays} days</div>}
            </div>

            <div className="test-significance">
              {test.hasSignificantResult ? (
                <div className="significant">Statistically Significant Results</div>
              ) : (
                <div className="not-significant">No Significant Results Yet</div>
              )}
            </div>
          </div>

          <div className="test-metrics">
            <h4>Overall Metrics</h4>
            <div className="metrics-grid">
              <div className="metric">
                <div className="metric-label">Searches</div>
                <div className="metric-value">{test.overall.searches}</div>
              </div>
              <div className="metric">
                <div className="metric-label">Clicks</div>
                <div className="metric-value">{test.overall.clicks}</div>
              </div>
              <div className="metric">
                <div className="metric-label">Conversions</div>
                <div className="metric-value">{test.overall.conversions}</div>
              </div>
              <div className="metric">
                <div className="metric-label">CTR</div>
                <div className="metric-value">
                  {(test.overall.clickThroughRate * 100).toFixed(2)}%
                </div>
              </div>
              <div className="metric">
                <div className="metric-label">CVR</div>
                <div className="metric-value">
                  {(test.overall.conversionRate * 100).toFixed(2)}%
                </div>
              </div>
            </div>
          </div>

          <div className="variant-comparison">
            <h4>Variant Comparison</h4>
            <div className="chart-container">
              <react_chartjs_2_1.Bar
                data={{
                  labels: test.variants.map(v => v.variantId),
                  datasets: [
                    {
                      label: 'Click-Through Rate',
                      data: test.variants.map(v => v.metrics.clickThroughRate * 100),
                      backgroundColor: 'rgba(54, 162, 235, 0.6)',
                      yAxisID: 'y',
                    },
                    {
                      label: 'Conversion Rate',
                      data: test.variants.map(v => v.metrics.conversionRate * 100),
                      backgroundColor: 'rgba(255, 99, 132, 0.6)',
                      yAxisID: 'y',
                    },
                  ],
                }}
                options={{
                  scales: {
                    y: {
                      type: 'linear',
                      display: true,
                      position: 'left',
                      title: {
                        display: true,
                        text: 'Rate (%)',
                      },
                    },
                  },
                }}
              />
            </div>

            <div className="improvements-table">
              <h4>Improvements vs Control</h4>
              <table>
                <thead>
                  <tr>
                    <th>Variant</th>
                    <th>CTR Improvement</th>
                    <th>CVR Improvement</th>
                    <th>Significant</th>
                  </tr>
                </thead>
                <tbody>
                  {test.variants
                    .filter(v => v.variantId !== 'control')
                    .map(variant => (
                      <tr key={variant.variantId}>
                        <td>{variant.variantId}</td>
                        <td
                          className={
                            variant.improvements.clickThroughRate > 0 ? 'positive' : 'negative'
                          }
                        >
                          {variant.improvements.clickThroughRate > 0 ? '+' : ''}
                          {variant.improvements.clickThroughRate.toFixed(2)}%
                        </td>
                        <td
                          className={
                            variant.improvements.conversionRate > 0 ? 'positive' : 'negative'
                          }
                        >
                          {variant.improvements.conversionRate > 0 ? '+' : ''}
                          {variant.improvements.conversionRate.toFixed(2)}%
                        </td>
                        <td>
                          {variant.isSignificant ? (
                            <span className="significant-badge">Yes</span>
                          ) : (
                            <span className="not-significant-badge">No</span>
                          )}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
exports.default = AnalyticsDashboard;
//# sourceMappingURL=analytics-dashboard-example.js.map
