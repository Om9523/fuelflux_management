"use client";
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, MoreVertical, Mail, Phone, ExternalLink } from 'lucide-react';
import Link from 'next/link';

const DUMMY_CUSTOMERS = [
  { id: 'CUST-001', name: 'Acme Logistics', type: 'Corporate', email: 'contact@acme.com', phone: '+91 9876543210', status: 'Active', totalOrders: 142, spent: '₹14,50,000' },
  { id: 'CUST-002', name: 'John Doe', type: 'Individual', email: 'john.doe@gmail.com', phone: '+91 9876543211', status: 'Active', totalOrders: 12, spent: '₹24,000' },
  { id: 'CUST-003', name: 'City Cabs Co.', type: 'Corporate', email: 'fleet@citycabs.in', phone: '+91 9876543212', status: 'Inactive', totalOrders: 89, spent: '₹8,20,000' },
  { id: 'CUST-004', name: 'Sarah Smith', type: 'Individual', email: 'sarah.s@outlook.com', phone: '+91 9876543213', status: 'Active', totalOrders: 5, spent: '₹12,500' },
  { id: 'CUST-005', name: 'Metro Transports', type: 'Corporate', email: 'ops@metrotrans.com', phone: '+91 9876543214', status: 'Active', totalOrders: 210, spent: '₹22,10,000' },
];

export default function CustomerManagement() {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCustomers = DUMMY_CUSTOMERS.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Customer Management</h1>
          <p className="text-sm text-gray-500">View and manage all registered customers</p>
        </div>
        <button className="btn-primary">Add Customer</button>
      </div>

      <div className="card overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-white">
          <div className="relative w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search by name or ID..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:border-orange-500 focus:bg-white focus:outline-none transition-colors"
            />
          </div>
          <button className="flex items-center gap-2 text-sm font-semibold text-gray-600 bg-gray-50 px-4 py-2 rounded-lg hover:bg-gray-100">
            <Filter className="w-4 h-4" /> Filter
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="table-base w-full">
            <thead>
              <tr>
                <th>Customer ID</th>
                <th>Name</th>
                <th>Type</th>
                <th>Contact</th>
                <th>Total Orders</th>
                <th>Total Spent</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.map((customer, idx) => (
                <motion.tr 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  key={customer.id}
                >
                  <td className="font-semibold text-gray-900">{customer.id}</td>
                  <td className="font-bold text-gray-900">{customer.name}</td>
                  <td>
                    <span className={`badge ${customer.type === 'Corporate' ? 'badge-blue' : 'badge-gray'}`}>
                      {customer.type}
                    </span>
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <button className="text-gray-400 hover:text-orange-500"><Mail className="w-4 h-4" /></button>
                      <button className="text-gray-400 hover:text-orange-500"><Phone className="w-4 h-4" /></button>
                    </div>
                  </td>
                  <td className="font-semibold">{customer.totalOrders}</td>
                  <td className="font-bold text-gray-900">{customer.spent}</td>
                  <td>
                    <span className={`badge ${customer.status === 'Active' ? 'badge-green' : 'badge-red'}`}>
                      {customer.status}
                    </span>
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <Link href={`/admin/customers/${customer.id}`} className="p-2 text-gray-400 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition-colors">
                        <ExternalLink className="w-4 h-4" />
                      </Link>
                      <button className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
          {filteredCustomers.length === 0 && (
            <div className="p-12 text-center text-gray-500">
              No customers found matching your search.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
