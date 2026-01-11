
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
  
  // 색상 상태 추가
  const [titleColor, setTitleColor] = useState('#ffffff');
  const [subtitleColor, setSubtitleColor] = useState('#facc15');
  
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
    let base = 7.0; 
    if (len > 30) base = 3.2;
    else if (len > 20) base = 4.2;
    else if (len > 12) base = 5.5;
    return base * fontSizeMultiplier;
  };

  const handleCapture = async () => {
    const lib = (window as any).htmlToImage;
    const node = document.getElementById('thumbnail-canvas');
    if (!lib || !node) return alert("이미지 라이브러리 로딩 대기 중...");

    try {
      const dataUrl = await lib.toPng(node, { 
        pixelRatio: 2, 
        cacheBust: true,
        backgroundColor: '#000'
      });
      const link = document.createElement('a');
      link.download = `thumbnail-pro-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (e) {
      console.error(e);
      alert("다운로드에 실패했습니다.");
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
          고화질 저장
        </button>
      </div>

      {/* 썸네일 캔버스 영역 */}
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
              {isLoadingImage ? "Generating AI Visual..." : "Ready to Design"}
            </p>
          </div>
        )}

        <div 
          className="absolute inset-0 z-[1] pointer-events-none"
          style={{ backgroundColor: `rgba(0,0,0,${opacity})` }}
        />

        {/* 텍스트 컨테이너 */}
        <div 
          className="absolute z-[2] flex flex-col pointer-events-none transition-all duration-150 ease-out p-[2%]"
          style={{ 
            top: `${vPos}%`, 
            left: `${hPos}%`,
            transform: `translate(-${hPos}%, -${vPos}%)`,
            textAlign: textAlign,
            alignItems: textAlign === 'left' ? 'flex-start' : textAlign === 'center' ? 'center' : 'flex-end',
            width: '90%'
          }}
        >
          <div className="flex flex-col gap-[0.5vw] w-full">
            {/* 핫배지 */}
            {localStrategy.badge && (
              <div className="flex" style={{ justifyContent: textAlign === 'center' ? 'center' : textAlign === 'right' ? 'flex-end' : 'flex-start' }}>
                <span 
                  className="bg-red-600 text-white px-[1.2vw] py-[0.4vw] rounded font-black shadow-[0_0.5vw_1vw_rgba(0,0,0,0.5)] uppercase inline-flex items-center justify-center"
                  style={{ 
                    fontSize: '1.4vw',
                    lineHeight: '1',
                    marginBottom: '0.4vw'
                  }}
                >
                  {localStrategy.badge}
                </span>
              </div>
            )}
            
            {/* 메인 제목 */}
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

            {/* 부제목 */}
            {localStrategy.subtitle && (
              <p 
                className="font-black"
                style={{ 
                  color: subtitleColor,
                  fontSize: '1.9vw',
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

      {/* 편집 컨트롤 패널 */}
      <div className="bg-slate-800/60 backdrop-blur-2xl p-6 md:p-8 rounded-[2.5rem] border border-slate-700/50 space-y-8 shadow-xl text-left">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-red-500 uppercase tracking-widest">Main Title Editor</label>
            <textarea 
              value={localStrategy.title}
              onChange={(e) => updateField('title', e.target.value)}
              className="w-full h-24 bg-slate-900/80 border border-slate-700 rounded-2xl p-4 text-white font-bold text-sm focus:ring-2 focus:ring-red-600 outline-none resize-none transition-all shadow-inner"
            />
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2 space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Subtitle</label>
                <input 
                  value={localStrategy.subtitle}
                  onChange={(e) => updateField('subtitle', e.target.value)}
                  className="w-full bg-slate-900/80 border border-slate-700 rounded-xl p-3 text-white font-bold text-xs outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Badge</label>
                <input 
                  value={localStrategy.badge}
                  onChange={(e) => updateField('badge', e.target.value)}
                  className="w-full bg-slate-900/80 border border-slate-700 rounded-xl p-3 text-white font-bold text-xs outline-none"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Title Color</label>
                <div className="flex items-center gap-2 bg-slate-900/50 p-2 rounded-xl border border-slate-700">
                  <input type="color" value={titleColor} onChange={(e) => setTitleColor(e.target.value)} className="w-8 h-8 rounded bg-transparent border-none cursor-pointer" />
                  <span className="text-[10px] font-mono text-slate-400">{titleColor.toUpperCase()}</span>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Subtitle Color</label>
                <div className="flex items-center gap-2 bg-slate-900/50 p-2 rounded-xl border border-slate-700">
                  <input type="color" value={subtitleColor} onChange={(e) => setSubtitleColor(e.target.value)} className="w-8 h-8 rounded bg-transparent border-none cursor-pointer" />
                  <span className="text-[10px] font-mono text-slate-400">{subtitleColor.toUpperCase()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 pt-6 border-t border-slate-700/30">
          <div className="space-y-4">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Text Position & Align</label>
            <div className="space-y-3">
              <div className="flex bg-slate-900/50 p-1 rounded-lg border border-slate-700 mb-2">
                {(['left', 'center', 'right'] as const).map(t => (
                  <button key={t} onClick={() => setTextAlign(t)} className={`flex-1 py-1 text-[8px] font-black uppercase rounded transition-all ${textAlign === t ? 'bg-red-600 text-white' : 'text-slate-500 hover:text-slate-300'}`}>{t}</button>
                ))}
              </div>
              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-[9px] text-slate-500 font-bold uppercase"><span>Vertical</span><span>{vPos}%</span></div>
                <input type="range" min="10" max="90" value={vPos} onChange={(e) => setVPos(Number(e.target.value))} className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-red-600" />
              </div>
              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-[9px] text-slate-500 font-bold uppercase"><span>Horizontal</span><span>{hPos}%</span></div>
                <input type="range" min="10" max="90" value={hPos} onChange={(e) => setHPos(Number(e.target.value))} className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-red-600" />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Font Family</label>
            <select 
              value={fontFamily} 
              onChange={(e) => setFontFamily(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white text-[11px] font-bold outline-none cursor-pointer hover:bg-slate-800 transition-colors"
            >
              <option value="font-gmarket">지마켓 산스 (Strong)</option>
              <option value="font-blackhan">블랙한산스 (Heavy)</option>
              <option value="font-tmon">티몬 몬소리 (Pop)</option>
              <option value="font-jua">배민 주아 (Soft)</option>
              <option value="font-dohyeon">배민 도현 (Modern)</option>
              <option value="font-pretendard">프리텐다드 (Clean)</option>
              <option value="font-nanum">나눔펜 (Hand)</option>
              <option value="font-gamja">감자꽃 (Cute)</option>
              <option value="font-poor">가난한이야기 (Story)</option>
            </select>
          </div>

          <div className="space-y-4">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Scale & Background</label>
            <div className="space-y-3">
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between text-[9px] text-slate-500 font-bold uppercase"><span>Font Size</span><span>{fontSizeMultiplier.toFixed(1)}x</span></div>
                <input type="range" min="0.5" max="2.0" step="0.1" value={fontSizeMultiplier} onChange={(e) => setFontSizeMultiplier(Number(e.target.value))} className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-red-600" />
              </div>
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between text-[9px] text-slate-500 font-bold uppercase"><span>BG Darkness</span><span>{(opacity * 100).toFixed(0)}%</span></div>
                <input type="range" min="0" max="0.95" step="0.05" value={opacity} onChange={(e) => setOpacity(Number(e.target.value))} className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-red-600" />
              </div>
            </div>
          </div>

          <div className="hidden lg:flex flex-col justify-center p-4 bg-red-600/5 rounded-2xl border border-red-600/10 border-dashed">
            <p className="text-[9px] text-red-500/70 leading-relaxed font-bold">
              업데이트: 텍스트 개별 색상 지정 기능이 추가되었습니다. 이제 배경 이미지의 톤에 맞춰 가장 눈에 띄는 색상 조합을 직접 골라보세요!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThumbnailPreview;
