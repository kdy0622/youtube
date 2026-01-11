
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
  const [fontSize, setFontSize] = useState(8); // cqw (container query width) 단위를 사용하여 자동 조절
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

      const options = {
        pixelRatio: 2,
        cacheBust: true,
        style: {
          borderRadius: '0',
        },
      };

      const dataUrl = await htmlToImage.toPng(thumbnailRef.current, options);

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
        alert("전체 썸네일 디자인이 클립보드에 복사되었습니다!");
      }
    } catch (err) {
      console.error("Export failed", err);
      alert("이미지 처리 중 오류가 발생했습니다. 브라우저 보안 정책 혹은 외부 폰트 로딩 문제일 수 있습니다.");
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
          className="px-4 py-2 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl text-xs font-black flex items-center gap-2 transition-all active:scale-95"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"/></svg>
          전체 복사
        </button>
        <button 
          onClick={() => exportThumbnail('download')}
          disabled={isExporting || !imageUrl}
          className="px-4 py-2 bg-red-600 hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl text-xs font-black flex items-center gap-2 transition-all active:scale-95 shadow-lg shadow-red-900/20"
        >
          {isExporting ? (
             <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
          ) : (
             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
          )}
          디자인 다운로드
        </button>
      </div>

      {/* 썸네일 캔버스 영역: 컨테이너 쿼리를 위해 container-type 지정 */}
      <div 
        ref={thumbnailRef}
        style={{ containerType: 'inline-size' } as React.CSSProperties}
        className="relative aspect-video w-full rounded-2xl overflow-hidden shadow-2xl bg-black border border-slate-700 group"
      >
        {imageUrl ? (
          <img src={imageUrl} crossOrigin="anonymous" alt="Thumbnail background" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900">
            {isLoadingImage ? (
              <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mb-4"></div>
                <p className="text-slate-400 text-sm font-bold tracking-widest">압도적인 배경 생성 중...</p>
              </div>
            ) : (
              <p className="text-slate-500">배경 이미지가 준비되지 않았습니다</p>
            )}
          </div>
        )}

        {/* 오버레이 암전 효과 */}
        <div 
          className="absolute inset-0 pointer-events-none transition-opacity duration-300" 
          style={{ backgroundColor: `rgba(0,0,0,${overlayOpacity})` }}
        ></div>

        {/* 텍스트 콘텐츠: 가로/세로 정렬 반영 */}
        <div className={`absolute inset-0 p-[5cqw] flex flex-col ${getVerticalJustify()} transition-all duration-300`}>
          <div className={`flex flex-col gap-[1.5cqw] w-full ${alignment === 'center' ? 'items-center text-center' : alignment === 'right' ? 'items-end text-right' : 'items-start text-left'}`}>
            
            {/* 뱃지: 컨테이너 크기에 비례하는 텍스트 크기 */}
            <div className="inline-block transform -rotate-1">
              <span 
                className="text-white px-[2cqw] py-[0.8cqw] rounded-md font-black uppercase tracking-tighter shadow-xl"
                style={{ backgroundColor: badgeBgColor, fontSize: '3cqw' }}
              >
                {localStrategy.badge}
              </span>
            </div>
            
            {/* 메인 타이틀: 슬라이더 값(fontSize)을 cqw 단위로 해석하여 컨테이너에 맞춰 자동 조절 */}
            <h1 
              className={`${fontFamily} leading-[1.1] drop-shadow-[0_0.8cqw_1.2cqw_rgba(0,0,0,1)] break-keep tracking-tighter whitespace-pre-wrap w-full`}
              style={{ fontSize: `${fontSize}cqw`, color: titleColor }}
            >
              {localStrategy.title}
            </h1>
            
            {/* 서브 타이틀 */}
            <p 
              className="font-black drop-shadow-[0_0.4cqw_0.8cqw_rgba(0,0,0,1)]"
              style={{ color: subtitleColor, fontSize: '4cqw' }}
            >
              {localStrategy.subtitle}
            </p>
          </div>
        </div>
      </div>

      {/* 에디터 컨트롤 영역 */}
      <div className="bg-slate-800/60 backdrop-blur-xl p-8 rounded-3xl border border-slate-700/50 space-y-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-700 pb-4">
            <h3 className="text-base font-black text-white flex items-center gap-2">
                <div className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.8)]"></div>
                디자인 커스텀
            </h3>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-3">
            <label className="text-xs font-black text-slate-500 uppercase tracking-widest">메인 타이틀</label>
            <textarea 
              value={localStrategy.title}
              onChange={(e) => handleChange('title', e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-4 text-base font-bold focus:ring-2 focus:ring-red-500/50 outline-none h-24 resize-none transition-all shadow-inner"
            />
          </div>
          <div className="space-y-4">
            <div className="space-y-3">
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest">서브텍스트 & 뱃지</label>
              <input 
                type="text"
                value={localStrategy.subtitle}
                onChange={(e) => handleChange('subtitle', e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm font-bold"
                placeholder="서브 타이틀"
              />
              <input 
                type="text"
                value={localStrategy.badge}
                onChange={(e) => handleChange('badge', e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm font-bold"
                placeholder="뱃지 문구"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4 border-t border-slate-700/50">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase">제목 색상</label>
            <div className="flex items-center gap-2 bg-slate-900 p-2 rounded-xl border border-slate-700">
              <input type="color" value={titleColor} onChange={(e) => setTitleColor(e.target.value)} className="w-8 h-8 rounded cursor-pointer bg-transparent border-none" />
              <span className="text-[10px] font-mono text-slate-400">{titleColor}</span>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase">서브 색상</label>
            <div className="flex items-center gap-2 bg-slate-900 p-2 rounded-xl border border-slate-700">
              <input type="color" value={subtitleColor} onChange={(e) => setSubtitleColor(e.target.value)} className="w-8 h-8 rounded cursor-pointer bg-transparent border-none" />
              <span className="text-[10px] font-mono text-slate-400">{subtitleColor}</span>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase">뱃지 색상</label>
            <div className="flex items-center gap-2 bg-slate-900 p-2 rounded-xl border border-slate-700">
              <input type="color" value={badgeBgColor} onChange={(e) => setBadgeBgColor(e.target.value)} className="w-8 h-8 rounded cursor-pointer bg-transparent border-none" />
              <span className="text-[10px] font-mono text-slate-400">{badgeBgColor}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 pt-4 border-t border-slate-700/50">
          <div className="space-y-3">
            <label className="text-xs font-black text-slate-500 block uppercase tracking-widest">폰트 스타일</label>
            <select 
                value={fontFamily}
                onChange={(e) => setFontFamily(e.target.value as FontType)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm font-bold"
            >
                {fontOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.name}</option>
                ))}
            </select>
          </div>

          <div className="space-y-3">
            <label className="text-xs font-black text-slate-500 block uppercase tracking-widest">글씨 크기 (비율)</label>
            <input 
              type="range" min="3" max="15" step="0.5" value={fontSize} 
              onChange={(e) => setFontSize(parseFloat(e.target.value))}
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-red-600"
            />
          </div>

          <div className="space-y-3">
            <label className="text-xs font-black text-slate-500 block uppercase tracking-widest">배경 어둡기</label>
            <input 
              type="range" min="0" max="1" step="0.05" value={overlayOpacity} 
              onChange={(e) => setOverlayOpacity(parseFloat(e.target.value))}
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-red-600"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          <div className="space-y-3">
            <label className="text-xs font-black text-slate-500 block uppercase tracking-widest">가로 정렬</label>
            <div className="flex bg-slate-900 rounded-xl p-1 border border-slate-700">
              {(['left', 'center', 'right'] as const).map((pos) => (
                <button
                  key={pos}
                  onClick={() => setAlignment(pos)}
                  className={`flex-1 py-2 rounded-lg text-xs font-black transition-all ${alignment === pos ? 'bg-red-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  {pos.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-xs font-black text-slate-500 block uppercase tracking-widest">세로 위치</label>
            <div className="flex bg-slate-900 rounded-xl p-1 border border-slate-700">
              {(['top', 'center', 'bottom'] as const).map((pos) => (
                <button
                  key={pos}
                  onClick={() => setVerticalAlign(pos)}
                  className={`flex-1 py-2 rounded-lg text-xs font-black transition-all ${verticalAlign === pos ? 'bg-red-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                >
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
