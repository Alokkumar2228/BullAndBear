// pages/Dashboard/index.js
import React, { useContext } from 'react';
import TopBar from '@/pages/Dashboard/components/TopBar';
import DashboardContent from '@/pages/Dashboard/components/Dashboard';
import { ContextApi } from '@/context/ContextApi';

const DashboardLayout = () => {
  const {user} = useContext(ContextApi);
  return (
    <>
      <TopBar user={user} />
      <DashboardContent user={user} />
    </>
  );
};

export default DashboardLayout;
