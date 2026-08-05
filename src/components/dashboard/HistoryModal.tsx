import React from 'react';
import { X, Clock, ExternalLink, ArrowRight, Database, RefreshCw, Calendar, CheckCircle2 } from 'lucide-react';

export interface HistoryItem {
  id: string;
  title: string;
  subtitle?: string;
  timestamp: string;
  badge?: string;
  data: any;
}

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  featureName: string;
  items: HistoryItem[];
  loading: boolean;
  onSelect: (item: HistoryItem) => void;
  onRefresh?: () => void;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({
  isOpen,
  onClose,
  title,
  featureName,
  items,
  loading,
  onSelect,
  onRefresh,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#17191c]/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-fadeIn">
      <div className="bg-[#ffffff] rounded-3xl border border-[#17191c]/15 shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-[#17191c]/10 flex items-center justify-between bg-[#fafafb]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#17191c] text-[#ffffff] flex items-center justify-center font-bold">
              <Clock className="w-5 h-5 text-[#fbe1d1]" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-[#17191c]">{title}</h3>
              <p className="text-xs text-[#777b86]">Audit &amp; Search History • {featureName}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onRefresh && (
              <button
                onClick={onRefresh}
                disabled={loading}
                className="p-2 rounded-xl text-[#777b86] hover:text-[#17191c] hover:bg-[#f2f2f3] transition-all disabled:opacity-50"
                title="Refresh History"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-[#777b86] hover:text-[#17191c] hover:bg-[#f2f2f3] transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-3 flex-1">
          {loading ? (
            <div className="py-12 text-center space-y-3">
              <RefreshCw className="w-8 h-8 text-[#17191c] animate-spin mx-auto" />
              <p className="text-sm font-medium text-[#777b86]">Retrieving data...</p>
            </div>
          ) : items.length > 0 ? (
            items.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  onSelect(item);
                  onClose();
                }}
                className="p-4 bg-[#fafafb] hover:bg-[#ffffff] border border-[#17191c]/10 hover:border-[#17191c]/30 rounded-2xl transition-all cursor-pointer flex items-center justify-between gap-4 group shadow-sm hover:shadow-md"
              >
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-[#17191c] truncate">{item.title}</span>
                    {item.badge && (
                      <span className="text-[10px] font-bold bg-[#17191c] text-[#fbe1d1] px-2 py-0.5 rounded-full uppercase">
                        {item.badge}
                      </span>
                    )}
                  </div>
                  {item.subtitle && (
                    <p className="text-xs text-[#777b86] truncate">{item.subtitle}</p>
                  )}
                  <div className="flex items-center gap-2 text-[11px] text-[#777b86] pt-1">
                    <Calendar className="w-3 h-3" />
                    <span>{new Date(item.timestamp).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>

                <button className="px-3.5 py-1.5 bg-[#ffffff] group-hover:bg-[#17191c] text-[#17191c] group-hover:text-[#ffffff] border border-[#17191c]/15 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all flex-shrink-0">
                  <span>Load</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          ) : (
            <div className="py-12 text-center space-y-3">
              <Database className="w-10 h-10 text-[#777b86]/40 mx-auto" />
              <p className="text-base font-semibold text-[#17191c]">No previous history records found</p>
              <p className="text-xs text-[#777b86] max-w-sm mx-auto">
                Run your first analysis or search to automatically record &amp; persist snapshot logs in your database.
              </p>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-[#17191c]/10 bg-[#fafafb] flex items-center justify-between text-xs text-[#777b86]">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#10a37f]" />
            Real-time Persistence Active
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#17191c] text-[#ffffff] rounded-xl font-medium hover:bg-[#17191c]/90 transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
