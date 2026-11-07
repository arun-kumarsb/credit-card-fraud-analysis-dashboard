import React, { useState } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { Header, DateRangeOption, DATE_RANGES } from './components/layout/Header';
import { ExecutiveOverviewPage } from './pages/ExecutiveOverviewPage';
import { TransactionsExplorerPage } from './pages/TransactionsExplorerPage';
import { CustomerAnalyticsPage } from './pages/CustomerAnalyticsPage';
import { CardsPortfolioPage } from './pages/CardsPortfolioPage';
import { MerchantEcosystemPage } from './pages/MerchantEcosystemPage';
import { MLPredictorPage } from './pages/MLPredictorPage';
import { DataQualityPage } from './pages/DataQualityPage';

export function App() {
  const [currentTab, setCurrentTab] = useState<string>('overview');
  const [refreshKey, setRefreshKey] = useState<number>(0);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [selectedRange, setSelectedRange] = useState<DateRangeOption>(DATE_RANGES[0]);
  const [globalSearchQuery, setGlobalSearchQuery] = useState<string>('');

  const handleRefresh = () => {
    setIsRefreshing(true);
    setRefreshKey((prev) => prev + 1);
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const handleDateRangeChange = (range: DateRangeOption) => {
    setSelectedRange(range);
    setRefreshKey((prev) => prev + 1);
  };

  const handleSearchSubmit = (query: string) => {
    setGlobalSearchQuery(query);
    setCurrentTab('transactions');
    setRefreshKey((prev) => prev + 1);
  };

  const getPageMeta = (tab: string) => {
    switch (tab) {
      case 'overview':
        return {
          title: 'Executive Fraud Analytics Overview',
          subtitle: 'Holistic portfolio surveillance, loss shares, and temporal anomaly matrices',
        };
      case 'transactions':
        return {
          title: 'Transactions Explorer & Ledger Stream',
          subtitle: 'Searchable, filterable ledger across 250,000 verified transaction records',
        };
      case 'customers':
        return {
          title: 'Customer Demographics & Portfolio Risk',
          subtitle: 'Demographic cohorts, income covariance, and occupational vulnerabilities',
        };
      case 'cards':
        return {
          title: 'Cards Portfolio & Lifecycle Surveillance',
          subtitle: 'Network shares, credit limits, tokenization modes, and operational status',
        };
      case 'merchants':
        return {
          title: 'Merchant Ecosystem & Risk Matrix',
          subtitle: '15 Category exposure curves, merchant ratings, and high-risk watchlists',
        };
      case 'predictor':
        return {
          title: 'Custom Transaction Fraud Predictor (ML)',
          subtitle: 'Predictive Inference Architecture — Scheduled for Phase 2 Deployment',
        };
      case 'quality':
        return {
          title: 'Data Quality & Pipeline Integrity Audit',
          subtitle: 'Transformation verification, cleaning audit trails, and 100% record retention proof',
        };
      default:
        return {
          title: 'SentinelShield Dashboard',
          subtitle: 'Fraud Analytics & Detection Suite',
        };
    }
  };

  const meta = getPageMeta(currentTab);

  const renderContent = () => {
    switch (currentTab) {
      case 'overview':
        return (
          <ExecutiveOverviewPage
            key={refreshKey}
            startDate={selectedRange.startDate}
            endDate={selectedRange.endDate}
          />
        );
      case 'transactions':
        return (
          <TransactionsExplorerPage
            key={refreshKey}
            initialSearch={globalSearchQuery}
            startDate={selectedRange.startDate}
            endDate={selectedRange.endDate}
          />
        );
      case 'customers':
        return (
          <CustomerAnalyticsPage
            key={refreshKey}
            startDate={selectedRange.startDate}
            endDate={selectedRange.endDate}
          />
        );
      case 'cards':
        return (
          <CardsPortfolioPage
            key={refreshKey}
            startDate={selectedRange.startDate}
            endDate={selectedRange.endDate}
          />
        );
      case 'merchants':
        return (
          <MerchantEcosystemPage
            key={refreshKey}
            startDate={selectedRange.startDate}
            endDate={selectedRange.endDate}
          />
        );
      case 'predictor':
        return <MLPredictorPage key={refreshKey} />;
      case 'quality':
        return <DataQualityPage key={refreshKey} />;
      default:
        return (
          <ExecutiveOverviewPage
            key={refreshKey}
            startDate={selectedRange.startDate}
            endDate={selectedRange.endDate}
          />
        );
    }
  };

  return (
    <div className="flex h-screen bg-canvas overflow-hidden">
      {/* Sidebar Navigation */}
      <Sidebar currentTab={currentTab} onTabChange={setCurrentTab} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header
          title={meta.title}
          subtitle={meta.subtitle}
          onRefresh={handleRefresh}
          isRefreshing={isRefreshing}
          selectedRangeId={selectedRange.id}
          onDateRangeChange={handleDateRangeChange}
          onSearchSubmit={handleSearchSubmit}
        />

        <main className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
          <div className="max-w-[1600px] mx-auto">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
