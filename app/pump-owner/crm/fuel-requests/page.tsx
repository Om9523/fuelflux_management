"use client";
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Droplets, CheckCircle2, Clock, MapPin, Truck } from 'lucide-react';

const DUMMY_REQUESTS = [
  { id: 'REQ-1001', customer: 'Global Transports', type: 'Diesel', volume: '500 L', location: 'Hosur Road Depot', requiredBy: '2023-10-26T14:00:00Z', status: 'Assigned', assignee: 'Truck #42 (Rajesh)' },
  { id: 'REQ-1002', customer: 'Acme Logistics', type: 'Petrol', volume: '100 L', location: 'Indiranagar Phase 1', requiredBy: '2023-10-25T18:00:00Z', status: 'Pending', assignee: 'Unassigned' },
  { id: 'REQ-1003', customer: 'City Cabs Co.', type: 'CNG', volume: '200 Kg', location: 'Koramangala Block 3', requiredBy: '2023-10-25T12:00:00Z', status: 'In Progress', assignee: 'Truck #18 (Suresh)' },
  { id: 'REQ-1004', customer: 'Metro Transports', type: 'Diesel', volume: '1200 L', location: 'Peenya Industrial Area', requiredBy: '2023-10-24T10:00:00Z', status: 'Delivered', assignee: 'Truck #55 (Kumar)' },
];

export default function FuelRequests() {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredRequests = DUMMY_REQUESTS.filter(r => 
    r.customer.toLowerCase().includes(searchTerm.toLowerCase()) || 
    r.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Fuel Requests Management</h1>
          <p className="text-sm text-gray-500">Track and assign bulk and emergency fuel delivery requests</p>
        </div>
        <button className="btn-primary flex items-center gap-2">
          <Droplets className="w-4 h-4" /> New Request
        </button>
      </div>

      <div className="card overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-white">
          <div className="relative w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search requests..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:border-orange-500 focus:bg-white focus:outline-none transition-colors"
            />
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 text-sm font-semibold text-gray-600 bg-gray-50 px-4 py-2 rounded-lg hover:bg-gray-100">
              <Filter className="w-4 h-4" /> Filter
            </button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="table-base w-full">
            <thead>
              <tr>
                <th>Request ID</th>
                <th>Customer</th>
                <th>Fuel Details</th>
                <th>Location</th>
                <th>Required By</th>
                <th>Assignee</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.map((req, idx) => (
                <motion.tr 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  key={req.id}
                >
                  <td className="font-semibold text-gray-900">{req.id}</td>
                  <td className="font-bold text-gray-900">{req.customer}</td>
                  <td>
                    <div className="flex items-center gap-1 font-semibold">
                      <Droplets className={`w-3 h-3 ${req.type === 'Diesel' ? 'text-blue-500' : req.type === 'Petrol' ? 'text-orange-500' : 'text-green-500'}`} />
                      {req.volume} {req.type}
                    </div>
                  </td>
                  <td className="text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-gray-400" /> {req.location}
                    </div>
                  </td>
                  <td>{new Date(req.requiredBy).toLocaleString()}</td>
                  <td className="text-sm">
                    <div className="flex items-center gap-1 font-medium text-gray-700">
                      <Truck className="w-3 h-3 text-gray-400" /> {req.assignee}
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${
                      req.status === 'Delivered' ? 'badge-green' : 
                      req.status === 'Pending' ? 'badge-red' : 
                      req.status === 'Assigned' ? 'badge-blue' : 'badge-orange'
                    }`}>
                      {req.status === 'Delivered' ? <CheckCircle2 className="w-3 h-3"/> : <Clock className="w-3 h-3"/>}
                      {req.status}
                    </span>
                  </td>
                  <td>
                    {req.status === 'Pending' ? (
                      <button className="text-sm font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors">
                        Assign
                      </button>
                    ) : (
                      <button className="text-sm font-semibold text-gray-600 bg-gray-50 hover:bg-gray-100 px-3 py-1.5 rounded-lg transition-colors">
                        Update
                      </button>
                    )}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
          {filteredRequests.length === 0 && (
            <div className="p-12 text-center text-gray-500">
              No fuel requests found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
