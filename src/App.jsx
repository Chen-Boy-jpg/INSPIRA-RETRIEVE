import React, { useState, useEffect } from 'react';

const API_BASE_URL = "http://localhost:8000/api";

const Navbar = () => (
  <nav className="sticky top-0 z-50 w-full border-b border-gray-100 bg-white/80 backdrop-blur-md">
    <div className="mx-auto flex h-20 max-w-none items-center justify-between px-8 md:px-12">
      <div className="flex items-center gap-12">
        <h1 className="text-2xl font-bold tracking-tighter text-black">INSPIRA</h1>
        <div className="hidden gap-8 md:flex">
          <a href="#" className="text-sm font-medium text-gray-900 border-b-2 border-black pb-1">Explore Layouts</a>
          <a href="#" className="text-sm font-medium text-gray-500 hover:text-black transition-colors">Aspiration Feed</a>
        </div>
      </div>
    </div>
  </nav>
);

const InspirationCard = ({ file, image_url, score, isAspiration, onPreviewClick }) => (
  <div className="group cursor-pointer space-y-3 opacity-0 animate-[fadeIn_0.5s_ease-out_forwards]" onClick={onPreviewClick}>
    {/* 外圍加寬 p-4 深色質感襯底 */}
    <div className="relative overflow-hidden rounded-2xl bg-gray-950 p-4 shadow-inner border border-gray-900 transition-all group-hover:shadow-lg">
      <img 
        src={image_url} 
        alt={file || "UI screenshot"} 
        className="h-auto w-full min-h-[180px] object-contain transition-transform duration-500 group-hover:scale-[1.025]" 
        onError={() => console.error(`❌ 圖片載入失效: ${image_url}`)}
      />
      <div className="absolute inset-0 bg-gray-950/0 transition-colors group-hover:bg-gray-950/20 flex items-center justify-center">
        <span className="material-icons text-white bg-black/40 backdrop-blur-sm p-3 rounded-full text-xl shadow-lg opacity-0 group-hover:opacity-100 transition-all">
          zoom_in
        </span>
      </div>
    </div>
    
    <div className="px-1 flex justify-between items-start">
      <div className="min-w-0 flex-1 pr-2">
        <h3 className="text-sm font-medium text-gray-900 truncate" title={file}>{file}</h3>
        <p className="text-[9px] font-mono text-gray-400 uppercase tracking-wider">
          {isAspiration ? "Pure Structure" : "Multi-Objective"}
        </p>
      </div>
      <span className={`rounded px-2 py-0.5 text-[10px] font-mono font-bold border shrink-0 ${
        isAspiration ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-blue-50 text-blue-600 border-blue-100'
      }`}>
        ★ {score}
      </span>
    </div>
  </div>
);

const SkeletonGrid = () => (
  <div className="grid grid-cols-1 gap-x-4 gap-y-12 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:gap-x-5">
    {Array(5).fill(0).map((_, i) => (
      <div key={i} className="space-y-3 animate-pulse">
        <div className="relative overflow-hidden rounded-2xl bg-gray-950 p-4 h-80 border border-gray-900"><div className="bg-gray-800 h-full w-full rounded-lg" /></div>
        <div className="h-4 bg-gray-200 rounded w-5/6" /><div className="h-3 bg-gray-100 rounded w-1/4" />
      </div>
    ))}
  </div>
);

