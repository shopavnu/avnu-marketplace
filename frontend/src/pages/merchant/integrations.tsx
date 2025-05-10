import { NextPage } from 'next';
import Head from 'next/head';
import MerchantLayout from '@/components/merchant/MerchantLayout';
import PlatformIntegrationSettings from '@/components/integrations/PlatformIntegrationSettings';

const MerchantIntegrations: NextPage = () => {
  return (
    <>
      <Head>
        <title>Platform Integrations | av|nu Marketplace</title>
        <meta name="description" content="Manage your platform integrations for av|nu marketplace" />
      </Head>
      
      <MerchantLayout>
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="sm:flex sm:items-center sm:justify-between mb-6">
            <h1 className="text-2xl font-semibold text-gray-900">Platform Integrations</h1>
          </div>
          
          <div className="bg-white shadow rounded-lg p-6">
            <p className="text-gray-700 mb-6">
              Connect your Shopify store to automatically sync products, inventory, and orders with av|nu marketplace.
            </p>
            
            <PlatformIntegrationSettings />
          </div>
        </div>
      </MerchantLayout>
    </>
  );
};

export default MerchantIntegrations;
