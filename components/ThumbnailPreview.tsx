
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
  const [fontSize, setFontSize] = useState(7); 
  const [opacity, setOpacity] = useState(0.4);
  const [fontFamily, setFontFamily] = useState('font-gmarket');
  const [textAlign, setTextAlign] = useState<'left' | 'center' | 'right'>('left');

  useEffect(() => {
    if (strategy) setLocalStrategy(strategy);
  }, [strategy]);

  const updateField = (field: keyof ThumbnailStrategy, val: string) => {
    const next = { ...localStrategy, [field]: val };
    setLocalStrategy(next);
    if (onUpdate) onUpdate(next);
  };

  const handleDownload = async () => {
    const lib = (window as any).htmlToImage;
    const node = document.getElementById('thumbnail-output');
    if (!lib || !node) return alert("이미지 라이브러리 로드 중...");
    
    try {
      const dataUrl = await lib.toPng(node, { pixelRatio: 2, cacheBust: true });
      const link = document.createElement('a');
      link.download = `youtube-thumbnail.png`;
      link.href = dataUrl;
      link.click();
    } catch (e) {
      alert("저장 실패. 잠시 후 다시 시도해주세요.");
    }
  };

  // 글자 길이에 따른 자동 줄바꿈 및 가독성을 위한 스타일
  const titleStyle: React.CSSProperties = {
    fontSize: `${fontSize}vw`,
    color: 'white',
    lineHeight: '1.1',
    margin: 0,
    fontWeight: 900,
    wordBreak: 'keep-all',
    overflowWrap: 'break-word',
    whiteSpace: 'pre-wrap',
    textShadow: '0 0.5vw 1.5vw rgba(0,0,0,0.9)',
    transition: 'font-size 0.2s ease-in-out'
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="flex justify-end">
        <button 
          onClick={handleDownload}
          disabled={!imageUrl}
          className="bg-red-600 text-white px-6 py-2 rounded-xl font-black text-sm hover:bg-red-500 disabled:opacity-30 transition-all shadow-lg"
        >
          최종 결과물 저장하기
        </button>
      </div>

      {/* 실시간 캔버스 구역 */}
      <div 
        id="thumbnail-output"
        className="relative w-full aspect-video rounded-2xl overflow-hidden bg-slate-800 shadow-2xl flex items-center justify-center"
      >
        {/* 배경 이미지 */}
        {imageUrl ? (
          <img 
            src={imageUrl} 
            className="absolute inset-0 w-full h-full object-cover" 
            crossOrigin="anonymous" 
          />
        ) : (
          <div className="text-slate-600 font-bold text-sm">
            {isLoadingImage ? "AI 배경 생성 중..." : "아이디어를 입력하면 썸네일이 나타납니다"}
          </div>
        )}

        {/* 배경 어둡게 조절 */}
        <div 
          className="absolute inset-0 pointer-events-none" 
          style={{ backgroundColor: `rgba(0,0,0,${opacity})`, zIndex: 1 }}
        ></div>

        {/* 텍스트 레이어 */}
        <div 
          className="absolute inset-0 z-10 p-[6%] flex flex-col justify-center"
          style={{ 
            textAlign: textAlign,
            alignItems: textAlign === 'left' ? 'flex-start' : textAlign === 'center' ? 'center' : 'flex-end'
          }}
        >
          <div className="flex flex-col gap-[1.5vw] w-full max-w-full">
            {/* 뱃지 */}
            {localStrategy.badge && (
              <div>
                <span className="bg-red-600 text-white px-[1.5vw] py-[0.4vw] rounded font-black shadow-2xl transform -rotate-1 inline-block" style={{ fontSize: '2.2vw' }}>
                  {localStrategy.badge}
                </span>
              </div>
            )}
            
            {/* 메인 제목 (자동 줄바꿈 및 크기 조절 적용) */}
            <h1 className={fontFamily} style={titleStyle}>
              {localStrategy.title}
            </h1>

            {/* 서브 제목 */}
            {localStrategy.subtitle && (
              <p className="font-black" style={{ 
                fontSize: '3.2vw', 
                color: '#facc15', 
                textShadow: '0 0.3vw 0.8vw rgba(0,0,0,0.8)',
                margin: 0
              }}>
                {localStrategy.subtitle}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* 상세 편집 패널 */}
      <div className="bg-slate-800/60 p-6 rounded-2xl border border-slate-700 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">메인 문구 직접 수정</label>
            <textarea 
              value={localStrategy.title}
              onChange={(e) => updateField('title', e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-xl p-3 text-white text-sm font-bold h-24 focus:ring-1 focus:ring-red-600 outline-none"
            />
          </div>
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-black text-slate-500">서브 문구</label>
              <input 
                value={localStrategy.subtitle}
                onChange={(e) => updateField('subtitle', e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-lg p-2 text-white text-xs font-bold"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-black text-slate-500">뱃지(강조)</label>
              <input 
                value={localStrategy.badge}
                onChange={(e) => updateField('badge', e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-lg p-2 text-white text-xs font-bold"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-slate-700">
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black text-slate-500">글꼴</label>
            <select 
              value={fontFamily} 
              onChange={(e) => setFontFamily(e.target.value)}
              className="bg-slate-900 text-white text-xs p-2 rounded border border-slate-700"
            >
              <option value="font-gmarket">지마켓 산스</option>
              <option value="font-blackhan">블랙한산스</option>
              <option value="font-tmon">티몬몬소리</option>
              <option value="font-pretendard">프리텐다드</option>
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black text-slate-500">글자 크기: {fontSize}</label>
            <input type="range" min="3" max="15" step="0.5" value={fontSize} onChange={(e) => setFontSize(parseFloat(e.target.value))} className="accent-red-600" />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black text-slate-500">밝기 조절</label>
            <input type="range" min="0" max="0.9" step="0.1" value={opacity} onChange={(e) => setOpacity(parseFloat(e.target.value))} className="accent-red-600" />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black text-slate-500">정렬</label>
            <div className="flex gap-1">
              {(['left', 'center', 'right'] as const).map(p => (
                <button 
                  key={p} 
                  onClick={() => setTextAlign(p)}
                  className={`flex-1 py-1 rounded text-[9px] font-black uppercase ${textAlign === p ? 'bg-red-600 text-white' : 'bg-slate-900 text-slate-500'}`}
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
