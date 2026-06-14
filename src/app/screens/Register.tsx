import { useState } from "react";
import { motion } from "motion/react";
import { Stethoscope, Loader2, ArrowLeft } from "lucide-react";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Button } from "@/app/components/ui/button";
import type { Lang } from "@/app/types";
import { tx } from "@/app/translations";
import { register } from "@/app/api";

interface Props {
  lang: Lang;
  onRegister: () => void;
  onBackToLogin: () => void;
}

export function Register({ lang, onRegister, onBackToLogin }: Props) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [clinicLocation, setClinicLocation] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register({ name, email, password, clinicLocation });
      onRegister();
    } catch (err: unknown) {
      const data = (err as { response?: { data?: { error?: { message?: string } } } })?.response?.data;
      setError(data?.error?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full items-center justify-center px-6 bg-gradient-to-br from-teal-600 to-teal-700">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        <button
          onClick={onBackToLogin}
          className="flex items-center gap-1 text-teal-100 mb-4 hover:text-white transition-colors"
        >
          <ArrowLeft size={16} /> {tx("back", lang)}
        </button>

        <div className="flex flex-col items-center mb-6">
          <div className="size-20 bg-white/20 rounded-3xl flex items-center justify-center mb-4">
            <Stethoscope size={40} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">RuralCare AI</h1>
          <p className="text-teal-100 text-sm mt-1">{tx("registerTitle", lang)}</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 shadow-2xl space-y-4">
          <div className="space-y-2">
            <Label htmlFor="reg-name" className="text-sm font-semibold text-gray-700">
              {tx("name", lang)}
            </Label>
            <Input
              id="reg-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={tx("regNamePh", lang)}
              className="h-12 text-base"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="reg-email" className="text-sm font-semibold text-gray-700">
              {tx("email", lang)}
            </Label>
            <Input
              id="reg-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={tx("emailPh", lang)}
              className="h-12 text-base"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="reg-password" className="text-sm font-semibold text-gray-700">
              {tx("password", lang)}
            </Label>
            <Input
              id="reg-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={tx("passwordPh", lang)}
              className="h-12 text-base"
              required
              minLength={8}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="reg-clinic" className="text-sm font-semibold text-gray-700">
              {tx("clinicLocation", lang)}
            </Label>
            <Input
              id="reg-clinic"
              value={clinicLocation}
              onChange={(e) => setClinicLocation(e.target.value)}
              placeholder={tx("clinicPh", lang)}
              className="h-12 text-base"
              required
            />
          </div>

          {error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-sm text-red-600 font-semibold text-center"
            >
              {error}
            </motion.p>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-12 text-base font-bold bg-teal-600 hover:bg-teal-500"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <Loader2 size={18} className="animate-spin" /> {tx("registerBtn", lang)}
              </span>
            ) : (
              tx("registerBtn", lang)
            )}
          </Button>
        </form>
      </motion.div>
    </div>
  );
}
