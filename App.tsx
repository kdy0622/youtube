
import React, { useState } from 'react';
import { generateStrategy, generateThumbnailImage } from './services/geminiService';
import { ThumbnailStrategy, HistoryItem } from './types';
import ThumbnailPreview from './components/ThumbnailPreview';

const App: React.FC = () => {
  const [input, setInput] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGeneratingImg, setIsGeneratingImg] = useState(false);
  const [currentStrategy, setCurrentStrategy] = useState<ThumbnailStrategy | null>(null);
  const [currentImageUrl, setCurrentImageUrl] = useState<string | undefined>();
  const [history, setHistory] = useState<HistoryItem[]>([]);

  const handleAnalyze = async () => {
    if (!input.trim()) return;
    
    setIsAnalyzing(true);
    setCurrentStrategy(null);
    setCurrentImageUrl(undefined);

    try {
      const strategy = await generateStrategy(input);
      setCurrentStrategy(strategy);
      
      setIsGeneratingImg(true);
      try {
        const imageUrl = await generateThumbnailImage(strategy.image_prompt);
        setCurrentImageUrl(imageUrl);
        
        const newItem: HistoryItem = {
          id: Date.now().toString(),
          input,
          strategy,
          imageUrl,
          timestamp: Date.now()
        };
        setHistory(prev => [newItem, ...prev].slice(0, 10));
      } catch (err) {
        console.error("Image generation failed", err);
      } finally {
        setIsGeneratingImg(false);
      }
    } catch (err) {
      console.error("Analysis failed", err);
      alert("전략 생성에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleStrategyUpdate = (updated: ThumbnailStrategy) => {
    setCurrentStrategy(updated);
  };

  return (
    <div className="bg-slate-900 min-h-screen text-slate-100 font-sans selection:bg-red-500/30">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Header */}
        <header className="mb-16 text-center">
          <div className="inline-flex items-center justify-center gap-4 mb-6 group cursor-default">
            <div className="bg-red-600 p-3 rounded-2xl shadow-[0_0_20px_rgba(220,38,38,0.4)] group-hover:scale-110 transition-transform">
              <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" />
              </svg>
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter italic">
              유튜브 <span className="text-red-600">썸네일 만들기</span>
            </h1>
          </div>
          <p className="text-slate-400 text-xl font-medium max-w-2xl mx-auto leading-relaxed">
            당신의 아이디어를 <span className="text-white border-b-2 border-red-600">무조건 클릭하게 만드는</span> 압도적인 썸네일 전략으로 변환합니다.
          </p>
        </header>

        <div className="grid lg:grid-cols-12 gap-12">
          {/* Left: Input & History */}
          <div className="lg:col-span-5 space-y-8">
            <section className="bg-slate-800/40 backdrop-blur-md p-8 rounded-3xl border border-slate-700/50 shadow-2xl">
              <div className="flex items-center gap-2 mb-4 text-slate-300">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                <label className="text-sm font-black uppercase tracking-widest">컨셉 기획안 입력</label>
              </div>
              <textarea
                className="w-full h-56 bg-slate-900/80 border border-slate-700 rounded-2xl p-5 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-red-600 transition-all resize-none shadow-inner text-lg leading-relaxed"
                placeholder="어떤 영상을 만드시나요? 영상의 주제나 강조하고 싶은 포인트를 자유롭게 적어주세요."
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />
              <button
                onClick={handleAnalyze}
                disabled={isAnalyzing || !input.trim()}
                className="w-full mt-6 py-5 bg-red-600 hover:bg-red-500 disabled:bg-slate-800 disabled:text-slate-600 disabled:cursor-not-allowed text-white font-black text-xl rounded-2xl shadow-[0_10px_30px_rgba(220,38,38,0.2)] transform transition-all active:scale-[0.98] flex items-center justify-center gap-3"
              >
                {isAnalyzing ? (
                  <><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>분석 중...</>
                ) : (
                  "매력적인 썸네일 만들기"
                )}
              </button>
            </section>

            {history.length > 0 && (
              <section className="animate-in fade-in slide-in-from-left duration-700">
                <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
                  <span className="w-8 h-px bg-slate-800"></span>
                  작업 히스토리
                </h3>
                <div className="space-y-3">
                  {history.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        setCurrentStrategy(item.strategy);
                        setCurrentImageUrl(item.imageUrl);
                      }}
                      className="w-full flex items-center gap-4 bg-slate-800/30 hover:bg-slate-800 p-3 rounded-xl border border-slate-700/30 transition-all text-left group"
                    >
                      <div className="w-20 aspect-video rounded-lg overflow-hidden bg-slate-900 flex-shrink-0">
                        <img src={item.imageUrl} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-300 truncate group-hover:text-white">{item.strategy.title}</p>
                        <p className="text-[10px] text-slate-600 font-mono mt-1">{new Date(item.timestamp).toLocaleString()}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Right: Preview & Live Editor */}
          <div className="lg:col-span-7">
            {currentStrategy ? (
              <div className="animate-in zoom-in-95 duration-500">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-black flex items-center gap-3 text-white">
                    <span className="flex h-8 w-1.5 bg-red-600 rounded-full"></span>
                    실시간 썸네일 디자인
                  </h2>
                  <div className="flex gap-2">
                    <span className="px-3 py-1 bg-green-500/10 text-green-500 text-[10px] font-black uppercase rounded-full border border-green-500/20">High CTR Potential</span>
                  </div>
                </div>
                
                <ThumbnailPreview 
                  strategy={currentStrategy} 
                  imageUrl={currentImageUrl} 
                  isLoadingImage={isGeneratingImg}
                  onUpdate={handleStrategyUpdate}
                />
              </div>
            ) : (
              <div className="h-full min-h-[500px] flex flex-col items-center justify-center border-2 border-dashed border-slate-800 rounded-3xl text-slate-700 bg-slate-800/10 px-12 text-center">
                <div className="w-24 h-24 mb-6 rounded-full bg-slate-800/30 flex items-center justify-center">
                  <svg className="w-12 h-12 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 002-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                </div>
                <h3 className="text-xl font-black text-slate-600 mb-2 italic uppercase">Waiting for your Idea</h3>
                <p className="text-slate-600 max-w-sm">왼쪽 패널에 영상의 핵심 내용을 입력하시면 100만 유튜버의 감각이 담긴 썸네일을 시각화해 드립니다.</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-32 pt-12 border-t border-slate-800/50 flex flex-col md:flex-row justify-between items-center gap-6 text-slate-600">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center font-black text-xs">C</div>
             <p className="font-bold tracking-tight">CTR PRO STRATEGIST <span className="text-slate-800 mx-2">|</span> AI POWERED</p>
          </div>
          <div className="flex gap-8 text-xs font-black uppercase tracking-widest">
            <a href="#" className="hover:text-red-500 transition-colors">Documentation</a>
            <a href="#" className="hover:text-red-500 transition-colors">Pricing</a>
            <a href="#" className="hover:text-red-500 transition-colors">API</a>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default App;
