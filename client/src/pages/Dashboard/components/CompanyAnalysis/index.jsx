import React from 'react'
import MarketCapChart from '@/pages/Dashboard/components/CompanyAnalysis/component/MarketCapChart';
import TotalAssetChart from '@/pages/Dashboard/components/CompanyAnalysis/component/TotalAssetChart';
import ShareHolderChart from '@/pages/Dashboard/components/CompanyAnalysis/component/ShareHolderChart';
import TotalDebtChart from '@/pages/Dashboard/components/CompanyAnalysis/component/TotalDebtChart';
import IncomeReport from '@/pages/Dashboard/components/CompanyAnalysis/component/IncomeReport';
import CashFlow from '@/pages/Dashboard/components/CompanyAnalysis/component/CashFlow';

const CompanyAnalysis = ({symbol}) => {
  return (
    <div>
      <MarketCapChart symbol={symbol} />
      <TotalAssetChart symbol={symbol} />
      <ShareHolderChart symbol={symbol} />
      <TotalDebtChart symbol={symbol} />
      <IncomeReport symbol={symbol} />
      <CashFlow symbol={symbol} />
    </div>
  )
}

export default CompanyAnalysis
