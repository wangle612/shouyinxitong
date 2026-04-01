import React from 'react';
import { Route, Routes, HashRouter } from 'react-router-dom';

import Layout from './components/Layout';
import NotFound from './pages/NotFound/NotFound';
import CashierPage from './pages/CashierPage/CashierPage';
import ProductsPage from './pages/ProductsPage/ProductsPage';
import OrdersPage from './pages/OrdersPage/OrdersPage';

const HashRouter = () => {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<CashierPage />} />
        <Route path="products" element={<ProductsPage />} />
        <Route path="orders" element={<OrdersPage />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default RoutesComponent;
