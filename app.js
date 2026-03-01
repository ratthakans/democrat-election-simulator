
const TARGET_PARTY = 'ประชาธิปัตย์';

const fmt = (n) => n.toLocaleString('th-TH');

const argmaxVote = (votesMap) => {
    return Object.entries(votesMap).reduce(
        (best, [party, votes]) => votes > best.votes ? { party, votes } : best,
        { party: '', votes: -Infinity }
    );
};

const computeResults = (districts, transferConfig) => {
    let seatCount = 0, flipCount = 0;
    const rows = districts.map(({ district, party_votes: originalVotes }) => {
        const newVotes = { ...originalVotes, [TARGET_PARTY]: originalVotes[TARGET_PARTY] || 0 };
        Object.entries(transferConfig).forEach(([party, pct]) => {
            const delta = Math.round((originalVotes[party] || 0) * pct);
            newVotes[party] = (newVotes[party] || 0) - delta;
            newVotes[TARGET_PARTY] += delta;
        });
        const { party: originalWinner } = argmaxVote(originalVotes);
        const { party: newWinner, votes: newWinnerVotes } = argmaxVote(newVotes);
        const status = newWinner === TARGET_PARTY ? 'win' : 'lose';
        if (status === 'win') {
            seatCount++;
            if (originalWinner !== TARGET_PARTY) flipCount++;
        }
        const topCompetitor = Math.max(...Object.entries(newVotes)
            .filter(([p]) => p !== TARGET_PARTY)
            .map(([, v]) => v));
        return {
            district,
            originalWinner,
            baseDem: originalVotes[TARGET_PARTY] || 0,
            newDem: newVotes[TARGET_PARTY],
            newWinner,
            status,
            votesNeeded: status === 'lose' ? topCompetitor - newVotes[TARGET_PARTY] + 1 : null,
            margin: newVotes[TARGET_PARTY] - (status === 'win' ? topCompetitor : newWinnerVotes),
            isClose: Math.abs(newVotes[TARGET_PARTY] - topCompetitor) < 5000
        };
    });
    rows.sort((a, b) => {
        if (a.status !== b.status) return a.status === 'win' ? -1 : 1;
        return a.status === 'win' ? a.district - b.district : (a.votesNeeded || 0) - (b.votesNeeded || 0);
    });
    return { seatCount, flipCount, rows };
};

// Global State Management (Minimalist version of Zustand)
const useStore = () => {
    const [state, setState] = React.useState({
        theme: localStorage.getItem('theme') || 'light',
        currentView: 'dashboard',
        selectedProvince: null,
        transferConfig: {},
        scenarios: JSON.parse(localStorage.getItem('scenarios') || '[]')
    });

    const updateState = (updates) => {
        setState(prev => {
            const newState = { ...prev, ...updates };
            if (updates.theme) localStorage.setItem('theme', updates.theme);
            if (updates.scenarios) localStorage.setItem('scenarios', JSON.stringify(updates.scenarios));
            return newState;
        });
    };

    return {
        ...state,
        setTheme: (theme) => updateState({ theme }),
        setView: (view) => updateState({ currentView: view }),
        setProvince: (province) => updateState({ selectedProvince: province }),
        updateTransfer: (party, value) => updateState({
            transferConfig: { ...state.transferConfig, [party]: value }
        }),
        resetTransfer: () => updateState({ transferConfig: {} }),
        saveScenario: (name, notes) => {
            if (!state.selectedProvince) return;
            const scenario = {
                id: Date.now().toString(36),
                name,
                notes,
                province: state.selectedProvince,
                transferConfig: { ...state.transferConfig },
                createdAt: new Date().toLocaleString('th-TH')
            };
            updateState({ scenarios: [...state.scenarios, scenario] });
        },
        loadScenario: (id) => {
            const s = state.scenarios.find(x => x.id === id);
            if (s) updateState({
                selectedProvince: s.province,
                transferConfig: s.transferConfig,
                currentView: 'simulation'
            });
        },
        deleteScenario: (id) => updateState({
            scenarios: state.scenarios.filter(x => x.id !== id)
        })
    };
};

