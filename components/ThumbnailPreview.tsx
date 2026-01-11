
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
  
  // 위치 조절 상태 (0~100%)
  const [vPos, setVPos] = useState(50); // 상하 위치 (Vertical)
  const [hPos, setHPos] = useState(50); // 좌우 위치 (Horizontal)

  useEffect(() => {
    if (strategy) setLocalStrategy(strategy);
  }, [strategy]);

  const updateField = (field: keyof ThumbnailStrategy, val: string) => {
    const next = { ...localStrategy, [field]: val };
    setLocalStrategy(next);
    if (onUpdate) onUpdate(next);
  };

  const calculateDynamicFontSize = (text: string) => {
    const charCount = text.length || 1;
    let baseSize = 8.0;
    if (charCount > 40) baseSize = 3.0;
    else if (charCount > 25) baseSize = 4.0;
    else if (charCount > 15) baseSize = 5.5;
    else if (charCount > 8) baseSize = 7.0;
    return baseSize * fontSizeMultiplier;
  };

  const handleDownload = async () => {
    const lib = (window as any).htmlToImage;
    const node = document.getElementById('thumbnail-output');
    if (!lib || !node) return alert("이미지 라이브러리를 로드 중입니다.");
    
    try {
      const dataUrl = await lib.toPng(node, { 
        pixelRatio: 2, 
        cacheBust: true,
        style: { transform: 'scale(1)', transformOrigin: 'top left' }
      });
      const link = document.createElement('a');
      link.download = `ctr-pro-thumbnail-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (e) {
      console.error("Capture Error:", e);
      alert("이미지 저장에 실패했습니다.");
    }
  };

  const dynamicFontSize = calculateDynamicFontSize(localStrategy.title);

  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="flex justify-end gap-2">
        <button 
          onClick={handleDownload}
          disabled={!imageUrl}
          className="bg-red-600 text-white px-8 py-3 rounded-2xl font-black text-sm hover:bg-red-500 disabled:opacity-30 transition-all shadow-xl active:scale-95 flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
          고화질 썸네일 저장
        </button>
      </div>

      {/* 썸네일 출력 캔버스 */}
      <div 
        id="thumbnail-output"
        className="relative w-full aspect-video rounded-3xl overflow-hidden bg-slate-950 shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex items-center justify-center border border-slate-800 select-none"
      >
        {imageUrl ? (
          <img 
            src={imageUrl} 
            className="absolute inset-0 w-full h-full object-cover" 
            crossOrigin="anonymous" 
          />
        ) : (
          <div className="text-slate-800 font-black animate-pulse text-2xl tracking-tighter">
            {isLoadingImage ? "CREATING VISUAL..." : "READY TO DESIGN"}
          </div>
        )}

        <div 
          className="absolute inset-0 z-[1]" 
          style={{ backgroundColor: `rgba(0,0,0,${opacity})` }}
        ></div>

        {/* 텍스트 레이어 - 위치 조절 적용 */}
        <div 
          className="absolute z-[2] p-[4%] flex flex-col pointer-events-none"
          style={{ 
            top: `${vPos}%`,
            left: `${hPos}%`,
            transform: `translate(-${hPos}%, -${vPos}%)`,
            textAlign: textAlign,
            alignItems: textAlign === 'left' ? 'flex-start' : textAlign === 'center' ? 'center' : 'flex-end',
            width: '92%', 
            maxHeight: '90%',
            justifyContent: 'center'
          }}
        >
          <div className="flex flex-col gap-[0.8vw] w-full">
            {localStrategy.badge && (
              <div className="inline-block">
                <span className="bg-red-600 text-white px-[1.2vw] py-[0.4vw] rounded font-black shadow-2xl inline-block uppercase tracking-tight" style={{ fontSize: '1.8vw' }}>
                  {localStrategy.badge}
                </span>
              </div>
            )}
            
            <h1 className={`${fontFamily} leading-[1.1] tracking-tighter m-0 font-black text-white`}
              style={{ 
                fontSize: `${dynamicFontSize}vw`, 
                wordBreak: 'keep-all',
                overflowWrap: 'anywhere',
                whiteSpace: 'pre-wrap',
                textShadow: '0 0.5vw 1.5vw rgba(0,0,0,0.9), 0 0 3vw rgba(0,0,0,0.5)',
                transition: 'font-size 0.2s ease'
              }}
            >
              {localStrategy.title}
            </h1>

            {localStrategy.subtitle && (
              <p className="font-black m-0" style={{ 
                fontSize: '2.2vw', 
                color: '#facc15', 
                textShadow: '0 0.3vw 0.8vw rgba(0,0,0,0.8)',
                opacity: 0.95
              }}>
                {localStrategy.subtitle}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* 커스텀 컨트롤 패널 */}
      <div className="bg-slate-800/60 p-8 rounded-[2.5rem] border border-slate-700/50 space-y-8 backdrop-blur-2xl shadow-2xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="flex flex-col gap-3">
            <label className="text-[10px] font-black text-red-500 uppercase tracking-[0.3em]">Main Title Editor</label>
            <textarea 
              value={localStrategy.title}
              onChange={(e) => updateField('title', e.target.value)}
              className="bg-slate-900/90 border border-slate-700 rounded-2xl p-5 text-white text-base font-bold h-32 focus:ring-2 focus:ring-red-600 outline-none resize-none transition-all shadow-inner"
              placeholder="제목을 입력하세요..."
            />
          </div>
          <div className="grid grid-cols-1 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Subtitle</label>
              <input 
                value={localStrategy.subtitle}
                onChange={(e) => updateField('subtitle', e.target.value)}
                className="bg-slate-900/90 border border-slate-700 rounded-xl p-4 text-white text-sm font-bold focus:ring-2 focus:ring-red-600 outline-none"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Hot Badge</label>
              <input 
                value={localStrategy.badge}
                onChange={(e) => updateField('badge', e.target.value)}
                className="bg-slate-900/90 border border-slate-700 rounded-xl p-4 text-white text-sm font-bold focus:ring-2 focus:ring-red-600 outline-none"
              />
            </div>
          </div>
        </div>

        {/* 위치 및 스타일 상세 조절 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 pt-8 border-t border-slate-700/50">
          <div className="flex flex-col gap-4">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">텍스트 위치 배치</label>
            <div className="space-y-4">
              <div className="flex flex-col gap-2">
                <span className="text-[9px] text-slate-500 flex justify-between">상하 (Vertical) <b>{vPos}%</b></span>
                <input type="range" min="10" max="90" value={vPos} onChange={(e) => setVPos(parseInt(e.target.value))} className="accent-red-600 h-1.5 bg-slate-900 rounded-lg appearance-none cursor-pointer" />
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-[9px] text-slate-500 flex justify-between">좌우 (Horizontal) <b>{hPos}%</b></span>
                <input type="range" min="10" max="90" value={hPos} onChange={(e) => setHPos(parseInt(e.target.value))} className="accent-red-600 h-1.5 bg-slate-900 rounded-lg appearance-none cursor-pointer" />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">폰트 & 정렬</label>
            <div className="space-y-3">
              <select 
                value={fontFamily} 
                onChange={(e) => setFontFamily(e.target.value)}
                className="w-full bg-slate-900 text-white text-xs p-3 rounded-xl border border-slate-700 outline-none cursor-pointer hover:bg-slate-800 transition-colors shadow-lg"
              >
                <option value="font-gmarket">지마켓 산스 (Bold)</option>
                <option value="font-blackhan">블랙한 산스 (Impact)</option>
                <option value="font-tmon">티몬 몬소리 (Pop)</option>
                <option value="font-jua">배민 주아 (Round)</option>
                <option value="font-dohyeon">배민 도현 (Modern)</option>
                <option value="font-pretendard">프리텐다드 (Clean)</option>
                <option value="font-nanumpen">나눔펜 (Handwriting)</option>
                <option value="font-gamja">감자꽃 (Cute)</option>
                <option value="font-poorstory">가난한 이야기 (Soft)</option>
              </select>
              <div className="flex p-1 bg-slate-900 rounded-xl border border-slate-700">
                {(['left', 'center', 'right'] as const).map(p => (
                  <button 
                    key={p} 
                    onClick={() => setTextAlign(p)}
                    className={`flex-1 py-2 rounded-lg text-[9px] font-black uppercase transition-all ${textAlign === p ? 'bg-red-600 text-white shadow-lg scale-105' : 'text-slate-500 hover:text-slate-300'}`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">크기 및 대비</label>
            <div className="space-y-4">
              <div className="flex flex-col gap-2">
                <span className="text-[9px] text-slate-500 flex justify-between">글자 크기 배율 <b>{fontSizeMultiplier.toFixed(1)}x</b></span>
                <input type="range" min="0.5" max="2.0" step="0.05" value={fontSizeMultiplier} onChange={(e) => setFontSizeMultiplier(parseFloat(e.target.value))} className="accent-red-600 h-1.5 bg-slate-900 rounded-lg appearance-none cursor-pointer" />
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-[9px] text-slate-500 flex justify-between">배경 어둡기 <b>{(opacity * 100).toFixed(0)}%</b></span>
                <input type="range" min="0" max="0.95" step="0.05" value={opacity} onChange={(e) => setOpacity(parseFloat(e.target.value))} className="accent-red-600 h-1.5 bg-slate-900 rounded-lg appearance-none cursor-pointer" />
              </div>
            </div>
          </div>

          <div className="hidden lg:flex flex-col justify-end p-4 bg-red-600/5 rounded-2xl border border-red-600/10">
            <p className="text-[10px] text-red-500/80 font-bold leading-relaxed">
              💡 팁: <br/>핫배지와 부제목 크기를 조절하여 메인 타이틀의 강조도를 높였습니다. 삐딱했던 배지도 일자로 정렬하여 깔끔한 느낌을 줍니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThumbnailPreview;
