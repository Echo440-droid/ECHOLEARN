import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { PageTransition } from "@/components/PageTransition";
import { Upload, FileText, ArrowLeft, Sparkles, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { useUser } from "@/hooks/useUser";
import { useSessionWS } from "@/hooks/useSessionWS";
import { useToast } from "@/hooks/use-toast";

export default function UploadLearn() {
  const navigate = useNavigate();
  const { userId, isOnboarded } = useUser();
  const { toast } = useToast();
  const {
    status,
    sessionId,
    topicName,
    error,
    initSession,
    uploadPDF,
    isConnected,
    disconnectSession,
  } = useSessionWS();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [question, setQuestion] = useState("");
  const [topicNameInput, setTopicNameInput] = useState("");
  const [subjectInput, setSubjectInput] = useState("");
  const [uploadPhase, setUploadPhase] = useState<"select" | "configure" | "uploading" | "done">("select");
  const [pendingUploadBase64, setPendingUploadBase64] = useState<string | null>(null);

  // Redirect if not logged in
  useEffect(() => {
    if (!isOnboarded) navigate("/", { replace: true });
  }, [isOnboarded, navigate]);

  // Track upload status changes from WS
  useEffect(() => {
    if (status === "uploading") setUploadPhase("uploading");
    if (status === "ready" && sessionId && uploadPhase === "uploading") {
      setUploadPhase("done");
      toast({ title: "Material uploaded! 📚", description: `"${topicName}" is ready to explore.` });
      // Auto-navigate to explanation after a brief pause
      setTimeout(() => navigate(`/explanation?sessionId=${sessionId}`), 1200);
    }
    if (status === "error" && error) {
      toast({ title: "Upload failed", description: error, variant: "destructive" });
      setUploadPhase("configure");
      setPendingUploadBase64(null);
    }
  }, [status, sessionId, error, topicName, uploadPhase, navigate, toast]);

  // Trigger upload only after init is fully complete
  useEffect(() => {
    if (status === "ready" && pendingUploadBase64 && selectedFile) {
      uploadPDF({
        fileName: selectedFile.name,
        fileBase64: pendingUploadBase64,
        topicName: topicNameInput || selectedFile.name,
        subject: subjectInput || "General",
        question: question || "Explain the key concepts from this material.",
      });
      setPendingUploadBase64(null);
    }
  }, [status, pendingUploadBase64, selectedFile, uploadPDF, topicNameInput, subjectInput, question]);

  // ─── File Selection ───────────────────────────

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      toast({ title: "Unsupported file", description: "Please upload a PDF file.", variant: "destructive" });
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      toast({ title: "File too large", description: "Maximum file size is 50MB.", variant: "destructive" });
      return;
    }

    setSelectedFile(file);
    setTopicNameInput(file.name.replace(/\.pdf$/i, "").replace(/[_-]/g, " "));
    setUploadPhase("configure");
  };

  // ─── Upload Flow ──────────────────────────────

  const handleUpload = async () => {
    if (!selectedFile || !userId) return;

    setUploadPhase("uploading");

    try {
      // Read file as base64
      const fileBase64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          resolve(result.split(",")[1]); // Strip data URL prefix
        };
        reader.onerror = reject;
        reader.readAsDataURL(selectedFile);
      });

      // Connect WS and init
      // We will wait for status === "ready" in the useEffect to actually send the file
      setPendingUploadBase64(fileBase64);
      initSession(userId, {});
    } catch (err: any) {
      toast({ title: "Failed to read file", description: err.message, variant: "destructive" });
      setUploadPhase("configure");
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <PageTransition>
      <div className="min-h-screen px-6 py-10 max-w-lg mx-auto">
        {/* Back */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => { disconnectSession(); navigate("/dashboard"); }}
          className="flex items-center gap-2 text-muted-foreground font-body text-sm mb-8 hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to dashboard
        </motion.button>

        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h2 className="text-2xl font-heading font-bold text-foreground mb-2">Upload something to learn</h2>
          <p className="text-muted-foreground font-body text-sm">I'll read it and explain it the way you think.</p>
        </motion.div>

        <AnimatePresence mode="wait">
          {/* ── Phase: Select File ─────────────────── */}
          {uploadPhase === "select" && (
            <motion.div
              key="select"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: 0.2 }}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf"
                onChange={handleFileSelect}
                className="hidden"
              />
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-border rounded-2xl p-12 text-center cursor-pointer hover:border-primary/40 transition-colors mb-6"
              >
                <Upload className="w-10 h-10 text-muted-foreground mx-auto mb-4" />
                <p className="font-heading font-semibold text-foreground mb-1">Drop files here or tap to browse</p>
                <p className="text-sm text-muted-foreground font-body">PDF files up to 50MB</p>
              </div>
            </motion.div>
          )}

          {/* ── Phase: Configure ───────────────────── */}
          {uploadPhase === "configure" && selectedFile && (
            <motion.div
              key="configure"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {/* File preview */}
              <div className="echo-card mb-6 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-echo-sage/40 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-6 h-6 text-echo-sage-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-heading font-semibold text-foreground text-sm truncate">{selectedFile.name}</p>
                  <p className="text-xs text-muted-foreground font-body">{formatFileSize(selectedFile.size)}</p>
                </div>
                <button
                  onClick={() => { setSelectedFile(null); setUploadPhase("select"); }}
                  className="text-xs text-muted-foreground hover:text-foreground font-body"
                >
                  Change
                </button>
              </div>

              {/* Topic name */}
              <div className="echo-card mb-4">
                <label className="text-sm font-heading font-semibold text-foreground block mb-2">Topic name</label>
                <input
                  value={topicNameInput}
                  onChange={(e) => setTopicNameInput(e.target.value)}
                  placeholder="e.g. Cell Biology Chapter 3"
                  className="w-full bg-muted/50 border border-border rounded-xl px-4 py-3 text-sm font-body text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>

              {/* Subject */}
              <div className="echo-card mb-4">
                <label className="text-sm font-heading font-semibold text-foreground block mb-2">Subject (optional)</label>
                <input
                  value={subjectInput}
                  onChange={(e) => setSubjectInput(e.target.value)}
                  placeholder="e.g. Biology, Math, History"
                  className="w-full bg-muted/50 border border-border rounded-xl px-4 py-3 text-sm font-body text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>

              {/* Question */}
              <div className="echo-card mb-6">
                <p className="font-heading font-semibold text-foreground mb-3">
                  What would you like to understand from this?
                </p>
                <textarea
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="E.g., 'Explain how mitosis works' or leave blank for a full overview"
                  className="w-full bg-muted/50 border border-border rounded-xl p-4 text-sm font-body text-foreground placeholder:text-muted-foreground/50 resize-none h-24 focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleUpload}
                className="w-full bg-primary text-primary-foreground font-heading font-semibold py-3 rounded-xl flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                Explain this to me
              </motion.button>
            </motion.div>
          )}

          {/* ── Phase: Uploading ───────────────────── */}
          {uploadPhase === "uploading" && (
            <motion.div
              key="uploading"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center py-12"
            >
              <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
              <p className="font-heading font-semibold text-foreground mb-1">
                {status === "uploading" ? "Processing your document…" : "Connecting…"}
              </p>
              <p className="text-sm text-muted-foreground font-body">
                Reading, understanding, and preparing your explanation
              </p>
            </motion.div>
          )}

          {/* ── Phase: Done ────────────────────────── */}
          {uploadPhase === "done" && (
            <motion.div
              key="done"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-12"
            >
              <CheckCircle2 className="w-12 h-12 text-secondary mx-auto mb-4" />
              <p className="font-heading font-semibold text-foreground mb-1">Ready!</p>
              <p className="text-sm text-muted-foreground font-body">
                Taking you to your explanation…
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageTransition>
  );
}
