import React, { useState } from 'react';
import Layout from './components/Layout';
import OrderForm from './components/OrderForm';
import OrderList from './components/OrderList';

export default function App() {
  return (
    <Layout>
      <OrderList />
    </Layout>
  );
}
