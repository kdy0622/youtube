
import React, { useState, useEffect } from 'react';
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
  const [fontSize, setFontSize] = useState(48);
  const [alignment, setAlignment] = useState<'left' | 'center' | 'right'>('left');
  const [verticalAlign, setVerticalAlign] = useState<'top' | 'center' | 'bottom'>('bottom');
  const [overlayOpacity, setOverlayOpacity] = useState(0.5);
  const [fontFamily, setFontFamily] = useState<FontType>('font-gmarket');
  
  // 색상 상태 추가
  const [titleColor, setTitleColor] = useState('#ffffff');
  const [subtitleColor, setSubtitleColor] = useState('#facc15'); // yellow-400
  const [badgeBgColor, setBadgeBgColor] = useState('#dc2626'); // red-600

  useEffect(() => {
    setLocalStrategy(strategy);
  }, [strategy]);

  const handleChange = (field: keyof ThumbnailStrategy, value: string) => {
    const updated = { ...localStrategy, [field]: value };
    setLocalStrategy(updated);
    if (onUpdate) onUpdate(updated);
  };

  const fontOptions = [
    { name: '고딕 (Pretendard)', value: 'font-pretendard' },
    { name: '지마켓 산스 (Bold)', value: 'font-gmarket' },
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

  return (
    <div className="space-y-6">
      {/* Thumbnail Display */}
      <div className="relative aspect-video w-full rounded-2xl overflow-hidden shadow-2xl bg-black border border-slate-700 group transition-all duration-500">
        {imageUrl ? (
          <img src={imageUrl} alt="Thumbnail background" className="w-full h-full object-cover" />
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

        {/* Dynamic Dark Overlay */}
        <div 
          className="absolute inset-0 pointer-events-none transition-opacity duration-300" 
          style={{ backgroundColor: `rgba(0,0,0,${overlayOpacity})` }}
        ></div>

        {/* Overlay Content */}
        <div className={`absolute inset-0 p-10 flex flex-col ${getVerticalJustify()} transition-all duration-300`}>
          <div className={`flex flex-col gap-4 ${alignment === 'center' ? 'items-center text-center' : alignment === 'right' ? 'items-end text-right' : 'items-start text-left'}`}>
            {/* Badge */}
            <div className="inline-block transform -rotate-1 hover:rotate-0 transition-transform cursor-default">
              <span 
                className="text-white px-5 py-2 rounded-md font-black text-base uppercase tracking-tighter shadow-[0_8px_15px_rgba(0,0,0,0.4)]"
                style={{ backgroundColor: badgeBgColor }}
              >
                {localStrategy.badge}
              </span>
            </div>
            
            {/* Title */}
            <h1 
              className={`${fontFamily} leading-[1.15] drop-shadow-[0_8px_12px_rgba(0,0,0,0.9)] break-keep tracking-tighter whitespace-pre-wrap`}
              style={{ fontSize: `${fontSize}px`, color: titleColor }}
            >
              {localStrategy.title}
            </h1>
            
            {/* Subtitle */}
            <p 
              className="text-2xl font-black drop-shadow-[0_4px_8px_rgba(0,0,0,0.9)]"
              style={{ color: subtitleColor }}
            >
              {localStrategy.subtitle}
            </p>
          </div>
        </div>
      </div>

      {/* Editor Controls */}
      <div className="bg-slate-800/60 backdrop-blur-xl p-8 rounded-3xl border border-slate-700/50 space-y-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-700 pb-4">
            <h3 className="text-base font-black text-white flex items-center gap-2">
                <div className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.8)]"></div>
                하이엔드 디자인 툴킷
            </h3>
        </div>
        
        {/* Text Edits */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-3">
            <label className="text-xs font-black text-slate-500 uppercase tracking-widest">메인 타이틀 편집</label>
            <textarea 
              value={localStrategy.title}
              onChange={(e) => handleChange('title', e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-4 text-base font-bold focus:ring-2 focus:ring-red-500/50 outline-none h-28 resize-none transition-all shadow-inner"
            />
          </div>
          <div className="space-y-4">
            <div className="space-y-3">
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest">서브텍스트 & 뱃지</label>
              <input 
                type="text"
                value={localStrategy.subtitle}
                onChange={(e) => handleChange('subtitle', e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm font-bold shadow-inner"
                placeholder="서브 타이틀"
              />
              <input 
                type="text"
                value={localStrategy.badge}
                onChange={(e) => handleChange('badge', e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm font-bold shadow-inner"
                placeholder="뱃지 문구"
              />
            </div>
          </div>
        </div>

        {/* Color Options */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 border-t border-slate-700/50">
          <div className="space-y-3">
            <label className="text-xs font-black text-slate-500 block uppercase tracking-widest">제목 색상</label>
            <div className="flex items-center gap-3 bg-slate-900 p-2 rounded-xl border border-slate-700">
              <input 
                type="color" 
                value={titleColor} 
                onChange={(e) => setTitleColor(e.target.value)}
                className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-none"
              />
              <span className="text-xs font-mono text-slate-400">{titleColor.toUpperCase()}</span>
            </div>
          </div>
          <div className="space-y-3">
            <label className="text-xs font-black text-slate-500 block uppercase tracking-widest">서브제목 색상</label>
            <div className="flex items-center gap-3 bg-slate-900 p-2 rounded-xl border border-slate-700">
              <input 
                type="color" 
                value={subtitleColor} 
                onChange={(e) => setSubtitleColor(e.target.value)}
                className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-none"
              />
              <span className="text-xs font-mono text-slate-400">{subtitleColor.toUpperCase()}</span>
            </div>
          </div>
          <div className="space-y-3">
            <label className="text-xs font-black text-slate-500 block uppercase tracking-widest">뱃지 배경색</label>
            <div className="flex items-center gap-3 bg-slate-900 p-2 rounded-xl border border-slate-700">
              <input 
                type="color" 
                value={badgeBgColor} 
                onChange={(e) => setBadgeBgColor(e.target.value)}
                className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-none"
              />
              <span className="text-xs font-mono text-slate-400">{badgeBgColor.toUpperCase()}</span>
            </div>
          </div>
        </div>

        {/* Typography & Background Options */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 pt-6 border-t border-slate-700/50">
          <div className="space-y-3">
            <label className="text-xs font-black text-slate-500 block uppercase tracking-widest">타이포그래피 선택</label>
            <select 
                value={fontFamily}
                onChange={(e) => setFontFamily(e.target.value as FontType)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm font-bold outline-none focus:ring-2 focus:ring-red-500/50 cursor-pointer"
            >
                {fontOptions.map(opt => (
                    <option key={opt.value} value={opt.value} className={opt.value}>{opt.name}</option>
                ))}
            </select>
          </div>

          <div className="space-y-3">
            <label className="text-xs font-black text-slate-500 block uppercase tracking-widest">폰트 크기 ({fontSize}px)</label>
            <input 
              type="range" min="24" max="120" value={fontSize} 
              onChange={(e) => setFontSize(parseInt(e.target.value))}
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-red-600"
            />
          </div>

          <div className="space-y-3">
            <label className="text-xs font-black text-slate-500 block uppercase tracking-widest">배경 레이어 명암 ({Math.round(overlayOpacity * 100)}%)</label>
            <input 
              type="range" min="0" max="1" step="0.05" value={overlayOpacity} 
              onChange={(e) => setOverlayOpacity(parseFloat(e.target.value))}
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-red-600"
            />
          </div>
        </div>

        {/* Alignment Options */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          <div className="space-y-3">
            <label className="text-xs font-black text-slate-500 block uppercase tracking-widest">가로 정렬 (Horizontal)</label>
            <div className="flex bg-slate-900 rounded-xl p-1 border border-slate-700">
              {(['left', 'center', 'right'] as const).map((pos) => (
                <button
                  key={pos}
                  onClick={() => setAlignment(pos)}
                  className={`flex-1 py-2.5 rounded-lg text-xs font-black transition-all ${alignment === pos ? 'bg-red-600 text-white shadow-[0_4px_10px_rgba(220,38,38,0.3)]' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  {pos.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-xs font-black text-slate-500 block uppercase tracking-widest">세로 위치 (Vertical)</label>
            <div className="flex bg-slate-900 rounded-xl p-1 border border-slate-700">
              {(['top', 'center', 'bottom'] as const).map((pos) => (
                <button
                  key={pos}
                  onClick={() => setVerticalAlign(pos)}
                  className={`flex-1 py-2.5 rounded-lg text-xs font-black transition-all ${verticalAlign === pos ? 'bg-red-600 text-white shadow-[0_4px_10px_rgba(220,38,38,0.3)]' : 'text-slate-500 hover:text-slate-300'}`}
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
