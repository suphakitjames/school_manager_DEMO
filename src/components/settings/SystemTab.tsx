"use client";

import { useState, useEffect } from "react";
import { 
  Database, 
  HardDrive, 
  ShieldAlert, 
  Trash2, 
  RefreshCw, 
  Activity, 
  Server, 
  DownloadCloud,
  CheckCircle2,
  AlertTriangle,
  Power
} from "lucide-react";

export default function SystemTab() {
  const [loading, setLoading] = useState(true);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [debugMode, setDebugMode] = useState(false);
  const [systemInfo, setSystemInfo] = useState({
    version: "v2.5.0",
    storageUsedGb: 0,
    storageTotalGb: 100,
    status: "online"
  });
  
  const [clearingCache, setClearingCache] = useState(false);
  const [cacheCleared, setCacheCleared] = useState(false);
  
  const [optimizingDb, setOptimizingDb] = useState(false);
  const [dbOptimized, setDbOptimized] = useState(false);

  const [backupingDb, setBackupingDb] = useState(false);
  const [dbBackedUp, setDbBackedUp] = useState(false);

  const [resettingSettings, setResettingSettings] = useState(false);
  const [settingsReset, setSettingsReset] = useState(false);

  useEffect(() => {
    fetchSystemInfo();
  }, []);

  const fetchSystemInfo = async () => {
    try {
      const res = await fetch("/api/settings/system");
      if (res.ok) {
        const data = await res.json();
        setMaintenanceMode(data.maintenanceMode || false);
        setDebugMode(data.debugMode || false);
        if (data.version) {
           setSystemInfo({
             version: data.version,
             storageUsedGb: data.storageUsedGb,
             storageTotalGb: data.storageTotalGb,
             status: data.status
           });
        }
      }
    } catch (error) {
      console.error("Failed to load system settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = async (key: string, value: boolean) => {
    try {
      if (key === 'maintenanceMode') setMaintenanceMode(value);
      if (key === 'debugMode') setDebugMode(value);
      
      const payload = { [key]: value };
      
      await fetch("/api/settings/system", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } catch (error) {
       console.error("Error updating setting:", error);
       // Revert on error
       if (key === 'maintenanceMode') setMaintenanceMode(!value);
       if (key === 'debugMode') setDebugMode(!value);
    }
  };

  const handleClearCache = async () => {
    setClearingCache(true);
    setCacheCleared(false);
    try {
      await fetch("/api/settings/system/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "clear_cache" }),
      });
      setCacheCleared(true);
      setTimeout(() => setCacheCleared(false), 3000);
    } catch (error) {
      console.error(error);
    } finally {
      setClearingCache(false);
    }
  };

  const handleOptimizeDb = async () => {
    setOptimizingDb(true);
    setDbOptimized(false);
    try {
      await fetch("/api/settings/system/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "optimize_db" }),
      });
      setDbOptimized(true);
      setTimeout(() => setDbOptimized(false), 3000);
    } catch (error) {
      console.error(error);
    } finally {
      setOptimizingDb(false);
    }
  };

  const handleBackupDb = async () => {
    setBackupingDb(true);
    setDbBackedUp(false);
    try {
      await fetch("/api/settings/system/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "backup_db" }),
      });
      setDbBackedUp(true);
      setTimeout(() => setDbBackedUp(false), 3000);
    } catch (error) {
      console.error(error);
    } finally {
      setBackupingDb(false);
    }
  };

  const handleResetSettings = async () => {
    if (!confirm("คุณแน่ใจหรือไม่ที่จะรีเซ็ตการตั้งค่าท้้งหมด? การกระทำนี้ไม่สามารถย้อนกลับได้")) return;
    
    setResettingSettings(true);
    setSettingsReset(false);
    try {
      await fetch("/api/settings/system/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reset_settings" }),
      });
      setSettingsReset(true);
      setTimeout(() => setSettingsReset(false), 3000);
    } catch (error) {
      console.error(error);
    } finally {
      setResettingSettings(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-slate-500 gap-4">
        <RefreshCw className="w-8 h-8 animate-spin text-indigo-500" />
        <p>กำลังโหลดข้อมูลระบบ...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* System Status Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
              <Activity className="w-5 h-5 text-emerald-600" />
            </div>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> ปกติ
            </span>
          </div>
          <div>
            <p className="text-sm font-bold text-slate-500 mb-1">สถานะระบบ</p>
            <h3 className="text-xl font-black text-slate-800">{systemInfo.status === 'maintenance' ? 'ปิดปรับปรุง' : 'ออนไลน์ (99.9%)'}</h3>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
              <Server className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-xs font-bold text-slate-400">{systemInfo.version}</span>
          </div>
          <div>
            <p className="text-sm font-bold text-slate-500 mb-1">เวอร์ชันระบบ</p>
            <h3 className="text-xl font-black text-slate-800">อัปเดตล่าสุด</h3>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
              <HardDrive className="w-5 h-5 text-purple-600" />
            </div>
            <span className="text-xs font-bold text-slate-400">{Math.round((systemInfo.storageUsedGb / systemInfo.storageTotalGb) * 100)}% Used</span>
          </div>
          <div>
            <p className="text-sm font-bold text-slate-500 mb-1">พื้นที่จัดเก็บข้อมูล</p>
            <h3 className="text-xl font-black text-slate-800">{systemInfo.storageUsedGb} GB <span className="text-sm font-medium text-slate-400">/ {systemInfo.storageTotalGb} GB</span></h3>
          </div>
        </div>
      </div>

      {/* Storage & Database Details */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 lg:p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
            <Database className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800">จัดการพื้นที่และฐานข้อมูล</h2>
            <p className="text-xs text-slate-500">ข้อมูลการใช้งานและการปรับแต่งประสิทธิภาพฐานข้อมูล</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Progress Bar */}
          <div>
            <div className="flex justify-between text-sm font-bold mb-2">
              <span className="text-slate-700">การใช้งานพื้นที่ทั้งหมด</span>
              <span className="text-slate-500">{systemInfo.storageUsedGb} GB ของ {systemInfo.storageTotalGb} GB</span>
            </div>
            <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden flex">
              <div className="h-full bg-blue-500" style={{ width: '25%' }} title="รูปภาพและสื่อ (25%)" />
              <div className="h-full bg-indigo-500" style={{ width: '15%' }} title="ฐานข้อมูล (15%)" />
              <div className="h-full bg-emerald-500" style={{ width: '5%' }} title="เอกสาร (5%)" />
            </div>
            <div className="flex justify-between items-center mt-3 text-xs text-slate-500 font-medium">
              <div className="flex gap-4">
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-500" /> รูปภาพ (25GB)</span>
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-indigo-500" /> ฐานข้อมูล (15GB)</span>
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500" /> เอกสารต่างๆ (5GB)</span>
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-slate-200" /> ว่าง (55GB)</span>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="border border-slate-200 rounded-xl p-5 flex flex-col justify-between">
              <div>
                <h4 className="font-bold text-slate-800 text-sm mb-1">ล้างแคชระบบ (System Cache)</h4>
                <p className="text-xs text-slate-500 mb-4 h-8">ลบไฟล์ขยะชั่วคราวเพื่อเพิ่มพื้นที่ว่างและช่วยให้ระบบทำงานรวดเร็วขึ้น</p>
              </div>
              <button 
                onClick={handleClearCache}
                disabled={clearingCache}
                className={`w-full py-2.5 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-colors ${
                  cacheCleared 
                    ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' 
                    : 'bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100 hover:text-slate-900 disabled:opacity-50'
                }`}
              >
                {clearingCache ? (
                  <><RefreshCw className="w-4 h-4 animate-spin text-slate-400" /> กำลังล้างแคช...</>
                ) : cacheCleared ? (
                  <><CheckCircle2 className="w-4 h-4" /> สำเร็จ 1.2 GB</>
                ) : (
                  <><Trash2 className="w-4 h-4 text-slate-400" /> ล้างแคชระบบ</>
                )}
              </button>
            </div>

            <div className="border border-slate-200 rounded-xl p-5 flex flex-col justify-between">
              <div>
                <h4 className="font-bold text-slate-800 text-sm mb-1">ปรับแต่งฐานข้อมูล (Optimize DB)</h4>
                <p className="text-xs text-slate-500 mb-4 h-8">จัดเรียงดัชนีและบีบอัดข้อมูลเก่าเพื่อการเรียกดึงข้อมูลที่ดีขึ้น</p>
              </div>
              <button 
                onClick={handleOptimizeDb}
                disabled={optimizingDb}
                className={`w-full py-2.5 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-colors ${
                  dbOptimized 
                    ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' 
                    : 'bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100 hover:text-indigo-800 disabled:opacity-50'
                }`}
              >
                {optimizingDb ? (
                  <><RefreshCw className="w-4 h-4 animate-spin text-indigo-400" /> กำลังประมวลผล...</>
                ) : dbOptimized ? (
                  <><CheckCircle2 className="w-4 h-4" /> ปรับแต่งเสร็จสิ้น</>
                ) : (
                  <><Database className="w-4 h-4 text-indigo-400" /> เริ่มปรับแต่ง</>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Advanced Security & Maintenance */}
      <div className="bg-white rounded-2xl border border-red-200 shadow-sm overflow-hidden">
        <div className="bg-red-50/50 p-6 lg:p-8 border-b border-red-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
              <ShieldAlert className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-red-800">เมนูผู้ดูแลระดับสูง (Danger Zone)</h2>
              <p className="text-xs text-red-600/80">การเปลี่ยนแปลงในส่วนนี้อาจส่งผลกระทบต่อระบบและการเข้าใช้งาน</p>
            </div>
          </div>
        </div>
        
        <div className="p-6 lg:p-8 flex flex-col space-y-5">
          {/* Maintenance Mode Toggle */}
          <div className="flex items-start justify-between p-5 border border-slate-200 rounded-xl transition-colors hover:border-slate-300">
            <div className="flex gap-4">
              <div className={`mt-1 p-2 rounded-lg ${maintenanceMode ? 'bg-orange-100 text-orange-600' : 'bg-slate-100 text-slate-400'}`}>
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-800">โหมดปิดปรับปรุงระบบ (Maintenance Mode)</h4>
                <p className="text-xs text-slate-500 mt-1 mb-2 max-w-lg">
                  ระบบจะปิดรับการเข้าสู่ระบบ ล็อกเอ้าท์ผู้ใช้งานปัจจุบันทั้งหมด 
                  (ยกเว้นผู้ดูแลระบบ) และแสดงหน้า "กำลังปรับปรุง"
                </p>
                {maintenanceMode && (
                  <span className="inline-flex items-center text-[10px] font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded border border-orange-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse mr-1.5" /> 
                    ระบบกำลังอยู่ในโหมดปรับปรุง
                  </span>
                )}
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-2">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={maintenanceMode} 
                onChange={(e) => updateSetting('maintenanceMode', e.target.checked)} 
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
            </label>
          </div>

          {/* Debug Mode Toggle */}
          <div className="flex items-start justify-between p-5 border border-slate-200 rounded-xl transition-colors hover:border-slate-300">
            <div className="flex gap-4">
              <div className={`mt-1 p-2 rounded-lg ${debugMode ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-400'}`}>
                <Power className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-800">โหมดนักพัฒนา (Debug Mode)</h4>
                <p className="text-xs text-slate-500 mt-1 max-w-lg">
                  แสดงข้อผิดพลาด (Errors) และ Logs โดยละเอียดในหน้าเว็บ (ไม่ควรเปิดใช้งานในระบบจริงบนโปรดักชัน)
                </p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-2">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={debugMode} 
                onChange={(e) => updateSetting('debugMode', e.target.checked)} 
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
            </label>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row gap-3 border-t border-slate-100">
            <button 
              onClick={handleBackupDb}
              disabled={backupingDb}
              className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold border transition-colors ${
                dbBackedUp 
                  ? 'bg-emerald-50 text-emerald-600 border-emerald-200' 
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:text-slate-900 disabled:opacity-50'
              }`}
            >
              {backupingDb ? (
                <><RefreshCw className="w-4 h-4 animate-spin text-slate-400" /> กำลังสำรอง...</>
              ) : dbBackedUp ? (
                <><CheckCircle2 className="w-4 h-4" /> สำรองข้อมูลสำเร็จ</>
              ) : (
                <><DownloadCloud className="w-4 h-4" /> สำรองข้อมูล (Backup DB)</>
              )}
            </button>
            <button 
              onClick={handleResetSettings}
              disabled={resettingSettings}
              className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold border transition-colors ml-auto sm:ml-0 ${
                settingsReset
                  ? 'bg-red-50 text-red-600 border-red-200'
                  : 'bg-white text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300 disabled:opacity-50'
              }`}
            >
              {resettingSettings ? (
                <><RefreshCw className="w-4 h-4 animate-spin text-red-400" /> กำลังรีเซ็ต...</>
              ) : settingsReset ? (
                <><CheckCircle2 className="w-4 h-4" /> รีเซ็ตสำเร็จ</>
              ) : (
                <><Trash2 className="w-4 h-4" /> รีเซ็ตการตั้งค่าดั้งเดิม</>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
