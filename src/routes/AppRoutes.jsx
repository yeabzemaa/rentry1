import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider } from '../context/ThemeContext'
import DashboardLayout from '../layouts/DashboardLayout'
import Dashboard from '../pages/Dashboard'
import Analytics from '../pages/Analytics'
import Dispute from '../pages/Dispute'
import Products from '../pages/Products'
import ProductForm from '../pages/ProductForm'
import Sellers from '../pages/Sellers'
import Buyers from '../pages/Buyers'
import Login from '../pages/Login'
import Logout from '../pages/Logout'
import ProtectedRoute from './ProtectedRoute'

export default function AppRoutes() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/logout" element={<Logout />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="products" element={<Products />} />
            <Route path="products/new" element={<ProductForm />} />
            <Route path="products/edit/:id" element={<ProductForm />} />
            <Route path="dispute" element={<Dispute />} />
            <Route path="sellers" element={<Sellers />} />
            <Route path="buyers" element={<Buyers />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  )
}
