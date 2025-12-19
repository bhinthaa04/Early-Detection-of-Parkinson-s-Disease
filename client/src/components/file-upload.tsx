import { useState, useRef } from "react";
import { Upload, FileAudio, FileImage, X, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface FileUploadProps {
  accept: string;
  label: string;
  icon: React.ElementType;
  file: File | null;
  setFile: (file: File | null) => void;
  id: string;
}

export function FileUpload({ accept, label, icon: Icon, file, setFile, id }: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const removeFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFile(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-muted-foreground mb-2">
        {label}
      </label>
      <div
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        data-testid={`upload-area-${id}`}
        className={cn(
          "relative h-40 w-full rounded-xl border-2 border-dashed transition-all duration-300 flex flex-col items-center justify-center cursor-pointer overflow-hidden group",
          isDragging
            ? "border-primary bg-primary/5 scale-[1.02]"
            : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50",
          file ? "border-primary bg-primary/5" : "bg-card"
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={handleFileChange}
          className="hidden"
          data-testid={`input-${id}`}
        />

        <AnimatePresence mode="wait">
          {file ? (
            <motion.div
              key="file-selected"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex flex-col items-center gap-2 p-4 text-center z-10"
            >
              <div className="p-3 rounded-full bg-primary/10 text-primary">
                <Icon className="w-6 h-6" />
              </div>
              <p className="text-sm font-medium text-foreground truncate max-w-[200px]">
                {file.name}
              </p>
              <p className="text-xs text-muted-foreground">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>
              <Button
                variant="ghost"
                size="icon"
                onClick={removeFile}
                className="absolute top-2 right-2 h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full"
                data-testid={`btn-remove-${id}`}
              >
                <X className="w-4 h-4" />
              </Button>
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-2 text-muted-foreground p-4 text-center"
            >
              <div className="p-3 rounded-full bg-muted group-hover:bg-background transition-colors">
                <Upload className="w-6 h-6" />
              </div>
              <p className="text-sm font-medium">Click to upload or drag & drop</p>
              <p className="text-xs opacity-100">
                {accept === "image/*" ? "PNG, JPG up to 10MB" : "MP3, WAV up to 10MB"}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
