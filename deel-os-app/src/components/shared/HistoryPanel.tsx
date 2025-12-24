import { useState, useEffect } from 'react';
import { fetchChangelog, revertChange, type ChangeLogEntry } from '../../utils/api';

interface HistoryPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onRevert?: () => void; // Callback to refresh data after revert
  filteredRecordId?: number;
  filteredTable?: string;
}

export function HistoryPanel({ isOpen, onClose, onRevert, filteredRecordId, filteredTable }: HistoryPanelProps) {
  const [history, setHistory] = useState<ChangeLogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [revertingId, setRevertingId] = useState<number | null>(null);
  const [confirmRevertId, setConfirmRevertId] = useState<number | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadHistory();
    }
  }, [isOpen]);

  // Clear success message after 3 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const loadHistory = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchChangelog(100);
      setHistory(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load history');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRevert = async (entryId: number) => {
    setRevertingId(entryId);
    setError(null);
    try {
      const result = await revertChange(entryId);
      setSuccessMessage(result.message);
      setConfirmRevertId(null);
      // Reload history to show the new revert entry
      await loadHistory();
      // Notify parent to refresh data
      if (onRevert) {
        onRevert();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to revert change');
    } finally {
      setRevertingId(null);
    }
  };

  // Filter history if specific record/table provided
  const filteredHistory = filteredRecordId && filteredTable
    ? history.filter(h => h.record_id === filteredRecordId && h.table_name === filteredTable)
    : history;

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatFieldName = (field: string) => {
    return field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getTableLabel = (table: string) => {
    switch (table) {
      case 'rubrics': return 'Rubric';
      case 'competency_definitions': return 'Competency';
      case 'questions': return 'Questions';
      default: return table;
    }
  };

  const truncateText = (text: string | null, maxLength = 100) => {
    if (!text) return '-';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const isRevertEntry = (entry: ChangeLogEntry) => {
    return entry.changed_by?.includes('(revert)');
  };

  if (!isOpen) return null;

  return (
    <div className="history-panel-overlay" onClick={(e) => {
      if (e.target === e.currentTarget) onClose();
    }}>
      <div className="history-panel">
        <div className="history-panel-header">
          <h3>Version History</h3>
          <button className="history-panel-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        {successMessage && (
          <div className="history-success">{successMessage}</div>
        )}

        {error && (
          <div className="history-error-banner">{error}</div>
        )}

        <div className="history-panel-content">
          {isLoading && (
            <div className="history-loading">Loading history...</div>
          )}

          {!isLoading && !error && filteredHistory.length === 0 && (
            <div className="history-empty">No changes recorded yet.</div>
          )}

          {!isLoading && filteredHistory.length > 0 && (
            <div className="history-list">
              {filteredHistory.map(entry => (
                <div 
                  key={entry.id} 
                  className={`history-entry ${isRevertEntry(entry) ? 'history-entry-revert' : ''}`}
                >
                  <div className="history-entry-header">
                    <span className="history-entry-table">
                      {getTableLabel(entry.table_name)}
                    </span>
                    <span className="history-entry-field">
                      {formatFieldName(entry.field_name)}
                    </span>
                    {isRevertEntry(entry) && (
                      <span className="history-entry-revert-badge">Revert</span>
                    )}
                    <span className="history-entry-time">
                      {formatDate(entry.changed_at)}
                    </span>
                  </div>
                  
                  {entry.changed_by && (
                    <div className="history-entry-user">
                      by {entry.changed_by.replace(' (revert)', '')}
                    </div>
                  )}
                  
                  <div className="history-entry-changes">
                    <div className="history-entry-old">
                      <span className="history-label">Before:</span>
                      <span className="history-value">{truncateText(entry.old_value)}</span>
                    </div>
                    <div className="history-entry-new">
                      <span className="history-label">After:</span>
                      <span className="history-value">{truncateText(entry.new_value)}</span>
                    </div>
                  </div>

                  {/* Revert button - only show if not already a revert entry and has old value */}
                  {!isRevertEntry(entry) && entry.old_value && (
                    <div className="history-entry-actions">
                      {confirmRevertId === entry.id ? (
                        <div className="revert-confirm">
                          <span className="revert-confirm-text">Restore to previous value?</span>
                          <button 
                            className="revert-confirm-btn revert-confirm-yes"
                            onClick={() => handleRevert(entry.id)}
                            disabled={revertingId === entry.id}
                          >
                            {revertingId === entry.id ? 'Reverting...' : 'Yes, Revert'}
                          </button>
                          <button 
                            className="revert-confirm-btn revert-confirm-no"
                            onClick={() => setConfirmRevertId(null)}
                            disabled={revertingId === entry.id}
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button 
                          className="history-revert-btn"
                          onClick={() => setConfirmRevertId(entry.id)}
                          title="Revert to the 'Before' value"
                        >
                          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                            <path d="M3 3v5h5" />
                          </svg>
                          Revert
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="history-panel-footer">
          <button className="history-refresh-btn" onClick={loadHistory} disabled={isLoading}>
            Refresh
          </button>
        </div>
      </div>
    </div>
  );
}
