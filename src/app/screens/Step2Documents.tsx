import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Camera, Upload, FileText, Loader2, Check, Edit3, Save, SkipForward } from "lucide-react";
import { Card, CardContent } from "@/app/components/ui/card";
import { Input } from "@/app/components/ui/input";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import { Skeleton } from "@/app/components/ui/skeleton";
import { Separator } from "@/app/components/ui/separator";
import type { Lang, ExtractedRow } from "@/app/types";
import { tx } from "@/app/translations";
import { MOCK_EXTRACTED } from "@/app/mock-data";

interface Props {
  onNext: () => void;
  onBack: () => void;
  lang: Lang;
}

export function Step2Documents({ onNext, onBack, lang }: Props) {
  const [uploaded, setUploaded] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [extracted, setExtracted] = useState(false);
  const [rows, setRows] = useState<ExtractedRow[]>([]);
  const [editIdx, setEditIdx] = useState<number | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleUpload = useCallback(() => {
    setUploaded(true);
    setExtracting(true);
    setTimeout(() => {
      setExtracting(false);
      setExtracted(true);
      setRows(MOCK_EXTRACTED);
    }, 2200);
  }, []);

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto px-4 pt-4 pb-2 space-y-5">
        <h2 className="text-xl font-bold text-gray-900">{tx("docUpload", lang)}</h2>

        {!uploaded ? (
          <>
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                onClick={handleUpload}
                className="flex flex-col items-center gap-2 h-auto py-5"
              >
                <div className="size-12 bg-teal-100 rounded-2xl flex items-center justify-center">
                  <Camera size={24} className="text-teal-600" />
                </div>
                <span className="text-sm font-semibold">{tx("takePhoto", lang)}</span>
              </Button>
              <Button
                variant="outline"
                onClick={handleUpload}
                className="flex flex-col items-center gap-2 h-auto py-5"
              >
                <div className="size-12 bg-blue-100 rounded-2xl flex items-center justify-center">
                  <Upload size={24} className="text-blue-600" />
                </div>
                <span className="text-sm font-semibold">{tx("uploadGal", lang)}</span>
              </Button>
            </div>

            <Button
              variant="outline"
              onClick={handleUpload}
              className="w-full border-dashed border-gray-300 h-auto py-8 flex flex-col items-center gap-3"
            >
              <FileText size={32} className="text-gray-400" />
              <p className="text-sm text-muted-foreground">{tx("dropZone", lang)}</p>
            </Button>

            <input ref={fileRef} type="file" accept="image/*" className="hidden" />
          </>
        ) : (
          <>
            <Card className="overflow-hidden">
              <div className="bg-gradient-to-br from-gray-200 to-gray-300 h-36 flex items-center justify-center">
                <div className="flex flex-col items-center gap-2 text-gray-500">
                  <FileText size={32} />
                  <span className="text-sm font-medium">prescription_scan.jpg</span>
                </div>
              </div>
            </Card>

            {extracting && (
              <Card className="border-blue-200 bg-blue-50/50">
                <CardContent className="p-5 space-y-3">
                  <div className="flex items-center gap-3">
                    <Loader2 size={20} className="text-blue-600 animate-spin" />
                    <span className="font-semibold text-blue-700">{tx("extracting", lang)}</span>
                  </div>
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-12 w-full rounded-xl" />
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <AnimatePresence>
              {extracted && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-gray-900">{tx("extracted", lang)}</h3>
                    <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-100">
                      <Check size={11} className="mr-1" /> AI Extracted
                    </Badge>
                  </div>

                  <Card>
                    <div className="grid grid-cols-3 bg-muted/50 px-4 py-2.5 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                      <span>{tx("medication", lang)}</span>
                      <span>{tx("dosage", lang)}</span>
                      <span>{tx("diagnosis", lang)}</span>
                    </div>
                    <Separator />
                    {rows.map((row, i) => (
                      <div key={i}>
                        <div className={`grid grid-cols-3 gap-2 px-4 py-3 ${editIdx === i ? "bg-teal-50" : "hover:bg-muted/30"} transition-colors items-center`}>
                          {editIdx === i ? (
                            <>
                              <Input
                                className="h-8 text-xs"
                                value={row.medication}
                                onChange={(e) => setRows((prev) => prev.map((r, j) => j === i ? { ...r, medication: e.target.value } : r))}
                              />
                              <Input
                                className="h-8 text-xs"
                                value={row.dosage}
                                onChange={(e) => setRows((prev) => prev.map((r, j) => j === i ? { ...r, dosage: e.target.value } : r))}
                              />
                              <div className="flex items-center gap-1">
                                <Input
                                  className="h-8 text-xs flex-1"
                                  value={row.diagnosis}
                                  onChange={(e) => setRows((prev) => prev.map((r, j) => j === i ? { ...r, diagnosis: e.target.value } : r))}
                                />
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={() => setEditIdx(null)}
                                  className="size-8 shrink-0"
                                >
                                  <Save size={13} className="text-teal-600" />
                                </Button>
                              </div>
                            </>
                          ) : (
                            <>
                              <span className="text-sm font-semibold text-gray-800">{row.medication}</span>
                              <span className="text-sm text-muted-foreground">{row.dosage}</span>
                              <div className="flex items-center gap-1">
                                <span className="text-sm text-muted-foreground flex-1">{row.diagnosis}</span>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={() => setEditIdx(i)}
                                  className="size-8 shrink-0"
                                >
                                  <Edit3 size={13} className="text-gray-400 hover:text-teal-600" />
                                </Button>
                              </div>
                            </>
                          )}
                        </div>
                        {i < rows.length - 1 && <Separator />}
                      </div>
                    ))}
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
      </div>

      <div className="flex flex-col gap-2 p-4 bg-white border-t border-gray-100">
        <div className="flex gap-3">
          <Button variant="outline" onClick={onBack} className="flex-1 h-12 text-base font-semibold">
            {tx("back", lang)}
          </Button>
          <Button onClick={onNext} className="flex-1 h-12 text-base font-bold bg-teal-600 hover:bg-teal-500">
            {tx("next", lang)}
          </Button>
        </div>
        {!uploaded && (
          <Button variant="link" onClick={onNext} className="text-sm text-muted-foreground underline underline-offset-2 h-auto">
            <SkipForward size={14} /> {tx("skipDoc", lang)}
          </Button>
        )}
      </div>
    </div>
  );
}
