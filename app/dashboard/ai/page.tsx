'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Send,
  Bot,
  User,
  TrendingUp,
  Coins,
  Activity,
  Info,
  Calendar,
  ArrowUpRight,
  Smartphone,
  Building,
  AlertCircle,
  HelpCircle,
  MessageSquare,
  ArrowRight,
  CheckCircle,
} from 'lucide-react';
import { usePumpStore } from '@/stores/pumps.store';
import { toast } from '@/components/feedback/Toast';
import { Button } from '@/components/ui/Button';

interface Message {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  chartType?: 'sales' | 'attendants' | 'inventory' | 'credit';
  createdAt: string;
}

export default function AIPage() {
  const { selectedPump } = usePumpStore();
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const currentPumpName = selectedPump?.name || 'Vijayawada Highway Fuel Center';
  const currentPumpId = selectedPump?.id || 'pump_1';

  // Seed default welcome message
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'MSG-001',
      sender: 'bot',
      text: `Hello, Rajesh. I am the FuelFlux AI Copilot. I have mapped real-time telemetry from **${currentPumpName}**. Ask me to analyze forecourt sales, check underground tank metrics, query outstanding customer credits, or audit employee performance.`,
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  // Scroll to bottom whenever messages list changes
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Preset suggested clicks
  const SUGGESTED_QUERIES = [
    { label: 'Weekly sales audit', query: 'What were my sales this week?', icon: <TrendingUp className="h-3 w-3 text-emerald-500" /> },
    { label: 'Attendant performance', query: 'Who are my top performing attendants?', icon: <User className="h-3 w-3 text-blue-500" /> },
    { label: 'Check fuel inventory', query: 'Check current inventory levels', icon: <Activity className="h-3 w-3 text-orange-500" /> },
    { label: 'Credit risk alarms', query: 'Are there any credit risk alerts?', icon: <Coins className="h-3 w-3 text-rose-500" /> },
  ];

  const handleSendMessage = (textToSend: string) => {
    if (!textToSend.trim()) return;

    // Add user message
    const userMsg: Message = {
      id: 'MSG-' + Math.random().toString(36).substr(2, 9),
      sender: 'user',
      text: textToSend,
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    // Simulate AI thinking and custom contextual reply
    setTimeout(() => {
      setIsTyping(false);
      let replyText = '';
      let chartType: Message['chartType'];

      const queryLower = textToSend.toLowerCase();

      if (queryLower.includes('sales') || queryLower.includes('week')) {
        replyText = `Forecourt telemetry shows that **${currentPumpName}** has generated total sales of **₹14.8 Lakhs** this week. UPI represents 45% of payments, Credit cards 30%, and Cash 25%. Here is your weekly gross revenue timeline:`;
        chartType = 'sales';
      } else if (queryLower.includes('attendant') || queryLower.includes('worker') || queryLower.includes('performing')) {
        replyText = `Shift reconciliations for **${currentPumpName}** have completed. **Karthik Raju** leads this week's leaderboard, dispensing 4,800 liters with 100% digital payment clearance. Here is the attendant leaderboard ranking:`;
        chartType = 'attendants';
      } else if (queryLower.includes('inventory') || queryLower.includes('tank') || queryLower.includes('level')) {
        replyText = `Underground ATG sensors are active. **Petrol (91-Octane)** is currently at **65% capacity** (Tank 1 & 2 combined). **Diesel** is running lower at **28% capacity** (Tank 3 & 4), which triggered a low-stock alert yesterday. Tank status:`;
        chartType = 'inventory';
      } else if (queryLower.includes('credit') || queryLower.includes('risk') || queryLower.includes('alert') || queryLower.includes('udhaar')) {
        replyText = `My CRM risk algorithm has flagged **2 commercial credit clients** with critical balances exceeding 90% of their limit at **${currentPumpName}**. I recommend dispatching a WhatsApp repayment warning. Status details:`;
        chartType = 'credit';
      } else {
        replyText = `I have received your query regarding: "${textToSend}". Based on **${currentPumpName}** metrics, all terminal systems are online, forecourt staff attendance is registered, and GSTR tax provisional filing for May is due in 15 days. Let me know if you would like me to render a specific report.`;
      }

      const botMsg: Message = {
        id: 'MSG-' + Math.random().toString(36).substr(2, 9),
        sender: 'bot',
        text: replyText,
        chartType,
        createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botMsg]);
    }, 1500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage(inputText);
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full font-plus-jakarta text-slate-800 text-left min-h-[calc(100vh-130px)]">
      
      {/* 1. MODULE HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white border border-slate-100 rounded-2xl p-6 shadow-xs gap-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-100 border border-orange-200 text-primary animate-pulse">
            <Sparkles className="h-5.5 w-5.5" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-lg font-extrabold text-text-primary tracking-tight">AI Forecourt Copilot</h1>
            <p className="text-xs text-text-secondary">Synthesize CCTV events, ask natural questions, check inventory stock depletion alerts, and audit digital sales.</p>
          </div>
        </div>
      </div>

      {selectedPump?.status !== 'approved' ? (
        <div className="bg-amber-50 border border-amber-200 rounded-3xl p-8 flex flex-col items-center justify-center text-center max-w-2xl mx-auto gap-4 mt-6">
          <AlertCircle className="h-10 w-10 text-amber-500 animate-pulse" />
          <h3 className="text-sm font-extrabold text-slate-800">AI Telemetry Access Locked</h3>
          <p className="text-xs text-slate-500 leading-relaxed max-w-md">
            The AI Forecourt Copilot requires real-time station synchronization. Telemetry algorithms, credit risks, and nozzle-reconciliation chats will activate once this station's approval processes complete.
          </p>
        </div>
      ) : (
        <div className="flex-grow grid grid-cols-1 lg:grid-cols-4 gap-6 items-stretch">
          
          {/* 2. LEFT SIDEBAR: DYNAMIC DOCK SYSTEM */}
          <div className="lg:col-span-1 bg-white border border-slate-100 rounded-3xl p-5 shadow-sm flex flex-col justify-between h-full min-h-[300px]">
            <div className="flex flex-col gap-5">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider pb-2 border-b border-slate-100 flex items-center gap-1.5">
                <Activity className="h-3.5 w-3.5 text-primary shrink-0" />
                Copilot Integrations
              </span>

              <div className="flex flex-col gap-4 text-xs font-medium text-slate-500">
                
                <div className="flex items-start gap-2.5">
                  <div className="h-5.5 w-5.5 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
                    <CheckCircle className="h-3.5 w-3.5" />
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="font-bold text-slate-700">CCTV ANPR Read-out</span>
                    <span className="text-[10px] leading-relaxed">OCR license reading logs sync immediately to credit drawers.</span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="h-5.5 w-5.5 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
                    <CheckCircle className="h-3.5 w-3.5" />
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="font-bold text-slate-700">ATG Fuel Depletion</span>
                    <span className="text-[10px] leading-relaxed">Safety warning triggers automate re-orders directly from terminal logs.</span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="h-5.5 w-5.5 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
                    <CheckCircle className="h-3.5 w-3.5" />
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="font-bold text-slate-700">Udhaar Risk Scanners</span>
                    <span className="text-[10px] leading-relaxed">Algorithmic credit analysis issues WhatsApp warnings on balance breaches.</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 mt-6">
              <span className="text-[9px] font-bold text-slate-400 uppercase">Interactive Context</span>
              <div className="flex items-center gap-2 mt-1">
                <Building className="h-4 w-4 text-primary shrink-0" />
                <span className="text-xs font-bold text-slate-700 truncate max-w-[150px]">{currentPumpName}</span>
              </div>
              <p className="text-[9px] text-slate-400 mt-1 leading-relaxed">AI limits responses to the currently selected station scope.</p>
            </div>
          </div>

          {/* 3. RIGHT PANEL: CHAT INTERFACE */}
          <div className="lg:col-span-3 bg-white border border-slate-100 rounded-3xl shadow-sm flex flex-col justify-between overflow-hidden h-[500px]">
            
            {/* Scrollable messages bay */}
            <div className="flex-grow p-5 overflow-y-auto space-y-4 max-h-[390px]">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex items-start gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.sender === 'bot' && (
                    <div className="h-8 w-8 rounded-xl bg-orange-100 border border-orange-200 flex items-center justify-center text-primary shrink-0">
                      <Bot className="h-4.5 w-4.5" />
                    </div>
                  )}

                  <div className={`flex flex-col gap-1.5 max-w-[85%] text-xs
                    ${msg.sender === 'user' ? 'items-end' : 'items-start'}
                  `}>
                    <div className={`p-4 rounded-3xl border text-left leading-relaxed
                      ${msg.sender === 'user'
                        ? 'bg-primary text-white border-transparent shadow-xs rounded-tr-xs'
                        : 'bg-slate-50 border-slate-200/50 text-slate-700 rounded-tl-xs'}
                    `}>
                      {msg.text}

                      {/* INLINE CHART GRAPHICS IN CHAT MESSAGES */}
                      {msg.sender === 'bot' && msg.chartType === 'sales' && (
                        <div className="mt-4 p-3 bg-white border border-slate-100 rounded-2xl shadow-xs">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-2 font-mono">Weekly Revenue Split (INR)</span>
                          
                          {/* Beautiful SVG Sales Chart */}
                          <div className="h-32 w-full flex items-end justify-between gap-1 pt-4 pb-2 border-b border-slate-100 px-2 relative">
                            <div className="absolute inset-y-0 left-0 flex flex-col justify-between text-[8px] text-slate-300 font-mono pointer-events-none pb-2 pt-4">
                              <span>3L</span>
                              <span>2L</span>
                              <span>1L</span>
                              <span>0</span>
                            </div>
                            
                            {[
                              { day: 'Mon', amt: 180000, h: '60%' },
                              { day: 'Tue', amt: 220000, h: '75%' },
                              { day: 'Wed', amt: 290000, h: '95%' },
                              { day: 'Thu', amt: 140000, h: '45%' },
                              { day: 'Fri', amt: 210000, h: '70%' },
                              { day: 'Sat', amt: 250000, h: '85%' },
                              { day: 'Sun', amt: 192000, h: '65%' },
                            ].map((d, i) => (
                              <div key={i} className="flex-1 flex flex-col items-center gap-1 group z-10">
                                <div className="w-6.5 bg-primary/20 group-hover:bg-primary border border-primary/30 group-hover:border-transparent rounded-t-lg transition-all relative flex justify-center" style={{ height: d.h }}>
                                  {/* Tooltip */}
                                  <span className="opacity-0 group-hover:opacity-100 absolute -top-8 bg-slate-900 text-white font-bold font-mono text-[9px] px-1.5 py-0.5 rounded-md shadow-xs pointer-events-none transition-opacity z-50 whitespace-nowrap">
                                    ₹{(d.amt / 1000).toFixed(0)}k
                                  </span>
                                </div>
                                <span className="text-[9px] font-bold text-slate-400 font-mono">{d.day}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {msg.sender === 'bot' && msg.chartType === 'attendants' && (
                        <div className="mt-4 p-3 bg-white border border-slate-100 rounded-2xl shadow-xs w-full max-w-[280px]">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-2.5 font-mono">Attendants Rankings (Liters)</span>
                          
                          <div className="flex flex-col gap-2">
                            {[
                              { name: 'Karthik Raju', amt: '4,820 L', val: 95, color: 'bg-primary' },
                              { name: 'Suresh Kumar', amt: '3,900 L', val: 78, color: 'bg-blue-500' },
                              { name: 'Madan Lal', amt: '2,890 L', val: 58, color: 'bg-amber-500' },
                            ].map((att, i) => (
                              <div key={i} className="flex flex-col gap-1 text-[10px] font-medium text-slate-600">
                                <div className="flex justify-between font-bold text-slate-700">
                                  <span>{i + 1}. {att.name}</span>
                                  <span className="font-mono text-slate-500">{att.amt}</span>
                                </div>
                                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                  <div className={`h-full rounded-full ${att.color}`} style={{ width: `${att.val}%` }} />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {msg.sender === 'bot' && msg.chartType === 'inventory' && (
                        <div className="mt-4 p-3 bg-white border border-slate-100 rounded-2xl shadow-xs w-full max-w-[280px]">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-2.5 font-mono">ATG Tank Capacities</span>
                          
                          <div className="grid grid-cols-2 gap-4 text-[10px] font-semibold text-slate-600">
                            {/* Petrol Cylinder indicator */}
                            <div className="flex flex-col items-center gap-1.5">
                              <span className="text-[9px] font-bold text-slate-400 uppercase">Tank 1 (Petrol)</span>
                              <div className="h-20 w-11 border border-slate-200 rounded-full relative overflow-hidden bg-slate-50 flex items-end justify-center">
                                {/* Fuel Wave layer */}
                                <div className="h-[65%] w-full bg-primary/25 border-t border-primary/50 relative">
                                  <div className="absolute inset-0 flex items-center justify-center font-black font-mono text-[10px] text-primary">65%</div>
                                </div>
                              </div>
                            </div>

                            {/* Diesel Cylinder indicator */}
                            <div className="flex flex-col items-center gap-1.5">
                              <span className="text-[9px] font-bold text-slate-400 uppercase">Tank 2 (Diesel)</span>
                              <div className="h-20 w-11 border border-slate-200 rounded-full relative overflow-hidden bg-slate-50 flex items-end justify-center">
                                {/* Fuel Wave layer */}
                                <div className="h-[28%] w-full bg-blue-500/25 border-t border-blue-500/50 relative">
                                  <div className="absolute inset-0 flex items-center justify-center font-black font-mono text-[10px] text-blue-600">28%</div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {msg.sender === 'bot' && msg.chartType === 'credit' && (
                        <div className="mt-4 p-3 bg-white border border-slate-100 rounded-2xl shadow-xs w-full max-w-[280px]">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-2.5 font-mono">Overdue Accounts Limit Breach</span>
                          
                          <div className="flex flex-col gap-2.5 text-[10px]">
                            <div className="flex justify-between items-center bg-slate-50 p-2 rounded-xl border border-slate-100">
                              <div className="flex flex-col">
                                <span className="font-extrabold text-slate-700">Apex Logistics</span>
                                <span className="text-[9px] text-rose-500 font-bold font-mono">₹3.42L / ₹5L used</span>
                              </div>
                              <button
                                onClick={() => toast.success('WhatsApp warning alert dispatched!')}
                                className="px-2 py-1 bg-primary hover:bg-primary-hover text-white font-bold rounded-lg shrink-0 outline-none transition-colors"
                              >
                                Remind
                              </button>
                            </div>

                            <div className="flex justify-between items-center bg-slate-50 p-2 rounded-xl border border-slate-100">
                              <div className="flex flex-col">
                                <span className="font-extrabold text-slate-700">Elite Transport</span>
                                <span className="text-[9px] text-rose-500 font-bold font-mono">₹7.80L / ₹8L used</span>
                              </div>
                              <button
                                onClick={() => toast.success('WhatsApp warning alert dispatched!')}
                                className="px-2 py-1 bg-primary hover:bg-primary-hover text-white font-bold rounded-lg shrink-0 outline-none transition-colors"
                              >
                                Remind
                              </button>
                            </div>
                          </div>
                        </div>
                      )}

                    </div>
                    <span className="text-[9px] text-slate-400 font-mono tracking-tight">{msg.createdAt}</span>
                  </div>

                  {msg.sender === 'user' && (
                    <div className="h-8 w-8 rounded-xl bg-primary flex items-center justify-center text-white font-black text-xs shrink-0 select-none shadow-sm shadow-primary/20">
                      R
                    </div>
                  )}
                </div>
              ))}

              {isTyping && (
                <div className="flex items-start gap-3 justify-start">
                  <div className="h-8 w-8 rounded-xl bg-orange-100 border border-orange-200 flex items-center justify-center text-primary shrink-0 animate-pulse">
                    <Bot className="h-4.5 w-4.5" />
                  </div>
                  <div className="bg-slate-50 border border-slate-200/50 p-4 rounded-3xl rounded-tl-xs flex items-center gap-1">
                    <span className="h-1.5 w-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="h-1.5 w-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="h-1.5 w-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              )}
              
              <div ref={chatEndRef} />
            </div>

            {/* Suggested quick clicks row */}
            <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/50 flex gap-2 overflow-x-auto select-none shrink-0 scrollbar-none">
              {SUGGESTED_QUERIES.map((sq, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(sq.query)}
                  disabled={isTyping}
                  className="flex items-center gap-1.5 bg-white border border-slate-200 hover:border-primary/50 text-[10px] font-bold text-slate-600 hover:text-primary rounded-xl px-3 py-1.5 shrink-0 transition-all shadow-2xs outline-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {sq.icon}
                  {sq.label}
                </button>
              ))}
            </div>

            {/* Input typing box */}
            <div className="p-4 border-t border-slate-100 bg-white flex gap-3 shrink-0 items-center">
              <input
                type="text"
                placeholder={`Ask Copilot about sales, attendants, or tank levels at ${currentPumpName}...`}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyPress}
                disabled={isTyping}
                className="flex-grow rounded-xl bg-slate-50 border border-slate-200 pl-4 pr-3 py-3 text-xs font-semibold text-slate-700 outline-none transition-all placeholder:text-slate-400 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 disabled:opacity-75"
              />

              <button
                onClick={() => handleSendMessage(inputText)}
                disabled={isTyping || !inputText.trim()}
                className="h-10 w-10 rounded-xl bg-primary hover:bg-primary-hover text-white flex items-center justify-center shadow-md shadow-primary/20 hover:shadow-primary/30 transition-all outline-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="h-4.5 w-4.5" />
              </button>
            </div>

          </div>

        </div>
      )}
    </div>
  );
}
