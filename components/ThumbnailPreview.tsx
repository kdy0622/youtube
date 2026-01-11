
import React, { useState, useEffect } from 'react';
import { ThumbnailStrategy } from '../types';

interface ThumbnailPreviewProps {
  strategy: ThumbnailStrategy;
  imageUrl?: string;
  isLoadingImage?: boolean;
  onUpdate?: (updated: ThumbnailStrategy) => void;
}

const ThumbnailPreview: React.FC<ThumbnailPreviewProps> = ({ strategy, imageUrl, isLoadingImage, onUpdate }) => {
  const [localStrategy, setLocalStrategy] = useState(strategy);
  const [fontSizeMultiplier, setFontSizeMultiplier] = useState(1.0);
  const [opacity, setOpacity] = useState(0.5);
  const [fontFamily, setFontFamily] = useState('font-gmarket');
  const [textAlign, setTextAlign] = useState<'left' | 'center' | 'right'>('left');
  
  // 텍스트 위치 조절 상태
  const [vPos, setVPos] = useState(50);
  const [hPos, setHPos] = useState(50);

  useEffect(() => {
    if (strategy) setLocalStrategy(strategy);
  }, [strategy]);

  const updateField = (field: keyof ThumbnailStrategy, val: string) => {
    const next = { ...localStrategy, [field]: val };
    setLocalStrategy(next);
    if (onUpdate) onUpdate(next);
  };

  const getResponsiveFontSize = (text: string) => {
    const len = text.length || 1;
    let base = 7.5;
    if (len > 30) base = 3.5;
    else if (len > 20) base = 4.5;
    else if (len > 12) base = 6.0;
    return base * fontSizeMultiplier;
  };

  const handleCapture = async () => {
    const lib = (window as any).htmlToImage;
    const node = document.getElementById('thumbnail-canvas');
    if (!lib || !node) return alert("이미지 라이브러리 로딩 대기 중...");

    try {
      const dataUrl = await lib.toPng(node, { pixelRatio: 2, cacheBust: true });
      const link = document.createElement('a');
      link.download = `thumbnail-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (e) {
      alert("다운로드에 실패했습니다. (CORS 문제 또는 브라우저 제한)");
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full animate-in fade-in duration-700">
      <div className="flex justify-end">
        <button 
          onClick={handleCapture}
          className="bg-red-600 hover:bg-red-500 text-white font-black px-6 py-2.5 rounded-xl shadow-lg transition-all active:scale-95 flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
          이미지로 저장
        </button>
      </div>

      {/* 썸네일 캔버스 영역 */}
      <div 
        id="thumbnail-canvas"
        className="relative w-full aspect-video rounded-3xl overflow-hidden bg-black shadow-2xl border border-slate-800"
      >
        {imageUrl ? (
          <img src={imageUrl} className="absolute inset-0 w-full h-full object-cover" crossOrigin="anonymous" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-slate-800 font-black text-xl italic uppercase tracking-widest">
            {isLoadingImage ? "Generating Visual..." : "Awaiting Content"}
          </div>
        )}

        {/* 배경 오버레이 */}
        <div 
          className="absolute inset-0 z-[1] pointer-events-none transition-colors"
          style={{ backgroundColor: `rgba(0,0,0,${opacity})` }}
        />

        {/* 텍스트 레이어 (위치 조절 가능) */}
        <div 
          className="absolute z-[2] flex flex-col pointer-events-none transition-all duration-150 ease-out"
          style={{ 
            top: `${vPos}%`, 
            left: `${hPos}%`,
            transform: `translate(-${hPos}%, -${vPos}%)`,
            textAlign: textAlign,
            alignItems: textAlign === 'left' ? 'flex-start' : textAlign === 'center' ? 'center' : 'flex-end',
            width: '85%'
          }}
        >
          <div className="flex flex-col gap-[0.6vw] w-full">
            {localStrategy.badge && (
              <span 
                className="bg-red-600 text-white px-[1.2vw] py-[0.4vw] rounded-md font-black shadow-lg uppercase inline-block self-start"
                style={{ fontSize: '1.6vw', alignSelf: textAlign === 'center' ? 'center' : textAlign === 'right' ? 'flex-end' : 'flex-start' }}
              >
                {localStrategy.badge}
              </span>
            )}
            
            <h1 
              className={`${fontFamily} text-white font-black leading-[1.1] tracking-tighter`}
              style={{ 
                fontSize: `${getResponsiveFontSize(localStrategy.title)}vw`,
                textShadow: '0 0.5vw 1vw rgba(0,0,0,0.8)',
                whiteSpace: 'pre-wrap',
                wordBreak: 'keep-all'
              }}
            >
              {localStrategy.title}
            </h1>

            {localStrategy.subtitle && (
              <p 
                className="font-black text-yellow-400"
                style={{ 
                  fontSize: '2.1vw',
                  textShadow: '0 0.3vw 0.6vw rgba(0,0,0,0.8)'
                }}
              >
                {localStrategy.subtitle}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* 실시간 편집 패널 */}
      <div className="bg-slate-800/80 backdrop-blur-xl p-6 md:p-8 rounded-[2rem] border border-slate-700 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest">제목 수정</label>
            <textarea 
              value={localStrategy.title}
              onChange={(e) => updateField('title', e.target.value)}
              className="w-full h-24 bg-slate-900 border border-slate-700 rounded-2xl p-4 text-white font-bold text-sm focus:ring-2 focus:ring-red-600 outline-none resize-none"
            />
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest">부제목 / 핫배지</label>
              <div className="flex gap-2">
                <input 
                  value={localStrategy.subtitle}
                  onChange={(e) => updateField('subtitle', e.target.value)}
                  className="flex-1 bg-slate-900 border border-slate-700 rounded-xl p-3 text-white font-bold text-xs"
                  placeholder="부제목"
                />
                <input 
                  value={localStrategy.badge}
                  onChange={(e) => updateField('badge', e.target.value)}
                  className="w-1/3 bg-slate-900 border border-slate-700 rounded-xl p-3 text-white font-bold text-xs"
                  placeholder="뱃지"
                />
              </div>
            </div>
            <div className="space-y-2">
               <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest">텍스트 정렬</label>
               <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-700">
                  {(['left', 'center', 'right'] as const).map(t => (
                    <button 
                      key={t}
                      onClick={() => setTextAlign(t)}
                      className={`flex-1 py-2 text-[10px] font-black uppercase rounded-lg transition-all ${textAlign === t ? 'bg-red-600 text-white' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                      {t}
                    </button>
                  ))}
               </div>
            </div>
          </div>
        </div>

        {/* 상세 컨트롤러 (위치/폰트/크기) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 pt-6 border-t border-slate-700/50">
          <div className="space-y-4">
            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">상하/좌우 배치</label>
            <div className="space-y-3">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] text-slate-500 flex justify-between">V-Pos: <b>{vPos}%</b></span>
                <input type="range" min="10" max="90" value={vPos} onChange={(e) => setVPos(Number(e.target.value))} className="w-full bg-slate-700 h-1.5 rounded-lg appearance-none cursor-pointer" />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] text-slate-500 flex justify-between">H-Pos: <b>{hPos}%</b></span>
                <input type="range" min="10" max="90" value={hPos} onChange={(e) => setHPos(Number(e.target.value))} className="w-full bg-slate-700 h-1.5 rounded-lg appearance-none cursor-pointer" />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">폰트 선택</label>
            <select 
              value={fontFamily} 
              onChange={(e) => setFontFamily(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white text-xs font-bold outline-none cursor-pointer"
            >
              <option value="font-gmarket">지마켓 산스 (Bold)</option>
              <option value="font-blackhan">블랙한산스 (Heavy)</option>
              <option value="font-tmon">티몬 몬소리 (Impact)</option>
              <option value="font-jua">배민 주아 (Round)</option>
              <option value="font-dohyeon">배민 도현 (Modern)</option>
              <option value="font-nanum">나눔펜 (Hand)</option>
              <option value="font-gamja">감자꽃 (Cute)</option>
              <option value="font-poor">가난한이야기 (Soft)</option>
            </select>
          </div>

          <div className="space-y-4">
            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">크기 & 밝기</label>
            <div className="space-y-3">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] text-slate-500 flex justify-between">텍스트 크기: <b>{fontSizeMultiplier.toFixed(1)}x</b></span>
                <input type="range" min="0.5" max="2.0" step="0.1" value={fontSizeMultiplier} onChange={(e) => setFontSizeMultiplier(Number(e.target.value))} className="w-full bg-slate-700 h-1.5 rounded-lg appearance-none cursor-pointer" />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] text-slate-500 flex justify-between">배경 어둡기: <b>{(opacity * 100).toFixed(0)}%</b></span>
                <input type="range" min="0" max="0.9" step="0.05" value={opacity} onChange={(e) => setOpacity(Number(e.target.value))} className="w-full bg-slate-700 h-1.5 rounded-lg appearance-none cursor-pointer" />
              </div>
            </div>
          </div>

          <div className="hidden lg:flex flex-col justify-center p-4 bg-slate-900/50 rounded-2xl border border-slate-700 border-dashed">
            <p className="text-[10px] text-slate-400 leading-relaxed font-bold">
              Tip: 제목의 길이에 따라 크기가 자동 조절됩니다. 핫배지와 부제목은 메인 제목의 강조를 위해 세련되게 축소 정렬되었습니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThumbnailPreview;
