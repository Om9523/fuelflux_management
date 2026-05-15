"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { useFuelLogStore } from "@/stores/useFuelLogStore";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Droplets, Calendar, CreditCard, Download, Search, Plus, X } from "lucide-react";

const COLORS = ['#f97316', '#3b82f6', '#22c55e', '#eab308'];

export default function FuelLogsPage() {
  const { logs, addLog } = useFuelLogStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newLog, setNewLog] = useState({
    stationName: "",
    vehicleNumber: "",
    fuelType: "Petrol",
    quantity: "",
    amount: "",
    date: new Date().toISOString().split('T')[0]
  });

  const handleAddManualLog = (e: React.FormEvent) => {
    e.preventDefault();
    addLog({
      bookingId: 'Manual-' + Date.now().toString().slice(-4),
      stationName: newLog.stationName,
      vehicleNumber: newLog.vehicleNumber,
      fuelType: newLog.fuelType,
      quantity: Number(newLog.quantity),
      amount: Number(newLog.amount),
      date: new Date(newLog.date).toISOString(),
      status: 'Completed'
    });
    setIsModalOpen(false);
    setNewLog({
      stationName: "",
      vehicleNumber: "",
      fuelType: "Petrol",
      quantity: "",
      amount: "",
      date: new Date().toISOString().split('T')[0]
    });
  };

  const filteredLogs = logs.filter(log => 
    log.stationName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.vehicleNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalSpent = logs.reduce((acc, log) => acc + log.amount, 0);
  const totalFuel = logs.reduce((acc, log) => acc + log.quantity, 0);

  // Group by fuel type for pie chart
  const fuelTypeData = logs.reduce((acc: any, log) => {
    const existing = acc.find((a: any) => a.name === log.fuelType);
    if (existing) {
      existing.value += log.quantity;
    } else {
      acc.push({ name: log.fuelType, value: log.quantity });
    }
    return acc;
  }, []);

  // Monthly data mockup for bar chart
  const monthlyData = [
    { name: 'Jan', amount: 4000 },
    { name: 'Feb', amount: 3000 },
    { name: 'Mar', amount: 5000 },
    { name: 'Apr', amount: 4500 },
    { name: 'May', amount: Math.floor(totalSpent) },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Fuel Logs & Analytics</h2>
        <p className="text-gray-500 text-sm">Track your fuel consumption and spending</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-500 mb-1">Total Spent</p>
              <h3 className="text-2xl font-bold text-gray-900">₹{totalSpent.toLocaleString()}</h3>
            </div>
            <div className="stat-card-icon bg-orange-50 text-orange-500">
              <CreditCard className="w-6 h-6" />
            </div>
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-500 mb-1">Total Fuel Added</p>
              <h3 className="text-2xl font-bold text-gray-900">{totalFuel}L</h3>
            </div>
            <div className="stat-card-icon bg-blue-50 text-blue-500">
              <Droplets className="w-6 h-6" />
            </div>
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-500 mb-1">Logs Recorded</p>
              <h3 className="text-2xl font-bold text-gray-900">{logs.length}</h3>
            </div>
            <div className="stat-card-icon bg-green-50 text-green-500">
              <Calendar className="w-6 h-6" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Monthly Spending</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#737373' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#737373' }} tickFormatter={(val) => `₹${val}`} />
                <Tooltip cursor={{ fill: '#fff7ed' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }} />
                <Bar dataKey="amount" fill="#f97316" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="card p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Fuel Type Breakdown</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={fuelTypeData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {fuelTypeData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-4 mt-4">
            {fuelTypeData.map((entry: any, idx: number) => (
              <div key={entry.name} className="flex items-center gap-2 text-sm">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></span>
                <span className="text-gray-600">{entry.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Logs Table */}
      <div className="card overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-white">
          <h3 className="text-lg font-bold text-gray-900">Recent Logs</h3>
          <div className="flex gap-4 items-center">
            <div className="relative w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search station or vehicle..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:border-orange-500 focus:bg-white focus:outline-none transition-colors"
              />
            </div>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="btn-primary flex items-center gap-2 py-2"
            >
              <Plus className="w-4 h-4" /> Add Manual Log
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="table-base">
            <thead>
              <tr>
                <th>Date</th>
                <th>Station</th>
                <th>Vehicle</th>
                <th>Fuel Details</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((log) => (
                <tr key={log.id}>
                  <td>{new Date(log.date).toLocaleDateString()}</td>
                  <td className="font-semibold">{log.stationName}</td>
                  <td>{log.vehicleNumber}</td>
                  <td>{log.fuelType} ({log.quantity}L)</td>
                  <td className="font-bold">₹{log.amount}</td>
                  <td>
                    <span className={`badge ${log.status === 'Completed' ? 'badge-green' : 'badge-red'}`}>
                      {log.status}
                    </span>
                  </td>
                  <td>
                    <button className="p-2 text-gray-400 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition-colors">
                      <Download className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredLogs.length === 0 && (
            <div className="p-8 text-center text-gray-500">No fuel logs found.</div>
          )}
        </div>
      </div>

      {/* Add Manual Log Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl"
          >
            <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-gray-900 text-lg">Add Manual Log</h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-900 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleAddManualLog} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Station Name</label>
                <input 
                  type="text" 
                  required
                  value={newLog.stationName}
                  onChange={(e) => setNewLog({...newLog, stationName: e.target.value})}
                  className="input-base" 
                  placeholder="E.g., Shell, Koramangala" 
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Vehicle Number</label>
                <input 
                  type="text" 
                  required
                  value={newLog.vehicleNumber}
                  onChange={(e) => setNewLog({...newLog, vehicleNumber: e.target.value})}
                  className="input-base" 
                  placeholder="E.g., KA 01 AB 1234" 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Fuel Type</label>
                  <select 
                    className="input-base"
                    value={newLog.fuelType}
                    onChange={(e) => setNewLog({...newLog, fuelType: e.target.value})}
                  >
                    <option value="Petrol">Petrol</option>
                    <option value="Diesel">Diesel</option>
                    <option value="CNG">CNG</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Date</label>
                  <input 
                    type="date" 
                    required
                    value={newLog.date}
                    onChange={(e) => setNewLog({...newLog, date: e.target.value})}
                    className="input-base" 
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Quantity (L)</label>
                  <input 
                    type="number" 
                    required
                    step="0.01"
                    min="0"
                    value={newLog.quantity}
                    onChange={(e) => setNewLog({...newLog, quantity: e.target.value})}
                    className="input-base" 
                    placeholder="0" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Total Amount (₹)</label>
                  <input 
                    type="number" 
                    required
                    step="0.01"
                    min="0"
                    value={newLog.amount}
                    onChange={(e) => setNewLog({...newLog, amount: e.target.value})}
                    className="input-base" 
                    placeholder="0" 
                  />
                </div>
              </div>
              
              <div className="pt-4 flex gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 btn-secondary"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="flex-1 btn-primary"
                >
                  Save Log
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
