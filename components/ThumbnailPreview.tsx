
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
  
  const [badgeBgColor, setBadgeBgColor] = useState('#dc2626');
  const thumbnailRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);

  // 데이터가 바뀔 때 내부 상태를 즉시 업데이트
  useEffect(() => {
    if (strategy) {
      setLocalStrategy(strategy);
    }
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
    
    // 글로벌 객체에서 안전하게 라이브러리 가져오기
    const lib = (window as any).htmlToImage;
    if (!lib) {
      alert("이미지 처리 라이브러리를 불러오는 중입니다. 잠시 후 다시 클릭해주세요.");
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
        if (navigator.clipboard && navigator.clipboard.write) {
          await navigator.clipboard.write([
            new ClipboardItem({ [blob.type]: blob })
          ]);
          alert("클립보드에 이미지가 복사되었습니다.");
        } else {
          alert("이 브라우저에서는 클립보드 복사를 지원하지 않습니다. 다운로드 기능을 이용해주세요.");
        }
      }
    } catch (err) {
      console.error("Export error:", err);
      alert("이미지 생성 중 오류가 발생했습니다.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-full overflow-hidden">
      {/* Action Buttons */}
      <div className="flex justify-end gap-2">
        <button 
          onClick={() => exportThumbnail('copy')}
          disabled={!imageUrl || isExporting}
          className="px-4 py-2 bg-slate-700 hover:bg-slate-600 disabled:opacity-30 rounded-lg text-xs font-bold transition-all text-white"
        >
          복사하기
        </button>
        <button 
          onClick={() => exportThumbnail('download')}
          disabled={!imageUrl || isExporting}
          className="px-4 py-2 bg-red-600 hover:bg-red-500 disabled:opacity-30 rounded-lg text-xs font-bold shadow-lg transition-all text-white"
        >
          이미지 저장
        </button>
      </div>

      {/* 실시간 프리뷰 캔버스 */}
      <div 
        ref={thumbnailRef}
        className="relative w-full aspect-video rounded-xl overflow-hidden bg-slate-950 border border-slate-800 shadow-2xl flex items-center justify-center"
        style={{ minHeight: '200px' }}
      >
        {/* 배경 이미지 레이어 */}
        {imageUrl ? (
          <img 
            src={imageUrl} 
            crossOrigin="anonymous" 
            alt="Thumbnail BG" 
            className="absolute inset-0 w-full h-full object-cover z-0" 
          />
        ) : (
          <div className="absolute inset-0 bg-slate-900 flex items-center justify-center z-0">
            {isLoadingImage && (
              <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-slate-500 text-[10px] font-bold">이미지 생성 중...</span>
              </div>
            )}
          </div>
        )}

        {/* 암전 오버레이 */}
        <div 
          className="absolute inset-0 z-10 pointer-events-none" 
          style={{ backgroundColor: `rgba(0,0,0,${overlayOpacity})` }}
        ></div>

        {/* 텍스트 레이어 */}
        <div 
          className={`absolute inset-0 z-20 p-[5%] flex flex-col pointer-events-none
            ${verticalAlign === 'top' ? 'justify-start' : verticalAlign === 'center' ? 'justify-center' : 'justify-end'}
            ${alignment === 'center' ? 'items-center text-center' : alignment === 'right' ? 'items-end text-right' : 'items-start text-left'}
          `}
        >
          <div className="w-full flex flex-col gap-[1.5vw]">
            {/* 뱃지 */}
            <div className="block">
              <span 
                className="inline-block px-[1.5vw] py-[0.5vw] rounded font-black text-white shadow-xl transform -rotate-1"
                style={{ backgroundColor: badgeBgColor, fontSize: '2.2vw' }}
              >
                {localStrategy.badge}
              </span>
            </div>

            {/* 타이틀 */}
            <h1 
              className={`${fontFamily} leading-[1.2] break-keep tracking-tighter whitespace-pre-wrap text-white`}
              style={{ 
                fontSize: `${fontSizeMultiplier}vw`, 
                textShadow: '0 4px 12px rgba(0,0,0,0.9)'
              }}
            >
              {localStrategy.title}
            </h1>

            {/* 서브타이틀 */}
            <p 
              className="font-black"
              style={{ 
                color: '#facc15', 
                fontSize: '3.2vw',
                textShadow: '0 2px 8px rgba(0,0,0,0.8)'
              }}
            >
              {localStrategy.subtitle}
            </p>
          </div>
        </div>
      </div>

      {/* 컨트롤 패널 */}
      <div className="bg-slate-800/40 border border-slate-700 rounded-2xl p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">타이틀 문구</label>
            <textarea 
              value={localStrategy.title} 
              onChange={(e) => handleChange('title', e.target.value)}
              className="w-full h-24 bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm font-bold text-white focus:ring-1 focus:ring-red-600 outline-none resize-none shadow-inner"
            />
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">서브텍스트 & 뱃지</label>
              <input 
                type="text" 
                value={localStrategy.subtitle} 
                onChange={(e) => handleChange('subtitle', e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs font-bold text-white mb-2"
                placeholder="서브 타이틀"
              />
              <input 
                type="text" 
                value={localStrategy.badge} 
                onChange={(e) => handleChange('badge', e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs font-bold text-white"
                placeholder="뱃지 텍스트"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4 border-t border-slate-700/50">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase">글꼴</label>
            <select 
              value={fontFamily} 
              onChange={(e) => setFontFamily(e.target.value as FontType)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs font-bold text-white outline-none cursor-pointer"
            >
              {fontOptions.map(o => <option key={o.value} value={o.value}>{o.name}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase">크기 조정</label>
            <input 
              type="range" 
              min="3" 
              max="15" 
              step="0.1" 
              value={fontSizeMultiplier} 
              onChange={(e) => setFontSizeMultiplier(parseFloat(e.target.value))} 
              className="w-full accent-red-600 h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer" 
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase">배경 암전</label>
            <input 
              type="range" 
              min="0" 
              max="0.9" 
              step="0.05" 
              value={overlayOpacity} 
              onChange={(e) => setOverlayOpacity(parseFloat(e.target.value))} 
              className="w-full accent-red-600 h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer" 
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-4 pt-4 border-t border-slate-700/50">
          <div className="flex-1 min-w-[140px] space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase">가로 정렬</label>
            <div className="flex bg-slate-900 rounded-lg p-1 border border-slate-700">
              {(['left', 'center', 'right'] as const).map(p => (
                <button 
                  key={p} 
                  onClick={() => setAlignment(p)} 
                  className={`flex-1 py-1 rounded text-[10px] font-black uppercase transition-colors ${alignment === p ? 'bg-red-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
          <div className="flex-1 min-w-[140px] space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase">세로 위치</label>
            <div className="flex bg-slate-900 rounded-lg p-1 border border-slate-700">
              {(['top', 'center', 'bottom'] as const).map(p => (
                <button 
                  key={p} 
                  onClick={() => setVerticalAlign(p)} 
                  className={`flex-1 py-1 rounded text-[10px] font-black uppercase transition-colors ${verticalAlign === p ? 'bg-red-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  {p}
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
