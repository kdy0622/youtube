
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
  
  // 색상 커스터마이징 상태
  const [titleColor, setTitleColor] = useState('#ffffff');
  const [subtitleColor, setSubtitleColor] = useState('#facc15');
  const [badgeColor, setBadgeColor] = useState('#ef4444');
  
  // 위치 조절 상태
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
    let base = 6.5; 
    if (len > 30) base = 3.0;
    else if (len > 20) base = 4.0;
    else if (len > 12) base = 5.0;
    return base * fontSizeMultiplier;
  };

  const handleCapture = async () => {
    const lib = (window as any).htmlToImage;
    const node = document.getElementById('thumbnail-canvas');
    if (!lib || !node) return alert("라이브러리 로딩 중...");

    try {
      const dataUrl = await lib.toPng(node, { 
        pixelRatio: 2, 
        cacheBust: true,
        backgroundColor: '#000'
      });
      const link = document.createElement('a');
      link.download = `youtube-thumbnail-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (e) {
      alert("저장에 실패했습니다. 캡처 기능을 이용해 주세요.");
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full animate-in fade-in duration-500 text-left">
      <div className="flex justify-end">
        <button 
          onClick={handleCapture}
          className="bg-red-600 hover:bg-red-500 text-white font-black px-6 py-2.5 rounded-xl shadow-lg transition-all active:scale-95 flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
          이미지 다운로드
        </button>
      </div>

      {/* 미리보기 캔버스 */}
      <div 
        id="thumbnail-canvas"
        className="relative w-full aspect-video rounded-3xl overflow-hidden bg-slate-950 shadow-2xl border border-slate-800"
      >
        {imageUrl ? (
          <img src={imageUrl} className="absolute inset-0 w-full h-full object-cover" crossOrigin="anonymous" />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-700 font-black gap-4">
            <div className={`w-12 h-12 border-4 border-slate-800 border-t-red-600 rounded-full ${isLoadingImage ? 'animate-spin' : ''}`}></div>
            <p className="text-sm italic tracking-widest uppercase">
              {isLoadingImage ? "Generating AI Visual..." : "Waiting for Design"}
            </p>
          </div>
        )}

        <div className="absolute inset-0 z-[1] pointer-events-none" style={{ backgroundColor: `rgba(0,0,0,${opacity})` }} />

        <div 
          className="absolute z-[2] flex flex-col pointer-events-none transition-all duration-150 p-[2%]"
          style={{ 
            top: `${vPos}%`, 
            left: `${hPos}%`,
            transform: `translate(-${hPos}%, -${vPos}%)`,
            textAlign: textAlign,
            alignItems: textAlign === 'left' ? 'flex-start' : textAlign === 'center' ? 'center' : 'flex-end',
            width: '85%'
          }}
        >
          <div className="flex flex-col gap-[0.5vw] w-full">
            {localStrategy.badge && (
              <div className="flex" style={{ justifyContent: textAlign === 'center' ? 'center' : textAlign === 'right' ? 'flex-end' : 'flex-start' }}>
                <span 
                  className="px-[1.2vw] py-[0.4vw] rounded font-black shadow-lg uppercase inline-flex items-center justify-center"
                  style={{ 
                    backgroundColor: badgeColor,
                    color: '#fff',
                    fontSize: '1.4vw',
                    lineHeight: '1',
                    marginBottom: '0.4vw'
                  }}
                >
                  {localStrategy.badge}
                </span>
              </div>
            )}
            
            <h1 
              className={`${fontFamily} font-black leading-[1.05] tracking-tighter`}
              style={{ 
                color: titleColor,
                fontSize: `${getResponsiveFontSize(localStrategy.title)}vw`,
                textShadow: '0 0.4vw 1vw rgba(0,0,0,0.9)',
                whiteSpace: 'pre-wrap',
                wordBreak: 'keep-all'
              }}
            >
              {localStrategy.title}
            </h1>

            {localStrategy.subtitle && (
              <p 
                className="font-black"
                style={{ 
                  color: subtitleColor,
                  fontSize: '1.8vw',
                  textShadow: '0 0.2vw 0.5vw rgba(0,0,0,0.8)',
                  marginTop: '0.2vw'
                }}
              >
                {localStrategy.subtitle}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* 에디터 패널 */}
      <div className="bg-slate-800/60 backdrop-blur-2xl p-6 md:p-8 rounded-[2.5rem] border border-slate-700/50 space-y-8 shadow-xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-red-500 uppercase tracking-widest">제목 내용</label>
              <textarea 
                value={localStrategy.title}
                onChange={(e) => updateField('title', e.target.value)}
                className="w-full h-24 bg-slate-900 border border-slate-700 rounded-2xl p-4 text-white font-bold text-sm focus:ring-2 focus:ring-red-600 outline-none resize-none shadow-inner"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">글씨 색상 설정</label>
              <div className="grid grid-cols-3 gap-2">
                <div className="flex flex-col gap-1">
                  <span className="text-[9px] text-slate-400 text-center">제목</span>
                  <input type="color" value={titleColor} onChange={(e) => setTitleColor(e.target.value)} className="w-full h-10 rounded-lg bg-slate-900 border border-slate-700 cursor-pointer p-1" />
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[9px] text-slate-400 text-center">부제목</span>
                  <input type="color" value={subtitleColor} onChange={(e) => setSubtitleColor(e.target.value)} className="w-full h-10 rounded-lg bg-slate-900 border border-slate-700 cursor-pointer p-1" />
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[9px] text-slate-400 text-center">뱃지</span>
                  <input type="color" value={badgeColor} onChange={(e) => setBadgeColor(e.target.value)} className="w-full h-10 rounded-lg bg-slate-900 border border-slate-700 cursor-pointer p-1" />
                </div>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2 space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">부제목</label>
                <input value={localStrategy.subtitle} onChange={(e) => updateField('subtitle', e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white font-bold text-xs outline-none" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">뱃지</label>
                <input value={localStrategy.badge} onChange={(e) => updateField('badge', e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white font-bold text-xs outline-none" />
              </div>
            </div>
            
            <div className="space-y-2">
               <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">정렬 및 폰트</label>
               <div className="flex gap-2">
                 <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-700 flex-1">
                    {(['left', 'center', 'right'] as const).map(t => (
                      <button key={t} onClick={() => setTextAlign(t)} className={`flex-1 py-1.5 text-[9px] font-black uppercase rounded-lg transition-all ${textAlign === t ? 'bg-red-600 text-white shadow-lg' : 'text-slate-500'}`}>{t}</button>
                    ))}
                 </div>
                 <select value={fontFamily} onChange={(e) => setFontFamily(e.target.value)} className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1 text-white text-[10px] font-bold outline-none cursor-pointer flex-1">
                    <option value="font-gmarket">지마켓</option>
                    <option value="font-blackhan">블랙한</option>
                    <option value="font-tmon">티몬</option>
                    <option value="font-jua">주아</option>
                    <option value="font-dohyeon">도현</option>
                    <option value="font-pretendard">기본</option>
                 </select>
               </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 pt-6 border-t border-slate-700/30">
          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">텍스트 위치 조절</label>
            <div className="flex flex-col gap-2">
              <div className="flex justify-between text-[9px] text-slate-500 uppercase font-bold"><span>상하</span><span>{vPos}%</span></div>
              <input type="range" min="10" max="90" value={vPos} onChange={(e) => setVPos(Number(e.target.value))} className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-red-600" />
              <div className="flex justify-between text-[9px] text-slate-500 uppercase font-bold"><span>좌우</span><span>{hPos}%</span></div>
              <input type="range" min="10" max="90" value={hPos} onChange={(e) => setHPos(Number(e.target.value))} className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-red-600" />
            </div>
          </div>
          
          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">텍스트 크기 & 배경</label>
            <div className="flex flex-col gap-2">
              <div className="flex justify-between text-[9px] text-slate-500 uppercase font-bold"><span>크기</span><span>{fontSizeMultiplier.toFixed(1)}x</span></div>
              <input type="range" min="0.5" max="2.0" step="0.1" value={fontSizeMultiplier} onChange={(e) => setFontSizeMultiplier(Number(e.target.value))} className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-red-600" />
              <div className="flex justify-between text-[9px] text-slate-500 uppercase font-bold"><span>배경 암전</span><span>{(opacity * 100).toFixed(0)}%</span></div>
              <input type="range" min="0" max="0.95" step="0.05" value={opacity} onChange={(e) => setOpacity(Number(e.target.value))} className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-red-600" />
            </div>
          </div>

          <div className="flex flex-col justify-center p-4 bg-red-600/5 rounded-2xl border border-red-600/10 border-dashed">
            <p className="text-[9px] text-red-500/70 leading-relaxed font-bold italic">
              "클릭을 부르는 비밀은 이미지의 빈 공간(Negative Space)을 찾아 텍스트를 배치하는 것입니다. 제목과 부제목의 색상 대비를 활용하세요!"
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThumbnailPreview;
