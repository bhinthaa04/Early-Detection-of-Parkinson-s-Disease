import { motion } from "framer-motion";
import {
  Brain,
  MapPin,
  Mail,
  PhoneCall,
  Youtube,
  Linkedin,
  Github,
} from "lucide-react";
import { useLocation } from "wouter";

const footerLinks = [
  { label: "Home", path: "/" },
  { label: "Upload Test", path: "/patient-form" },
  { label: "Results", path: "/prediction" },
  { label: "Report", path: "/prediction" },
  { label: "Find Doctor", path: "/find-nearby-doctor" },
  { label: "Awareness", path: "/education" },
];

export function MainFooter() {
  const [, setLocation] = useLocation();

  return (
    <motion.footer
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.5 }}
      className="w-full border-t border-blue-950 bg-black text-white shadow-2xl"
    >
      <div className="mx-auto max-w-7xl px-6 py-10 md:px-10">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-white/15 p-3 ring-1 ring-white/30">
                <Brain className="h-7 w-7 text-cyan-200" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">NeuroScan AI</p>
                <p className="text-sm font-semibold uppercase tracking-wider text-cyan-100">Early Detection Saves Lives</p>
              </div>
            </div>
            <p className="text-sm leading-relaxed text-blue-100/95">
              AI-powered Parkinson&apos;s Disease early screening platform using spiral drawing and voice analysis.
            </p>
            <p className="text-xs text-blue-200">Technology supporting healthier lives.</p>
            <div className="flex items-center gap-3">
              <a href="#" className="rounded-full bg-white/15 p-2.5 transition hover:scale-105 hover:bg-white/25" aria-label="YouTube">
                <Youtube className="h-4 w-4 text-white" />
              </a>
              <a href="#" className="rounded-full bg-white/15 p-2.5 transition hover:scale-105 hover:bg-white/25" aria-label="LinkedIn">
                <Linkedin className="h-4 w-4 text-white" />
              </a>
              <a href="#" className="rounded-full bg-white/15 p-2.5 transition hover:scale-105 hover:bg-white/25" aria-label="GitHub">
                <Github className="h-4 w-4 text-white" />
              </a>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="rounded-lg bg-white/10 px-3 py-2 ring-1 ring-white/20">
                <p className="text-blue-100">Total tests</p>
                <p className="font-semibold text-white">1,250+</p>
              </div>
              <div className="rounded-lg bg-white/10 px-3 py-2 ring-1 ring-white/20">
                <p className="text-blue-100">Accuracy</p>
                <p className="font-semibold text-white">92%</p>
                <div className="mt-1 h-1.5 w-full rounded-full bg-white/20">
                  <div className="h-1.5 w-[92%] rounded-full bg-cyan-300" />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4 lg:border-l lg:border-blue-900 lg:pl-8">
            <h3 className="text-lg font-semibold text-white">Quick Links</h3>
            <div className="grid gap-2 text-sm">
              {footerLinks.map((item) => (
                <button
                  key={item.label}
                  onClick={() => setLocation(item.path)}
                  className="w-fit text-blue-100 transition duration-200 hover:translate-x-1 hover:text-white"
                >
                  {item.label}
                </button>
              ))}
            </div>
            <div className="pt-2">
              <p className="mb-2 text-sm font-semibold text-white">Education & Help</p>
              <div className="grid gap-1 text-sm text-blue-100">
                <button className="w-fit transition hover:translate-x-1 hover:text-white">Parkinson&apos;s Symptoms</button>
                <button className="w-fit transition hover:translate-x-1 hover:text-white">Prevention Tips</button>
                <button className="w-fit transition hover:translate-x-1 hover:text-white">Watch Overview Video</button>
                <button className="w-fit transition hover:translate-x-1 hover:text-white">Early Warning Signs</button>
              </div>
            </div>
          </div>

          <div className="space-y-4 lg:border-l lg:border-blue-900 lg:pl-8">
            <h3 className="text-lg font-semibold text-white">Medical & Support</h3>
            <div className="space-y-2 text-sm text-blue-100">
              <p className="flex items-center gap-2"><MapPin className="h-4 w-4 text-cyan-200" />Chennai, India</p>
              <p className="flex items-center gap-2"><Mail className="h-4 w-4 text-cyan-200" />support@neuroscan.ai</p>
              <p className="flex items-center gap-2"><PhoneCall className="h-4 w-4 text-cyan-200" />+91 98765 43210</p>
            </div>
            <div className="rounded-lg border border-red-300/50 bg-red-500/10 p-3">
              <p className="text-sm font-semibold text-red-100">Emergency Support</p>
              <p className="mt-1 text-xs text-red-100/90">If symptoms worsen suddenly, seek immediate medical help.</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button className="rounded-md border border-red-300 px-3 py-1.5 text-xs font-medium text-red-100 transition hover:bg-red-500/20">
                  Call Emergency Services
                </button>
                <button
                  onClick={() => setLocation("/find-nearby-doctor")}
                  className="rounded-md border border-red-300 px-3 py-1.5 text-xs font-medium text-red-100 transition hover:bg-red-500/20"
                >
                  Locate Nearest Hospital
                </button>
              </div>
            </div>
          </div>

        </div>

        <div className="mt-8 border-t border-blue-900 pt-6">
          <div className="rounded-xl border border-blue-900 bg-black p-4 text-sm text-blue-100">
            <p className="text-lg font-bold text-amber-200">Medical Disclaimer</p>
            <p className="mt-1">
              This system is intended for preliminary screening only and not a medical diagnosis. Please consult a certified neurologist for clinical confirmation.
            </p>
          </div>
        </div>
      </div>

      <div className="border-t border-blue-900 bg-black px-6 py-5 md:px-10">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 text-xs text-blue-200">
          <p>(c) 2026 NeuroScan AI - Parkinson&apos;s Predictor System. Developed by Final Year Project Team.</p>
          <div className="flex flex-wrap gap-4">
            <a href="#" className="transition hover:text-white">Privacy Policy</a>
            <a href="#" className="transition hover:text-white">Terms & Conditions</a>
            <a href="#" className="transition hover:text-white">Data Protection</a>
            <a href="#" className="transition hover:text-white">Cookie Policy</a>
            <a href="#" className="transition hover:text-white">AI Ethics Policy</a>
          </div>
        </div>
        <p className="mx-auto mt-2 max-w-7xl text-xs text-blue-200/90">
          Your uploaded voice and images are not stored permanently.
        </p>
        <p className="mx-auto mt-2 max-w-7xl text-xs text-white">
          &copy; 2025 NeuroScan AI. All medical information is for educational purposes only.
        </p>
      </div>
    </motion.footer>
  );
}
