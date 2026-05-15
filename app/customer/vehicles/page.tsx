"use client";
import { useState } from "react";
import { useVehicleStore, Vehicle } from "@/stores/useVehicleStore";
import { Car, Plus, Trash2, Star, CheckCircle2 } from "lucide-react";
import { useForm } from "react-hook-form";

export default function VehiclesPage() {
  const { vehicles, addVehicle, deleteVehicle, setDefaultVehicle } = useVehicleStore();
  const [isAdding, setIsAdding] = useState(false);

  const { register, handleSubmit, reset } = useForm<Omit<Vehicle, 'id' | 'isDefault'>>();

  const onSubmit = (data: any) => {
    addVehicle({ ...data, isDefault: vehicles.length === 0 });
    setIsAdding(false);
    reset();
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-gray-900">My Vehicles</h2>
          <p className="text-sm text-gray-500 mt-1">Manage your vehicles for faster fuel booking.</p>
        </div>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="bg-gray-900 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-gray-800 transition-colors flex items-center gap-2"
        >
          {isAdding ? "Cancel" : <><Plus className="w-4 h-4"/> Add Vehicle</>}
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Vehicle Number</label>
            <input required {...register("number")} placeholder="e.g. MH 01 AB 1234" className="w-full p-2.5 rounded-lg border border-gray-200 focus:border-orange-500" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Vehicle Type</label>
            <select required {...register("type")} className="w-full p-2.5 rounded-lg border border-gray-200 focus:border-orange-500">
              <option value="2-Wheeler">2-Wheeler</option>
              <option value="4-Wheeler">4-Wheeler</option>
              <option value="Heavy Vehicle">Heavy Vehicle</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Brand</label>
            <input required {...register("brand")} placeholder="e.g. Honda" className="w-full p-2.5 rounded-lg border border-gray-200 focus:border-orange-500" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Model</label>
            <input required {...register("model")} placeholder="e.g. City" className="w-full p-2.5 rounded-lg border border-gray-200 focus:border-orange-500" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Fuel Type</label>
            <select required {...register("fuelType")} className="w-full p-2.5 rounded-lg border border-gray-200 focus:border-orange-500">
              <option value="Petrol">Petrol</option>
              <option value="Diesel">Diesel</option>
              <option value="CNG">CNG</option>
              <option value="EV">EV</option>
            </select>
          </div>
          <div className="md:col-span-2 flex justify-end mt-2">
            <button type="submit" className="bg-orange-500 text-white px-6 py-2 rounded-lg font-bold hover:bg-orange-600 transition-colors">
              Save Vehicle
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {vehicles.map((vehicle) => (
          <div key={vehicle.id} className={`bg-white p-6 rounded-2xl border-2 transition-all ${vehicle.isDefault ? 'border-orange-500 shadow-md' : 'border-gray-100 shadow-sm hover:border-orange-200'}`}>
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center text-gray-500">
                <Car className="w-6 h-6" />
              </div>
              <div className="flex gap-2">
                {vehicle.isDefault ? (
                  <span className="bg-orange-100 text-orange-600 text-xs font-bold px-2 py-1 rounded flex items-center gap-1">
                    <Star className="w-3 h-3 fill-orange-600"/> Default
                  </span>
                ) : (
                  <button onClick={() => setDefaultVehicle(vehicle.id)} className="text-xs font-semibold text-gray-500 hover:text-orange-500 border border-gray-200 rounded px-2 py-1">
                    Make Default
                  </button>
                )}
              </div>
            </div>
            
            <h3 className="text-xl font-black text-gray-900 mb-1">{vehicle.number}</h3>
            <p className="text-sm font-semibold text-gray-500 mb-4">{vehicle.brand} {vehicle.model}</p>
            
            <div className="flex flex-wrap gap-2 mb-6">
              <span className="bg-gray-50 border border-gray-100 text-gray-600 text-xs font-semibold px-2.5 py-1 rounded-md">{vehicle.type}</span>
              <span className="bg-gray-50 border border-gray-100 text-gray-600 text-xs font-semibold px-2.5 py-1 rounded-md">{vehicle.fuelType}</span>
            </div>

            <div className="pt-4 border-t border-gray-100 flex justify-end gap-2">
              <button 
                onClick={() => deleteVehicle(vehicle.id)}
                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                title="Delete Vehicle"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}

        {vehicles.length === 0 && !isAdding && (
          <div className="col-span-full py-12 text-center border-2 border-dashed border-gray-200 rounded-2xl">
            <Car className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No vehicles added yet.</p>
            <button onClick={() => setIsAdding(true)} className="text-orange-500 font-bold mt-2 hover:underline">Add your first vehicle</button>
          </div>
        )}
      </div>
    </div>
  );
}
