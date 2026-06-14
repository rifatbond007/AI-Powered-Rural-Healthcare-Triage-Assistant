import { motion } from "motion/react";
import { User, MapPin, Plus, ClipboardList, Clock } from "lucide-react";
import { Card, CardContent } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";
import type { Lang } from "@/app/types";
import { tx } from "@/app/translations";
import { TRIAGE_STYLES } from "@/app/utils";
import { MOCK_CASES } from "@/app/mock-data";

export function Dashboard({ onStart, lang }: { onStart: () => void; lang: Lang }) {
  return (
    <div className="flex flex-col min-h-0">
      <div className="bg-gradient-to-br from-teal-600 to-teal-700 px-5 pt-6 pb-8">
        <div className="flex items-center gap-3 mb-5">
          <div className="size-14 bg-white/20 rounded-2xl flex items-center justify-center">
            <User size={28} className="text-white" />
          </div>
          <div>
            <p className="text-teal-100 text-sm">{tx("greeting", lang)}</p>
            <p className="text-white font-bold text-lg leading-tight">{tx("chwName", lang)}</p>
            <div className="flex items-center gap-1 text-teal-200 text-xs mt-0.5">
              <MapPin size={11} /> {tx("location", lang)}
            </div>
          </div>
        </div>
        <Button
          onClick={onStart}
          size="lg"
          className="w-full bg-white text-teal-700 font-bold text-lg rounded-2xl py-6 hover:bg-teal-50 shadow-xl shadow-teal-800/30"
        >
          <div className="size-9 bg-teal-100 rounded-xl flex items-center justify-center">
            <Plus size={22} className="text-teal-700" />
          </div>
          {tx("newTriage", lang)}
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pt-5 pb-4">
        <h2 className="text-base font-bold text-gray-700 mb-3 flex items-center gap-2">
          <ClipboardList size={17} className="text-teal-600" />
          {tx("recentCases", lang)}
        </h2>
        <div className="space-y-3">
          {MOCK_CASES.map((c, i) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
            >
              <Card className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-4 flex items-center gap-4">
                  <div
                    className="size-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: TRIAGE_STYLES[c.level].hex }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900 truncate">
                      {lang === "bn" ? c.namebn : c.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {c.age}y · {lang === "bn" ? c.condbn : c.condition}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <Badge
                      className="text-xs font-bold"
                      style={{
                        backgroundColor: TRIAGE_STYLES[c.level].hex,
                        color: c.level === "moderate" ? "#1f2937" : "white",
                      }}
                    >
                      {tx(c.level, lang)}
                    </Badge>
                    <p className="text-xs text-gray-400 mt-1 flex items-center justify-end gap-0.5">
                      <Clock size={10} /> {lang === "bn" ? c.timebn : c.time}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
