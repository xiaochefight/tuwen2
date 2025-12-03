
import React, { useRef, useState, useCallback, useEffect } from 'react';
import { toPng } from 'html-to-image';
import JSZip from 'jszip';
import { Image, FileCode, Loader2, Layers, Smartphone, MessageCircle, ChevronDown, Grid, Eye, ChevronLeft, ChevronRight, Package, Images, User, Upload, Edit3, Move, Palette } from 'lucide-react';
import { CardContent, CardStyle, UserInfo, UserInfoPosition } from '../types';
import CardRenderer from './CardRenderer';
import { generateStandardSvg } from '../utils/svgGenerator'; // Import custom generator

interface CardGridProps {
  content: CardContent;
  onContentChange: (newContent: CardContent) => void;
}

type Platform = 'XIAOHONGSHU' | 'WECHAT';

interface ExportTask {
  platform: Platform;
  pages: Array<{
    renderMode: 'cover' | 'slide';
    sectionIndex: number;
    index: number;
    total: number;
  }>;
}

// --- Sub-Components ---
const SlidePreview: React.FC<{ content: CardContent; style: CardStyle; styleName: string; userInfo: UserInfo }> = ({ content, style, userInfo }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const totalSlides = 1 + content.sections.length;

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % totalSlides);
  };

  const exportWidth = 750;
  const exportHeight = 1000;
  const displayWidth = 280;
  const scale = displayWidth / exportWidth;
  const displayHeight = exportHeight * scale;
  const isCover = currentIndex === 0;
  
  return (
    <div className="w-full flex flex-col items-center pb-4 pt-2 bg-gray-50/50 rounded-lg select-none">
       <div 
         className="relative shadow-sm rounded-lg overflow-hidden bg-white group transition-all duration-300 ease-in-out"
         style={{ width: `${displayWidth}px`, height: `${displayHeight}px` }}
       >
          <div style={{ width: `${exportWidth}px`, height: `${exportHeight}px`, transform: `scale(${scale})`, transformOrigin: 'top left' }}>
             <CardRenderer 
                content={content} 
                style={style} 
                renderMode={isCover ? 'cover' : 'slide'} 
                sectionIndex={isCover ? -1 : currentIndex - 1}
                fixedAspectRatioClass="w-full h-full"
                footerNote={`${currentIndex + 1}/${totalSlides}`}
                userInfo={userInfo}
             />
          </div>
          <div className="absolute inset-0 flex items-center justify-between px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-50">
             <button onClick={handlePrev} className="bg-black/50 hover:bg-black/70 text-white p-2 rounded-full backdrop-blur-sm shadow-lg"><ChevronLeft size={20} /></button>
             <button onClick={handleNext} className="bg-black/50 hover:bg-black/70 text-white p-2 rounded-full backdrop-blur-sm shadow-lg"><ChevronRight size={20} /></button>
          </div>
          <div className="absolute bottom-3 right-3 bg-black/60 text-white text-[10px] font-mono px-2 py-0.5 rounded-full backdrop-blur-md pointer-events-none z-50">
             {currentIndex + 1} / {totalSlides}
          </div>
       </div>
       <div className="flex gap-2 mt-4 overflow-x-auto max-w-full px-4 no-scrollbar h-4 items-center justify-center">
          {Array.from({ length: totalSlides }).map((_, i) => (
            <button key={i} onClick={() => setCurrentIndex(i)} className={`rounded-full transition-all duration-300 ${i === currentIndex ? 'w-6 h-1.5 bg-indigo-600' : 'w-1.5 h-1.5 bg-gray-300 hover:bg-gray-400'}`} />
          ))}
       </div>
    </div>
  );
};

