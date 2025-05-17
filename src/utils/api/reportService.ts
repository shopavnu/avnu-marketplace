import { v4 as uuidv4 } from 'uuid';
import { ProductReport, ReportStatus, ReportReason, ReportAction, MerchantReportSummary } from '../../types/report';

// Mock data for development
const mockReports: ProductReport[] = [
  {
    id: 'report-1',
    productId: 'prod-1',
    productName: 'Counterfeit Designer Bag',
    productImage: '/images/products/bag1.jpg',
    merchantId: 'merch-1',
    merchantName: 'Fashion Finds',
    reporterEmail: 'customer@example.com',
    reason: 'counterfeit',
    description: 'This appears to be a counterfeit version of a designer bag.',
    status: 'pending',
    dateReported: new Date(2025, 4, 12).toISOString(),
  },
  {
    id: 'report-2',
    productId: 'prod-2',
    productName: 'Prohibited Substance',
    productImage: '/images/products/item2.jpg',
    merchantId: 'merch-1',
    merchantName: 'Fashion Finds',
    reporterEmail: 'shopper@example.com',
    reason: 'prohibited_item',
    description: 'This product appears to contain a prohibited substance.',
    status: 'pending',
    dateReported: new Date(2025, 4, 14).toISOString(),
  },
  {
    id: 'report-3',
    productId: 'prod-3',
    productName: 'Mislabeled Food Product',
    productImage: '/images/products/food1.jpg',
    merchantId: 'merch-2',
    merchantName: 'Gourmet Eats',
    reporterEmail: 'foodie@example.com',
    reason: 'misleading_description',
    description: 'The product description claims it is organic, but nothing on the packaging indicates this.',
    status: 'reviewed',
    dateReported: new Date(2025, 4, 10).toISOString(),
    reviewDate: new Date(2025, 4, 11).toISOString(),
    reviewedBy: 'admin@avnu.com',
    action: 'deactivate_product',
    actionNotes: 'Product has been deactivated due to misleading description. Merchant has been notified.',
  },
  {
    id: 'report-4',
    productId: 'prod-4',
    productName: 'Safety Hazard Toy',
    productImage: '/images/products/toy1.jpg',
    merchantId: 'merch-3',
    merchantName: 'Kids Zone',
    reporterEmail: 'parent@example.com',
    reason: 'safety_concern',
    description: 'This toy has small parts that could be a choking hazard but is not labeled as such.',
    status: 'pending',
    dateReported: new Date(2025, 4, 15).toISOString(),
  },
  {
    id: 'report-5',
    productId: 'prod-5',
    productName: 'Offensive T-Shirt',
    productImage: '/images/products/shirt1.jpg',
    merchantId: 'merch-4',
    merchantName: 'Trendy Tees',
    reporterEmail: 'buyer@example.com',
    reason: 'inappropriate_content',
    description: 'This shirt contains offensive text and imagery.',
    status: 'reviewed',
    dateReported: new Date(2025, 4, 8).toISOString(),
    reviewDate: new Date(2025, 4, 9).toISOString(),
    reviewedBy: 'admin@avnu.com',
    action: 'dismiss',
    actionNotes: 'Reviewed product and determined it does not violate marketplace policies.',
  },
];

// Service methods for product reports
const reportService = {
  // Get all reports with optional filters
  getReports: async (filters?: { 
    status?: ReportStatus, 
    merchantId?: string,
    productId?: string,
    reason?: ReportReason
  }): Promise<ProductReport[]> => {
    // In a real implementation, this would make an API call
    let filteredReports = [...mockReports];
    
    if (filters) {
      if (filters.status) {
        filteredReports = filteredReports.filter(report => report.status === filters.status);
      }
      if (filters.merchantId) {
        filteredReports = filteredReports.filter(report => report.merchantId === filters.merchantId);
      }
      if (filters.productId) {
        filteredReports = filteredReports.filter(report => report.productId === filters.productId);
      }
      if (filters.reason) {
        filteredReports = filteredReports.filter(report => report.reason === filters.reason);
      }
    }
    
    // Sort by date reported, newest first
    return filteredReports.sort((a, b) => 
      new Date(b.dateReported).getTime() - new Date(a.dateReported).getTime()
    );
  },
  
  // Get a specific report by ID
  getReportById: async (id: string): Promise<ProductReport | null> => {
    // In a real implementation, this would make an API call
    const report = mockReports.find(report => report.id === id);
    return report || null;
  },
  
  // Create a new report
  createReport: async (reportData: Omit<ProductReport, 'id' | 'status' | 'dateReported'>): Promise<ProductReport> => {
    // In a real implementation, this would make an API call
    const newReport: ProductReport = {
      id: uuidv4(),
      ...reportData,
      status: 'pending',
      dateReported: new Date().toISOString(),
    };
    
    // In a real implementation, this would be saved to the database
    mockReports.push(newReport);
    
    return newReport;
  },
  
  // Update report status and action
  updateReportStatus: async (
    reportId: string, 
    status: ReportStatus, 
    action?: ReportAction,
    actionNotes?: string
  ): Promise<ProductReport> => {
    // In a real implementation, this would make an API call
    const reportIndex = mockReports.findIndex(report => report.id === reportId);
    
    if (reportIndex === -1) {
      throw new Error('Report not found');
    }
    
    const updatedReport = {
      ...mockReports[reportIndex],
      status,
      action,
      actionNotes,
      reviewDate: new Date().toISOString(),
      reviewedBy: 'admin@avnu.com', // In a real app, this would be the current user
    };
    
    // In a real implementation, this would update the database
    mockReports[reportIndex] = updatedReport;
    
    return updatedReport;
  },
  
  // Deactivate a product
  deactivateProduct: async (productId: string, reason: string): Promise<boolean> => {
    // In a real implementation, this would make an API call to deactivate the product
    console.log(`Product ${productId} deactivated for reason: ${reason}`);
    return true;
  },
  
  // Deactivate a merchant
  deactivateMerchant: async (merchantId: string, reason: string): Promise<boolean> => {
    // In a real implementation, this would make an API call to deactivate the merchant
    console.log(`Merchant ${merchantId} deactivated for reason: ${reason}`);
    return true;
  },
  
  // Get report summaries grouped by merchant
  getMerchantReportSummaries: async (): Promise<MerchantReportSummary[]> => {
    // In a real implementation, this would make an API call
    
    // Group reports by merchant ID
    const merchantMap = new Map<string, { 
      merchantName: string, 
      reports: ProductReport[] 
    }>();
    
    mockReports.forEach(report => {
      if (!merchantMap.has(report.merchantId)) {
        merchantMap.set(report.merchantId, { 
          merchantName: report.merchantName, 
          reports: []
        });
      }
      
      merchantMap.get(report.merchantId)?.reports.push(report);
    });
    
    // Generate summary for each merchant
    const summaries: MerchantReportSummary[] = [];
    
    merchantMap.forEach((value, merchantId) => {
      const reports = value.reports;
      const summary: MerchantReportSummary = {
        merchantId,
        merchantName: value.merchantName,
        totalReports: reports.length,
        pendingReports: reports.filter(r => r.status === 'pending').length,
        actionedReports: reports.filter(r => r.status === 'actioned').length,
        dismissedReports: reports.filter(r => r.status === 'dismissed').length,
      };
      
      summaries.push(summary);
    });
    
    // Sort by total reports (descending)
    return summaries.sort((a, b) => b.totalReports - a.totalReports);
  },
};

export default reportService;