const Icons = {
    Dashboard: () => <i data-lucide="layout-dashboard" className="w-5 h-5"></i>,
    Simulation: () => <i data-lucide="sparkles" className="w-5 h-5"></i>,
    Scenarios: () => <i data-lucide="bookmark-check" className="w-5 h-5"></i>,
    Analytics: () => <i data-lucide="trending-up" className="w-5 h-5"></i>,
    MonteCarlo: () => <i data-lucide="dices" className="w-5 h-5"></i>,
    Save: () => <i data-lucide="save" className="w-4 h-4"></i>,
    Refresh: () => <i data-lucide="refresh-cw" className="w-4 h-4"></i>,
    Search: () => <i data-lucide="search" className="w-4 h-4"></i>,
    Trophy: () => <i data-lucide="trophy" className="w-8 h-8"></i>,
    Alert: () => <i data-lucide="alert-circle" className="w-8 h-8"></i>,
    Map: () => <i data-lucide="map" className="w-4 h-4"></i>,
    Users: () => <i data-lucide="users" className="w-6 h-6"></i>,
    Zap: () => <i data-lucide="zap" className="w-6 h-6"></i>,
    Dollar: () => <i data-lucide="dollar-sign" className="w-6 h-6"></i>,
    Play: () => <i data-lucide="play-circle" className="w-5 h-5"></i>,
    Moon: () => <i data-lucide="moon" className="w-5 h-5"></i>,
    Sun: () => <i data-lucide="sun" className="w-5 h-5"></i>,
    Trash: () => <i data-lucide="trash-2" className="w-4 h-4"></i>,
    PlaySmall: () => <i data-lucide="play" className="w-3 h-3"></i>,
    Calendar: () => <i data-lucide="calendar" className="w-3 h-3"></i>,
};

function StatCard({ label, value, change, icon: Icon, variant = 'primary' }) {
    const variants = {
        primary: 'text-sky-700 bg-sky-50 border-sky-100 dark:text-sky-300 dark:bg-sky-900/30 dark:border-sky-800',
        success: 'text-emerald-700 bg-emerald-50 border-emerald-100 dark:text-emerald-300 dark:bg-emerald-900/30 dark:border-emerald-800',
        warning: 'text-amber-700 bg-amber-50 border-amber-100 dark:text-amber-300 dark:bg-amber-900/30 dark:border-amber-800',
        info: 'text-indigo-700 bg-indigo-50 border-indigo-100 dark:text-indigo-300 dark:bg-indigo-900/30 dark:border-indigo-800',
    };
    return (
        <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-4">
                <div className={`p-2.5 rounded-lg border ${variants[variant]}`}>
                    <Icon />
                </div>
                {change && <span className="text-xs font-bold px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-md text-slate-500">{change}</span>}
            </div>
            <div>
                <p className="text-sm font-bold text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-tight">{label}</p>
                <p className="text-4xl font-black text-slate-900 dark:text-white leading-none">{value}</p>
            </div>
        </div>
    );
}

function BarChartComponent({ data, options }) {
    const canvasRef = React.useRef(null);
    const chartRef = React.useRef(null);

    React.useEffect(() => {
        if (chartRef.current) chartRef.current.destroy();
        const ctx = canvasRef.current.getContext('2d');
        chartRef.current = new Chart(ctx, {
            type: 'bar',
            data: data,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    y: { 
                        beginAtZero: true,
                        grid: { color: 'rgba(0,0,0,0.05)' },
                        ticks: { font: { weight: 'bold' } }
                    },
                    x: { 
                        grid: { display: false },
                        ticks: { font: { weight: 'bold' } }
                    }
                },
                ...options
            }
        });
        return () => { if (chartRef.current) chartRef.current.destroy(); };
    }, [data, options]);

    return <canvas ref={canvasRef} />;
}

function DoughnutChartComponent({ data }) {
    const canvasRef = React.useRef(null);
    const chartRef = React.useRef(null);

    React.useEffect(() => {
        if (chartRef.current) chartRef.current.destroy();
        const ctx = canvasRef.current.getContext('2d');
        chartRef.current = new Chart(ctx, {
            type: 'doughnut',
            data: data,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '70%',
                plugins: { 
                    legend: { 
                        position: 'bottom', 
                        labels: { 
                            font: { size: 12, weight: 'bold' },
                            padding: 20,
                            usePointStyle: true
                        } 
                    } 
                }
            }
        });
        return () => { if (chartRef.current) chartRef.current.destroy(); };
    }, [data]);

    return <canvas ref={canvasRef} />;
}

