"use client";

import { useState, useEffect } from "react";
import { Image as ImageIcon, Plus, Trash2, Edit, Save, X, Link, RefreshCw, Grab, ArrowUp, ArrowDown } from "lucide-react";

type Banner = {
  id: number;
  imageUrl: string;
  title: string | null;
  subtitle: string | null;
  isActive: boolean;
  order: number;
};

type LandingLink = {
  id: number;
  title: string;
  url: string;
  icon: string | null;
  type: "QUICK_LINK" | "E_SERVICE";
  isActive: boolean;
  order: number;
};

export default function LandingPageTab() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [links, setLinks] = useState<LandingLink[]>([]);
  const [loading, setLoading] = useState(true);

  // Banner Modals
  const [isBannerModalOpen, setIsBannerModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Link Modals
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<LandingLink | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [bannersRes, linksRes] = await Promise.all([
        fetch("/api/settings/banners"),
        fetch("/api/settings/landing-links")
      ]);
      if (bannersRes.ok) setBanners(await bannersRes.json());
      if (linksRes.ok) setLinks(await linksRes.json());
    } catch (error) {
      console.error("Error fetching landing page data:", error);
    } finally {
      setLoading(false);
    }
  };

  // --- Banners ---
  const handleSaveBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBanner?.imageUrl) return alert("กรุณาอัปโหลดรูปภาพ");

    try {
      const isNew = !editingBanner.id;
      const url = isNew ? "/api/settings/banners" : `/api/settings/banners/${editingBanner.id}`;
      const method = isNew ? "POST" : "PUT";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingBanner),
      });

      if (!res.ok) throw new Error("Failed to save banner");
      
      setIsBannerModalOpen(false);
      fetchData();
    } catch (error) {
      console.error(error);
      alert("ไม่สามารถบันทึกข้อมูลได้");
    }
  };

  const handleDeleteBanner = async (id: number) => {
    if (!confirm("ยืนยันการลบแบนเนอร์นี้?")) return;
    try {
      await fetch(`/api/settings/banners/${id}`, { method: "DELETE" });
      fetchData();
    } catch (error) {
      console.error(error);
    }
  };

  const handleBannerImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      setEditingBanner(prev => prev ? { ...prev, imageUrl: data.url } : null);
    } catch (error) {
      console.error(error);
      alert("อัปโหลดรูปภาพไม่สำเร็จ");
    } finally {
      setUploadingImage(false);
    }
  };

  const moveBanner = async (index: number, direction: 'up' | 'down') => {
    const newBanners = [...banners];
    if (direction === 'up' && index > 0) {
      [newBanners[index], newBanners[index - 1]] = [newBanners[index - 1], newBanners[index]];
    } else if (direction === 'down' && index < newBanners.length - 1) {
      [newBanners[index], newBanners[index + 1]] = [newBanners[index + 1], newBanners[index]];
    } else return;

    // Update frontend eagerly
    setBanners(newBanners);

    // Save order to DB (simplified: updating all)
    try {
      await Promise.all(newBanners.map((b, i) => 
        fetch(`/api/settings/banners/${b.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ order: i })
        })
      ));
    } catch (error) {
      console.error(error);
    }
  };

  // --- Links ---
  const handleSaveLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLink?.title || !editingLink?.url) return alert("กรุณากรอกข้อมูลให้ครบถ้วน");

    try {
      const isNew = !editingLink.id;
      const url = isNew ? "/api/settings/landing-links" : `/api/settings/landing-links/${editingLink.id}`;
      const method = isNew ? "POST" : "PUT";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingLink),
      });

      if (!res.ok) throw new Error("Failed to save link");
      
      setIsLinkModalOpen(false);
      fetchData();
    } catch (error) {
      console.error(error);
      alert("ไม่สามารถบันทึกข้อมูลได้");
    }
  };

  const handleDeleteLink = async (id: number) => {
    if (!confirm("ยืนยันการลบรายการนี้?")) return;
    try {
      await fetch(`/api/settings/landing-links/${id}`, { method: "DELETE" });
      fetchData();
    } catch (error) {
      console.error(error);
    }
  };


  if (loading) {
     return <div className="text-center py-20 text-slate-500"><RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4"/>กำลังโหลดข้อมูล...</div>;
  }

  return (
    <div className="space-y-8">

      {/* 1. Banners Section */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-200 flex justify-between items-center bg-slate-50">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
               <ImageIcon className="w-5 h-5 text-indigo-600" />
             </div>
             <div>
               <h3 className="font-bold text-slate-800">ภาพสไลด์โชว์ (Hero Banners)</h3>
               <p className="text-xs text-slate-500">จัดการรูปภาพสไลด์ด้านบนสุดของหน้าแรก</p>
             </div>
          </div>
          <button 
             onClick={() => {
               setEditingBanner({ id: 0, imageUrl: "", title: "", subtitle: "", isActive: true, order: banners.length });
               setIsBannerModalOpen(true);
             }}
             className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-indigo-700 transition-colors"
          >
            <Plus className="w-4 h-4" /> เพิ่มแบนเนอร์
          </button>
        </div>
        
        <div className="p-6">
          {banners.length === 0 ? (
            <div className="text-center py-10 text-slate-500 border-2 border-dashed border-slate-200 rounded-xl">ยังไม่มีแบนเนอร์</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {banners.map((banner, index) => (
                 <div key={banner.id} className={`group relative rounded-xl border-2 ${banner.isActive ? 'border-slate-200' : 'border-slate-200 opacity-60 grayscale'} overflow-hidden shadow-sm hover:shadow-md transition-all`}>
                    <img src={banner.imageUrl} alt={banner.title || ''} className="w-full h-40 object-cover" />
                    <div className="p-4 bg-white">
                      <h4 className="font-bold text-slate-800 truncate">{banner.title || "ไม่มีหัวข้อ"}</h4>
                      <p className="text-xs text-slate-500 truncate mt-1">{banner.subtitle || "ไม่มีคำบรรยาย"}</p>
                    </div>
                    
                    {/* Actions Overlay */}
                    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => { setEditingBanner(banner); setIsBannerModalOpen(true); }} className="p-2 bg-white rounded-lg shadow-sm text-blue-600 hover:bg-blue-50"><Edit className="w-4 h-4"/></button>
                      <button onClick={() => handleDeleteBanner(banner.id)} className="p-2 bg-white rounded-lg shadow-sm text-red-600 hover:bg-red-50"><Trash2 className="w-4 h-4"/></button>
                    </div>
                    {/* Reorder Overlay */}
                    <div className="absolute top-2 left-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 backdrop-blur rounded-lg shadow-sm p-1 border border-slate-200/50">
                      <button onClick={() => moveBanner(index, 'up')} disabled={index===0} className="p-1 hover:bg-slate-100 rounded disabled:opacity-30"><ArrowUp className="w-3 h-3 text-slate-600"/></button>
                      <button onClick={() => moveBanner(index, 'down')} disabled={index===banners.length-1} className="p-1 hover:bg-slate-100 rounded disabled:opacity-30"><ArrowDown className="w-3 h-3 text-slate-600"/></button>
                    </div>
                    {!banner.isActive && <div className="absolute top-0 right-0 bg-slate-800 text-white text-[10px] px-2 py-1 rounded-bl-lg font-bold">ปิดใช้งาน</div>}
                 </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 2. Links Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {[
          { type: "QUICK_LINK", title: "ข้อมูลพื้นฐาน (Quick Links)", desc: "เมนูลัดส่วนข้อมูลพื้นฐานโรงเรียน", color: "blue" },
          { type: "E_SERVICE", title: "E-Service", desc: "เมนูบริการอิเล็กทรอนิกส์", color: "amber" }
        ].map(section => (
          <div key={section.type} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            <div className="px-5 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <div className="flex items-center gap-2">
                 <Link className={`w-5 h-5 text-${section.color}-600`} />
                 <div>
                   <h3 className="font-bold text-slate-800">{section.title}</h3>
                   <p className="text-[10px] text-slate-500">{section.desc}</p>
                 </div>
              </div>
              <button 
                 onClick={() => {
                   setEditingLink({ id: 0, title: "", url: "", icon: "", type: section.type as "QUICK_LINK" | "E_SERVICE", isActive: true, order: 0 });
                   setIsLinkModalOpen(true);
                 }}
                 className={`px-3 py-1.5 bg-${section.color}-100 text-${section.color}-700 rounded-lg text-xs font-bold hover:bg-${section.color}-200 transition-colors`}
              >
                + เพิ่มลิงก์
              </button>
            </div>
            
            <div className="p-0 flex-1">
              {links.filter(l => l.type === section.type).length === 0 ? (
                 <div className="text-center py-10 text-slate-400 text-sm">ยังไม่มีรายการช้อมูล</div>
              ) : (
                <ul className="divide-y divide-slate-100">
                  {links.filter(l => l.type === section.type).map(link => (
                    <li key={link.id} className="flex justify-between items-center px-5 py-3 hover:bg-slate-50 transition-colors group">
                       <div className="flex items-center gap-3">
                         <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-slate-500">
                           {link.icon ? <span className="text-xs font-bold">{link.icon.substring(0,2)}</span> : <Link className="w-4 h-4"/>}
                         </div>
                         <div>
                           <p className={`text-sm font-bold ${link.isActive ? 'text-slate-800' : 'text-slate-400 line-through'}`}>{link.title}</p>
                           <p className="text-[10px] text-slate-500 truncate max-w-[200px]">{link.url}</p>
                         </div>
                       </div>
                       <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => { setEditingLink(link); setIsLinkModalOpen(true); }} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"><Edit className="w-3.5 h-3.5"/></button>
                          <button onClick={() => handleDeleteLink(link.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded"><Trash2 className="w-3.5 h-3.5"/></button>
                       </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        ))}
      </div>


      {/* Banner Modal */}
      {isBannerModalOpen && editingBanner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
             <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
               <h3 className="font-bold text-slate-800">{editingBanner.id ? "แก้ไขแบนเนอร์" : "เพิ่มแบนเนอร์ใหม่"}</h3>
               <button onClick={() => setIsBannerModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5"/></button>
             </div>
             
             <div className="p-6 overflow-y-auto">
               <form id="bannerForm" onSubmit={handleSaveBanner} className="space-y-5">
                 <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">รูปภาพ <span className="text-red-500">*</span></label>
                    <div className="w-full h-40 bg-slate-100 rounded-xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center relative overflow-hidden group">
                       {uploadingImage ? (
                         <RefreshCw className="w-6 h-6 animate-spin text-indigo-500" />
                       ) : editingBanner.imageUrl ? (
                         <>
                           <img src={editingBanner.imageUrl} alt="preview" className="w-full h-full object-cover" />
                           <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                             <span className="text-white font-bold text-sm bg-black/50 px-3 py-1.5 rounded-lg">คลิกเพื่อเปลี่ยนรูปภาพ</span>
                           </div>
                         </>
                       ) : (
                         <div className="text-center text-slate-400">
                           <ImageIcon className="w-8 h-8 mx-auto mb-2 opacity-50"/>
                           <span className="text-sm font-semibold">อัปโหลดรูปภาพ (1920x600px)</span>
                         </div>
                       )}
                       <input type="file" accept="image/*" onChange={handleBannerImageUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                    </div>
                 </div>
                 
                 <div>
                   <label className="block text-sm font-bold text-slate-700 mb-1">หัวข้อ (Title)</label>
                   <input type="text" value={editingBanner.title || ""} onChange={e => setEditingBanner({...editingBanner, title: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-xl bg-slate-50 text-sm" placeholder="เช่น ยินดีต้อนรับสู่..." />
                 </div>
                 
                 <div>
                   <label className="block text-sm font-bold text-slate-700 mb-1">คำบรรยาย (Subtitle)</label>
                   <input type="text" value={editingBanner.subtitle || ""} onChange={e => setEditingBanner({...editingBanner, subtitle: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-xl bg-slate-50 text-sm" placeholder="รายละเอียดเพิ่มเติม" />
                 </div>

                 <div className="flex items-center gap-3">
                   <label className="flex items-center cursor-pointer relative">
                     <input type="checkbox" checked={editingBanner.isActive} onChange={e => setEditingBanner({...editingBanner, isActive: e.target.checked})} className="sr-only" />
                     <div className={`w-11 h-6 rounded-full transition-colors ${editingBanner.isActive ? 'bg-indigo-600' : 'bg-slate-300'}`}></div>
                     <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${editingBanner.isActive ? 'translate-x-5' : ''}`}></div>
                   </label>
                   <span className="text-sm font-bold text-slate-700">เปิดใช้งานแบนเนอร์นี้</span>
                 </div>
               </form>
             </div>
             
             <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end">
               <button form="bannerForm" type="submit" disabled={uploadingImage} className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center gap-2">
                 <Save className="w-4 h-4" /> บันทึกแบนเนอร์
               </button>
             </div>
          </div>
        </div>
      )}


      {/* Link Modal */}
      {isLinkModalOpen && editingLink && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-xl overflow-hidden flex flex-col">
             <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
               <h3 className="font-bold text-slate-800">{editingLink.id ? "แก้ไขลิงก์" : "เพิ่มลิงก์ใหม่"}</h3>
               <button onClick={() => setIsLinkModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5"/></button>
             </div>
             
             <div className="p-6">
               <form id="linkForm" onSubmit={handleSaveLink} className="space-y-4">
                 <div>
                   <label className="block text-sm font-bold text-slate-700 mb-1">ชื่อลิงก์ <span className="text-red-500">*</span></label>
                   <input type="text" required value={editingLink.title} onChange={e => setEditingLink({...editingLink, title: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-xl bg-slate-50 text-sm" placeholder="เช่น ข้อมูลพื้นฐาน..." />
                 </div>
                 
                 <div>
                   <label className="block text-sm font-bold text-slate-700 mb-1">URL ปลายทาง <span className="text-red-500">*</span></label>
                   <input type="text" required value={editingLink.url} onChange={e => setEditingLink({...editingLink, url: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-xl bg-slate-50 text-sm" placeholder="/about หรือ https://..." />
                 </div>

                 <div>
                   <label className="block text-sm font-bold text-slate-700 mb-1">ไอคอน (Icon Name จาก lucide-react)</label>
                   <input type="text" value={editingLink.icon || ""} onChange={e => setEditingLink({...editingLink, icon: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-xl bg-slate-50 text-sm" placeholder="เช่น Users, BookOpen" />
                 </div>

                 <div className="flex items-center gap-3 pt-2">
                   <label className="flex items-center cursor-pointer relative">
                     <input type="checkbox" checked={editingLink.isActive} onChange={e => setEditingLink({...editingLink, isActive: e.target.checked})} className="sr-only" />
                     <div className={`w-11 h-6 rounded-full transition-colors ${editingLink.isActive ? 'bg-indigo-600' : 'bg-slate-300'}`}></div>
                     <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${editingLink.isActive ? 'translate-x-5' : ''}`}></div>
                   </label>
                   <span className="text-sm font-bold text-slate-700">เปิดใช้งานลิงก์นี้</span>
                 </div>
               </form>
             </div>
             
             <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end">
               <button form="linkForm" type="submit" className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-colors w-full">
                 บันทึกลิงก์
               </button>
             </div>
          </div>
        </div>
      )}

    </div>
  );
}
