import { useEffect, useMemo, useState } from 'react';
import { ActivitySquare, ClipboardList, FileSearch, Search, Stethoscope, UserRound } from 'lucide-react';
import { backgroundImage, logoImage } from '../lib/assets';
import { MOCK_RESULT_DETAIL, MOCK_RESULT_LIST } from '../lib/mockClinician';

function badgeTone(status: string) {
  if (status === 'reviewed') return 'bg-emerald-400/15 text-emerald-200 border-emerald-300/20';
  if (status === 'flagged') return 'bg-amber-400/15 text-amber-100 border-amber-200/20';
  return 'bg-sky-400/15 text-sky-100 border-sky-200/20';
}

export function ClinicianDashboard() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [results, setResults] = useState<any[]>([]);
  const [stats, setStats] = useState<Record<string, number>>({});
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedResult, setSelectedResult] = useState<any | null>(null);

  useEffect(() => {
    const filtered = MOCK_RESULT_LIST.results.filter((result) => {
      const matchesSearch = search
        ? `${result.first_name} ${result.last_name} ${result.pid} ${result.session_id}`
            .toLowerCase()
            .includes(search.toLowerCase())
        : true;
      const matchesStatus = status === 'all' ? true : result.status === status;
      return matchesSearch && matchesStatus;
    });

    setResults(filtered);
    setStats({
      ...MOCK_RESULT_LIST.stats,
      total: filtered.length,
      pending: filtered.filter((item) => item.status === 'pending').length,
      reviewed: filtered.filter((item) => item.status === 'reviewed').length,
      flagged: filtered.filter((item) => item.status === 'flagged').length,
    });
    setSelectedId((current) => {
      if (current && filtered.some((item) => item.session_id === current)) return current;
      return filtered[0]?.session_id ?? null;
    });
  }, [search, status]);

  useEffect(() => {
    setSelectedResult(selectedId ? (MOCK_RESULT_DETAIL[selectedId] ?? null) : null);
  }, [selectedId]);

  const statCards = useMemo(() => ([
    { label: 'Total Sessions', value: stats.total ?? results.length, icon: ClipboardList },
    { label: 'Pending Review', value: stats.pending ?? 0, icon: FileSearch },
    { label: 'Flagged', value: stats.flagged ?? 0, icon: ActivitySquare },
    { label: 'Reviewed', value: stats.reviewed ?? 0, icon: Stethoscope },
  ]), [results.length, stats]);

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      />
      <div className="absolute inset-0 bg-slate-950/75" />

      <div className="relative min-h-screen p-8 text-white">
        <div className="mx-auto max-w-[1600px]">
          <div className="mb-8 flex items-center justify-between rounded-[2rem] border border-white/10 bg-slate-950/45 px-8 py-6 backdrop-blur-sm">
            <div className="flex items-center gap-6">
              <img src={logoImage} alt="Oivio" className="h-14" />
              <div className="h-12 w-px bg-white/20" />
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-cyan-200/70">Clinician Portal</p>
                <h1 className="text-4xl tracking-tight">Spirometry Result Review</h1>
              </div>
            </div>
            <div className="rounded-full border border-white/15 bg-white/8 px-5 py-3 text-lg text-white/75">
              Doctor Workspace
            </div>
          </div>

          <div className="mb-8 grid grid-cols-4 gap-5">
            {statCards.map(({ label, value, icon: Icon }) => (
              <div key={label} className="rounded-[1.75rem] border border-white/10 bg-white/8 p-6 backdrop-blur-sm">
                <div className="flex items-center justify-between">
                  <p className="text-sm uppercase tracking-[0.25em] text-white/45">{label}</p>
                  <Icon className="h-5 w-5 text-white/55" />
                </div>
                <p className="mt-5 text-5xl">{value}</p>
              </div>
            ))}
          </div>

          <div className="mb-6 flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-white/40" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search patient, patient ID, or session ID"
                className="w-full rounded-full border border-white/15 bg-white/8 py-4 pl-14 pr-6 text-xl text-white placeholder:text-white/35"
              />
            </div>
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              className="rounded-full border border-white/15 bg-white/8 px-6 py-4 text-xl text-white"
            >
              <option value="all">All statuses</option>
              <option value="pending">Pending</option>
              <option value="reviewed">Reviewed</option>
              <option value="flagged">Flagged</option>
            </select>
          </div>

          <div className="grid grid-cols-[0.95fr_1.25fr] gap-8">
            <div className="rounded-[2rem] border border-white/10 bg-slate-950/45 p-6 backdrop-blur-sm">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-2xl tracking-tight">Recent Sessions</h2>
                <span className="text-white/50">{results.length} shown</span>
              </div>

              <div className="space-y-3">
                {results.map((result) => (
                  <button
                    key={result.session_id}
                    type="button"
                    onClick={() => setSelectedId(result.session_id)}
                    className={`w-full rounded-[1.5rem] border p-5 text-left transition ${
                      selectedId === result.session_id
                        ? 'border-white/35 bg-white/12'
                        : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/8'
                    }`}
                  >
                    <div className="mb-4 flex items-center justify-between gap-4">
                      <div>
                        <p className="text-2xl">{result.first_name} {result.last_name}</p>
                        <p className="text-sm uppercase tracking-[0.24em] text-white/45">{result.pid}</p>
                      </div>
                      <span className={`rounded-full border px-3 py-1 text-sm uppercase tracking-[0.18em] ${badgeTone(result.status)}`}>
                        {result.status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-lg text-white/70">
                      <span>{result.ai_pattern}{result.ai_severity ? ` • ${result.ai_severity}` : ''}</span>
                      <span>{result.test_date}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-slate-950/45 p-8 backdrop-blur-sm">
              {selectedResult ? (
                <>
                  <div className="mb-8 flex items-start justify-between gap-6">
                    <div>
                      <p className="text-sm uppercase tracking-[0.3em] text-cyan-200/70">Selected Session</p>
                      <h2 className="mt-3 text-5xl tracking-tight">{selectedResult.first_name} {selectedResult.last_name}</h2>
                      <p className="mt-3 text-xl text-white/60">{selectedResult.pid} • {selectedResult.session_id}</p>
                    </div>
                    <span className={`rounded-full border px-4 py-2 text-sm uppercase tracking-[0.22em] ${badgeTone(selectedResult.status)}`}>
                      {selectedResult.status}
                    </span>
                  </div>

                  <div className="mb-8 grid grid-cols-3 gap-5">
                    {[
                      ['FVC', `${selectedResult.fvc_measured?.toFixed?.(2) ?? selectedResult.fvc_measured} L`],
                      ['FEV1', `${selectedResult.fev1_measured?.toFixed?.(2) ?? selectedResult.fev1_measured} L`],
                      ['FEV1/FVC', `${selectedResult.fev1_fvc_ratio?.toFixed?.(1) ?? selectedResult.fev1_fvc_ratio}%`],
                      ['Pattern', selectedResult.ai_pattern],
                      ['Confidence', `${Math.round((selectedResult.ai_confidence ?? 0) * 100)}%`],
                      ['Performed By', selectedResult.performed_by_name ?? 'Booth'],
                    ].map(([label, value]) => (
                      <div key={label} className="rounded-[1.5rem] border border-white/10 bg-white/6 p-5">
                        <p className="text-sm uppercase tracking-[0.24em] text-white/45">{label}</p>
                        <p className="mt-3 text-3xl">{value}</p>
                      </div>
                    ))}
                  </div>

                  <div className="mb-8 grid grid-cols-[0.9fr_1.1fr] gap-6">
                    <div className="rounded-[1.75rem] border border-white/10 bg-white/6 p-6">
                      <div className="mb-5 flex items-center gap-3">
                        <UserRound className="h-5 w-5 text-white/55" />
                        <h3 className="text-2xl tracking-tight">Patient Profile</h3>
                      </div>
                      <div className="space-y-4 text-xl text-white/78">
                        <div className="flex justify-between"><span className="text-white/45">DOB</span><span>{selectedResult.date_of_birth}</span></div>
                        <div className="flex justify-between"><span className="text-white/45">Sex</span><span>{selectedResult.sex}</span></div>
                        <div className="flex justify-between"><span className="text-white/45">Height</span><span>{selectedResult.height_cm} cm</span></div>
                        <div className="flex justify-between"><span className="text-white/45">Weight</span><span>{selectedResult.weight_kg} kg</span></div>
                        <div className="flex justify-between"><span className="text-white/45">Smoker</span><span>{selectedResult.smoker ? 'Yes' : 'No'}</span></div>
                      </div>
                    </div>

                    <div className="rounded-[1.75rem] border border-white/10 bg-white/6 p-6">
                      <h3 className="text-2xl tracking-tight">Clinical Interpretation</h3>
                      <p className="mt-5 text-xl leading-relaxed text-white/75">
                        {selectedResult.ai_summary ?? 'No AI summary available for this session.'}
                      </p>
                      <div className="mt-6 rounded-[1.25rem] border border-white/10 bg-slate-950/25 p-4">
                        <p className="text-sm uppercase tracking-[0.24em] text-white/45">Clinician Note</p>
                        <p className="mt-3 text-xl text-white/80">
                          {selectedResult.clinician_notes || 'No clinician note entered yet.'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-[1.75rem] border border-white/10 bg-white/6 p-6">
                    <h3 className="text-2xl tracking-tight">Flow-Volume Snapshot</h3>
                    <div className="mt-6 flex h-64 items-end gap-2 rounded-[1.25rem] border border-white/10 bg-slate-950/20 p-4">
                      {(selectedResult.flowVolumeCurve ?? []).map((point: any, index: number) => (
                        <div
                          key={`${point.volume}-${index}`}
                          className="flex-1 rounded-t-full bg-cyan-300/70"
                          style={{ height: `${Math.max(8, point.flow * 18)}px` }}
                        />
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex h-full items-center justify-center text-2xl text-white/50">
                  Select a session to review.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