const PositionEditor: React.FC<{ 
  userInfo: UserInfo; 
  setUserInfo: React.Dispatch<React.SetStateAction<UserInfo>>; 
  content: CardContent 
}> = ({ userInfo, setUserInfo, content }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    e.preventDefault();
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    e.preventDefault();
  };

  const handleMove = useCallback((clientX: number, clientY: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    
    // Calculate position relative to container
    let x = clientX - rect.left;
    let y = clientY - rect.top;

    // Convert to percentage
    let xPercent = (x / rect.width) * 100;
    let yPercent = (y / rect.height) * 100;

    // Clamp values (keep inside)
    xPercent = Math.max(2, Math.min(90, xPercent));
    yPercent = Math.max(2, Math.min(90, yPercent));

    setUserInfo(prev => ({
      ...prev,
      customPos: { x: xPercent, y: yPercent }
    }));
  }, [setUserInfo]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        handleMove(e.clientX, e.clientY);
      }
    };
    const handleMouseUp = () => setIsDragging(false);

    const handleTouchMove = (e: TouchEvent) => {
      if (isDragging && e.touches.length > 0) {
        handleMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    };
    const handleTouchEnd = () => setIsDragging(false);

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleTouchMove);
      window.addEventListener('touchend', handleTouchEnd);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isDragging, handleMove]);

  return (
    <div className="flex flex-col gap-2 animate-in fade-in zoom-in duration-300">
       <div className="text-xs text-indigo-600 font-bold flex justify-between">
          <span>拖拽头像调整位置</span>
          <span>X: {Math.round(userInfo.customPos.x)}%, Y: {Math.round(userInfo.customPos.y)}%</span>
       </div>
       <div 
         ref={containerRef}
         className="relative w-full aspect-[3/4] bg-gray-100 rounded-lg overflow-hidden border-2 border-dashed border-indigo-200 cursor-crosshair group"
       >
          {/* Static Background Preview (Minimalist Style) */}
          <div className="absolute inset-0 pointer-events-none opacity-50 scale-[0.35] origin-top-left w-[285%] h-[285%]">
             <CardRenderer 
               content={content} 
               style={CardStyle.MINIMALIST} 
               renderMode="cover" 
               // Disable internal user info to prevent double rendering
               userInfo={{...userInfo, enabled: false}} 
             />
          </div>
          
          {/* Draggable Overlay */}
          <div 
             className={`absolute flex items-center gap-2 p-1 rounded border-2 z-50 transition-transform duration-75 select-none ${isDragging ? 'border-indigo-500 bg-white/80 scale-110 shadow-xl cursor-grabbing' : 'border-indigo-500/0 hover:border-indigo-500/50 cursor-grab bg-white/40 backdrop-blur-sm'}`}
             style={{ 
               left: `${userInfo.customPos.x}%`, 
               top: `${userInfo.customPos.y}%`,
               transform: 'translate(0, 0)' // Origin handled by left/top
             }}
             onMouseDown={handleMouseDown}
             onTouchStart={handleTouchStart}
          >
             {userInfo.avatar ? (
                <div className="w-8 h-8 rounded-full overflow-hidden border border-white shadow-sm">
                   <img src={userInfo.avatar} className="w-full h-full object-cover" />
                </div>
             ) : (
                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-500"><User size={16} /></div>
             )}
             <span className="text-[10px] font-bold text-gray-800 whitespace-nowrap">{userInfo.nickname}</span>
             
             {isDragging && (
                <>
                   {/* Guides */}
                   <div className="fixed top-0 left-[-1000px] right-[-1000px] h-px bg-indigo-500 border-t border-dashed opacity-50 pointer-events-none"></div>
                   <div className="fixed top-[-1000px] bottom-[-1000px] left-0 w-px bg-indigo-500 border-l border-dashed opacity-50 pointer-events-none"></div>
                </>
             )}
          </div>
       </div>
    </div>
  );
};

