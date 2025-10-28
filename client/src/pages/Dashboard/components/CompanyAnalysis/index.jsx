import React from 'react'
import { useParams } from "react-router-dom";
import MarketCapChart from '@/pages/CompanyAnalysis/components/MarketCapChart';

const CompanyAnalysis = () => {
    const { symbol } = useParams();
  return (
    <div>
      <MarketCapChart symbol={symbol} />
    </div>
  )
}

export default CompanyAnalysis
