import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import {
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  X,
  ArrowRight,
  ArrowLeft,
  Download,
  Loader2,
  Layers,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { executeMenuImport, previewMenuImport } from '../../pages/app/appStore';
import { useToast } from '../feedback/ToastProvider';

interface SmartImportWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

type Step = 'upload' | 'mapping' | 'preview' | 'importing' | 'results';
type ImportMode = 'add' | 'update' | 'skip';

const TARGET_FIELDS = [
  { key: 'category', label: 'Category / Section', required: true, description: 'E.g. Main Course, Starters' },
  { key: 'name', label: 'Dish / Item Name', required: true, description: 'E.g. Paneer Butter Masala' },
  { key: 'price', label: 'Single Price (₹)', required: false, description: 'E.g. 180' },
  { key: 'halfPrice', label: 'Half Price (₹)', required: false, description: 'E.g. 110' },
  { key: 'fullPrice', label: 'Full Price (₹)', required: false, description: 'E.g. 200' },
  { key: 'variantName', label: 'Variant / Portion Name', required: false, description: 'E.g. Small, Medium, Large' },
  { key: 'variantPrice', label: 'Variant Price (₹)', required: false, description: 'E.g. 199' },
  { key: 'description', label: 'Description', required: false, description: 'Detailed dish info' },
  { key: 'dietType', label: 'Veg / Non-Veg / Vegan', required: false, description: 'veg, non-veg, vegan' },
  { key: 'available', label: 'Available Status', required: false, description: 'yes, no, true, false' },
  { key: 'imageUrl', label: 'Image URL', required: false, description: 'HTTP link to photo' },
  { key: 'ignore', label: '-- Ignore Field --', required: false, description: 'Skip this column' }
];

export function SmartImportWizard({ isOpen, onClose, onSuccess }: SmartImportWizardProps) {
  const showToast = useToast();
  const [step, setStep] = useState<Step>('upload');
  const [fileName, setFileName] = useState<string>('');
  const [headers, setHeaders] = useState<string[]>([]);
  const [rawRows, setRawRows] = useState<Record<string, any>[]>([]);
  const [columnMap, setColumnMap] = useState<Record<string, string>>({});
  
  const [previewSummary, setPreviewSummary] = useState<any>(null);
  const [previewCategories, setPreviewCategories] = useState<any[]>([]);
  const [issues, setIssues] = useState<any[]>([]);
  
  const [importMode, setImportMode] = useState<ImportMode>('add');
  const [isProcessing, setIsProcessing] = useState(false);
  const [importResult, setImportResult] = useState<any>(null);
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});

  if (!isOpen) return null;

  const handleFileUpload = (file: File) => {
    if (!file) return;
    const name = file.name;
    const ext = name.split('.').pop()?.toLowerCase();
    if (!['xlsx', 'xls', 'csv'].includes(ext || '')) {
      showToast('error', 'Please upload a valid .xlsx, .xls or .csv file.');
      return;
    }

    setFileName(name);
    setIsProcessing(true);

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const buffer = e.target?.result;
        const workbook = XLSX.read(buffer, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const json: any[] = XLSX.utils.sheet_to_json(sheet, { header: 1 });

        if (!json || json.length < 2) {
          showToast('error', 'Spreadsheet appears to be empty or missing data rows.');
          setIsProcessing(false);
          return;
        }

        const rawHeaders = json[0].map((h: any) => String(h || '').trim()).filter(Boolean);
        const rowObjects: Record<string, any>[] = [];

        for (let i = 1; i < json.length; i++) {
          const rowArray = json[i];
          if (!rowArray || rowArray.length === 0) continue;
          const obj: Record<string, any> = {};
          let hasVal = false;
          rawHeaders.forEach((h: string, colIdx: number) => {
            const val = rowArray[colIdx];
            obj[h] = val !== undefined ? val : '';
            if (val !== undefined && val !== '') hasVal = true;
          });
          if (hasVal) rowObjects.push(obj);
        }

        setHeaders(rawHeaders);
        setRawRows(rowObjects);

        // Preview initial auto-mapping
        const res = await previewMenuImport(rawHeaders, rowObjects);
        setColumnMap(res.detectedColumns);
        setPreviewSummary(res.summary);
        setPreviewCategories(res.categories);
        setIssues(res.issues);

        setStep('mapping');
      } catch (error) {
        showToast('error', 'Failed to parse workbook file. Ensure it is not corrupted.');
      } finally {
        setIsProcessing(false);
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const updateMapping = async (header: string, targetField: string) => {
    const updated = { ...columnMap, [header]: targetField };
    setColumnMap(updated);

    // Re-run preview with updated mapping
    try {
      const res = await previewMenuImport(headers, rawRows);
      setPreviewSummary(res.summary);
      setPreviewCategories(res.categories);
      setIssues(res.issues);
    } catch {
      // Keep state
    }
  };

  const handleConfirmMapping = async () => {
    setIsProcessing(true);
    try {
      const res = await previewMenuImport(headers, rawRows);
      setPreviewSummary(res.summary);
      setPreviewCategories(res.categories);
      setIssues(res.issues);
      setStep('preview');
    } catch (err) {
      showToast('error', 'Error generating preview validation.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExecuteImport = async () => {
    setIsProcessing(true);
    setStep('importing');
    try {
      const res = await executeMenuImport(previewCategories, importMode, fileName);
      setImportResult(res);
      setStep('results');
      showToast('success', 'Menu imported successfully!');
      onSuccess();
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Import failed.');
      setStep('preview');
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadTemplateFormatA = () => {
    const data = [
      ['Category', 'Item Name', 'Price', 'Description', 'Diet Type', 'Available'],
      ['Starters', 'Paneer Tikka', 240, 'Char-grilled cottage cheese with spices', 'veg', 'yes'],
      ['Starters', 'Chicken Tikka', 280, 'Tandoori marinated chicken morsels', 'non-veg', 'yes'],
      ['Main Course', 'Paneer Butter Masala', 260, 'Rich tomato cashew gravy', 'veg', 'yes'],
      ['Main Course', 'Dal Makhani', 220, 'Slow cooked black lentils', 'veg', 'yes'],
      ['Beverages', 'Mango Lassi', 90, 'Chilled mango yogurt drink', 'veg', 'yes']
    ];
    const ws = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Menu Template');
    XLSX.writeFile(wb, 'MENUQR_Standard_Menu_Template.xlsx');
  };

  const downloadTemplateFormatB = () => {
    const data = [
      ['Category', 'Item Name', 'Description', 'Variant Name', 'Variant Price', 'Diet Type', 'Available'],
      ['Pizza', 'Margherita Pizza', 'Classic mozzarella and basil', 'Small', 199, 'veg', 'yes'],
      ['Pizza', 'Margherita Pizza', 'Classic mozzarella and basil', 'Medium', 299, 'veg', 'yes'],
      ['Pizza', 'Margherita Pizza', 'Classic mozzarella and basil', 'Large', 449, 'veg', 'yes'],
      ['Curries', 'Paneer Butter Masala', 'Royal paneer gravy', 'Half Plate', 180, 'veg', 'yes'],
      ['Curries', 'Paneer Butter Masala', 'Royal paneer gravy', 'Full Plate', 320, 'veg', 'yes']
    ];
    const ws = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Advanced Menu');
    XLSX.writeFile(wb, 'MENUQR_Variants_Menu_Template.xlsx');
  };

  const toggleCategoryExpand = (name: string) => {
    setExpandedCategories(prev => ({ ...prev, [name]: !prev[name] }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
      <div className="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-[#2d3a34] bg-[#1d2723] shadow-2xl text-[#f0f4f2]">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-[#2d3a34] bg-[#151c19] px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e8783c]/15 text-[#e8783c]">
              <FileSpreadsheet className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Smart Excel Menu Import</h2>
              <p className="text-xs text-[#aab7b2]">Review, map columns, and import your restaurant menu</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-[#aab7b2] hover:bg-[#25322c] hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Stepper Progress */}
        <div className="border-b border-[#2d3a34] bg-[#1a231f] px-6 py-3">
          <div className="flex items-center justify-between text-xs font-medium text-[#aab7b2]">
            <div className={`flex items-center gap-2 ${['upload', 'mapping', 'preview', 'importing', 'results'].includes(step) ? 'text-[#e8783c]' : ''}`}>
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#e8783c]/20 text-[10px] font-bold">1</span>
              <span>Upload</span>
            </div>
            <ChevronRight className="h-4 w-4 text-[#384841]" />
            <div className={`flex items-center gap-2 ${['mapping', 'preview', 'importing', 'results'].includes(step) ? 'text-[#e8783c]' : ''}`}>
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#e8783c]/20 text-[10px] font-bold">2</span>
              <span>Map Columns</span>
            </div>
            <ChevronRight className="h-4 w-4 text-[#384841]" />
            <div className={`flex items-center gap-2 ${['preview', 'importing', 'results'].includes(step) ? 'text-[#e8783c]' : ''}`}>
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#e8783c]/20 text-[10px] font-bold">3</span>
              <span>Preview & Validate</span>
            </div>
            <ChevronRight className="h-4 w-4 text-[#384841]" />
            <div className={`flex items-center gap-2 ${step === 'results' ? 'text-[#e8783c]' : ''}`}>
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#e8783c]/20 text-[10px] font-bold">4</span>
              <span>Results</span>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6">
          
          {/* STEP 1: UPLOAD */}
          {step === 'upload' && (
            <div className="space-y-6">
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#384841] bg-[#151c19]/50 p-10 text-center transition-colors hover:border-[#e8783c]/60"
              >
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#e8783c]/10 text-[#e8783c]">
                  <Upload className="h-8 w-8" />
                </div>
                <h3 className="text-base font-semibold text-white">Upload your menu spreadsheet</h3>
                <p className="mt-1 text-xs text-[#aab7b2]">
                  Drag & drop your Excel file here or click to browse. Supports <span className="font-mono text-emerald-400">.xlsx, .xls, .csv</span>
                </p>

                <label className="mt-6 inline-flex cursor-pointer items-center gap-2 rounded-xl bg-[#e8783c] px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-[#d6672b]">
                  <Upload className="h-4 w-4" />
                  Browse Excel File
                  <input
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    className="hidden"
                    onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                  />
                </label>
              </div>

              {/* Sample Templates Download Card */}
              <div className="rounded-xl border border-[#2d3a34] bg-[#151c19] p-5">
                <div className="flex items-center gap-2 text-sm font-semibold text-white">
                  <Download className="h-4 w-4 text-[#e8783c]" />
                  Need a standard Excel template?
                </div>
                <p className="mt-1 text-xs text-[#aab7b2]">
                  Download our pre-formatted spreadsheet templates with example items, categories, and half/full portion options.
                </p>
                <div className="mt-4 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={downloadTemplateFormatA}
                    className="flex items-center gap-2 rounded-lg border border-[#384841] bg-[#1d2723] px-3.5 py-2 text-xs font-medium text-white hover:border-[#e8783c] hover:text-[#e8783c]"
                  >
                    <Download className="h-3.5 w-3.5" />
                    Format A: Standard Single Price Template
                  </button>
                  <button
                    type="button"
                    onClick={downloadTemplateFormatB}
                    className="flex items-center gap-2 rounded-lg border border-[#384841] bg-[#1d2723] px-3.5 py-2 text-xs font-medium text-white hover:border-[#e8783c] hover:text-[#e8783c]"
                  >
                    <Download className="h-3.5 w-3.5" />
                    Format B: Multi-Size / Variants Template
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: COLUMN MAPPING */}
          {step === 'mapping' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between rounded-xl border border-[#2d3a34] bg-[#151c19] p-4">
                <div className="flex items-center gap-3">
                  <FileSpreadsheet className="h-5 w-5 text-[#e8783c]" />
                  <div>
                    <p className="text-sm font-semibold text-white">{fileName}</p>
                    <p className="text-xs text-[#aab7b2]">{rawRows.length} data rows detected</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setStep('upload')}
                  className="text-xs text-[#aab7b2] underline hover:text-white"
                >
                  Change file
                </button>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-white">Smart Column Mapping</h3>
                <p className="text-xs text-[#aab7b2]">Match your Excel headers to MENUQR menu fields.</p>
              </div>

              <div className="space-y-3">
                {headers.map((header) => {
                  const sampleVal = rawRows[0]?.[header];
                  const currentField = columnMap[header] || 'ignore';
                  return (
                    <div
                      key={header}
                      className="flex flex-col gap-3 rounded-xl border border-[#2d3a34] bg-[#151c19] p-4 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-white">{header}</span>
                          {currentField !== 'ignore' && (
                            <span className="rounded bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
                              Matched
                            </span>
                          )}
                        </div>
                        {sampleVal !== undefined && (
                          <p className="text-xs text-[#aab7b2] italic">
                            Sample: "{String(sampleVal).slice(0, 40)}"
                          </p>
                        )}
                      </div>

                      <div className="w-full sm:w-64">
                        <select
                          value={currentField}
                          onChange={(e) => updateMapping(header, e.target.value)}
                          className="w-full rounded-lg border border-[#384841] bg-[#1d2723] px-3 py-2 text-xs font-medium text-white focus:border-[#e8783c] focus:outline-none"
                        >
                          {TARGET_FIELDS.map((field) => (
                            <option key={field.key} value={field.key}>
                              {field.label} {field.required ? '*' : ''}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 3: PREVIEW & VALIDATE */}
          {step === 'preview' && previewSummary && (
            <div className="space-y-6">
              {/* Summary Stats Header */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="rounded-xl border border-[#2d3a34] bg-[#151c19] p-3.5 text-center">
                  <p className="text-xs text-[#aab7b2]">Categories</p>
                  <p className="text-xl font-bold text-white">{previewSummary.categoriesCount}</p>
                </div>
                <div className="rounded-xl border border-[#2d3a34] bg-[#151c19] p-3.5 text-center">
                  <p className="text-xs text-[#aab7b2]">Total Dishes</p>
                  <p className="text-xl font-bold text-emerald-400">{previewSummary.itemsCount}</p>
                </div>
                <div className="rounded-xl border border-[#2d3a34] bg-[#151c19] p-3.5 text-center">
                  <p className="text-xs text-[#aab7b2]">Portion Variants</p>
                  <p className="text-xl font-bold text-amber-400">{previewSummary.variantsCount}</p>
                </div>
                <div className="rounded-xl border border-[#2d3a34] bg-[#151c19] p-3.5 text-center">
                  <p className="text-xs text-[#aab7b2]">Duplicates Matched</p>
                  <p className="text-xl font-bold text-sky-400">{previewSummary.duplicatesCount}</p>
                </div>
              </div>

              {/* Validation Warnings / Issues if any */}
              {issues.length > 0 && (
                <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-amber-300">
                    <AlertTriangle className="h-4 w-4" />
                    Validation Notice ({issues.length} items flagged)
                  </div>
                  <div className="mt-2 max-h-32 overflow-y-auto space-y-1 text-xs text-amber-200/90">
                    {issues.map((iss, i) => (
                      <p key={i}>
                        Row {iss.row}: {iss.message}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              {/* Import Mode Selector */}
              <div className="rounded-xl border border-[#2d3a34] bg-[#151c19] p-4">
                <label className="text-xs font-semibold uppercase tracking-wider text-[#aab7b2]">
                  Select Import Behavior
                </label>
                <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <button
                    type="button"
                    onClick={() => setImportMode('add')}
                    className={`flex flex-col rounded-xl border p-3 text-left transition-all ${
                      importMode === 'add'
                        ? 'border-[#e8783c] bg-[#e8783c]/10 text-white'
                        : 'border-[#384841] bg-[#1d2723] text-[#aab7b2] hover:border-[#4d6158]'
                    }`}
                  >
                    <span className="text-xs font-bold text-white">Add New Items</span>
                    <span className="mt-1 text-[11px]">Creates items; keeps existing menu intact</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setImportMode('update')}
                    className={`flex flex-col rounded-xl border p-3 text-left transition-all ${
                      importMode === 'update'
                        ? 'border-[#e8783c] bg-[#e8783c]/10 text-white'
                        : 'border-[#384841] bg-[#1d2723] text-[#aab7b2] hover:border-[#4d6158]'
                    }`}
                  >
                    <span className="text-xs font-bold text-white">Update Matched Items</span>
                    <span className="mt-1 text-[11px]">Updates prices and details of existing dishes</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setImportMode('skip')}
                    className={`flex flex-col rounded-xl border p-3 text-left transition-all ${
                      importMode === 'skip'
                        ? 'border-[#e8783c] bg-[#e8783c]/10 text-white'
                        : 'border-[#384841] bg-[#1d2723] text-[#aab7b2] hover:border-[#4d6158]'
                    }`}
                  >
                    <span className="text-xs font-bold text-white">Skip Duplicates</span>
                    <span className="mt-1 text-[11px]">Only imports dishes that don't exist yet</span>
                  </button>
                </div>
              </div>

              {/* Categorized Preview List */}
              <div className="space-y-4">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-[#aab7b2]">
                  Parsed Menu Structure ({previewCategories.length} Categories)
                </h4>

                {previewCategories.map((cat) => {
                  const isExpanded = expandedCategories[cat.name] !== false;
                  return (
                    <div key={cat.name} className="overflow-hidden rounded-xl border border-[#2d3a34] bg-[#151c19]">
                      <button
                        type="button"
                        onClick={() => toggleCategoryExpand(cat.name)}
                        className="flex w-full items-center justify-between bg-[#1d2723] px-4 py-3 text-left text-sm font-semibold text-white"
                      >
                        <div className="flex items-center gap-2">
                          <Layers className="h-4 w-4 text-[#e8783c]" />
                          <span>{cat.name}</span>
                          <span className="rounded-full bg-[#25322c] px-2 py-0.5 text-xs text-[#aab7b2]">
                            {cat.items.length} items
                          </span>
                        </div>
                        <span className="text-xs text-[#aab7b2]">{isExpanded ? 'Collapse' : 'Expand'}</span>
                      </button>

                      {isExpanded && (
                        <div className="divide-y divide-[#25322c] p-2">
                          {cat.items.map((item: any, idx: number) => (
                            <div key={idx} className="flex flex-col gap-1 p-2 text-xs">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 font-medium text-white">
                                  <span className={`h-2 w-2 rounded-full ${item.dietType === 'veg' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                                  <span>{item.name}</span>
                                  {item.isExisting && (
                                    <span className="rounded bg-sky-500/15 px-1.5 py-0.5 text-[10px] text-sky-300">
                                      Existing match
                                    </span>
                                  )}
                                </div>
                                <span className="font-mono font-bold text-emerald-400">
                                  {item.pricingType === 'variants' && item.variants?.length > 0
                                    ? `₹${Math.min(...item.variants.map((v: any) => v.price))} – ₹${Math.max(...item.variants.map((v: any) => v.price))}`
                                    : `₹${item.price}`}
                                </span>
                              </div>

                              {item.description && (
                                <p className="text-[#aab7b2] text-[11px] line-clamp-1">{item.description}</p>
                              )}

                              {/* Variants sub-list */}
                              {item.variants && item.variants.length > 0 && (
                                <div className="mt-1 flex flex-wrap gap-2">
                                  {item.variants.map((v: any, vIdx: number) => (
                                    <span key={vIdx} className="rounded border border-[#384841] bg-[#1a231f] px-2 py-0.5 text-[10px] text-amber-300">
                                      {v.name}: ₹{v.price}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 4: IMPORTING */}
          {step === 'importing' && (
            <div className="flex min-h-[300px] flex-col items-center justify-center text-center">
              <Loader2 className="h-12 w-12 text-[#e8783c] animate-spin" />
              <h3 className="mt-4 text-base font-bold text-white">Importing your menu...</h3>
              <p className="mt-1 text-xs text-[#aab7b2]">Creating categories, items, and portion variants</p>
            </div>
          )}

          {/* STEP 5: RESULTS */}
          {step === 'results' && importResult && (
            <div className="flex flex-col items-center text-center space-y-6 py-6">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-400">
                <CheckCircle2 className="h-10 w-10" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Menu Import Complete!</h3>
                <p className="mt-1 text-xs text-[#aab7b2]">Your restaurant menu has been imported safely.</p>
              </div>

              <div className="grid w-full max-w-lg grid-cols-3 gap-3">
                <div className="rounded-xl border border-[#2d3a34] bg-[#151c19] p-4">
                  <p className="text-xs text-[#aab7b2]">Categories</p>
                  <p className="text-xl font-bold text-white">{importResult.categoriesCreated}</p>
                </div>
                <div className="rounded-xl border border-[#2d3a34] bg-[#151c19] p-4">
                  <p className="text-xs text-[#aab7b2]">Dishes Created</p>
                  <p className="text-xl font-bold text-emerald-400">{importResult.itemsCreated || importResult.itemsUpdated}</p>
                </div>
                <div className="rounded-xl border border-[#2d3a34] bg-[#151c19] p-4">
                  <p className="text-xs text-[#aab7b2]">Variants Added</p>
                  <p className="text-xl font-bold text-amber-400">{importResult.variantsCreated}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between border-t border-[#2d3a34] bg-[#151c19] px-6 py-4">
          {step === 'upload' && (
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-[#384841] px-4 py-2 text-xs font-semibold text-[#aab7b2] hover:text-white"
            >
              Cancel
            </button>
          )}

          {step === 'mapping' && (
            <>
              <button
                type="button"
                onClick={() => setStep('upload')}
                className="flex items-center gap-1.5 rounded-xl border border-[#384841] px-4 py-2 text-xs font-semibold text-[#aab7b2] hover:text-white"
              >
                <ArrowLeft className="h-4 w-4" /> Back
              </button>
              <button
                type="button"
                onClick={handleConfirmMapping}
                disabled={isProcessing}
                className="flex items-center gap-1.5 rounded-xl bg-[#e8783c] px-5 py-2 text-xs font-semibold text-white hover:bg-[#d6672b] disabled:opacity-50"
              >
                Preview Validation <ArrowRight className="h-4 w-4" />
              </button>
            </>
          )}

          {step === 'preview' && (
            <>
              <button
                type="button"
                onClick={() => setStep('mapping')}
                className="flex items-center gap-1.5 rounded-xl border border-[#384841] px-4 py-2 text-xs font-semibold text-[#aab7b2] hover:text-white"
              >
                <ArrowLeft className="h-4 w-4" /> Back to Mapping
              </button>
              <button
                type="button"
                onClick={handleExecuteImport}
                disabled={isProcessing}
                className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-6 py-2.5 text-xs font-bold text-white hover:bg-emerald-500 disabled:opacity-50"
              >
                Confirm & Import Menu <Sparkles className="h-4 w-4" />
              </button>
            </>
          )}

          {step === 'results' && (
            <div className="flex w-full justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl bg-[#e8783c] px-6 py-2.5 text-xs font-bold text-white hover:bg-[#d6672b]"
              >
                Done & Return to Menu Manager
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
