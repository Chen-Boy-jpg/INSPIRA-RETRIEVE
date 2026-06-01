import React, { useState, useEffect } from 'react';

const API_BASE_URL = "http://localhost:8001/api";

// ==========================================
// 📊 1. 超緊湊版：ADIR 四維權重動態顯示面板 (橫向窄型適配)
// ==========================================
const ExplanationPanel = ({ weights }) => {
  const currentWeights = weights || { f1_domain: 25, f2_function: 25, f3_composition: 25, f4_structure: 25 };

  const infoList = [
    { key: 'f1_domain', label: '🏢 產業', color: 'bg-blue-500' },
    { key: 'f2_function', label: '📱 功能', color: 'bg-emerald-500' },
    { key: 'f3_composition', label: '🧱 元件', color: 'bg-amber-500' },
    { key: 'f4_structure', label: '📐 結構', color: 'bg-purple-500' }
  ];

  return (
    <div className="flex items-center gap-x-4 shrink-0">
      {infoList.map((item) => {
        const val = currentWeights[item.key] || 0;
        return (
          <div key={item.key} className="flex flex-col justify-center min-w-[100px] lg:min-w-[130px]">
            <div className="flex justify-between items-center text-[10px] font-bold mb-0.5">
              <span className="text-zinc-600 truncate mr-2">{item.label}</span>
              <span className="font-mono text-zinc-900">{val}%</span>
            </div>
            <div className="w-full h-2 bg-zinc-100 rounded-full overflow-hidden border border-zinc-200/60">
              <div 
                className={`h-full ${item.color} rounded-full transition-all duration-700 ease-out`} 
                style={{ width: `${val}%` }} 
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

const InspirationCard = ({ file, image_url, score, isAspiration, onPreviewClick }) => (
  <div className="group cursor-pointer space-y-2 opacity-0 animate-[fadeIn_0.5s_ease-out_forwards]" onClick={onPreviewClick}>
    <div className="relative overflow-hidden rounded-xl bg-gray-950 p-3 shadow-inner border border-gray-900 transition-all group-hover:shadow-md">
      <img src={image_url} alt={file || "UI screenshot"} className="h-auto w-full min-h-[150px] object-contain transition-transform duration-500 group-hover:scale-[1.02]" />
      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/10 transition-opacity">
        <span className="material-icons text-white text-xl">zoom_in</span>
      </div>
    </div>
    <div className="px-1 flex justify-between items-center">
      <h3 className="text-xs font-medium text-gray-700 truncate flex-1 mr-2" title={file}>{file}</h3>
      <span className={`rounded-md px-1.5 py-0.5 text-[9px] font-mono font-bold border shrink-0 ${isAspiration ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>
        ★ {score}
      </span>
    </div>
  </div>
);

const SkeletonGrid = () => (
  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
    {Array(10).fill(0).map((_, i) => (
      <div key={i} className="space-y-2 animate-pulse">
        <div className="h-60 bg-gray-100 rounded-xl border border-gray-200" />
        <div className="h-3 bg-gray-100 rounded w-3/4" />
      </div>
    ))}
  </div>
);

// ==========================================
// 📱 2. 主 App 核心佈局組裝
// ==========================================
const App = () => {
  const [searchQuery, setSearchQuery] = useState("Modern dashboard");
  const [exploitationResults, setExploitationResults] = useState([]);
  const [aspirationResults, setAspirationResults] = useState([]);
  const [objectives, setObjectives] = useState(null); 
  const [weights, setWeights] = useState(null); 
  const [loading, setLoading] = useState(false);
  const [previewItem, setPreviewItem] = useState(null);
  const [isReranking, setIsReranking] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
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
        setObjectives({ ...data.objectives });
        setWeights({ ...data.weights });
      }
    } catch (error) {
      console.error("❌ Search 請求失敗:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRerankAndOptimize = async (clickedFile, mode) => {
    if (!objectives || exploitationResults.length === 0) return;
    setIsReranking(true); 
    setPreviewItem(null); 
    try {
      const combined = [...exploitationResults, ...aspirationResults];
      const uniqueResults = Array.from(new Map(combined.map(item => [item.file, item])).values());

      const response = await fetch(`${API_BASE_URL}/rerank`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: searchQuery,
          current_objectives: JSON.stringify(objectives), 
          clicked_file: clickedFile,
          current_results: uniqueResults,
          mode: mode 
        })
      });
      const data = await response.json();
      if (data.status === "success") {
        setExploitationResults(data.exploitation_results || []);
        setAspirationResults(data.aspiration_results || []);
        setObjectives({ ...data.objectives }); 
        setWeights({ ...data.weights });       
      }
    } catch (error) {
      console.error("❌ Rerank 請求失敗:", error);
    } finally {
      setIsReranking(false); 
    }
  };

  // ✅ 修正後的標準寫法：將初始加載異步隔離，徹底消除 Cascading Renders 警告
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
          setObjectives({ ...data.objectives });
          setWeights({ ...data.weights }); 
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
    if (objectives.f2_Function_Target) tags.push({ text: objectives.f2_Function_Target });
    if (objectives.f3_Composition_Target?.Mandatory) objectives.f3_Composition_Target.Mandatory.slice(0, 4).forEach(el => tags.push({ text: `＋ ${el}` }));
    if (objectives.f4_Structure_Target?.Layout_Expect) tags.push({ text: `📐 ${objectives.f4_Structure_Target.Layout_Expect}` });
    return tags;
  };

  return (
    <div className="min-h-screen bg-white text-gray-900">
      
      {/* 🌟 核心更新：雙行緊湊型置頂 Navbar (白色背景 bg-white/95) */}
      <header className="fixed top-0 left-0 right-0 z-50 w-full border-b border-zinc-200 bg-white/95 backdrop-blur-md px-8 py-2.5 shadow-sm flex flex-col gap-2">
        
        {/* 第一行：Logo ＋ 搜尋框 ──（靠左對齊展開） ｜ 權重面板 ──（靠右對齊） */}
        <div className="max-w-[1600px] w-full mx-auto flex items-center justify-between gap-8">
          
          {/* 左側：補回 Logo + 精簡搜尋框 */}
          <div className="flex items-center gap-6 flex-1 max-w-xl shrink-0">
            <h1 className=" font-black tracking-tighter text-black select-none shrink-0">INSPIRA</h1>
            <div className="relative w-full">
              <input 
                type="text" 
                value={searchQuery} 
                onChange={(e) => setSearchQuery(e.target.value)} 
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()} 
                
                className="w-full bg-transparent border-0 border-b border-zinc-300 rounded-none px-1 py-1.5 pr-10 text-base font-bold text-zinc-900 focus:outline-none focus:border-black focus:ring-0 transition-all placeholder:text-zinc-400"
                placeholder="輸入搜尋意圖描述..."
              />
              <span onClick={handleSearch} className="absolute right-3 top-1/2 -translate-y-1/2 material-icons text-zinc-400 hover:text-black transition-colors text-lg cursor-pointer select-none">search</span>
            </div>
          </div>

          {/* 右側：純粹橫向四維權重 Bar 控制條 */}
          <div className="hidden md:block">
            <ExplanationPanel weights={weights} />
          </div>
          
        </div>

        {/* 🌟 核心更新：獨立出來的「第二行」多目標 Tag 牆 ── 完整舒展在下方，不與搜尋和 Bar 搶空間 */}
        {extractTags().length > 0 && (
          <div className="max-w-[1600px] w-full mx-auto border-t border-zinc-100/80 pt-2">
            <div className={`flex flex-wrap gap-2 items-center transition-all duration-300 ${isReranking ? 'opacity-30 blur-[1px]' : ''}`}>
              <span className="text-[10px] font-mono text-zinc-400 font-bold uppercase tracking-wider select-none mr-1">ADIR Objectives:</span>
              {extractTags().map((tag, index) => (
                <span key={index} className="bg-zinc-50 border border-zinc-200 text-[10px] px-3 py-0.5 rounded-full text-zinc-600 font-semibold shadow-sm select-none">
                  {tag.text}
                </span>
              ))}
            </div>
          </div>
        )}
      </header>

      {/* 主內容區域：因為多了一行 Tag 牆，所以調整安全頂部緩衝高（pt-[110px]）防止卡片被遮擋 */}
      <main className="max-w-[1600px] mx-auto px-8 pt-[115px] pb-12 mt-15">
        
        {/* 📊 網格一 */}
        <section className="mb-12">
          <div className="flex items-center gap-2 mb-4">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-500"></span>
            <h2 className="text-sm font-bold text-gray-800">符合多目標優化結果 (Exploitation Feed)</h2>
          </div>
          {loading || isReranking ? <SkeletonGrid /> : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
              {exploitationResults.map((item, idx) => <InspirationCard key={idx} {...item} onPreviewClick={() => setPreviewItem(item)} />)}
            </div>
          )}
        </section>

        {/* 📊 網格二 */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
            <h2 className="text-sm font-bold text-gray-800">探索純結構結果 (Aspiration Feed)</h2>
          </div>
          <div className="text-[10px] font-mono text-emerald-600 font-bold -mt-3 mb-4 tracking-wide">
            已解耦美學風格 · 純粹拓撲佈局與結構空間對齊 (與上方網格 100% 互斥去重)
          </div>
          {loading || isReranking ? <SkeletonGrid /> : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
              {aspirationResults.map((item, idx) => <InspirationCard key={idx} {...item} isAspiration={true} onPreviewClick={() => setPreviewItem(item)} />)}
            </div>
          )}
        </section>
      </main>

      {/* 大圖彈窗 */}
      {previewItem && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={() => setPreviewItem(null)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full flex flex-col md:flex-row overflow-hidden max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
            <div className="md:w-2/3 bg-zinc-950 p-4 flex items-center justify-center">
              <img src={previewItem.image_url} alt="preview" className="max-w-full max-h-full object-contain" />
            </div>
            <div className="md:w-1/3 p-6 flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-bold mb-2 break-all">{previewItem.file}</h3>
                <div className="text-sm font-mono text-blue-600 font-bold mb-6">Score: ★ {previewItem.score}</div>
              </div>
              <div className="space-y-3">
                <button onClick={() => handleRerankAndOptimize(previewItem.file, "function")} className="w-full py-3 bg-zinc-100 hover:bg-zinc-200 text-zinc-900 rounded-xl text-xs font-bold transition-all">📱 依功能洗牌</button>
                <button onClick={() => handleRerankAndOptimize(previewItem.file, "layout")} className="w-full py-3 bg-black hover:bg-zinc-800 text-white rounded-xl text-xs font-bold transition-all shadow-lg">📐 依結構探索</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;