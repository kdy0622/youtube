
import React, { useState, useEffect, useRef } from 'react';
import { ThumbnailStrategy } from '../types';

// html-to-image는 window 객체에 전역으로 로드됨 (index.html 참고)
declare const htmlToImage: any;

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
  // 폰트 크기 배율 (기본값 8)
  const [fontSizeMultiplier, setFontSizeMultiplier] = useState(8); 
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
    { name: '지마켓 산스 (Bold)', value: 'font-gmarket' },
    { name: '고딕 (Pretendard)', value: 'font-pretendard' },
    { name: '블랙 한 산스 (Heavy)', value: 'font-blackhan' },
    { name: '티몬 몬소리 (Impact)', value: 'font-tmon' },
    { name: '도현체 (Block)', value: 'font-dohyeon' },
    { name: '주아체 (Round)', value: 'font-jua' },
    { name: '나눔 손글씨 (Pen)', value: 'font-nanumpen' },
    { name: '감자꽃체 (Cute)', value: 'font-gamja' },
    { name: '푸어스토리 (Soft)', value: 'font-poorstory' },
  ];

  const getVerticalJustify = () => {
    if (verticalAlign === 'top') return 'justify-start';
    if (verticalAlign === 'center') return 'justify-center';
    return 'justify-end';
  };

  const exportThumbnail = async (mode: 'download' | 'copy') => {
    if (!thumbnailRef.current) return;
    setIsExporting(true);
    
    try {
      if (typeof htmlToImage === 'undefined') {
        throw new Error("html-to-image library not loaded");
      }

      const dataUrl = await htmlToImage.toPng(thumbnailRef.current, {
        pixelRatio: 2,
        cacheBust: true,
      });

      if (mode === 'download') {
        const link = document.createElement('a');
        link.download = `youtube-thumbnail-${Date.now()}.png`;
        link.href = dataUrl;
        link.click();
      } else {
        const response = await fetch(dataUrl);
        const blob = await response.blob();
        await navigator.clipboard.write([
          new ClipboardItem({ [blob.type]: blob })
        ]);
        alert("클립보드에 복사되었습니다!");
      }
    } catch (err) {
      console.error(err);
      alert("이미지 처리 중 오류가 발생했습니다.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end gap-3 mb-2">
        <button 
          onClick={() => exportThumbnail('copy')}
          disabled={isExporting || !imageUrl}
          className="px-4 py-2 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 rounded-xl text-xs font-black flex items-center gap-2 transition-all"
        >
          전체 복사
        </button>
        <button 
          onClick={() => exportThumbnail('download')}
          disabled={isExporting || !imageUrl}
          className="px-4 py-2 bg-red-600 hover:bg-red-500 disabled:opacity-50 rounded-xl text-xs font-black flex items-center gap-2 transition-all shadow-lg"
        >
          다운로드
        </button>
      </div>

      {/* Main Preview Canvas */}
      <div 
        ref={thumbnailRef}
        className="relative aspect-video w-full rounded-2xl overflow-hidden shadow-2xl bg-black border border-slate-700 flex items-stretch"
      >
        {/* Background Layer */}
        <div className="absolute inset-0 z-0">
          {imageUrl ? (
            <img src={imageUrl} crossOrigin="anonymous" alt="Thumbnail" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-slate-800">
              {isLoadingImage ? <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div> : <p className="text-slate-500 font-bold">배경 생성 대기 중</p>}
            </div>
          )}
          {/* Dark Overlay */}
          <div className="absolute inset-0" style={{ backgroundColor: `rgba(0,0,0,${overlayOpacity})` }}></div>
        </div>

        {/* Content Layer: Using calc and aspect-ratio based sizing for responsiveness */}
        <div className={`relative z-10 w-full h-full p-[5%] flex flex-col ${getVerticalJustify()}`}>
          <div className={`flex flex-col gap-[2%] w-full ${alignment === 'center' ? 'items-center text-center' : alignment === 'right' ? 'items-end text-right' : 'items-start text-left'}`}>
            
            {/* Badge */}
            <div className="inline-block transform -rotate-1 mb-[1%]">
              <span 
                className="text-white px-[2.5%] py-[1%] rounded-md font-black shadow-2xl inline-block" 
                // FIXED: Removed duplicate fontSize property. Using 2.8vw for responsive scaling.
                style={{ backgroundColor: badgeBgColor, fontSize: '2.8vw' }}
              >
                {localStrategy.badge}
              </span>
            </div>

            {/* Title: Size is linked to fontSizeMultiplier and viewport width for auto-scale */}
            <h1 
              className={`${fontFamily} leading-[1.1] drop-shadow-[0_4px_8px_rgba(0,0,0,1)] break-keep tracking-tighter whitespace-pre-wrap w-full`} 
              style={{ 
                fontSize: `${fontSizeMultiplier}vw`, 
                color: titleColor,
                textShadow: '2px 2px 10px rgba(0,0,0,0.8)'
              }}
            >
              {localStrategy.title}
            </h1>

            {/* Subtitle */}
            <p 
              className="font-black drop-shadow-md mt-[1%]" 
              style={{ 
                color: subtitleColor, 
                fontSize: '3.5vw',
                textShadow: '1px 1px 5px rgba(0,0,0,0.8)'
              }}
            >
              {localStrategy.subtitle}
            </p>
          </div>
        </div>
      </div>

      {/* Editor Controls */}
      <div className="bg-slate-800/60 backdrop-blur-xl p-8 rounded-3xl border border-slate-700/50 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-3">
            <label className="text-xs font-black text-slate-500 uppercase">메인 타이틀 (엔터로 줄바꿈)</label>
            <textarea 
              value={localStrategy.title} 
              onChange={(e) => handleChange('title', e.target.value)} 
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-4 text-white font-bold h-24 focus:ring-2 focus:ring-red-600 outline-none" 
            />
          </div>
          <div className="space-y-3">
            <label className="text-xs font-black text-slate-500 uppercase">서브텍스트 & 뱃지</label>
            <input type="text" value={localStrategy.subtitle} onChange={(e) => handleChange('subtitle', e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white mb-2" placeholder="서브 타이틀" />
            <input type="text" value={localStrategy.badge} onChange={(e) => handleChange('badge', e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white" placeholder="뱃지 문구" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-4 border-t border-slate-700/50">
          <div className="space-y-3">
            <label className="text-xs font-black text-slate-500 uppercase">폰트 스타일</label>
            <select value={fontFamily} onChange={(e) => setFontFamily(e.target.value as FontType)} className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white font-bold">
                {fontOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.name}</option>)}
            </select>
          </div>
          <div className="space-y-3">
            <label className="text-xs font-black text-slate-500 uppercase">글씨 크기 자동 비율 ({fontSizeMultiplier})</label>
            <input type="range" min="3" max="15" step="0.1" value={fontSizeMultiplier} onChange={(e) => setFontSizeMultiplier(parseFloat(e.target.value))} className="w-full accent-red-600" />
          </div>
          <div className="space-y-3">
            <label className="text-xs font-black text-slate-500 uppercase">배경 어둡기</label>
            <input type="range" min="0" max="1" step="0.05" value={overlayOpacity} onChange={(e) => setOverlayOpacity(parseFloat(e.target.value))} className="w-full accent-red-600" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          <div className="space-y-3">
            <label className="text-xs font-black text-slate-500 uppercase">가로 정렬 (좌측 기본)</label>
            <div className="flex bg-slate-900 rounded-xl p-1 border border-slate-700">
              {(['left', 'center', 'right'] as const).map((pos) => (
                <button key={pos} onClick={() => setAlignment(pos)} className={`flex-1 py-2 rounded-lg text-xs font-black transition-all ${alignment === pos ? 'bg-red-600 text-white shadow-lg' : 'text-slate-500'}`}>
                  {pos.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-3">
            <label className="text-xs font-black text-slate-500 uppercase">세로 위치 (가운데 기본)</label>
            <div className="flex bg-slate-900 rounded-xl p-1 border border-slate-700">
              {(['top', 'center', 'bottom'] as const).map((pos) => (
                <button key={pos} onClick={() => setVerticalAlign(pos)} className={`flex-1 py-2 rounded-lg text-xs font-black transition-all ${verticalAlign === pos ? 'bg-red-600 text-white shadow-lg' : 'text-slate-500'}`}>
                  {pos.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThumbnailPreview;
