
import React, { useState, useEffect, useRef } from 'react';
import { ThumbnailStrategy } from '../types';

// html-to-image는 window 객체에 전역으로 로드됨
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
  const [fontSizeMultiplier, setFontSizeMultiplier] = useState(7); // 기본 폰트 크기 비중
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
      const dataUrl = await htmlToImage.toPng(thumbnailRef.current, {
        pixelRatio: 2,
        cacheBust: true,
      });

      if (mode === 'download') {
        const link = document.createElement('a');
        link.download = `youtube-thumbnail.png`;
        link.href = dataUrl;
        link.click();
      } else {
        const response = await fetch(dataUrl);
        const blob = await response.blob();
        await navigator.clipboard.write([
          new ClipboardItem({ [blob.type]: blob })
        ]);
        alert("이미지가 클립보드에 복사되었습니다!");
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
      <div className="flex justify-end gap-3">
        <button 
          onClick={() => exportThumbnail('copy')}
          disabled={isExporting || !imageUrl}
          className="px-4 py-2 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 rounded-xl text-xs font-black transition-all"
        >
          복사하기
        </button>
        <button 
          onClick={() => exportThumbnail('download')}
          disabled={isExporting || !imageUrl}
          className="px-4 py-2 bg-red-600 hover:bg-red-500 disabled:opacity-50 rounded-xl text-xs font-black shadow-lg transition-all"
        >
          저장하기
        </button>
      </div>

      {/* 실시간 프리뷰 영역 */}
      <div 
        ref={thumbnailRef}
        className="relative aspect-video w-full rounded-2xl overflow-hidden shadow-2xl bg-slate-950 border border-slate-800"
      >
        {/* 배경 레이어 */}
        {imageUrl ? (
          <img src={imageUrl} crossOrigin="anonymous" alt="Background" className="absolute inset-0 w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-slate-900">
            {isLoadingImage ? (
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-500"></div>
            ) : (
              <p className="text-slate-600 font-bold">전략을 먼저 생성해주세요</p>
            )}
          </div>
        )}

        {/* 오버레이 암전 */}
        <div className="absolute inset-0" style={{ backgroundColor: `rgba(0,0,0,${overlayOpacity})` }}></div>

        {/* 텍스트 콘텐츠 레이어 */}
        <div className={`absolute inset-0 p-[4vw] flex flex-col ${getVerticalJustify()} z-10`}>
          <div className={`flex flex-col gap-[1.5vw] w-full ${alignment === 'center' ? 'items-center text-center' : alignment === 'right' ? 'items-end text-right' : 'items-start text-left'}`}>
            
            {/* 뱃지 */}
            <div className="inline-block transform -rotate-1">
              <span 
                className="text-white px-[2vw] py-[0.5vw] rounded-md font-black shadow-2xl" 
                style={{ backgroundColor: badgeBgColor, fontSize: '2.5vw' }}
              >
                {localStrategy.badge}
              </span>
            </div>

            {/* 메인 타이틀: vw 단위로 자동 스케일링 */}
            <h1 
              className={`${fontFamily} leading-[1.1] drop-shadow-[2px_4px_8px_rgba(0,0,0,0.8)] break-keep tracking-tighter whitespace-pre-wrap w-full overflow-hidden`} 
              style={{ 
                fontSize: `${fontSizeMultiplier}vw`, 
                color: titleColor 
              }}
            >
              {localStrategy.title}
            </h1>

            {/* 서브 타이틀 */}
            <p 
              className="font-black drop-shadow-lg" 
              style={{ 
                color: subtitleColor, 
                fontSize: '3.5vw' 
              }}
            >
              {localStrategy.subtitle}
            </p>
          </div>
        </div>
      </div>

      {/* 에디터 컨트롤 영역 */}
      <div className="bg-slate-800/80 backdrop-blur-md p-6 rounded-3xl border border-slate-700 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-500 uppercase tracking-tighter">메인 타이틀</label>
            <textarea 
              value={localStrategy.title} 
              onChange={(e) => handleChange('title', e.target.value)} 
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white font-bold h-24 focus:ring-1 focus:ring-red-500 outline-none" 
            />
          </div>
          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-xs font-black text-slate-500 uppercase tracking-tighter">서브 타이틀</label>
              <input type="text" value={localStrategy.subtitle} onChange={(e) => handleChange('subtitle', e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-white" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-black text-slate-500 uppercase tracking-tighter">뱃지 텍스트</label>
              <input type="text" value={localStrategy.badge} onChange={(e) => handleChange('badge', e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-white" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-700">
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-500 uppercase">폰트</label>
            <select value={fontFamily} onChange={(e) => setFontFamily(e.target.value as FontType)} className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-white text-sm">
                {fontOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.name}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-500 uppercase">크기 ({fontSizeMultiplier})</label>
            <input type="range" min="3" max="15" step="0.1" value={fontSizeMultiplier} onChange={(e) => setFontSizeMultiplier(parseFloat(e.target.value))} className="w-full accent-red-600" />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-500 uppercase">명암 오버레이</label>
            <input type="range" min="0" max="1" step="0.05" value={overlayOpacity} onChange={(e) => setOverlayOpacity(parseFloat(e.target.value))} className="w-full accent-red-600" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-500 uppercase">가로 정렬</label>
            <div className="flex bg-slate-900 rounded-xl p-1 border border-slate-700">
              {(['left', 'center', 'right'] as const).map((pos) => (
                <button key={pos} onClick={() => setAlignment(pos)} className={`flex-1 py-1.5 rounded-lg text-xs font-black ${alignment === pos ? 'bg-red-600 text-white' : 'text-slate-500'}`}>
                  {pos.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-500 uppercase">세로 위치</label>
            <div className="flex bg-slate-900 rounded-xl p-1 border border-slate-700">
              {(['top', 'center', 'bottom'] as const).map((pos) => (
                <button key={pos} onClick={() => setVerticalAlign(pos)} className={`flex-1 py-1.5 rounded-lg text-xs font-black ${verticalAlign === pos ? 'bg-red-600 text-white' : 'text-slate-500'}`}>
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