const CardWrapper: React.FC<{ content: CardContent; style: CardStyle; styleName: string; userInfo: UserInfo; onContentChange: (c: CardContent) => void }> = ({ content, style, styleName, userInfo, onContentChange }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const hiddenExportRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState<string | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  const [viewMode, setViewMode] = useState<'total' | 'slides'>('total');
  const [isEditMode, setIsEditMode] = useState(false);
  
  const [exportState, setExportState] = useState<{ isActive: boolean; platform: Platform; pageConfig: ExportTask['pages'][0] | null; }>({ isActive: false, platform: 'XIAOHONGSHU', pageConfig: null });

  const handleDownloadSingle = async (format: 'png' | 'svg') => {
    if (viewMode === 'slides') {
       if (!confirm("即将下载长图，是否继续？")) return;
       setViewMode('total');
       await new Promise(r => setTimeout(r, 200));
    }

    if (!cardRef.current) return;
    setIsDownloading(format);
    
    try {
      const timestamp = new Date().getTime();
      const fileName = `magic-card-${style.toLowerCase()}-${timestamp}.${format}`;
      
      let dataUrl = '';
      
      if (format === 'svg') {
         // USE CUSTOM GENERATOR FOR SVG with Encoding Fix
         const svgString = generateStandardSvg(content, style, 'cover', 0, userInfo);
         
         // Fix encoding for Visio/Windows: Add BOM and use Uint8Array
         const bom = new Uint8Array([0xEF, 0xBB, 0xBF]);
         const svgBytes = new TextEncoder().encode(svgString);
         const blob = new Blob([bom, svgBytes], { type: 'image/svg+xml;charset=utf-8' });
         
         dataUrl = URL.createObjectURL(blob);
      } else {
         // USE HTML-TO-IMAGE FOR PNG
         const node = cardRef.current;
         dataUrl = await toPng(node, { quality: 1.0, pixelRatio: 2 });
      }

      const link = document.createElement('a');
      link.download = fileName;
      link.href = dataUrl;
      link.click();
      
      if (format === 'svg') URL.revokeObjectURL(dataUrl);

    } catch (err) {
      console.error('Export failed', err);
      alert('生成失败，请重试。');
    } finally {
      setIsDownloading(null);
    }
  };

  const calculatePages = (platform: Platform): ExportTask => {
    const pages: ExportTask['pages'] = [];
    const totalSections = content.sections ? content.sections.length : 0;
    pages.push({ renderMode: 'cover', sectionIndex: -1, index: 1, total: 1 });
    if (totalSections > 0) {
      for (let i = 0; i < totalSections; i++) {
        pages.push({ renderMode: 'slide', sectionIndex: i, index: pages.length + 1, total: 1 });
      }
    }
    const total = pages.length;
    pages.forEach(p => p.total = total);
    return { platform, pages };
  };

  const handleDownloadSeries = async (platform: Platform, method: 'zip' | 'individual', format: 'png' | 'svg') => {
    setShowMenu(false);
    setIsDownloading('series');
    
    const task = calculatePages(platform);
    const width = platform === 'XIAOHONGSHU' ? 750 : 640;
    const height = platform === 'XIAOHONGSHU' ? 1000 : 960;

    let zip: JSZip | null = null;
    let imgFolder: JSZip | null = null;
    if (method === 'zip') {
      zip = new JSZip();
      imgFolder = zip.folder(`magic-cards-${style.toLowerCase()}`);
    }

    try {
      for (const page of task.pages) {
        let fileContent: string = '';
        
        if (format === 'svg') {
           // Use Custom Generator
           fileContent = generateStandardSvg(content, style, page.renderMode, page.sectionIndex, userInfo);
        } else {
           // Use PNG Generator
           setExportState({ isActive: true, platform, pageConfig: page });
           await new Promise(resolve => setTimeout(resolve, 250)); // Wait for render
           
           if (hiddenExportRef.current) {
             const node = hiddenExportRef.current.firstElementChild as HTMLElement;
             if (node) {
               fileContent = await toPng(node, { width, height, pixelRatio: 2 });
             }
           }
        }

        // Handle Download
        if (method === 'individual') {
           const link = document.createElement('a');
           link.download = `card-${style.toLowerCase()}-${page.index}.${format}`;
           if (format === 'svg') {
             // Fix Encoding
             const bom = new Uint8Array([0xEF, 0xBB, 0xBF]);
             const svgBytes = new TextEncoder().encode(fileContent);
             const blob = new Blob([bom, svgBytes], { type: 'image/svg+xml;charset=utf-8' });
             link.href = URL.createObjectURL(blob);
           } else {
             link.href = fileContent;
           }
           link.click();
           await new Promise(r => setTimeout(r, 200));
        } else if (method === 'zip' && imgFolder) {
           if (format === 'svg') {
              // Note: JSZip handles strings as UTF-8 by default, but we can store blob if needed.
              // For simplicity with JSZip, standard string usually works, but to be safe for Windows extraction:
              imgFolder.file(`card-${page.index.toString().padStart(2, '0')}.svg`, fileContent);
           } else {
              imgFolder.file(`card-${page.index.toString().padStart(2, '0')}.png`, fileContent.split(',')[1], {base64: true});
           }
        }
      }

      if (method === 'zip' && zip) {
        const content = await zip.generateAsync({type: "blob"});
        const url = URL.createObjectURL(content);
        const link = document.createElement('a');
        link.download = `magic-cards-${style.toLowerCase()}-${format}-pack.zip`;
        link.href = url;
        link.click();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      }
    } catch (err) {
      console.error("Series export failed", err);
      alert("批量生成失败");
    } finally {
      setIsDownloading(null);
      setExportState(prev => ({ ...prev, isActive: false }));
    }
  };

  return (
    <div className="flex flex-col gap-3 group relative">
      <div className="fixed left-[-9999px] top-[-9999px] overflow-hidden pointer-events-none z-0" ref={hiddenExportRef}>
        {exportState.isActive && exportState.pageConfig && (
          <div style={{ width: exportState.platform === 'XIAOHONGSHU' ? '750px' : '640px', height: exportState.platform === 'XIAOHONGSHU' ? '1000px' : '960px' }}>
            <CardRenderer content={content} style={style} renderMode={exportState.pageConfig.renderMode} sectionIndex={exportState.pageConfig.sectionIndex} footerNote={`${exportState.pageConfig.index}/${exportState.pageConfig.total}`} fixedAspectRatioClass="w-full h-full" userInfo={userInfo} />
          </div>
        )}
      </div>

      <div className="flex justify-between items-center px-1">
        <span className="text-xs font-mono text-gray-400 group-hover:text-gray-800 transition-colors">{styleName}</span>
        <div className="flex gap-2">
            <button 
              onClick={() => setIsEditMode(!isEditMode)} 
              className={`text-xs font-medium flex items-center gap-1 transition-colors ${isEditMode ? 'text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded' : 'text-gray-400 hover:text-indigo-600'}`}
            >
               <Edit3 size={14} /> {isEditMode ? '完成' : '编辑'}
            </button>
            <button onClick={() => setViewMode(prev => prev === 'total' ? 'slides' : 'total')} className="text-xs font-medium text-gray-400 hover:text-indigo-600 flex items-center gap-1 transition-colors">
               {viewMode === 'total' ? <Eye size={14} /> : <Grid size={14} />} {viewMode === 'total' ? '预览多图' : '预览长图'}
            </button>
        </div>
      </div>
      
      <div className={`relative shadow-sm hover:shadow-md transition-all duration-300 rounded-lg bg-white border ${isEditMode ? 'border-indigo-300 ring-2 ring-indigo-500/20' : 'border-gray-100'}`}>
        {viewMode === 'total' ? (
           <div ref={cardRef} className="w-full bg-white overflow-hidden rounded-lg">
             <CardRenderer 
               content={content} 
               style={style} 
               renderMode="total" 
               userInfo={userInfo} 
               isEditable={isEditMode}
               onContentChange={onContentChange}
             />
           </div>
        ) : (
           <div className="w-full bg-white rounded-lg p-1">
             <SlidePreview content={content} style={style} styleName={styleName} userInfo={userInfo} />
           </div>
        )}
      </div>

      <div className="flex items-center gap-2 pt-1">
        <button onClick={() => handleDownloadSingle('png')} disabled={!!isDownloading} className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium text-gray-600 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-all disabled:opacity-50">
          {isDownloading === 'png' ? <Loader2 size={14} className="animate-spin" /> : <Image size={14} />} 长图
        </button>
        <button onClick={() => handleDownloadSingle('svg')} disabled={!!isDownloading} className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium text-gray-600 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-all disabled:opacity-50">
          {isDownloading === 'svg' ? <Loader2 size={14} className="animate-spin" /> : <FileCode size={14} />} SVG
        </button>
        <div className="relative">
          <button onClick={() => setShowMenu(!showMenu)} disabled={!!isDownloading} className={`flex items-center justify-center gap-1 px-2 py-2 text-xs font-medium border rounded-lg transition-all disabled:opacity-50 ${showMenu ? 'bg-indigo-50 border-indigo-200 text-indigo-600' : 'bg-gray-50 border-gray-200 text-gray-600'}`}>
             {isDownloading === 'series' ? <Loader2 size={14} className="animate-spin" /> : <Layers size={14} />} <ChevronDown size={12} />
          </button>
          {showMenu && (
            <div className="absolute bottom-full right-0 mb-2 w-64 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50">
               <div className="bg-gray-50/50 px-3 py-2 border-b border-gray-100 flex items-center gap-2 text-xs font-bold text-gray-600"><Smartphone size={14} /> 小红书 (3:4)</div>
               <div className="p-2 space-y-2 border-b border-gray-100">
                  <div className="grid grid-cols-2 gap-2">
                    <button onClick={() => handleDownloadSeries('XIAOHONGSHU', 'zip', 'png')} className="flex items-center justify-center gap-1 py-1.5 bg-indigo-50 text-indigo-700 rounded text-[10px] font-medium"><Package size={12} /> PNG包</button>
                    <button onClick={() => handleDownloadSeries('XIAOHONGSHU', 'individual', 'png')} className="flex items-center justify-center gap-1 py-1.5 bg-white border text-gray-700 rounded text-[10px] font-medium"><Images size={12} /> PNG逐张</button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button onClick={() => handleDownloadSeries('XIAOHONGSHU', 'zip', 'svg')} className="flex items-center justify-center gap-1 py-1.5 bg-emerald-50 text-emerald-700 rounded text-[10px] font-medium"><FileCode size={12} /> SVG包</button>
                    <button onClick={() => handleDownloadSeries('XIAOHONGSHU', 'individual', 'svg')} className="flex items-center justify-center gap-1 py-1.5 bg-white border text-gray-700 rounded text-[10px] font-medium"><FileCode size={12} /> SVG逐张</button>
                  </div>
               </div>
               <div className="bg-gray-50/50 px-3 py-2 border-b border-gray-100 flex items-center gap-2 text-xs font-bold text-gray-600"><MessageCircle size={14} /> 公众号 (2:3)</div>
               <div className="p-2 space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <button onClick={() => handleDownloadSeries('WECHAT', 'zip', 'png')} className="flex items-center justify-center gap-1 py-1.5 bg-indigo-50 text-indigo-700 rounded text-[10px] font-medium"><Package size={12} /> PNG包</button>
                    <button onClick={() => handleDownloadSeries('WECHAT', 'individual', 'png')} className="flex items-center justify-center gap-1 py-1.5 bg-white border text-gray-700 rounded text-[10px] font-medium"><Images size={12} /> PNG逐张</button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button onClick={() => handleDownloadSeries('WECHAT', 'zip', 'svg')} className="flex items-center justify-center gap-1 py-1.5 bg-emerald-50 text-emerald-700 rounded text-[10px] font-medium"><FileCode size={12} /> SVG包</button>
                    <button onClick={() => handleDownloadSeries('WECHAT', 'individual', 'svg')} className="flex items-center justify-center gap-1 py-1.5 bg-white border text-gray-700 rounded text-[10px] font-medium"><FileCode size={12} /> SVG逐张</button>
                  </div>
               </div>
            </div>
          )}
          {showMenu && <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)}></div>}
        </div>
      </div>
    </div>
  );
};