function DashboardView({ store }) {
    const stats = React.useMemo(() => {
        let democratSeats = 0;
        let flipCount = 0;
        const partySeats = {};
        let totalDistricts = 0;

        Object.values(window.electionData).forEach(districts => {
            const res = computeResults(districts, store.transferConfig);
            democratSeats += res.seatCount;
            flipCount += res.flipCount;
            totalDistricts += districts.length;
            res.rows.forEach(row => {
                partySeats[row.newWinner] = (partySeats[row.newWinner] || 0) + 1;
            });
        });

        const sortedParties = Object.entries(partySeats).sort(([, a], [, b]) => b - a).slice(0, 5);
        const democratRank = Object.keys(partySeats).sort((a,b) => partySeats[b] - partySeats[a]).indexOf(TARGET_PARTY) + 1;

        return {
            democratSeats, flipCount, totalDistricts, 
            democratRank: democratRank > 0 ? democratRank : '-',
            chartLabels: sortedParties.map(([p]) => p),
            chartData: sortedParties.map(([, s]) => s)
        };
    }, [store.transferConfig]);

    const chartConfig = {
        labels: stats.chartLabels,
        datasets: [{
            data: stats.chartData,
            backgroundColor: ['#0284c7', '#ef4444', '#f59e0b', '#10b981', '#6366f1'],
            borderRadius: 6,
            barThickness: 40
        }]
    };

    return (
        <div className="space-y-8 animate-appear">
            <div>
                <h2 className="text-4xl font-black text-slate-900 dark:text-white mb-2">สรุปผลการวิเคราะห์</h2>
                <p className="text-lg text-slate-600 dark:text-slate-400 font-medium">ภาพรวมที่นั่งและสถิติคํานวณจาก {stats.totalDistricts} เขตเลือกตั้ง</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard label="ที่นั่ง ปชป." value={stats.democratSeats} change="ที่นั่งทั้งหมด" icon={Icons.Users} variant="primary" />
                <StatCard label="อันดับพรรค" value={`${stats.democratRank}${stats.democratRank === 1 ? 'st' : 'th'}`} change="จากทุกพรรค" icon={Icons.Trophy} variant="success" />
                <StatCard label="เขตที่พลิกชนะ" value={stats.flipCount} change="เขตเปลี่ยนขั้ว" icon={Icons.Zap} variant="warning" />
                <StatCard label="คาดการณ์ (ล้าน)" value={fmt(stats.democratSeats * 2.5)} change="งบประมาณคร่าวๆ" icon={Icons.Dollar} variant="info" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white dark:bg-slate-900 rounded-xl p-8 border border-slate-200 dark:border-slate-800">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-8 border-l-4 border-sky-500 pl-4">จํานวนที่นั่ง 5 อันดับแรก</h3>
                    <div className="h-80"><BarChartComponent data={chartConfig} /></div>
                </div>
                <div className="bg-white dark:bg-slate-900 rounded-xl p-8 border border-slate-200 dark:border-slate-800">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-8 border-l-4 border-sky-500 pl-4">สัดส่วนในสภาจำลอง</h3>
                    <div className="h-80"><DoughnutChartComponent data={chartConfig} /></div>
                </div>
            </div>
        </div>
    );
}

