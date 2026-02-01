'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Pencil, RefreshCw, Trash2, Plus, ArrowRight, Eye, Sparkles, Check, X, Wand2 } from 'lucide-react';
import { useStore, AdRow } from '../lib/store';
import { toast } from 'sonner';

export default function ReviewStep() {
  const { rows, setRows, updateRow, adCount, productName, brandName, colors, setStep } = useStore();
  const [editingCell, setEditingCell] = useState<{ row: number; field: keyof AdRow } | null>(null);
  const [editValue, setEditValue] = useState('');
  const [regeneratingRow, setRegeneratingRow] = useState<number | null>(null);
  const [previewRow, setPreviewRow] = useState<number | null>(null);

  const columns: { key: keyof AdRow; label: string; width: string }[] = [
    { key: 'index', label: '#', width: 'w-16' },
    { key: 'ad_copy', label: 'Ad Copy', width: 'w-48' },
    { key: 'product', label: 'Product', width: 'w-40' },
    { key: 'character', label: 'Character', width: 'w-40' },
    { key: 'visual_guide', label: 'Visual Guide', width: 'w-64' },
    { key: 'text_watermark', label: 'Watermark', width: 'w-32' },
  ];

  const startEdit = (row: number, field: keyof AdRow) => {
    setEditingCell({ row, field });
    setEditValue(rows[row][field] as string || '');
  };

  const saveEdit = () => {
    if (editingCell) {
      updateRow(editingCell.row, { [editingCell.field]: editValue });
      setEditingCell(null);
      setEditValue('');
    }
  };

  const cancelEdit = () => {
    setEditingCell(null);
    setEditValue('');
  };

  const regenerateRow = async (index: number) => {
    setRegeneratingRow(index);
    
    try {
      const response = await fetch('/api/regenerate-row', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rowIndex: index,
          productName,
          brandName,
          colors: colors.map(c => c.hex),
          currentRow: rows[index],
        }),
      });

      if (!response.ok) throw new Error('Failed to regenerate');
      
      const { row } = await response.json();
      updateRow(index, row);
      toast.success(`Row ${index + 1} regenerated`);
    } catch (error) {
      toast.error('Failed to regenerate row');
    } finally {
      setRegeneratingRow(null);
    }
  };

  const deleteRow = (index: number) => {
    const newRows = rows.filter((_, i) => i !== index).map((row, i) => ({
      ...row,
      index: `'${String(i + 1).padStart(2, '0')}`,
    }));
    setRows(newRows);
    toast.success('Row deleted');
  };

  const addRow = () => {
    const newRow: AdRow = {
      index: `'${String(rows.length + 1).padStart(2, '0')}`,
      ad_copy: '',
      product: productName,
      character: '',
      visual_guide: '',
      text_watermark: brandName || '',
      color_1: colors[0]?.hex || '#6366f1',
      color_2: colors[1]?.hex || '#8b5cf6',
      color_3: colors[2]?.hex || '#ffffff',
    };
    setRows([...rows, newRow]);
    toast.success('New row added');
  };

  const handleGenerate = () => {
    if (rows.length === 0) {
      toast.error('Please add at least one ad');
      return;
    }
    setStep('generating');
  };

  return (
    <div className="min-h-screen px-6 py-12">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <h2 className="text-3xl font-bold mb-2">Review Your Ads</h2>
            <p className="text-zinc-400">
              Edit any cell by clicking on it. Regenerate rows you don't like.
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <button onClick={addRow} className="btn-secondary flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add Row
            </button>
            <button onClick={handleGenerate} className="btn-primary flex items-center gap-2">
              Generate Images
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </motion.div>

        {/* Stats bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass rounded-xl p-4 mb-6 flex items-center gap-6"
        >
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-genesis-500" />
            <span className="text-sm text-zinc-400">{rows.length} ads ready</span>
          </div>
          <div className="h-4 w-px bg-surface-3" />
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-genesis-400" />
            <span className="text-sm text-zinc-400">Click any cell to edit</span>
          </div>
          <div className="h-4 w-px bg-surface-3" />
          <div className="flex items-center gap-2">
            {colors.slice(0, 3).map((color, i) => (
              <div
                key={i}
                className="w-5 h-5 rounded-md"
                style={{ backgroundColor: color.hex }}
              />
            ))}
          </div>
        </motion.div>

        {/* Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass rounded-2xl overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  {columns.map((col) => (
                    <th key={col.key} className={`table-header text-left ${col.width}`}>
                      {col.label}
                    </th>
                  ))}
                  <th className="table-header text-center w-32">Actions</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {rows.map((row, rowIndex) => (
                    <motion.tr
                      key={row.index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: rowIndex * 0.02 }}
                      className="group hover:bg-surface-2/50 transition-colors"
                    >
                      {columns.map((col) => (
                        <td
                          key={col.key}
                          className={`table-cell ${col.width} ${col.key !== 'index' ? 'cursor-pointer hover:bg-genesis-500/10' : ''}`}
                          onClick={() => col.key !== 'index' && startEdit(rowIndex, col.key)}
                        >
                          {editingCell?.row === rowIndex && editingCell?.field === col.key ? (
                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') saveEdit();
                                  if (e.key === 'Escape') cancelEdit();
                                }}
                                autoFocus
                                className="input py-1 px-2 text-sm"
                              />
                              <button onClick={saveEdit} className="p-1 hover:bg-emerald-500/20 rounded">
                                <Check className="w-4 h-4 text-emerald-400" />
                              </button>
                              <button onClick={cancelEdit} className="p-1 hover:bg-red-500/20 rounded">
                                <X className="w-4 h-4 text-red-400" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <span className={`truncate ${col.key === 'index' ? 'font-mono text-genesis-400' : ''}`}>
                                {row[col.key]}
                              </span>
                              {col.key !== 'index' && (
                                <Pencil className="w-3 h-3 text-zinc-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                              )}
                            </div>
                          )}
                        </td>
                      ))}
                      <td className="table-cell text-center">
                        <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => setPreviewRow(previewRow === rowIndex ? null : rowIndex)}
                            className="p-1.5 rounded-lg hover:bg-surface-3 transition-colors"
                            title="Preview"
                          >
                            <Eye className="w-4 h-4 text-zinc-400" />
                          </button>
                          <button
                            onClick={() => regenerateRow(rowIndex)}
                            disabled={regeneratingRow === rowIndex}
                            className="p-1.5 rounded-lg hover:bg-surface-3 transition-colors disabled:opacity-50"
                            title="Regenerate"
                          >
                            <RefreshCw className={`w-4 h-4 text-zinc-400 ${regeneratingRow === rowIndex ? 'animate-spin' : ''}`} />
                          </button>
                          <button
                            onClick={() => deleteRow(rowIndex)}
                            className="p-1.5 rounded-lg hover:bg-red-500/20 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4 text-red-400" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Preview panel */}
        <AnimatePresence>
          {previewRow !== null && rows[previewRow] && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="fixed bottom-6 left-6 right-6 max-w-3xl mx-auto glass-strong rounded-2xl p-6 shadow-2xl z-50"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-lg">Preview: Row {previewRow + 1}</h3>
                  <p className="text-sm text-zinc-400">This is how the AI will interpret your ad</p>
                </div>
                <button
                  onClick={() => setPreviewRow(null)}
                  className="p-2 rounded-lg hover:bg-surface-3"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Ad Copy</div>
                  <div className="text-lg font-semibold text-genesis-400">{rows[previewRow].ad_copy}</div>
                </div>
                <div>
                  <div className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Character</div>
                  <div className="text-zinc-300">{rows[previewRow].character}</div>
                </div>
                <div className="md:col-span-2">
                  <div className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Visual Guide</div>
                  <div className="text-zinc-300">{rows[previewRow].visual_guide}</div>
                </div>
                <div>
                  <div className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Colors</div>
                  <div className="flex gap-2">
                    <div className="w-8 h-8 rounded-lg" style={{ backgroundColor: rows[previewRow].color_1 }} />
                    <div className="w-8 h-8 rounded-lg" style={{ backgroundColor: rows[previewRow].color_2 }} />
                    <div className="w-8 h-8 rounded-lg" style={{ backgroundColor: rows[previewRow].color_3 }} />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
