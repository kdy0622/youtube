
import React, { useState, useEffect, useRef } from 'react';
import { ThumbnailStrategy } from '../types';

interface ThumbnailPreviewProps {
  strategy: ThumbnailStrategy;
  imageUrl?: string;
  isLoadingImage?: boolean;
  onUpdate?: (updated: ThumbnailStrategy) => void;
}

type FontType = 
  | 'font-pretendard' 
  | 'font-gmarket' 
  | 'font-blackhan' 
  | 'font-nanumpen' 
  | 'font-jua' 
  | 'font-dohyeon' 
  | 'font-gamja' 
  | 'font-poorstory' 
  | 'font-tmon';

const ThumbnailPreview: React.FC<ThumbnailPreviewProps> = ({ strategy, imageUrl, isLoadingImage, onUpdate }) => {
  const [localStrategy, setLocalStrategy] = useState(strategy);
  const [fontSizeMultiplier, setFontSizeMultiplier] = useState(7);
  const [alignment, setAlignment] = useState<'left' | 'center' | 'right'>('left');
  const [verticalAlign, setVerticalAlign] = useState<'top' | 'center' | 'bottom'>('center');
  const [overlayOpacity, setOverlayOpacity] = useState(0.4);
  const [fontFamily, setFontFamily] = useState<FontType>('font-gmarket');
  
  const [titleColor, setTitleColor] = useState('#ffffff');
  const [subtitleColor, setSubtitleColor] = useState('#facc15');
  const [badgeBgColor, setBadgeBgColor] = useState('#dc2626');

  const thumbnailRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    setLocalStrategy(strategy);
  }, [strategy]);

  const handleChange = (field: keyof ThumbnailStrategy, value: string) => {
    const updated = { ...localStrategy, [field]: value };
    setLocalStrategy(updated);
    if (onUpdate) onUpdate(updated);
  };

  const fontOptions = [
    { name: '지마켓 산스', value: 'font-gmarket' },
    { name: '고딕', value: 'font-pretendard' },
    { name: '블랙한산스', value: 'font-blackhan' },
    { name: '티몬몬소리', value: 'font-tmon' },
    { name: '도현체', value: 'font-dohyeon' },
    { name: '주아체', value: 'font-jua' },
    { name: '나눔펜', value: 'font-nanumpen' },
    { name: '감자꽃체', value: 'font-gamja' },
    { name: '푸어스토리', value: 'font-poorstory' },
  ];

  const exportThumbnail = async (mode: 'download' | 'copy') => {
    if (!thumbnailRef.current || isExporting) return;
    
    const lib = (window as any).htmlToImage;
    if (!lib) {
      alert("이미지 라이브러리가 로드되지 않았습니다. 잠시 후 다시 시도해주세요.");
      return;
    }

    setIsExporting(true);
    try {
      const dataUrl = await lib.toPng(thumbnailRef.current, {
        pixelRatio: 2,
        cacheBust: true,
        backgroundColor: '#000000'
      });

      if (mode === 'download') {
        const link = document.createElement('a');
        link.download = `thumbnail-${Date.now()}.png`;
        link.href = dataUrl;
        link.click();
      } else {
        const res = await fetch(dataUrl);
        const blob = await res.blob();
        await navigator.clipboard.write([
          new ClipboardItem({ [blob.type]: blob })
        ]);
        alert("이미지가 클립보드에 복사되었습니다.");
      }
    } catch (err) {
      console.error(err);
      alert("이미지 처리 중 오류가 발생했습니다.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Action Buttons */}
      <div className="flex justify-end gap-2">
        <button 
          onClick={() => exportThumbnail('copy')}
          disabled={!imageUrl || isExporting}
          className="px-4 py-2 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 rounded-lg text-xs font-bold transition-all"
        >
          클립보드 복사
        </button>
        <button 
          onClick={() => exportThumbnail('download')}
          disabled={!imageUrl || isExporting}
          className="px-4 py-2 bg-red-600 hover:bg-red-500 disabled:opacity-50 rounded-lg text-xs font-bold shadow-lg transition-all"
        >
          이미지로 저장
        </button>
      </div>

      {/* Canvas Area */}
      <div 
        ref={thumbnailRef}
        className="relative w-full aspect-video rounded-xl overflow-hidden bg-black border border-slate-800 shadow-2xl select-none"
      >
        {/* Background */}
        {imageUrl ? (
          <img src={imageUrl} crossOrigin="anonymous" alt="Thumbnail Background" className="absolute inset-0 w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-slate-900">
            {isLoadingImage ? (
              <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-slate-500 text-xs font-bold">배경 생성 중...</p>
              </div>
            ) : (
              <p className="text-slate-700 font-bold uppercase tracking-widest text-sm">Preview Area</p>
            )}
          </div>
        )}

        {/* Dark Overlay */}
        <div className="absolute inset-0 z-10" style={{ backgroundColor: `rgba(0,0,0,${overlayOpacity})` }}></div>

        {/* Text Layer */}
        <div 
          className={`absolute inset-0 z-20 p-[5%] flex flex-col pointer-events-none
            ${verticalAlign === 'top' ? 'justify-start' : verticalAlign === 'center' ? 'justify-center' : 'justify-end'}
            ${alignment === 'center' ? 'items-center text-center' : alignment === 'right' ? 'items-end text-right' : 'items-start text-left'}
          `}
        >
          <div className="max-w-full space-y-[1.5vw]">
            {/* Badge */}
            <div className="inline-block transform -rotate-2">
              <span 
                className="px-[1.5vw] py-[0.5vw] rounded font-black text-white shadow-xl"
                style={{ backgroundColor: badgeBgColor, fontSize: '2.2vw' }}
              >
                {localStrategy.badge}
              </span>
            </div>

            {/* Title */}
            <h1 
              className={`${fontFamily} leading-[1.15] break-keep tracking-tighter whitespace-pre-wrap`}
              style={{ 
                fontSize: `${fontSizeMultiplier}vw`, 
                color: titleColor,
                textShadow: '0 4px 12px rgba(0,0,0,0.8)'
              }}
            >
              {localStrategy.title}
            </h1>

            {/* Subtitle */}
            <p 
              className="font-black"
              style={{ 
                color: subtitleColor, 
                fontSize: '3.2vw',
                textShadow: '0 2px 8px rgba(0,0,0,0.8)'
              }}
            >
              {localStrategy.subtitle}
            </p>
          </div>
        </div>
      </div>

      {/* Controls Container */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">메인 타이틀 수정</label>
            <textarea 
              value={localStrategy.title} 
              onChange={(e) => handleChange('title', e.target.value)}
              className="w-full h-24 bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm font-bold text-white focus:ring-1 focus:ring-red-600 outline-none resize-none"
            />
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">서브텍스트 / 뱃지</label>
              <input 
                type="text" 
                value={localStrategy.subtitle} 
                onChange={(e) => handleChange('subtitle', e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs font-bold text-white"
                placeholder="서브 타이틀"
              />
              <input 
                type="text" 
                value={localStrategy.badge} 
                onChange={(e) => handleChange('badge', e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs font-bold text-white mt-2"
                placeholder="뱃지 문구"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4 border-t border-slate-700">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase">폰트 스타일</label>
            <select 
              value={fontFamily} 
              onChange={(e) => setFontFamily(e.target.value as FontType)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs font-bold text-white"
            >
              {fontOptions.map(o => <option key={o.value} value={o.value}>{o.name}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase">글자 크기 ({fontSizeMultiplier})</label>
            <input type="range" min="3" max="15" step="0.1" value={fontSizeMultiplier} onChange={(e) => setFontSizeMultiplier(parseFloat(e.target.value))} className="w-full accent-red-600" />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase">배경 밝기</label>
            <input type="range" min="0" max="1" step="0.05" value={overlayOpacity} onChange={(e) => setOverlayOpacity(parseFloat(e.target.value))} className="w-full accent-red-600" />
          </div>
        </div>

        <div className="flex flex-wrap gap-6 pt-4 border-t border-slate-700">
          <div className="flex-1 min-w-[150px] space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase">가로 정렬</label>
            <div className="flex bg-slate-900 rounded-lg p-1 border border-slate-700">
              {(['left', 'center', 'right'] as const).map(p => (
                <button key={p} onClick={() => setAlignment(p)} className={`flex-1 py-1 rounded text-[10px] font-black uppercase ${alignment === p ? 'bg-red-600 text-white' : 'text-slate-500'}`}>{p}</button>
              ))}
            </div>
          </div>
          <div className="flex-1 min-w-[150px] space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase">세로 위치</label>
            <div className="flex bg-slate-900 rounded-lg p-1 border border-slate-700">
              {(['top', 'center', 'bottom'] as const).map(p => (
                <button key={p} onClick={() => setVerticalAlign(p)} className={`flex-1 py-1 rounded text-[10px] font-black uppercase ${verticalAlign === p ? 'bg-red-600 text-white' : 'text-slate-500'}`}>{p}</button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThumbnailPreview;
