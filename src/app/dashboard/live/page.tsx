'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Video,
  Play,
  Pause,
  Shield,
  Eye,
  EyeOff,
  Cpu,
  Layers,
  Activity,
  Maximize2,
  ListRestart,
  Fuel,
} from 'lucide-react';
import { toast } from '@/components/feedback/Toast';

export default function LiveMonitorPage() {
  const [activeCam, setActiveCam] = useState<number>(1);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [showANPR, setShowANPR] = useState<boolean>(true);
  const [showPersonDetect, setShowPersonDetect] = useState<boolean>(true);
  const [showSafetyZones, setShowSafetyZones] = useState<boolean>(true);

  // Simulated AI CCTV logs
  const [logs, setLogs] = useState<Array<{ id: string; time: string; msg: string; type: 'info' | 'warn' | 'success' }>>([
    { id: 'l_1', time: '12:02:14', msg: 'ANPR matched plate AP-09-CD-1234 linked to Rajesh Kumar.', type: 'success' },
    { id: 'l_2', time: '12:04:30', msg: 'Attendant Vikram Singh checked in at Dispenser 2 Safety zone.', type: 'info' },
    { id: 'l_3', time: '12:08:45', msg: 'Alert: Vehicle parked in Tanker Unloading Safety Bay.', type: 'warn' },
  ]);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const requestRef = useRef<number | null>(null);

  // Periodically insert new simulated logs
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      const plates = ['TS-08-EJ-9921', 'DL-03-CD-4567', 'KA-51-MM-8921', 'MH-12-PQ-3049'];
      const users = ['Vikram Singh', 'Anjali Sharma', 'Suresh Patel', 'Aditya Sen'];
      const dispensers = [1, 2, 3, 4];
      
      const newPlate = plates[Math.floor(Math.random() * plates.length)];
      const newUser = users[Math.floor(Math.random() * users.length)];
      const newDisp = dispensers[Math.floor(Math.random() * dispensers.length)];

      const isBanned = Math.random() > 0.8;
      const time = new Date().toLocaleTimeString('en-US', { hour12: false });
      
      const newLog = isBanned
        ? {
            id: 'l_' + Math.random(),
            time,
            msg: `Alert: Blacklisted vehicle ${newPlate} attempted fuel checkout. Dispenser ${newDisp} locked.`,
            type: 'warn' as const,
          }
        : {
            id: 'l_' + Math.random(),
            time,
            msg: `ANPR matched plate ${newPlate} linked to ${newUser} at Dispenser ${newDisp}.`,
            type: 'success' as const,
          };

      setLogs((prev) => [newLog, ...prev.slice(0, 15)]);
      
      if (isBanned) {
        toast.error(`Operational Security Alarm: Blacklisted plate detected!`);
      }
    }, 6000);

    return () => clearInterval(interval);
  }, [isPlaying]);

  // Main HTML5 Canvas draw scanning loop for real-time AI bounding box rendering
  useEffect(() => {
    let frameId: number;
    let scanLineY = 0;
    let scanDirection = 1;

    const draw = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const w = canvas.width;
      const h = canvas.height;

      // 1. Draw static grid camera placeholder (dark CCTV feel)
      ctx.fillStyle = '#0f172a'; // slate-900 background
      ctx.fillRect(0, 0, w, h);

      // Draw structural elements (mock wireframes of petrol station)
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1;
      // Draw grid lines
      for (let i = 0; i < w; i += 40) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, h);
        ctx.stroke();
      }
      for (let j = 0; j < h; j += 40) {
        ctx.beginPath();
        ctx.moveTo(0, j);
        ctx.lineTo(w, j);
        ctx.stroke();
      }

      if (isPlaying) {
        // Draw simulated dispensers (mock grey panels)
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(80, 120, 60, 100); // Dispenser 1
        ctx.fillRect(260, 120, 60, 100); // Dispenser 2

        ctx.fillStyle = '#f97316'; // Display Orange
        ctx.font = 'bold 8px monospace';
        ctx.fillText('DISPENSER 1', 82, 115);
        ctx.fillText('DISPENSER 2', 262, 115);

        // 2. Draw Safety zones overlays (Orange warning boxes)
        if (showSafetyZones) {
          ctx.strokeStyle = 'rgba(249, 115, 22, 0.4)';
          ctx.fillStyle = 'rgba(249, 115, 22, 0.05)';
          ctx.lineWidth = 1.5;
          ctx.setLineDash([4, 4]);
          
          // Safety zone around Dispenser 1
          ctx.fillRect(50, 100, 120, 140);
          ctx.strokeRect(50, 100, 120, 140);
          
          // Tanker unloading bay (Danger zone)
          ctx.strokeStyle = 'rgba(239, 68, 68, 0.4)';
          ctx.fillStyle = 'rgba(239, 68, 68, 0.05)';
          ctx.fillRect(400, 80, 180, 160);
          ctx.strokeRect(400, 80, 180, 160);
          ctx.fillStyle = '#ef4444';
          ctx.fillText('DANGER ZONE: TANKER UNLOAD', 410, 75);
          
          ctx.setLineDash([]);
        }

        // 3. Draw Attendant tracking (Person detection)
        if (showPersonDetect) {
          ctx.strokeStyle = '#38bdf8'; // Sky-400
          ctx.lineWidth = 2;
          
          // Person 1 (Attendant Rajesh)
          ctx.strokeRect(120, 150, 25, 55);
          ctx.fillStyle = 'rgba(56, 189, 248, 0.15)';
          ctx.fillRect(120, 150, 25, 55);
          
          ctx.fillStyle = '#38bdf8';
          ctx.font = 'bold 9px monospace';
          ctx.fillText('Attendant Rajesh', 120, 145);
          ctx.fillText('98.4% Confidence', 120, 215);

          // Person 2 (Customer)
          ctx.strokeStyle = '#38bdf8';
          ctx.strokeRect(280, 160, 25, 55);
          ctx.fillStyle = 'rgba(56, 189, 248, 0.15)';
          ctx.fillRect(280, 160, 25, 55);
          ctx.fillStyle = '#38bdf8';
          ctx.fillText('Customer', 280, 155);
        }

        // 4. Draw Vehicle plate tracking (ANPR plate boxes)
        if (showANPR) {
          ctx.strokeStyle = '#22c55e'; // Emerald-500
          ctx.lineWidth = 2;
          
          // Car at Dispenser 2
          ctx.strokeRect(250, 130, 80, 90);
          ctx.fillStyle = 'rgba(34, 197, 94, 0.1)';
          ctx.fillRect(250, 130, 80, 90);
          
          // Plate tooltip badge
          ctx.fillStyle = '#22c55e';
          ctx.fillRect(250, 105, 80, 18);
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 9px monospace';
          ctx.fillText('AP-09-CD-1234', 255, 117);
          
          ctx.fillStyle = '#22c55e';
          ctx.fillText('ANPR: MATCHED', 250, 230);
        }

        // 5. Draw laser scanning line
        ctx.strokeStyle = 'rgba(249, 115, 22, 0.5)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(0, scanLineY);
        ctx.lineTo(w, scanLineY);
        ctx.stroke();

        scanLineY += scanDirection * 2.5;
        if (scanLineY >= h || scanLineY <= 0) {
          scanDirection *= -1;
        }

        // 6. Draw active recording dot
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(25, 25, 5, 0, 2 * Math.PI);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 9px sans-serif';
        ctx.fillText('REC', 35, 28);
      } else {
        // Draw paused overlay
        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.fillRect(0, 0, w, h);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 16px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('CCTV FEED PAUSED', w / 2, h / 2);
        ctx.textAlign = 'start'; // restore
      }

      // Draw camera info labels
      ctx.fillStyle = 'rgba(0,0,0,0.6)';
      ctx.fillRect(5, h - 25, w - 10, 20);
      ctx.fillStyle = '#cbd5e1';
      ctx.font = 'bold 9px monospace';
      ctx.fillText(`CAM 0${activeCam} // FORECOURT DISPENSERS BAY 1 & 2 // FPS: 30`, 12, h - 12);

      frameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(frameId);
    };
  }, [isPlaying, activeCam, showANPR, showPersonDetect, showSafetyZones]);

  return (
    <div className="flex flex-col gap-6 w-full font-plus-jakarta text-slate-800">
      {/* 1. MODULE HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white border border-slate-100 rounded-2xl p-6 shadow-xs gap-4 text-left">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-100 border border-orange-200 text-primary">
            <Video className="h-5.5 w-5.5" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-lg font-extrabold text-text-primary tracking-tight">AI Forecourt Live Monitor</h1>
            <p className="text-xs text-text-secondary">Simulated real-time CCTV analysis, vehicle ANPR plate recognition, and safety compliance</p>
          </div>
        </div>

        {/* AI processor hardware status banner */}
        <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 text-slate-300 px-4 py-2 rounded-xl text-xs font-bold font-mono shadow-md">
          <Cpu className="h-4 w-4 text-primary animate-pulse" />
          AI UNIT: COMPUTE_ONLINE
        </div>
      </div>

      {/* 2. CAMERA GRID & AI TELEMETRY PANEL */}
      <div className="grid lg:grid-cols-12 gap-6 items-start">
        {/* Left: Interactive Canvas Screen & Camera switchers */}
        <div className="lg:col-span-8 flex flex-col gap-4 w-full">
          {/* Main Simulated CCTV screen wrapper */}
          <div className="w-full aspect-video rounded-3xl overflow-hidden border border-slate-900 shadow-2xl relative bg-slate-950">
            <canvas ref={canvasRef} width={640} height={360} className="w-full h-full object-cover" />
          </div>

          {/* Screen controls & Toggles */}
          <div className="bg-white border border-slate-100 rounded-2xl p-4.5 flex flex-wrap justify-between items-center gap-4">
            {/* Play/Pause controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className={`
                  inline-flex items-center justify-center h-10 w-10 rounded-xl transition-all cursor-pointer outline-none active:scale-95
                  ${isPlaying ? 'bg-slate-900 hover:bg-slate-800 text-white' : 'bg-primary hover:bg-primary-hover text-white'}
                `}
              >
                {isPlaying ? <Pause className="h-4.5 w-4.5" /> : <Play className="h-4.5 w-4.5 pl-0.5" />}
              </button>
              <span className="text-xs font-bold text-slate-500">
                {isPlaying ? 'LIVE SCANNING ACTIVE' : 'CCTV CAMERAS STANDBY'}
              </span>
            </div>

            {/* AI Layers switches */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowANPR(!showANPR)}
                className={`
                  px-3.5 py-2 border rounded-xl text-xs font-bold transition-all cursor-pointer outline-none select-none flex items-center gap-1.5
                  ${
                    showANPR
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-600 font-bold'
                      : 'bg-slate-50 border-slate-200 text-slate-400 hover:border-slate-300'
                  }
                `}
              >
                {showANPR ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                ANPR Tracker
              </button>

              <button
                onClick={() => setShowPersonDetect(!showPersonDetect)}
                className={`
                  px-3.5 py-2 border rounded-xl text-xs font-bold transition-all cursor-pointer outline-none select-none flex items-center gap-1.5
                  ${
                    showPersonDetect
                      ? 'bg-blue-50 border-blue-200 text-blue-600 font-bold'
                      : 'bg-slate-50 border-slate-200 text-slate-400 hover:border-slate-300'
                  }
                `}
              >
                {showPersonDetect ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                Person overlay
              </button>

              <button
                onClick={() => setShowSafetyZones(!showSafetyZones)}
                className={`
                  px-3.5 py-2 border rounded-xl text-xs font-bold transition-all cursor-pointer outline-none select-none flex items-center gap-1.5
                  ${
                    showSafetyZones
                      ? 'bg-orange-50 border-orange-200 text-primary font-bold'
                      : 'bg-slate-50 border-slate-200 text-slate-400 hover:border-slate-300'
                  }
                `}
              >
                {showSafetyZones ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                Safety zones
              </button>
            </div>
          </div>

          {/* Grid of 4 cameras thumbnail selectors */}
          <div className="grid grid-cols-4 gap-4">
            {[
              { id: 1, name: 'Dispensers 1 & 2' },
              { id: 2, name: 'Dispensers 3 & 4' },
              { id: 3, name: 'Tanker Loading Bay' },
              { id: 4, name: 'Main Road Entrance' },
            ].map((cam) => (
              <button
                key={cam.id}
                onClick={() => {
                  setActiveCam(cam.id);
                  toast.info(`Switched active live monitor view to: CAM 0${cam.id}`);
                }}
                className={`
                  flex flex-col p-3 rounded-xl border text-left gap-1.5 transition-all duration-300 cursor-pointer outline-none select-none active:scale-95
                  ${
                    activeCam === cam.id
                      ? 'border-primary bg-orange-50/15 shadow-sm'
                      : 'border-slate-200 hover:border-border-accent bg-white'
                  }
                `}
              >
                <span className="text-[10px] font-bold text-slate-400 font-mono leading-none">CCTV CAM 0{cam.id}</span>
                <span className="text-xs font-bold text-text-primary leading-tight truncate">{cam.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Right: Live AI Event logs feed */}
        <div className="lg:col-span-4 bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex flex-col gap-4 text-left h-[500px]">
          <div className="flex justify-between items-center border-b border-slate-50 pb-3">
            <div className="flex items-center gap-2">
              <Activity className="h-4.5 w-4.5 text-primary shrink-0" />
              <span className="text-xs font-extrabold text-text-primary">Realtime AI Event Logs</span>
            </div>
            <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0 animate-ping" />
          </div>

          <div className="flex-1 overflow-y-auto flex flex-col gap-2.5 pr-1.5">
            {logs.map((log) => {
              const borderClasses = {
                success: 'border-l-2 border-l-emerald-500 bg-slate-50',
                warn: 'border-l-2 border-l-amber-500 bg-amber-500/5',
                info: 'border-l-2 border-l-blue-500 bg-slate-50',
              };

              return (
                <div key={log.id} className={`p-3 rounded-xl border border-slate-100/50 flex flex-col gap-1 text-[11px] leading-relaxed ${borderClasses[log.type]}`}>
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-400 font-mono tracking-tight">{log.time}</span>
                    <span className={`text-[8px] font-bold tracking-wider uppercase font-mono ${log.type === 'warn' ? 'text-amber-600' : 'text-slate-500'}`}>
                      {log.type === 'warn' ? 'COMPLIANCE FLAG' : 'TRACKING DATA'}
                    </span>
                  </div>
                  <p className="font-semibold text-slate-700 leading-normal">{log.msg}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