const getStyleName = (style: CardStyle): string => {
  switch (style) {
    case CardStyle.MINIMALIST: return '极简留白';
    case CardStyle.MODERN_GRADIENT: return '现代渐变';
    case CardStyle.CYBERPUNK: return '赛博朋克';
    case CardStyle.NEO_BRUTALISM: return '新丑主义';
    case CardStyle.ELEGANT_LUXURY: return '黑金奢华';
    case CardStyle.NATURE_ORGANIC: return '自然有机';
    case CardStyle.GLASSMORPHISM: return '毛玻璃拟态';
    case CardStyle.NEWSPAPER: return '复古报纸';
    default: return style;
  }
};

const CardGrid: React.FC<CardGridProps> = ({ content, onContentChange }) => {
  const [userInfo, setUserInfo] = useState<UserInfo>({
    enabled: false,
    avatar: null,
    nickname: '我的昵称',
    position: 'bottom-left',
    customPos: { x: 5, y: 90 },
    scale: 1,
    opacity: 0.9
  });

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUserInfo(prev => ({ ...prev, avatar: reader.result as string, enabled: true }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="container mx-auto px-4 pb-24 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* User Info Toolbar */}
      <div className="mb-12 bg-white rounded-xl p-6 shadow-sm border border-slate-100">
         <div className="flex flex-col md:flex-row gap-8 items-start">
            
            <div className="flex-1 space-y-4 w-full">
               <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-800 flex items-center gap-2">
                     <User size={20} className="text-indigo-600" />
                     <span>个人水印设置</span>
                  </h3>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" checked={userInfo.enabled} onChange={e => setUserInfo({...userInfo, enabled: e.target.checked})} />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                  </label>
               </div>

               {userInfo.enabled && (
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-top-2">
                    <div className="space-y-4">
                       <div>
                          <label className="block text-xs font-bold text-slate-500 mb-1">头像</label>
                          <div className="flex items-center gap-3">
                             <div className="w-10 h-10 rounded-full bg-slate-100 overflow-hidden border border-slate-200">
                                {userInfo.avatar ? <img src={userInfo.avatar} className="w-full h-full object-cover" /> : <User className="w-full h-full p-2 text-slate-300" />}
                             </div>
                             <label className="flex-1">
                                <span className="sr-only">Choose file</span>
                                <input type="file" accept="image/*" onChange={handleAvatarUpload} className="block w-full text-xs text-slate-500
                                  file:mr-2 file:py-1.5 file:px-3
                                  file:rounded-full file:border-0
                                  file:text-xs file:font-semibold
                                  file:bg-indigo-50 file:text-indigo-700
                                  hover:file:bg-indigo-100 cursor-pointer
                                "/>
                             </label>
                          </div>
                       </div>
                       
                       <div>
                          <label className="block text-xs font-bold text-slate-500 mb-1">昵称</label>
                          <input 
                             type="text" 
                             value={userInfo.nickname} 
                             onChange={e => setUserInfo({...userInfo, nickname: e.target.value})}
                             className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none"
                          />
                       </div>

                       <div>
                          <label className="block text-xs font-bold text-slate-500 mb-1">预设位置</label>
                          <div className="grid grid-cols-3 gap-2">
                             {['bottom-left', 'bottom-right', 'top-left', 'top-right'].map((pos) => (
                                <button 
                                  key={pos}
                                  onClick={() => setUserInfo({...userInfo, position: pos as any})}
                                  className={`px-2 py-1.5 text-xs border rounded ${userInfo.position === pos ? 'bg-indigo-50 border-indigo-200 text-indigo-600 font-bold' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                                >
                                  {pos}
                                </button>
                             ))}
                             <button 
                                onClick={() => setUserInfo({...userInfo, position: 'custom'})}
                                className={`px-2 py-1.5 text-xs border rounded col-span-2 ${userInfo.position === 'custom' ? 'bg-indigo-50 border-indigo-200 text-indigo-600 font-bold' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                             >
                                <Move size={10} className="inline mr-1"/> 自定义位置
                             </button>
                          </div>
                       </div>
                       
                       <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1">大小 ({userInfo.scale.toFixed(1)})</label>
                            <input type="range" min="0.5" max="1.5" step="0.1" value={userInfo.scale} onChange={e => setUserInfo({...userInfo, scale: parseFloat(e.target.value)})} className="w-full accent-indigo-600" />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1">透明度 ({Math.round(userInfo.opacity * 100)}%)</label>
                            <input type="range" min="0.1" max="1" step="0.1" value={userInfo.opacity} onChange={e => setUserInfo({...userInfo, opacity: parseFloat(e.target.value)})} className="w-full accent-indigo-600" />
                          </div>
                       </div>
                    </div>

                    {userInfo.position === 'custom' && (
                       <div className="w-full max-w-[200px] mx-auto">
                          <PositionEditor userInfo={userInfo} setUserInfo={setUserInfo} content={content} />
                       </div>
                    )}
                 </div>
               )}
            </div>
         </div>
      </div>
      
      {/* Card Grid */}
      <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
         <Palette size={20} className="text-indigo-600" /> 选择风格并导出
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {Object.values(CardStyle).map((style) => (
          <CardWrapper
            key={style}
            content={content}
            style={style}
            styleName={getStyleName(style)}
            userInfo={userInfo}
            onContentChange={onContentChange}
          />
        ))}
      </div>
    </div>
  );
};

export default CardGrid;
