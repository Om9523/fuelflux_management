"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { 
  Users, AlertCircle, TrendingUp, Droplets, Smile, Clock, 
  Activity, Star, CheckCircle, Ticket 
} from 'lucide-react';
import Link from 'next/link';
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell 
} from 'recharts';

const monthlyRevenue = [
  { name: 'Jan', revenue: 45000 },
  { name: 'Feb', revenue: 52000 },
  { name: 'Mar', revenue: 48000 },
  { name: 'Apr', revenue: 61000 },
  { name: 'May', revenue: 59000 },
  { name: 'Jun', revenue: 67000 },
];

const customerSatisfaction = [
  { name: 'Satisfied', value: 78, color: '#22c55e' },
  { name: 'Neutral', value: 15, color: '#eab308' },
  { name: 'Dissatisfied', value: 7, color: '#ef4444' },
];

const recentActivities = [
  { id: 1, type: 'registration', text: 'New customer "Acme Logistics" registered', time: '10 mins ago', icon: Users, color: 'text-blue-500', bg: 'bg-blue-50' },
  { id: 2, type: 'complaint', text: 'Ticket #4429 opened: Delayed delivery', time: '1 hour ago', icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-50' },
  { id: 3, type: 'order', text: 'Order #8921 delivered successfully', time: '2 hours ago', icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-50' },
  { id: 4, type: 'feedback', text: '5-star rating received from "John Doe"', time: '3 hours ago', icon: Star, color: 'text-yellow-500', bg: 'bg-yellow-50' },
];

const topBuyers = [
  { id: 1, name: 'Global Transports', volume: '12,500 L', revenue: '₹12,50,000' },
  { id: 2, name: 'City Cabs Co.', volume: '8,200 L', revenue: '₹8,20,000' },
  { id: 3, name: 'Metro Logistics', volume: '6,400 L', revenue: '₹6,40,000' },
];

export default function CRMDashboard() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">CRM Dashboard</h1>
          <p className="text-sm text-gray-500">Customer Relationship Management Overview</p>
        </div>
        <button className="btn-primary">Generate Report</button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Link href="/admin/customers" className="block">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="stat-card h-full cursor-pointer hover:border-orange-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-500 mb-1">Total Customers</p>
                <h3 className="text-2xl font-bold text-gray-900">2,451</h3>
              </div>
              <div className="stat-card-icon bg-blue-50 text-blue-500">
                <Users className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-4 text-xs font-medium text-green-600 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> +12% this month
            </div>
          </motion.div>
        </Link>

        <Link href="/admin/crm/fuel-requests" className="block">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="stat-card h-full cursor-pointer hover:border-orange-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-500 mb-1">Active Requests</p>
                <h3 className="text-2xl font-bold text-gray-900">184</h3>
              </div>
              <div className="stat-card-icon bg-orange-50 text-orange-500">
                <Droplets className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-4 text-xs font-medium text-orange-600 flex items-center gap-1">
              <Activity className="w-3 h-3" /> Processing normally
            </div>
          </motion.div>
        </Link>

        <Link href="/admin/crm/complaints" className="block">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="stat-card h-full cursor-pointer hover:border-orange-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-500 mb-1">Pending Complaints</p>
                <h3 className="text-2xl font-bold text-gray-900">12</h3>
              </div>
              <div className="stat-card-icon bg-red-50 text-red-500">
                <AlertCircle className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-4 text-xs font-medium text-red-600 flex items-center gap-1">
              <Clock className="w-3 h-3" /> 3 require immediate action
            </div>
          </motion.div>
        </Link>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-500 mb-1">Customer Satisfaction</p>
              <h3 className="text-2xl font-bold text-gray-900">92%</h3>
            </div>
            <div className="stat-card-icon bg-green-50 text-green-500">
              <Smile className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 text-xs font-medium text-green-600 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> +2% from last month
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Trend */}
        <div className="lg:col-span-2 card p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Revenue Analytics</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyRevenue}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#737373' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#737373' }} tickFormatter={(value) => `₹${value / 1000}k`} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}
                  formatter={(value) => [`₹${value}`, 'Revenue']}
                />
                <Line type="monotone" dataKey="revenue" stroke="#f97316" strokeWidth={3} dot={{ r: 4, fill: '#f97316', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Satisfaction Pie Chart */}
        <div className="card p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Satisfaction Ratio</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={customerSatisfaction}
                  innerRadius={70}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {customerSatisfaction.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-4 mt-2">
            {customerSatisfaction.map((entry) => (
              <div key={entry.name} className="flex items-center gap-2 text-xs font-semibold">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }}></span>
                <span className="text-gray-600">{entry.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activities */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900">CRM Timeline</h3>
            <Link href="/admin/crm/communication-logs" className="text-sm font-semibold text-orange-500 hover:text-orange-600">View All</Link>
          </div>
          <div className="space-y-6">
            {recentActivities.map((activity) => {
              const Icon = activity.icon;
              return (
                <div key={activity.id} className="flex gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${activity.bg} ${activity.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{activity.text}</p>
                    <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Buyers */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900">Top Corporate Customers</h3>
            <Link href="/admin/customers" className="text-sm font-semibold text-orange-500 hover:text-orange-600">Full List</Link>
          </div>
          <div className="space-y-4">
            {topBuyers.map((buyer) => (
              <div key={buyer.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600 font-bold">
                    {buyer.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 text-sm">{buyer.name}</h4>
                    <p className="text-xs text-gray-500">Volume: {buyer.volume}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900">{buyer.revenue}</p>
                  <p className="text-xs text-green-600 font-medium">Active</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
