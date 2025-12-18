import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Settings, Check, AlertCircle } from "lucide-react";
import { API_BASE_URL, setBackendURL } from "@/lib/api-config";

export function BackendConfigButton() {
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState(API_BASE_URL);
  const [testStatus, setTestStatus] = useState<"idle" | "testing" | "success" | "error">("idle");
  const [testMessage, setTestMessage] = useState("");

  const handleTest = async () => {
    setTestStatus("testing");
    try {
      const response = await fetch(`${url}/predict`, {
        method: "OPTIONS",
      }).catch(() =>
        fetch(`${url}/`, { method: "HEAD" })
      );
      
      if (response.ok || response.status === 405) { // 405 is OK for OPTIONS
        setTestStatus("success");
        setTestMessage("✓ Backend is reachable");
        localStorage.setItem("VITE_BACKEND_URL", url);
        setBackendURL(url);
        setTimeout(() => setOpen(false), 1000);
      } else {
        setTestStatus("error");
        setTestMessage(`Server returned: ${response.status}`);
      }
    } catch (err) {
      setTestStatus("error");
      setTestMessage(err instanceof Error ? err.message : "Connection failed");
    }
  };

  const handleSave = () => {
    if (url.trim()) {
      localStorage.setItem("VITE_BACKEND_URL", url);
      setBackendURL(url);
      setOpen(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 p-3 bg-primary text-white rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-110 z-30"
        title="Configure backend URL"
        data-testid="btn-backend-config"
      >
        <Settings className="w-5 h-5" />
      </button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40"
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md mx-4"
            >
              <div className="bg-white rounded-xl shadow-2xl border border-border">
                <div className="p-6 space-y-4">
                  <div>
                    <h2 className="text-xl font-heading font-bold text-foreground mb-2">Backend Configuration</h2>
                    <p className="text-sm text-gray-600">
                      Enter your Flask backend URL (local or ngrok)
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Backend URL</label>
                    <Input
                      type="url"
                      placeholder="http://localhost:5000"
                      value={url}
                      onChange={(e) => {
                        setUrl(e.target.value);
                        setTestStatus("idle");
                      }}
                      data-testid="input-backend-url"
                    />
                    <p className="text-xs text-gray-600">
                      Examples: http://localhost:5000 or https://your-ngrok-url.ngrok.io
                    </p>
                  </div>

                  {testStatus !== "idle" && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`p-3 rounded-lg flex items-center gap-2 ${
                        testStatus === "success"
                          ? "bg-green-50 text-green-700"
                          : testStatus === "error"
                          ? "bg-red-50 text-red-700"
                          : "bg-blue-50 text-blue-700"
                      }`}
                    >
                      {testStatus === "testing" && (
                        <div className="animate-spin">⏳</div>
                      )}
                      {testStatus === "success" && <Check className="w-4 h-4 flex-shrink-0" />}
                      {testStatus === "error" && <AlertCircle className="w-4 h-4 flex-shrink-0" />}
                      <span className="text-sm">{testMessage}</span>
                    </motion.div>
                  )}

                  <div className="flex gap-2 pt-2">
                    <Button
                      className="flex-1 rounded-lg"
                      onClick={handleTest}
                      disabled={testStatus === "testing" || !url.trim()}
                      data-testid="btn-test-connection"
                    >
                      {testStatus === "testing" ? "Testing..." : "Test Connection"}
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1 rounded-lg"
                      onClick={() => setOpen(false)}
                      data-testid="btn-close-config"
                    >
                      Cancel
                    </Button>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-700">
                    <p className="font-semibold mb-1">🔧 Troubleshooting:</p>
                    <ul className="space-y-1 list-disc list-inside">
                      <li>Ensure backend is running</li>
                      <li>Add CORS headers if needed</li>
                      <li>Use full URL with http/https</li>
                    </ul>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
