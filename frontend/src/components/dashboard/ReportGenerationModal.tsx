import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Calendar as CalendarIcon, Download, AlertCircle } from "lucide-react";

interface ReportGenerationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (startDate: string, endDate: string) => Promise<void>;
  isGenerating: boolean;
}

type PresetType = "30days" | "3months" | "6months" | "12months" | "currentYear" | "previousYear" | "custom";

export default function ReportGenerationModal({
  isOpen,
  onClose,
  onGenerate,
  isGenerating
}: ReportGenerationModalProps) {
  const [preset, setPreset] = useState<PresetType>("12months");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      applyPreset("12months");
    }
  }, [isOpen]);

  const applyPreset = (p: PresetType) => {
    setPreset(p);
    setError(null);
    
    const now = new Date();
    let end = new Date(now);
    let start = new Date(now);

    switch (p) {
      case "30days":
        start.setDate(now.getDate() - 29); // Today minus 29 days (30 days total inclusive)
        break;
      case "3months":
        start.setMonth(now.getMonth() - 3);
        break;
      case "6months":
        start.setMonth(now.getMonth() - 6);
        break;
      case "12months":
        start.setFullYear(now.getFullYear() - 1);
        break;
      case "currentYear":
        start = new Date(now.getFullYear(), 0, 1);
        break;
      case "previousYear":
        start = new Date(now.getFullYear() - 1, 0, 1);
        end = new Date(now.getFullYear() - 1, 11, 31);
        break;
      case "custom":
        // Don't auto-set dates for custom to let user choose
        return;
    }

    // Keep it as local date strings YYYY-MM-DD
    const pad = (n: number) => n.toString().padStart(2, '0');
    setStartDate(`${start.getFullYear()}-${pad(start.getMonth()+1)}-${pad(start.getDate())}`);
    setEndDate(`${end.getFullYear()}-${pad(end.getMonth()+1)}-${pad(end.getDate())}`);
  };

  const handleGenerate = async () => {
    setError(null);
    
    if (!startDate || !endDate) {
      setError("Please select both start and end dates.");
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      setError("Start date cannot be after end date.");
      return;
    }

    try {
      await onGenerate(startDate, endDate);
      onClose();
    } catch (err: any) {
      setError(err.message || "An error occurred while generating the report. Please try again.");
    }
  };

  const presets = [
    { id: "30days", label: "Last 30 Days" },
    { id: "3months", label: "Last 3 Months" },
    { id: "6months", label: "Last 6 Months" },
    { id: "12months", label: "Last 12 Months" },
    { id: "currentYear", label: "Current Year" },
    { id: "previousYear", label: "Previous Year" },
    { id: "custom", label: "Custom Range" }
  ];

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-[#0A0E27] border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl relative"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/50 hover:text-white bg-white/5 p-1.5 rounded-full transition-colors"
          >
            <X size={18} />
          </button>

          <div className="flex items-center gap-3 mb-6 text-white">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
              <CalendarIcon size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold">Activity Report</h2>
              <p className="text-sm text-white/50">Select reporting period to export</p>
            </div>
          </div>

          <div className="space-y-6">
            {/* Presets */}
            <div>
              <label className="block text-sm font-medium text-white/70 mb-3">Quick Select</label>
              <div className="flex flex-wrap gap-2">
                {presets.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => applyPreset(p.id as PresetType)}
                    className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                      preset === p.id 
                      ? "bg-purple-500 text-white border-transparent" 
                      : "bg-white/5 text-white/60 hover:bg-white/10 border border-white/5"
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Dates */}
            <div className="bg-white/5 p-4 rounded-xl space-y-4 border border-white/5">
              <div>
                <label className="block text-xs font-semibold text-white/50 uppercase mb-1.5 tracking-wider">From Date</label>
                <input 
                  type="date"
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    setPreset("custom");
                  }}
                  className="w-full bg-[#111127] border border-white/10 rounded-lg px-3 py-2 text-white outline-none focus:border-purple-500 transition-colors [&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:invert"
                />
              </div>
              
              <div>
                <label className="block text-xs font-semibold text-white/50 uppercase mb-1.5 tracking-wider">To Date</label>
                <input 
                  type="date"
                  value={endDate}
                  onChange={(e) => {
                    setEndDate(e.target.value);
                    setPreset("custom");
                  }}
                  className="w-full bg-[#111127] border border-white/10 rounded-lg px-3 py-2 text-white outline-none focus:border-purple-500 transition-colors [&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:invert"
                />
              </div>
            </div>

            {/* Error Area */}
            {error && (
              <div className="flex items-center gap-2 text-red-400 bg-red-400/10 p-3 rounded-lg text-sm border border-red-400/20">
                <AlertCircle size={16} />
                <p>{error}</p>
              </div>
            )}

            {/* Submit */}
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className={`w-full py-3 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition-all ${
                isGenerating 
                ? "bg-purple-500/50 cursor-not-allowed" 
                : "bg-purple-600 hover:bg-purple-500 shadow-lg shadow-purple-500/25"
              }`}
            >
              {isGenerating ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Generating PDF...
                </>
              ) : (
                <>
                  <Download size={18} />
                  Download Report
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
