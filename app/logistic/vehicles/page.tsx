'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Car,
  Search,
  Filter,
  Plus,
  BatteryCharging,
  AlertTriangle,
  CheckCircle2,
  MoreVertical,
  X,
  ShieldCheck,
  Zap,
  Truck,
  Bus,
  SlidersHorizontal,
  User,
  Phone,
  ChevronRight,
  ShieldAlert
} from 'lucide-react';
import { useFleetStore, LogisticVehicle, VehicleType, FuelType, VehicleStatus } from '@/stores/fleet.store';
import { vehiclesService } from '@/services/vehicles.service';
import { toast } from '@/components/feedback/Toast';

export default function VehiclesPage() {
  const { activeFleetId, vehicles, transactions, addVehicle, requestCreditIncrease, updateVehicleStatus } = useFleetStore();

  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchVehicles = async () => {
      setLoading(true);
      try {
        await vehiclesService.getVehicles();
      } catch (err) {
        console.warn('[VehiclesPage] Failed to fetch real backend vehicles:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchVehicles();
  }, [activeFleetId]);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newVehicleNumber, setNewVehicleNumber] = useState('');
  const [newVehicleType, setNewVehicleType] = useState<VehicleType>('truck');
  const [newMake, setNewMake] = useState('');
  const [newModel, setNewModel] = useState('');
  const [newFuelType, setNewFuelType] = useState<FuelType>('diesel');
  const [newDriverName, setNewDriverName] = useState('');
  const [newDriverPhone, setNewDriverPhone] = useState('');
  const [newCreditLimit, setNewCreditLimit] = useState(200000);

  // Detail Drawer State
  const [selectedVehicle, setSelectedVehicle] = useState<LogisticVehicle | null>(null);
  const [creditAdjustmentAmount, setCreditAdjustmentAmount] = useState<number>(0);
  const [adjustingCredit, setAdjustingCredit] = useState(false);

  const fleetVehicles = vehicles[activeFleetId] || [];

  // Filter vehicles
  const filteredVehicles = fleetVehicles.filter((v) => {
    const matchesSearch =
      v.vehicleNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.driverName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.model.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = filterType === 'all' || v.vehicleType === filterType;
    const matchesStatus = filterStatus === 'all' || v.status === filterStatus;

    return matchesSearch && matchesType && matchesStatus;
  });

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVehicleNumber || !newMake || !newModel || !newDriverName || !newDriverPhone) {
      toast.error('Please fill in all required fields.');
      return;
    }

    try {
      await vehiclesService.registerVehicle({
        vehicleNumber: newVehicleNumber,
        vehicleType: newVehicleType,
        make: newMake,
        model: newModel,
        fuelType: newFuelType,
        driverName: newDriverName,
        driverPhone: newDriverPhone,
        creditLimit: newCreditLimit,
      });

      toast.success(`Vehicle ${newVehicleNumber} registered for approved limits.`);
      setIsModalOpen(false);

      // Reset Form
      setNewVehicleNumber('');
      setNewMake('');
      setNewModel('');
      setNewDriverName('');
      setNewDriverPhone('');
      setNewCreditLimit(200000);
    } catch (err) {
      toast.error('Failed to register vehicle.');
    }
  };

  const handleAdjustCredit = async () => {
    if (!selectedVehicle) return;
    if (creditAdjustmentAmount <= 0) {
      toast.error('Please enter a valid credit limit amount.');
      return;
    }

    setAdjustingCredit(true);
    try {
      await vehiclesService.requestCreditAdjustment(selectedVehicle.id, creditAdjustmentAmount);
      toast.success('Credit increase request queued successfully.');
      
      // Update selected vehicle in view
      setSelectedVehicle({
        ...selectedVehicle,
        creditLimit: creditAdjustmentAmount,
      });
      setAdjustingCredit(false);
    } catch (err) {
      toast.error('Credit limit request failed.');
      setAdjustingCredit(false);
    }
  };

  const handleToggleStatus = async (vehicle: LogisticVehicle) => {
    const nextStatus: VehicleStatus = vehicle.status === 'blocked' ? 'active' : 'blocked';
    try {
      await vehiclesService.updateStatus(vehicle.id, nextStatus);
      toast.success(`Vehicle successfully ${nextStatus === 'active' ? 'Activated' : 'Blocked'}`);
      
      if (selectedVehicle?.id === vehicle.id) {
        setSelectedVehicle({
          ...selectedVehicle,
          status: nextStatus,
        });
      }
    } catch (err) {
      toast.error('Failed to update status.');
    }
  };

  // Get specific transactions for selected vehicle
  const vehicleTxns = selectedVehicle
    ? (transactions[activeFleetId] || []).filter((t) => t.vehicleId === selectedVehicle.id)
    : [];

  const vehicleIcons = {
    truck: <Truck className="h-5 w-5" />,
    bus: <Bus className="h-5 w-5" />,
    car: <Car className="h-5 w-5" />,
    bike: <SlidersHorizontal className="h-5 w-5" />,
    lcv: <Truck className="h-5 w-5" />,
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
            My Vehicles
          </h1>
          <p className="text-sm font-semibold text-slate-400 mt-1">
            Configure fuel caps, authorize credit ceilings, and manage driver details
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl text-sm font-bold hover:shadow-lg hover:shadow-orange-500/20 transition-all cursor-pointer shrink-0"
        >
          <Plus className="h-4 w-4" />
          Onboard Vehicle
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search vehicle number, make, or driver..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-orange-500/50 focus:ring-4 focus:ring-orange-500/5 transition-all"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 w-1/2 md:w-auto">
            <Filter className="h-3.5 w-3.5 text-slate-400" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-600 focus:outline-none cursor-pointer"
            >
              <option value="all">All Types</option>
              <option value="truck">Trucks</option>
              <option value="bus">Buses</option>
              <option value="car">Cars</option>
              <option value="lcv">LCVs</option>
            </select>
          </div>

          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 w-1/2 md:w-auto">
            <SlidersHorizontal className="h-3.5 w-3.5 text-slate-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-600 focus:outline-none cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="blocked">Blocked</option>
              <option value="pending_approval">Pending approval</option>
            </select>
          </div>
        </div>
      </div>

      {/* Vehicles Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 bg-slate-200 rounded-2xl"></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <AnimatePresence>
          {filteredVehicles.map((vehicle) => {
            const usagePct = vehicle.creditLimit > 0 ? (vehicle.usedCredit / vehicle.creditLimit) * 100 : 0;
            
            const badges = {
              active: <span className="px-2.5 py-1 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-lg text-[10px] font-extrabold uppercase">Active</span>,
              blocked: <span className="px-2.5 py-1 bg-rose-50 text-rose-600 border border-rose-100 rounded-lg text-[10px] font-extrabold uppercase">Blocked</span>,
              pending_approval: <span className="px-2.5 py-1 bg-amber-50 text-amber-600 border border-amber-100 rounded-lg text-[10px] font-extrabold uppercase">Pending Approval</span>,
            };

            return (
              <motion.div
                key={vehicle.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                onClick={() => {
                  setSelectedVehicle(vehicle);
                  setCreditAdjustmentAmount(vehicle.creditLimit);
                }}
                className="bg-white border border-slate-200 hover:border-orange-500/30 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
                        {vehicleIcons[vehicle.vehicleType] || <Truck className="h-5 w-5" />}
                      </div>
                      <div>
                        <h3 className="text-base font-extrabold text-slate-900 group-hover:text-orange-500 transition-colors">
                          {vehicle.vehicleNumber}
                        </h3>
                        <p className="text-xs font-semibold text-slate-400 capitalize">
                          {vehicle.make} {vehicle.model}
                        </p>
                      </div>
                    </div>
                    {badges[vehicle.status]}
                  </div>

                  {/* Driver Panel */}
                  <div className="mt-4 bg-slate-50/80 border border-slate-100 rounded-xl p-3 space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                      <User className="h-3.5 w-3.5 text-slate-400" />
                      <span>{vehicle.driverName}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                      <Phone className="h-3.5 w-3.5 text-slate-400" />
                      <span>{vehicle.driverPhone}</span>
                    </div>
                  </div>
                </div>

                {/* Credit Limit ceiling bar */}
                <div className="mt-5 border-t border-slate-100 pt-4">
                  <div className="flex justify-between text-xs font-bold text-slate-500 mb-1.5">
                    <span>Credit Limits Used</span>
                    <span className="text-slate-800">
                      ₹{vehicle.usedCredit.toLocaleString()} / ₹{vehicle.creditLimit.toLocaleString()}
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        usagePct > 90 ? 'bg-rose-500' : usagePct > 65 ? 'bg-amber-500' : 'bg-gradient-to-r from-orange-500 to-amber-500'
                      }`}
                      style={{ width: `${Math.min(usagePct, 100)}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase mt-2">
                    <span>{usagePct.toFixed(0)}% Exhausted</span>
                    <span className="flex items-center text-orange-500 hover:underline gap-0.5">
                      Configure Limits <ChevronRight className="h-3 w-3" />
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {filteredVehicles.length === 0 && (
          <div className="col-span-full bg-white border border-slate-200 rounded-2xl py-12 px-4 text-center">
            <Truck className="h-10 w-10 text-slate-300 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-slate-800">No vehicles match filters</h3>
            <p className="text-xs text-slate-400 font-semibold mt-1">Try refining your search query or registering a new vehicle credentials.</p>
          </div>
        )}
      </div>
      )}

      {/* Onboard Vehicle Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white border border-slate-200 rounded-3xl w-full max-w-lg shadow-2xl relative overflow-hidden z-10 p-6"
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900">Onboard New Fleet Vehicle</h3>
                  <p className="text-xs font-semibold text-slate-400 mt-0.5">Registers credentials with the Central CRM pending approvals</p>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleRegister} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-500 uppercase">Vehicle Registration No. *</label>
                    <input
                      type="text"
                      placeholder="e.g. AP-09-XX-9999"
                      value={newVehicleNumber}
                      onChange={(e) => setNewVehicleNumber(e.target.value.toUpperCase())}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:bg-white focus:border-orange-500"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-500 uppercase">Vehicle operational Category *</label>
                    <select
                      value={newVehicleType}
                      onChange={(e) => setNewVehicleType(e.target.value as VehicleType)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:bg-white focus:border-orange-500 cursor-pointer"
                    >
                      <option value="truck">Heavy Truck</option>
                      <option value="lcv">Light Commercial Vehicle (LCV)</option>
                      <option value="bus">Bus</option>
                      <option value="car">Executive Car</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-500 uppercase">Manufacturer Make *</label>
                    <input
                      type="text"
                      placeholder="e.g. Tata / BharatBenz"
                      value={newMake}
                      onChange={(e) => setNewMake(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:bg-white focus:border-orange-500"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-500 uppercase">Model Spec *</label>
                    <input
                      type="text"
                      placeholder="e.g. Prima 4025"
                      value={newModel}
                      onChange={(e) => setNewModel(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:bg-white focus:border-orange-500"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-500 uppercase">Authorized Fuel Type *</label>
                    <select
                      value={newFuelType}
                      onChange={(e) => setNewFuelType(e.target.value as FuelType)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:bg-white focus:border-orange-500 cursor-pointer"
                    >
                      <option value="diesel">Diesel</option>
                      <option value="cng">CNG</option>
                      <option value="petrol">Petrol</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-500 uppercase">Assigned Credit Limit (INR) *</label>
                    <input
                      type="number"
                      placeholder="Credit Limit"
                      value={newCreditLimit}
                      onChange={(e) => setNewCreditLimit(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:bg-white focus:border-orange-500"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-4">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-500 uppercase">Assigned Driver Name *</label>
                    <input
                      type="text"
                      placeholder="Driver Name"
                      value={newDriverName}
                      onChange={(e) => setNewDriverName(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:bg-white focus:border-orange-500"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-500 uppercase">Driver Contact Phone *</label>
                    <input
                      type="text"
                      placeholder="e.g. 9876543210"
                      value={newDriverPhone}
                      onChange={(e) => setNewDriverPhone(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:bg-white focus:border-orange-500"
                      required
                    />
                  </div>
                </div>

                <div className="flex gap-3 justify-end border-t border-slate-100 pt-4 mt-6">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl text-xs font-bold transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl text-xs font-bold hover:shadow-lg hover:shadow-orange-500/20 transition-all cursor-pointer"
                  >
                    Submit Registration
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Slide-out details drawer */}
      <AnimatePresence>
        {selectedVehicle && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedVehicle(null)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40"
            />

            {/* Slide drawer */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="fixed top-0 bottom-0 right-0 w-full max-w-md bg-white border-l border-slate-200 shadow-2xl z-50 flex flex-col justify-between"
            >
              {/* Drawer Header */}
              <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-black bg-orange-50 text-orange-600 border border-orange-100/50 px-2 py-0.5 rounded-md uppercase">
                    Vehicle Profile
                  </span>
                  <h3 className="text-lg font-extrabold text-slate-900 mt-1">
                    {selectedVehicle.vehicleNumber}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedVehicle(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Drawer Body */}
              <div className="flex-1 overflow-y-auto p-5 space-y-6">
                {/* Visual Status card */}
                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Operational Status</p>
                    <p className="text-xs font-bold text-slate-800 capitalize mt-1">
                      {selectedVehicle.status === 'active' ? 'Authorized for Fill' : 'Authorization Suspended'}
                    </p>
                  </div>
                  <button
                    onClick={() => handleToggleStatus(selectedVehicle)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer ${
                      selectedVehicle.status === 'blocked'
                        ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-600 border border-emerald-100'
                        : 'bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-100'
                    }`}
                  >
                    {selectedVehicle.status === 'blocked' ? (
                      <>
                        <ShieldCheck className="h-4 w-4" /> Activate
                      </>
                    ) : (
                      <>
                        <ShieldAlert className="h-4 w-4" /> Suspense Limit
                      </>
                    )}
                  </button>
                </div>

                {/* Driver Info */}
                <div className="space-y-3">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider">Driver Assignment</h4>
                  <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400 font-medium">Driver Name</span>
                      <span className="font-bold text-slate-800">{selectedVehicle.driverName}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400 font-medium">Contact Phone</span>
                      <span className="font-bold text-slate-800">{selectedVehicle.driverPhone}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400 font-medium">Specs</span>
                      <span className="font-bold text-slate-800 capitalize">
                        {selectedVehicle.make} {selectedVehicle.model} ({selectedVehicle.fuelType})
                      </span>
                    </div>
                  </div>
                </div>

                {/* Adjust Limit Box */}
                <div className="space-y-3">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider">Configure Credit Limit Ceiling</h4>
                  <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Limit Value (INR)</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">₹</span>
                        <input
                          type="number"
                          value={creditAdjustmentAmount}
                          onChange={(e) => setCreditAdjustmentAmount(Number(e.target.value))}
                          className="w-full pl-7 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:bg-white focus:border-orange-500"
                        />
                      </div>
                    </div>
                    <button
                      onClick={handleAdjustCredit}
                      disabled={adjustingCredit || creditAdjustmentAmount === selectedVehicle.creditLimit}
                      className="w-full py-2.5 bg-orange-500 hover:bg-orange-600 disabled:bg-slate-100 disabled:text-slate-400 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-md shadow-orange-500/10"
                    >
                      {adjustingCredit ? 'Updating Limit...' : 'Submit Limit Adjustment'}
                    </button>
                  </div>
                </div>

                {/* Vehicle Specific Logs */}
                <div className="space-y-3">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider">Log history</h4>
                  <div className="space-y-2">
                    {vehicleTxns.length > 0 ? (
                      vehicleTxns.map((t) => (
                        <div key={t.id} className="bg-slate-50 border border-slate-100 rounded-xl p-3 flex justify-between items-center text-xs">
                          <div>
                            <p className="font-bold text-slate-800">{t.pumpName}</p>
                            <p className="text-[10px] text-slate-400 font-semibold mt-0.5">{t.date}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-slate-900">₹{t.amount.toLocaleString()}</p>
                            <p className="text-[10px] text-slate-400 font-semibold">{t.quantity} L ({t.fuelType})</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="bg-slate-50 border border-slate-100 rounded-xl py-6 text-center text-xs text-slate-400 font-semibold">
                        No fueling transactions recorded for this vehicle.
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Drawer Footer */}
              <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex gap-3">
                <button
                  onClick={() => setSelectedVehicle(null)}
                  className="w-full py-2.5 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Close Drawer
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