function SimulationView({ store }) {
    const [filter, setFilter] = React.useState('all');
    const [searchTerm, setSearchTerm] = React.useState('');
    const [showSaveModal, setShowSaveModal] = React.useState(false);
    const [scenarioName, setScenarioName] = React.useState('');

    const provinces = React.useMemo(() => Object.keys(window.electionData).sort((a, b) => a.localeCompare(b, 'th')), []);
    const availableParties = React.useMemo(() => {
        if (!store.selectedProvince) return [];
        const parties = new Set();
        window.electionData[store.selectedProvince]?.forEach(d => {
            Object.keys(d.party_votes).forEach(p => { if (p !== TARGET_PARTY) parties.add(p); });
        });
        return Array.from(parties).sort((a, b) => a.localeCompare(b, 'th'));
    }, [store.selectedProvince]);

    const results = React.useMemo(() => {
        if (!store.selectedProvince) return null;
        return computeResults(window.electionData[store.selectedProvince] || [], store.transferConfig);
    }, [store.selectedProvince, store.transferConfig]);

    const filteredRows = React.useMemo(() => {
        if (!results) return [];
        return results.rows.filter(r => {
            const mFilter = filter === 'all' ? true : filter === 'win' ? r.status === 'win' : filter === 'lose' ? r.status === 'lose' : r.isClose;
            const mSearch = searchTerm ? r.district.toString().includes(searchTerm) : true;
            return mFilter && mSearch;
        });
    }, [results, filter, searchTerm]);

    const handleSave = () => {
        store.saveScenario(scenarioName, `บันทึกเมื่อ ${new Date().toLocaleString('th-TH')}`);
        setShowSaveModal(false);
        setScenarioName('');
    };

    return (
        <div className="space-y-8 animate-appear">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b-2 border-slate-200 dark:border-slate-800 pb-8">
                <div>
                    <h2 className="text-4xl font-black text-slate-900 dark:text-white">Workspace จำลองผล</h2>
                    <p className="text-lg text-slate-600 dark:text-slate-400 font-medium">ปรับแต่งข้อมูลและดูการคำนวณแบบ Real-time</p>
                </div>
                <button onClick={() => setShowSaveModal(true)} disabled={!store.selectedProvince} className="bg-sky-600 hover:bg-sky-700 text-white px-8 py-4 rounded-xl font-black flex items-center gap-3 transition-all disabled:opacity-30">
                    <Icons.Save /> บันทึกแผนงานนี้
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                <aside className="lg:col-span-4 space-y-8">
                    <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border-2 border-slate-200 dark:border-slate-800">
                        <label className="block text-sm font-black text-slate-900 dark:text-white uppercase mb-4">1. เลือกจังหวัดเป้าหมาย</label>
                        <select value={store.selectedProvince || ''} onChange={(e) => { store.setProvince(e.target.value || null); store.resetTransfer(); }} className="input-clean font-bold">
                            <option value="">-- คลิกเพื่อเลือกจังหวัด --</option>
                            {provinces.map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                    </div>

                    {store.selectedProvince && (
                        <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border-2 border-slate-200 dark:border-slate-800 space-y-6">
                            <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-800 -mx-6 -mt-6 p-6 rounded-t-xl border-b border-slate-200 dark:border-slate-800">
                                <h3 className="text-sm font-black text-slate-900 dark:text-white">2. ปรับตัวแปรการโอนคะแนน</h3>
                                <button onClick={store.resetTransfer} className="text-xs font-bold text-red-600 hover:bg-red-50 px-2 py-1 rounded transition-colors">ล้างค่าใหม่</button>
                            </div>
                            <div className="space-y-8 max-h-[500px] overflow-y-auto pr-2">
                                {availableParties.map(p => (
                                    <div key={p} className="space-y-3">
                                        <div className="flex justify-between items-end">
                                            <span className="text-base font-bold text-slate-700 dark:text-slate-300">{p}</span>
                                            <span className="text-xl font-black text-sky-600">{Math.round((store.transferConfig[p] || 0) * 100)}%</span>
                                        </div>
                                        <input type="range" min="0" max="100" value={Math.round((store.transferConfig[p] || 0) * 100)} onChange={(e) => store.updateTransfer(p, e.target.value / 100)} className="w-full h-3 bg-slate-200 dark:bg-slate-800 rounded-full appearance-none cursor-pointer accent-sky-600" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </aside>

                <div className="lg:col-span-8 space-y-8">
                    {store.selectedProvince && results ? (
                        <>
                            <div className="grid grid-cols-2 gap-8">
                                <div className="bg-sky-600 text-white rounded-2xl p-8 shadow-xl shadow-sky-500/20">
                                    <p className="text-sm font-black uppercase opacity-80 mb-2">จํานวนที่นั่งรวม</p>
                                    <p className="text-6xl font-black">{results.seatCount}</p>
                                </div>
                                <div className="bg-emerald-600 text-white rounded-2xl p-8 shadow-xl shadow-emerald-500/20">
                                    <p className="text-sm font-black uppercase opacity-80 mb-2">เขตที่พลิกกลับมาได้</p>
                                    <p className="text-6xl font-black">{results.flipCount}</p>
                                </div>
                            </div>

                            <div className="bg-white dark:bg-slate-900 rounded-xl border-2 border-slate-200 dark:border-slate-800 overflow-hidden shadow-md">
                                <div className="bg-slate-50 dark:bg-slate-800 p-6 flex flex-col md:flex-row justify-between gap-6 border-b border-slate-200 dark:border-slate-800">
                                    <div className="flex bg-white dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-800 shadow-inner">
                                        {['all', 'win', 'lose', 'close'].map(f => (
                                            <button key={f} onClick={() => setFilter(f)} className={`px-5 py-2.5 rounded-lg text-sm font-black transition-all ${filter === f ? 'bg-sky-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}>
                                                {f === 'all' ? 'ทุกเขต' : f === 'win' ? 'ชนะ' : f === 'lose' ? 'ยังไม่ได้' : 'สูสี'}
                                            </button>
                                        ))}
                                    </div>
                                    <div className="relative">
                                        <i data-lucide="search" className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400"></i>
                                        <input type="text" placeholder="พิมพ์เลขเขต..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-12 pr-6 py-3 text-sm font-bold w-full md:w-56 focus:border-sky-500 outline-none" />
                                    </div>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white uppercase text-xs font-black border-b border-slate-200 dark:border-slate-800"><th className="p-6">เขตเลือกตั้ง</th><th className="p-6">ผู้ชนะคนเดิม</th><th className="p-6 text-right">คะแนนใหม่ ปชป.</th><th className="p-6 text-center">ผลลัพธ์</th></tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                            {filteredRows.map(r => (
                                                <tr key={r.district} className="hover:bg-sky-50/50 dark:hover:bg-sky-900/10 transition-colors">
                                                    <td className="p-6 font-black text-lg">เขตที่ {r.district}</td>
                                                    <td className="p-6 text-slate-600 dark:text-slate-400 font-bold">{r.originalWinner}</td>
                                                    <td className="p-6 text-right font-black text-xl text-sky-600">{fmt(r.newDem)}</td>
                                                    <td className="p-6 text-center">
                                                        {r.status === 'win' ? 
                                                            <span className="bg-sky-600 text-white px-5 py-2 rounded-lg font-black text-sm shadow-md shadow-sky-500/20">WINNER</span> : 
                                                            <span className="bg-slate-200 dark:bg-slate-800 text-slate-500 px-4 py-2 rounded-lg font-black text-xs">RETRY</span>
                                                        }
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="bg-slate-100 dark:bg-slate-900/50 rounded-2xl h-[600px] border-4 border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center text-center p-12">
                            <div className="w-24 h-24 bg-white dark:bg-slate-800 rounded-3xl flex items-center justify-center shadow-xl mb-10 text-sky-600"><Icons.Map /></div>
                            <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-4 italic">"เครื่องมือพร้อมสำหรับการวิเคราะห์"</h3>
                            <p className="text-lg text-slate-500 max-w-sm font-bold">กรุณาเลือกจังหวัดในแถบสีขาวด้านซ้ายมือ เพื่อโหลดข้อมูลเขตพื้นที่และเริ่มต้นการจำลอง</p>
                        </div>
                    )}
                </div>
            </div>

            {showSaveModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="glass bg-white dark:bg-gray-900 p-6 rounded-2xl w-full max-w-md shadow-2xl">
                        <h3 className="text-xl font-bold mb-4">บันทึกสถานการณ์</h3>
                        <input type="text" placeholder="ตั้งชื่อสถานการณ์..." value={scenarioName} onChange={(e) => setScenarioName(e.target.value)} className="w-full glass-input mb-4" />
                        <div className="flex justify-end gap-2">
                            <button onClick={() => setShowSaveModal(false)} className="px-4 py-2">ยกเลิก</button>
                            <button onClick={handleSave} className="bg-blue-600 text-white px-4 py-2 rounded-xl">บันทึก</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function ScenariosView({ store }) {
    return (
        <div className="space-y-10 animate-appear">
            <div>
                <h2 className="text-4xl font-black text-slate-900 dark:text-white mb-2">กลยุทธ์ที่บันทึกไว้</h2>
                <p className="text-lg text-slate-600 dark:text-slate-400 font-medium">จัดการและเรียกคืนแผนการจำลองที่คุณเคยวิเคราะห์ไว้</p>
            </div>
            {store.scenarios.length === 0 ? (
                <div className="bg-slate-100 dark:bg-slate-900/50 rounded-2xl h-64 border-2 border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center text-slate-400">
                    <Icons.Scenarios /> <p className="mt-4 font-black text-lg italic uppercase">No Saved Scenarios</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {store.scenarios.map(s => (
                        <div key={s.id} className="bg-white dark:bg-slate-900 rounded-2xl p-8 border-2 border-slate-200 dark:border-slate-800 shadow-lg hover:border-sky-500 transition-all">
                            <div className="flex justify-between items-start mb-6">
                                <h3 className="font-black text-2xl text-slate-900 dark:text-white leading-tight">{s.name}</h3>
                                <span className="bg-sky-600 text-white px-3 py-1 rounded-lg text-xs font-black uppercase tracking-widest leading-none">{s.province}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-slate-500 font-bold mb-8 px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl"><Icons.Calendar /> {s.createdAt}</div>
                            <div className="flex justify-between items-center pt-6 border-t-2 border-slate-50 dark:border-slate-800">
                                <button onClick={() => store.deleteScenario(s.id)} className="p-3 text-slate-400 hover:text-red-600 transition-colors"><Icons.Trash /></button>
                                <button onClick={() => store.loadScenario(s.id)} className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-3 rounded-xl flex items-center gap-2 text-sm font-black shadow-md hover:scale-105 active:scale-95 transition-all"><Icons.PlaySmall /> เรียกใช้ข้อมูล</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

function MonteCarloView({ store }) {
    const [iters, setIters] = React.useState(1000);
    const [std, setStd] = React.useState(3);
    const [running, setRunning] = React.useState(false);
    const [prog, setProg] = React.useState(0);
    const [res, setRes] = React.useState(null);

    const run = () => {
        if (!store.selectedProvince) return;
        setRunning(true); setProg(0); setRes(null);
        const data = [];
        const districts = window.electionData[store.selectedProvince] || [];
        
        let i = 0;
        const batch = () => {
            for (let j=0; j<200 && i<iters; j++) {
                const config = {};
                Object.entries(store.transferConfig).forEach(([p,v]) => {
                    const noise = (Math.random() - 0.5) * 2 * (std/100);
                    config[p] = Math.max(0, Math.min(1, v + noise));
                });
                data.push(computeResults(districts, config).seatCount);
                i++;
            }
            setProg(Math.round((i/iters)*100));
            if (i < iters) setTimeout(batch, 0);
            else {
                data.sort((a,b) => a-b);
                setRes({
                    mean: data.reduce((a,b) => a+b, 0)/iters,
                    median: data[Math.floor(iters/2)],
                    ci: `${data[Math.floor(iters*0.025)]} - ${data[Math.floor(iters*0.975)]}`,
                    labels: Array.from({length: Math.max(...data) + 1}, (_, k) => k),
                    hist: new Array(Math.max(...data) + 1).fill(0).map((_, k) => data.filter(x => x === k).length)
                });
                setRunning(false);
            }
        };
        batch();
    };

    return (
        <div className="space-y-10 animate-appear">
             <div>
                <h2 className="text-4xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">Monte Carlo Simulation</h2>
                <p className="text-lg text-slate-600 dark:text-slate-400 font-medium">จำลองความเสี่ยงทางสถิติด้วยการสุ่มตัวแปร {fmt(iters)} รอบ</p>
             </div>
             <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                <div className="lg:col-span-4 bg-white dark:bg-slate-900 rounded-2xl p-8 border-2 border-slate-200 dark:border-slate-800 flex flex-col gap-10">
                    <h3 className="text-sm font-black uppercase text-sky-600 tracking-widest border-b border-slate-100 dark:border-slate-800 pb-4">Simulation Settings</h3>
                    <div className="space-y-6">
                        <div className="flex justify-between items-end"><label className="text-base font-black text-slate-900 dark:text-white">รอบการประมวลผล</label><span className="text-3xl font-black text-sky-600">{fmt(iters)}</span></div>
                        <input type="range" min="100" max="10000" step="500" value={iters} onChange={e => setIters(parseInt(e.target.value))} className="w-full h-3 bg-slate-200 dark:bg-slate-800 rounded-full appearance-none cursor-pointer accent-sky-600" />
                    </div>
                    <div className="space-y-6">
                        <div className="flex justify-between items-end"><label className="text-base font-black text-slate-900 dark:text-white">อัตราความคลาดเคลื่อน</label><span className="text-3xl font-black text-sky-600">±{std}%</span></div>
                        <input type="range" min="1" max="25" step="1" value={std} onChange={e => setStd(parseInt(e.target.value))} className="w-full h-3 bg-slate-200 dark:bg-slate-800 rounded-full appearance-none cursor-pointer accent-sky-600" />
                    </div>
                    <button onClick={run} disabled={running || !store.selectedProvince} className="w-full bg-sky-600 hover:bg-sky-700 text-white font-black py-6 rounded-2xl shadow-xl shadow-sky-500/20 active:scale-95 transition-all text-xl disabled:opacity-30">
                        {running ? <span className="flex items-center justify-center gap-4">กำลังคำนวณ {prog}%...</span> : 'เริ่มการจำลองผล'}
                    </button>
                </div>
                <div className="lg:col-span-8 space-y-8">
                    {res ? (
                        <div className="space-y-8">
                            <div className="grid grid-cols-3 gap-6">
                                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border-2 border-slate-100 dark:border-slate-800 text-center"><p className="text-xs font-black text-slate-400 uppercase mb-2">ค่าเฉลี่ยที่นั่ง</p><p className="text-4xl font-black text-slate-900 dark:text-white">{res.mean.toFixed(1)}</p></div>
                                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border-2 border-slate-100 dark:border-slate-800 text-center"><p className="text-xs font-black text-slate-400 uppercase mb-2">ค่ามัธยฐาน</p><p className="text-4xl font-black text-slate-900 dark:text-white">{res.median}</p></div>
                                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border-2 border-sky-500 text-center"><p className="text-xs font-black text-sky-600 uppercase mb-2">ช่วงเชื่อมั่น 95%</p><p className="text-4xl font-black text-sky-600">{res.ci}</p></div>
                            </div>
                            <div className="bg-white dark:bg-slate-900 rounded-xl p-8 border-2 border-slate-200 dark:border-slate-800">
                                <h3 className="text-lg font-black text-slate-900 dark:text-white mb-8">ความหนาแน่นของความน่าจะเป็น (Probability)</h3>
                                <div className="h-96"><BarChartComponent data={{ labels: res.labels, datasets: [{ data: res.hist, backgroundColor: '#0284c7', borderRadius: 6 }] }} /></div>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-slate-50 dark:bg-slate-900/40 rounded-3xl h-full flex flex-col items-center justify-center text-slate-400 opacity-60 text-center p-12 border-4 border-dashed border-slate-200 dark:border-slate-800">
                            <div className="w-20 h-20 bg-white dark:bg-slate-800 rounded-3xl flex items-center justify-center shadow-lg mb-8 text-sky-600"><Icons.MonteCarlo /></div>
                            <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-4 italic">"Engine Ready"</h3>
                            <p className="max-w-xs text-lg font-bold">กรุณาตั้งค่าตัวแปรด้านข้างและกดปุ่มเริ่ม เพื่อประมวลผลทางสถิติขั้นสูง</p>
                        </div>
                    )}
                </div>
             </div>
        </div>
    );
}

function AnalyticsView() {
    return (
        <div className="space-y-10 animate-appear">
            <div>
                <h2 className="text-4xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">Advanced Analytics</h2>
                <p className="text-lg text-slate-600 dark:text-slate-400 font-medium">บทวิเคราะห์จากปัญญาประดิษฐ์และแนวโน้มการเติบโตระดับยุทธศาสตร์</p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                <div className="bg-white dark:bg-slate-900 rounded-xl p-8 border-2 border-slate-200 dark:border-slate-800">
                    <h3 className="text-xl font-black text-slate-900 dark:text-white mb-8 border-l-8 border-sky-600 pl-4 uppercase">Popularity Growth</h3>
                    <div className="h-80"><BarChartComponent data={{ labels: ['Election Day', 'M+1', 'M+2', 'M+3', 'Target'], datasets: [{ data: [11, 15, 14, 20, 29], backgroundColor: '#0284c7', borderRadius: 10, barThickness: 50 }] }} /></div>
                </div>
                <div className="bg-white dark:bg-slate-900 rounded-xl p-8 border-2 border-slate-200 dark:border-slate-800">
                    <h3 className="text-xl font-black text-slate-900 dark:text-white mb-8 border-l-8 border-emerald-600 pl-4 uppercase">Strategic Districts</h3>
                    <div className="space-y-4">
                        {[
                            { p: 'กรุงเทพมหานคร Area A', r: 'HIGH PRIORITY', c: 'text-white bg-sky-600' },
                            { p: 'กระบี่ District 1', r: 'STABLE CORE', c: 'text-white bg-emerald-600' },
                            { p: 'ภูเก็ต District 2', r: 'SWING ZONE', c: 'text-white bg-amber-600' },
                            { p: 'ตรัง Area 3', r: 'STABLE CORE', c: 'text-white bg-emerald-600' },
                            { p: 'พังงา District 1', r: 'HIGH PRIORITY', c: 'text-white bg-sky-600' }
                        ].map(item => (
                            <div key={item.p} className="flex items-center justify-between p-5 rounded-2xl border-2 border-slate-50 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                                <span className="text-xl font-black">{item.p}</span>
                                <span className={`px-4 py-2 rounded-xl text-xs font-black shadow-sm ${item.c}`}>{item.r}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

function App() {
    const store = useStore();
    
    React.useEffect(() => {
        document.documentElement.classList.toggle('dark', store.theme === 'dark');
        lucide.createIcons();
    }, [store.theme, store.currentView]);

    const renderView = () => {
        switch(store.currentView) {
            case 'simulation': return <SimulationView store={store} />;
            case 'scenarios': return <ScenariosView store={store} />;
            case 'analytics': return <AnalyticsView />;
            case 'monte-carlo': return <MonteCarloView store={store} />;
            default: return <DashboardView store={store} />;
        }
    };

    const nav = [
        { id: 'dashboard', label: 'ภาพรวมระบบ', icon: Icons.Dashboard },
        { id: 'simulation', label: 'พื้นที่จำลอง', icon: Icons.Simulation },
        { id: 'scenarios', label: 'ฐานข้อมูลแผน', icon: Icons.Scenarios },
        { id: 'analytics', label: 'วิเคราะห์เชิงลึก', icon: Icons.Analytics },
        { id: 'monte-carlo', label: 'จำลองสถิติ', icon: Icons.MonteCarlo },
    ];

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
            <header className="sticky top-0 z-50 p-6 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="max-w-[1700px] mx-auto flex items-center justify-between px-8">
                    <div className="flex items-center gap-6">
                        <img src="https://uploads.democrat.or.th/uploads/2025/12/main-logo_1.svg" className="h-14 w-auto shadow-sm" alt="Logo" />
                        <div>
                            <h1 className="text-3xl font-black tracking-tighter text-slate-900 dark:text-white leading-none">ELECTION AI-ANALYTICS</h1>
                            <p className="text-xs font-black text-sky-600 uppercase tracking-widest mt-2">Professional Simulation Suite v2.1</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-6">
                        <button onClick={() => store.setTheme(store.theme === 'light' ? 'dark' : 'light')} className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-sky-100 dark:hover:bg-sky-900/30 transition-all text-slate-600 dark:text-slate-300">
                            {store.theme === 'light' ? <Icons.Moon /> : <Icons.Sun />}
                        </button>
                    </div>
                </div>
            </header>

            <div className="flex max-w-[1750px] mx-auto w-full flex-1 p-10 gap-10">
                <aside className="sticky top-40 h-[calc(100vh-12rem)] w-72 hidden xl:flex flex-col gap-3 overflow-y-auto">
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 px-4 bg-slate-100 dark:bg-slate-900 py-2 rounded-lg">Main Navigation</p>
                    {nav.map(item => (
                        <button key={item.id} onClick={() => store.setView(item.id)} className={`sidebar-item ${store.currentView === item.id ? 'active' : ''}`}>
                            <item.icon /> <span>{item.label}</span>
                        </button>
                    ))}
                    <div className="mt-auto p-8 rounded-3xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-sky-500 opacity-20 -mr-10 -mt-10 rounded-full blur-3xl" />
                        <p className="text-[10px] font-black uppercase text-sky-400 dark:text-sky-600 mb-2">Build Version</p>
                        <p className="text-xl font-black italic tracking-tighter leading-none">PRODUCTION STABLE</p>
                    </div>
                </aside>
                
                <main className="flex-1 max-w-6xl pb-20">
                    <div className="bg-white dark:bg-slate-900/50 rounded-3xl p-4 sm:p-10 shadow-sm border border-slate-100 dark:border-slate-800">
                        {renderView()}
                    </div>
                </main>
            </div>
        </div>
    );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