const App = () => {
  const [searchQuery, setSearchQuery] = useState("Modern dashboard with complex data visualization");
  const [exploitationResults, setExploitationResults] = useState([]);
  const [aspirationResults, setAspirationResults] = useState([]);
  const [objectives, setObjectives] = useState(null); 
  const [loading, setLoading] = useState(false);
  const [previewItem, setPreviewItem] = useState(null);
  const [isReranking, setIsReranking] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setLoading(true);
    try {
      console.log(`📡 [API Search] 發送意圖: ${searchQuery}`);
      const response = await fetch(`${API_BASE_URL}/search`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: searchQuery })
      });
      const data = await response.json();
      console.log("📥 [API Response] Search 回傳資料:", data);

      if (data.status === "success") {
        setExploitationResults(data.exploitation_results || []);
        setAspirationResults(data.aspiration_results || []);
        setObjectives(data.objectives);
      }
    } catch (error) {
      console.error("❌ Search 請求失敗:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRerankAndOptimize = async (clickedFile) => {
    if (!objectives || exploitationResults.length === 0) return;
    setIsReranking(true); 
    setPreviewItem(null); 
    try {
      console.log(`📡 [API Rerank] 鎖定結構樣本: ${clickedFile}`);
      
     
      const combined = [...exploitationResults, ...aspirationResults];
      const uniqueResults = Array.from(new Map(combined.map(item => [item.file, item])).values());

      const response = await fetch(`${API_BASE_URL}/rerank`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: searchQuery,
          current_objectives: JSON.stringify(objectives),
          clicked_file: clickedFile,
          current_results: uniqueResults 
        })
      });
      const data = await response.json();
      console.log("📥 [API Response] Rerank 重排結果:", data);

      if (data.status === "success") {
        setExploitationResults(data.exploitation_results || []);
        setAspirationResults(data.aspiration_results || []);
        setObjectives(data.objectives); 
      }
    } catch (error) {
      console.error("❌ Rerank 請求失敗:", error);
    } finally {
      setIsReranking(false); 
    }
  };

  useEffect(() => {
    const triggerInitialFetch = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${API_BASE_URL}/search`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: searchQuery })
        });
        const data = await response.json();
        if (data.status === "success") {
          setExploitationResults(data.exploitation_results || []);
          setAspirationResults(data.aspiration_results || []);
          setObjectives(data.objectives);
        }
      } catch (error) {
        console.error("❌ 初始自動加載失敗:", error);
      } finally {
        setLoading(false);
      }
    };
    triggerInitialFetch();
  }, []); 

  const extractTags = () => {
    if (!objectives) return [];
    const tags = [];
    if (Array.isArray(objectives.f1_Domain_Target)) objectives.f1_Domain_Target.forEach(dom => tags.push({ text: dom }));
    if (objectives.f2_Function_Target) tags.push({ text: objectives.f2_Function_Target.length > 25 ? "Target Flow Role" : objectives.f2_Function_Target });
    if (objectives.f3_Composition_Target?.Mandatory) objectives.f3_Composition_Target.Mandatory.slice(0, 4).forEach(el => tags.push({ text: `＋ ${el}` }));
    if (objectives.f4_Structure_Target?.Layout_Expect) tags.push({ text: `📐 ${objectives.f4_Structure_Target.Layout_Expect}` });
    return tags;
  };

  const activeTags = extractTags();

  return (
    <div className="min-h-screen bg-white text-gray-900 selection:bg-black selection:text-white">
      <Navbar />
      
      <main className="mx-auto max-w-none px-8 md:px-12 py-12">
        {/* 搜尋區塊 */}
        <section className="mb-12 border-b border-gray-100 pb-12">
          <div className="relative mb-8">
            <input 
              type="text" 
              value={searchQuery} 
              onChange={(e) => setSearchQuery(e.target.value)} 
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()} 
              className="w-full bg-transparent pr-12 text-4xl font-medium tracking-tight text-gray-900 focus:outline-none placeholder:text-gray-200" 
            />
            <span onClick={handleSearch} className="absolute right-0 top-1/2 -translate-y-1/2 material-icons text-gray-400 hover:text-black transition-colors text-3xl cursor-pointer">search</span>
          </div>
          
          {activeTags.length > 0 && (
            <div className={`flex flex-wrap gap-2.5 max-w-none transition-all duration-300 ${isReranking ? 'opacity-40 blur-[2px]' : ''}`}>
              {activeTags.map((tag, index) => (
                <button key={index} className="flex items-center gap-2 rounded-full border px-4 py-1.5 text-[10px] font-mono tracking-wide shadow-sm bg-gray-50 text-gray-600 border-gray-100">
                  {tag.text}
                </button>
              ))}
            </div>
          )}
        </section>

        {/* 📊 網格一：符合多目標優化之 UI 結果 (Exploitation) */}
        <section className="space-y-6">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div className="flex items-center gap-3">
              <span className="h-2 w-2 rounded-full bg-blue-500"></span>
              <h2 className="text-lg font-bold tracking-tight text-gray-900">符合多目標優化之 UI 結果 (Exploitation Feed)</h2>
            </div>
          </div>

          {loading || isReranking ? (
            <SkeletonGrid />
          ) : (
            <div className="grid grid-cols-1 gap-x-4 gap-y-12 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:gap-x-5">
              {exploitationResults.length > 0 ? (
                exploitationResults.map((item, idx) => (
                  <InspirationCard key={item.file || idx} {...item} onPreviewClick={() => setPreviewItem(item)} />
                ))
              ) : (
                <div className="col-span-full text-center py-12 font-mono text-sm text-gray-400">網格載入中或後端預加載數量為 0 筆。</div>
              )}
            </div>
          )}
        </section>

        {/* 📊 網格二：探索純結構之 UI 結果 (Aspiration) */}
        <section className="space-y-6 mt-20">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div className="flex items-center gap-3">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <h2 className="text-lg font-bold tracking-tight text-gray-900">探索純結構之 UI 結果 (Aspiration Feed)</h2>
            </div>
          </div>
          <div className="text-[11px] font-mono text-emerald-600 font-bold -mt-3">
            已解耦美學風格 · 純粹拓撲佈局與結構空間對齊 (與上方網格 100% 互斥去重)
          </div>

          {loading || isReranking ? (
            <SkeletonGrid />
          ) : (
            <div className="grid grid-cols-1 gap-x-4 gap-y-12 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:gap-x-5">
              {aspirationResults.length > 0 ? (
                aspirationResults.map((item, idx) => (
                  <InspirationCard key={item.file || idx} {...item} isAspiration={true} onPreviewClick={() => setPreviewItem(item)} />
                ))
              ) : (
                <div className="col-span-full text-center py-12 font-mono text-sm text-gray-400">探索區域載入中或所有解皆已包含在上方主網格中。</div>
              )}
            </div>
          )}
        </section>
      </main>

      {/* 大圖彈窗 */}
      {previewItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-6 overflow-y-auto" onClick={() => !isReranking && setPreviewItem(null)}>
          <div className="relative max-w-4xl w-full bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row border border-gray-100" onClick={(e) => e.stopPropagation()}>
            <div className="md:w-3/5 bg-gray-950 p-4 flex items-center justify-center max-h-[80vh]"><img src={previewItem.image_url} alt={previewItem.file} className="w-full h-auto max-h-[75vh] object-contain" /></div>
            <div className="md:w-2/5 p-8 flex flex-col justify-between bg-white">
              <div className="space-y-6">
                <div className="flex justify-between items-start">
                  <div><span className="text-[10px] font-mono uppercase tracking-widest text-gray-400">File Signature</span><h2 className="text-xl font-bold tracking-tight text-gray-900 mt-0.5 break-all">{previewItem.file}</h2></div>
                  {!isReranking && <button onClick={() => setPreviewItem(null)} className="text-gray-400 hover:text-black transition-colors"><span className="material-icons">close</span></button>}
                </div>
                <div className="border-t border-b border-gray-100 py-4"><div className="flex justify-between text-xs font-mono"><span className="text-gray-400">Current Vector Score:</span><span className="font-bold text-blue-600">★ {previewItem.score}</span></div></div>
              </div>
              <div className="mt-8 pt-4">
                <button disabled={isReranking} onClick={() => handleRerankAndOptimize(previewItem.file)} className={`w-full text-white transition-all rounded-xl py-3.5 text-xs font-mono font-bold tracking-wider flex items-center justify-center gap-2 shadow-lg ${isReranking ? 'bg-gray-400 cursor-not-allowed shadow-none' : 'bg-black hover:bg-gray-800'}`}>
                  <span className={`material-icons text-sm ${isReranking ? 'animate-spin' : ''}`}>{isReranking ? 'sync' : 'tune'}</span>
                  {isReranking ? 'OPTIMIZING PARETO FRONT...' : 'USE THIS STYLE TO RERANK ⚡️'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;