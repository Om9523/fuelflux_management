"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { DUMMY_USERS } from "@/data/users";
import { useAuthStore } from "@/stores/useAuthStore";
import { ArrowRight } from "lucide-react";
import Image from "next/image";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"), // Password is required but we mock validation
});

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuthStore();
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "customer@fuelflux.in",
      password: "password123",
    }
  });

  const onSubmit = (values: z.infer<typeof loginSchema>) => {
    setIsLoading(true);
    setError("");
    
    // Simulate network delay
    setTimeout(() => {
      const user = DUMMY_USERS.find(u => u.email === values.email);
      
      if (user) {
        // If user has multiple roles, we should normally redirect to role selection.
        // For simplicity, we just pick the first role or default to customer if they have it.
        const roleToLogin = user.roles.includes("Customer") ? "Customer" : user.roles[0];
        login(user, roleToLogin);
        
        if (roleToLogin === "Customer") {
          router.push("/customer/dashboard");
        } else {
          router.push(`/${roleToLogin.toLowerCase().replace(' ', '-')}/dashboard`);
        }
      } else {
        setError("Invalid email or password (Hint: use customer@fuelflux.in)");
      }
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl overflow-hidden">
        <div className="p-8 text-center bg-gradient-to-br from-orange-500 to-orange-600 text-white relative">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-md overflow-hidden p-2">
            <Image src="/logo.png" alt="FuelFlux Logo" width={64} height={64} className="w-full h-full object-contain filter brightness-0 invert" />
          </div>
          <h1 className="text-2xl font-black mb-2">FuelFlux</h1>
          <p className="text-orange-100 text-sm">Frontend-Only Enterprise Platform</p>
        </div>
        
        <div className="p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Sign in to your account</h2>
          
          {error && (
            <div className="bg-red-50 text-red-500 text-sm p-3 rounded-lg mb-6 border border-red-100">
              {error}
            </div>
          )}

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Email Address</label>
              <input 
                {...form.register("email")}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none transition-all bg-gray-50 focus:bg-white"
                placeholder="customer@fuelflux.in"
              />
              {form.formState.errors.email && <p className="text-red-500 text-xs mt-1">{form.formState.errors.email.message}</p>}
            </div>
            
            <div>
              <div className="flex justify-between mb-1">
                <label className="block text-sm font-semibold text-gray-700">Password</label>
                <a href="#" className="text-sm font-semibold text-orange-500 hover:text-orange-600">Forgot?</a>
              </div>
              <input 
                {...form.register("password")}
                type="password"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none transition-all bg-gray-50 focus:bg-white"
                placeholder="••••••••"
              />
              {form.formState.errors.password && <p className="text-red-500 text-xs mt-1">{form.formState.errors.password.message}</p>}
            </div>

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full bg-gray-900 text-white py-3 rounded-xl font-bold text-sm hover:bg-gray-800 transition-all flex items-center justify-center gap-2 mt-6 disabled:opacity-70"
            >
              {isLoading ? "Signing in..." : "Sign In"}
              {!isLoading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>
          
          <div className="mt-8 text-center text-sm text-gray-500">
            Don't have an account? <a href="#" className="font-bold text-orange-500">Sign up</a>
          </div>
        </div>
      </div>
    </div>
  );
}
