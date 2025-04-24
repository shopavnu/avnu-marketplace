import Head from 'next/head';
import MerchantLayout from '@/components/merchant/MerchantLayout';
import AnalyticsDashboard from '@/components/merchant/analytics/AnalyticsDashboard';

const AnalyticsPage = () => {
  return (
    <>
      <Head>
        <title>Analytics | Merchant Portal | av|nu</title>
        <meta name="description" content="View your store analytics on av|nu marketplace" />
      </Head>
      
      <MerchantLayout>
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="sm:flex sm:items-center sm:justify-between mb-6">
            <h1 className="text-2xl font-semibold text-gray-900">Analytics Dashboard</h1>
          </div>
          
          <AnalyticsDashboard />
        </div>
      </MerchantLayout>
    </>
  );
};

export default AnalyticsPage;
