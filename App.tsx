
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
        console.error("Image generation failed:", err);
        // 이미지가 실패해도 전략은 보여줌
      } finally {
        setIsGeneratingImg(false);
      }
    } catch (err: any) {
      console.error("Analysis failed:", err);
      const msg = err.message?.includes("API_KEY") 
        ? "API Key 설정에 문제가 있습니다. 관리자에게 문의하세요."
        : "전략 생성 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.";
      alert(msg);
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
        <header className="mb-16 text-center">
          <div className="inline-flex items-center justify-center gap-4 mb-6 group cursor-default">
            <div className="bg-red-600 p-3 rounded-2xl shadow-[0_0_20px_rgba(220,38,38,0.4)] group-hover:scale-110 transition-transform">
              <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" />
              </svg>
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter italic">
              유튜브 <span className="text-red-600">CTR 분석기</span>
            </h1>
          </div>
          <p className="text-slate-400 text-xl font-medium max-w-2xl mx-auto leading-relaxed">
            클릭을 부르는 압도적인 <span className="text-white border-b-2 border-red-600">AI 썸네일 전략가</span>
          </p>
        </header>

        <div className="grid lg:grid-cols-12 gap-12">
          <div className="lg:col-span-5 space-y-8">
            <section className="bg-slate-800/40 backdrop-blur-md p-8 rounded-3xl border border-slate-700/50 shadow-2xl">
              <div className="flex items-center gap-2 mb-4 text-slate-300">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                <label className="text-sm font-black uppercase tracking-widest text-left block w-full">영상 주제 입력</label>
              </div>
              <textarea
                className="w-full h-56 bg-slate-900/80 border border-slate-700 rounded-2xl p-5 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-red-600 transition-all resize-none shadow-inner text-lg leading-relaxed"
                placeholder="영상의 핵심 아이디어를 자유롭게 적어주세요."
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />
              <button
                onClick={handleAnalyze}
                disabled={isAnalyzing || !input.trim()}
                className="w-full mt-6 py-5 bg-red-600 hover:bg-red-500 disabled:bg-slate-800 disabled:text-slate-600 disabled:cursor-not-allowed text-white font-black text-xl rounded-2xl shadow-[0_10px_30px_rgba(220,38,38,0.2)] transform transition-all active:scale-[0.98] flex items-center justify-center gap-3"
              >
                {isAnalyzing ? (
                  <><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>전략 분석 중...</>
                ) : (
                  "AI 전략 생성하기"
                )}
              </button>
            </section>

            {history.length > 0 && (
              <section className="animate-in fade-in slide-in-from-left duration-700">
                <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
                  <span className="w-8 h-px bg-slate-800"></span>
                  히스토리
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
                        {item.imageUrl ? <img src={item.imageUrl} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all" /> : <div className="w-full h-full bg-slate-800" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-300 truncate group-hover:text-white">{item.strategy.title}</p>
                        <p className="text-[10px] text-slate-600 font-mono mt-1">{new Date(item.timestamp).toLocaleTimeString()}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </section>
            )}
          </div>

          <div className="lg:col-span-7">
            {currentStrategy ? (
              <div className="animate-in zoom-in-95 duration-500">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-black flex items-center gap-3 text-white">
                    <span className="flex h-8 w-1.5 bg-red-600 rounded-full"></span>
                    디자인 스튜디오
                  </h2>
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
                <h3 className="text-xl font-black text-slate-600 mb-2 italic uppercase italic">Waiting for Idea</h3>
                <p className="text-slate-600 max-w-sm">주제를 입력하면 AI가 최적의 썸네일과 제목을 디자인해 드립니다.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
