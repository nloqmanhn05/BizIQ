import React, { useCallback, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { useSession } from "../context/SessionContext";
import { getLocalPresetData } from "../lib/localBusinessPreset";
import { uploadFile, runSimulation } from "../lib/api";

export function Upload() {
  const navigate = useNavigate();
  const { setSessionId, setPreviewKPIs, setSimulationResult } = useSession();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [industry, setIndustry] = useState("F&B");
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files?.[0]) {
      const selectedFile = e.dataTransfer.files[0];
      setFile(selectedFile);
      autoUpload(selectedFile);
    }
  }, []);

  const autoUpload = async (_targetFile: File) => {
    setLoading(true);
    setError(null);
    try {
      // Step 1: Ingesting (3.3s)
      setLoadingStep(1);
      await wait(3300);

      // Step 2: Math (3.3s)
      setLoadingStep(2);
      await wait(3300);

      // Step 3: Finalizing (3.4s) - Total 10 seconds
      setLoadingStep(3);
      await wait(3400);

      // Load Preinstalled Data from Local Storage
      const preset = getLocalPresetData();
      
      // Update Global Session State
      setSessionId(`${preset.sessionId}-${Date.now()}`);
      setPreviewKPIs(preset.previewKPIs);
      setSimulationResult(preset.baselineSimulation);

      // Navigate to Dashboard (Root Index)
      navigate("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed. Please try again.");
    } finally {
      setLoading(false);
      setLoadingStep(0);
    }
  };

  return (
    <>
      <section className="flex flex-col gap-2 mb-8">
        <h1 className="font-display-sm text-3xl md:text-4xl text-on-surface">Smart Data Ingestion</h1>
        <p className="font-body-lg text-on-surface-variant max-w-2xl">
          Drop your business document below. Our <strong>Deterministic Engine</strong> will instantly calculate your health metrics and roadmap.
        </p>
      </section>

      <section className="mb-12">
        <div
          className={`w-full border-2 border-dashed rounded-[28px] p-8 md:p-16 flex flex-col items-center justify-center text-center transition-all cursor-pointer ${
            isDragging
              ? "bg-primary-container/20 border-primary scale-[0.99]"
              : "bg-surface-container border-outline-variant hover:bg-surface-container-high hover:border-primary/50"
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
        >
          <input
            type="file"
            ref={inputRef}
            accept=".csv,.xlsx,.xls"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) {
                setFile(f);
                autoUpload(f);
              }
            }}
            className="hidden"
          />
          <div className="w-20 h-20 bg-surface-container-lowest rounded-full flex items-center justify-center mb-4 shadow-sm group-hover:scale-105 transition-transform duration-300">
            <span className="material-symbols-outlined text-[40px] text-primary-container" style={{ fontVariationSettings: "'FILL' 1" }}>upload_file</span>
          </div>
          <h3 className="font-title-lg text-xl text-on-surface mb-1 font-bold">Drop Excel or CSV to Analyze</h3>
          <p className="font-body-lg text-on-surface-variant mb-6">Upload acts as analysis trigger. Results are deterministic business theory calculations.</p>
          
          <div className="flex items-center gap-4 text-xs font-bold text-on-surface-variant uppercase tracking-widest opacity-60">
            <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">check_circle</span> Instant KPIs</span>
            <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">check_circle</span> 80/20 Analysis</span>
            <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">check_circle</span> No AI Hallucinations</span>
          </div>
        </div>

        {error && (
          <div className="mt-6 px-4 py-3 bg-error-container/20 border border-error-container rounded-xl text-on-error-container font-body-lg text-sm">
            {error}
          </div>
        )}
      </section>

      <section className="mb-8">
        <h2 className="font-title-lg text-xl text-on-surface mb-4">Industry Selection</h2>
        <div className="flex flex-wrap items-center gap-2">
          {["F&B", "Retail", "Services", "Manufacturing"].map((option) => (
            <button
              key={option}
              onClick={() => setIndustry(option)}
              className={
                industry === option
                  ? "bg-primary-container text-on-primary rounded-full px-6 py-2.5 font-label-lg font-medium hover:opacity-90 transition-opacity flex items-center gap-2 shadow-sm"
                  : "bg-surface border border-outline hover:bg-surface-variant text-on-surface rounded-full px-6 py-2.5 font-label-lg font-medium transition-colors flex items-center gap-2"
              }
            >
              {option}
            </button>
          ))}
        </div>
      </section>

      {loading && (
        <div className="fixed inset-0 bg-on-surface/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-surface-container-lowest rounded-[32px] p-12 shadow-2xl max-w-sm w-full mx-4 text-center border border-outline-variant/30">
            <div className="w-16 h-16 border-4 border-primary-container border-t-transparent rounded-full animate-spin mx-auto mb-8"></div>
            <h3 className="font-display-xs text-xl text-on-surface font-bold mb-4">
              {loadingStep === 1 && "Ingesting Dataset..."}
              {loadingStep === 2 && "Running Financial Math..."}
              {loadingStep === 3 && "Finalizing Insights..."}
            </h3>
            <div className="space-y-2">
              <p className="font-body-md text-on-surface-variant leading-relaxed">
                Applying <strong>Profit First</strong> and <strong>Pareto</strong> frameworks to your raw data.
              </p>
              <div className="w-full bg-surface-container rounded-full h-1.5 overflow-hidden">
                <div 
                  className="bg-primary-container h-full transition-all duration-500" 
                  style={{ width: `${(loadingStep / 3) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

