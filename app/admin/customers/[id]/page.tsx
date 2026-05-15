"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, Mail, Phone, MapPin, Building, Calendar, 
  CreditCard, TrendingUp, Droplets, Clock, FileText, CheckCircle2 
} from 'lucide-react';
import Link from 'next/link';

export default function CustomerDetails({ params }: { params: { id: string } }) {
  // Mock customer data
  const customer = {
    id: params.id,
    name: 'Acme Logistics',
    type: 'Corporate',
    email: 'contact@acme.com',
    phone: '+91 9876543210',
    address: '123 Business Park, Phase 2, Bangalore, 560001',
    joinedDate: '2022-04-15',
    status: 'Active',
    metrics: {
      totalOrders: 142,
      totalSpent: '₹14,50,000',
      totalVolume: '18,200 L',
      loyaltyPoints: 4500
    }
  };

  const recentOrders = [
    { id: 'ORD-8921', date: '2023-10-25', volume: '150 L', amount: '₹14,250', status: 'Completed' },
    { id: 'ORD-8910', date: '2023-10-22', volume: '200 L', amount: '₹19,000', status: 'Completed' },
    { id: 'ORD-8895', date: '2023-10-18', volume: '100 L', amount: '₹9,500', status: 'Completed' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/customers" className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-500 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">{customer.name}</h1>
            <span className={`badge ${customer.status === 'Active' ? 'badge-green' : 'badge-red'}`}>
              {customer.status}
            </span>
            <span className={`badge ${customer.type === 'Corporate' ? 'badge-blue' : 'badge-gray'}`}>
              {customer.type}
            </span>
          </div>
          <p className="text-sm text-gray-500">Customer ID: {customer.id}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Details */}
        <div className="space-y-6">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 border-b border-gray-100 pb-2">Contact Information</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500 font-semibold uppercase">Email</p>
                  <p className="text-sm font-medium text-gray-900">{customer.email}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500 font-semibold uppercase">Phone</p>
                  <p className="text-sm font-medium text-gray-900">{customer.phone}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500 font-semibold uppercase">Address</p>
                  <p className="text-sm font-medium text-gray-900">{customer.address}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500 font-semibold uppercase">Customer Since</p>
                  <p className="text-sm font-medium text-gray-900">{new Date(customer.joinedDate).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 border-b border-gray-100 pb-2">CRM Actions</h3>
            <div className="space-y-3">
              <button className="w-full btn-primary flex items-center justify-center gap-2">
                <Mail className="w-4 h-4" /> Send Message
              </button>
              <button className="w-full btn-secondary flex items-center justify-center gap-2">
                <FileText className="w-4 h-4" /> Generate Statement
              </button>
            </div>
          </motion.div>
        </div>

        {/* Right Column - Metrics & History */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="stat-card p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold text-gray-500">Total Spent</p>
                <CreditCard className="w-4 h-4 text-orange-500" />
              </div>
              <p className="text-xl font-bold text-gray-900">{customer.metrics.totalSpent}</p>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="stat-card p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold text-gray-500">Volume</p>
                <Droplets className="w-4 h-4 text-blue-500" />
              </div>
              <p className="text-xl font-bold text-gray-900">{customer.metrics.totalVolume}</p>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="stat-card p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold text-gray-500">Orders</p>
                <TrendingUp className="w-4 h-4 text-green-500" />
              </div>
              <p className="text-xl font-bold text-gray-900">{customer.metrics.totalOrders}</p>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="stat-card p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold text-gray-500">Loyalty</p>
                <Star className="w-4 h-4 text-yellow-500" />
              </div>
              <p className="text-xl font-bold text-gray-900">{customer.metrics.loyaltyPoints}</p>
            </motion.div>
          </div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="card overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-white">
              <h3 className="text-lg font-bold text-gray-900">Recent Orders</h3>
              <Link href={`/admin/orders?customer=${customer.id}`} className="text-sm font-semibold text-orange-500 hover:text-orange-600">
                View All
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="table-base w-full">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Date</th>
                    <th>Volume</th>
                    <th>Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => (
                    <tr key={order.id}>
                      <td className="font-semibold text-gray-900">{order.id}</td>
                      <td>{new Date(order.date).toLocaleDateString()}</td>
                      <td>{order.volume}</td>
                      <td className="font-bold">{order.amount}</td>
                      <td>
                        <span className={`badge ${order.status === 'Completed' ? 'badge-green' : 'badge-orange'}`}>
                          {order.status === 'Completed' ? <CheckCircle2 className="w-3 h-3"/> : <Clock className="w-3 h-3"/>}
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
