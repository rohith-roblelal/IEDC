"use client";

import React, { createContext, useContext, useState, useRef, useEffect, ReactNode, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, X } from "lucide-react";

type ConfirmFunction = (message: string) => Promise<boolean>;

interface ConfirmContextType {
  confirm: ConfirmFunction;
}

const ConfirmContext = createContext<ConfirmContextType | undefined>(undefined);

export const useConfirm = () => {
  const context = useContext(ConfirmContext);
  if (!context) {
    throw new Error("useConfirm must be used within a ConfirmProvider");
  }
  return context.confirm;
};

export const ConfirmProvider = ({ children }: { children: ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const resolvePromiseRef = React.useRef<(value: boolean) => void>(null);
  const cancelButtonRef = useRef<HTMLButtonElement>(null);

  // Move focus inside dialog when it opens
  useEffect(() => {
    if (isOpen && cancelButtonRef.current) {
      cancelButtonRef.current.focus();
    }
  }, [isOpen]);

  const confirm = useCallback((msg: string): Promise<boolean> => {
    setMessage(msg);
    setIsOpen(true);
    return new Promise((resolve) => {
      resolvePromiseRef.current = resolve as (value: boolean) => void;
    });
  }, []);

  const handleConfirm = useCallback(() => {
    setIsOpen(false);
    if (resolvePromiseRef.current) resolvePromiseRef.current(true);
  }, []);

  const handleCancel = useCallback(() => {
    setIsOpen(false);
    if (resolvePromiseRef.current) resolvePromiseRef.current(false);
  }, []);

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleCancel}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-labelledby="confirm-dialog-title"
              className="bg-[#111432] border border-white/10 rounded-2xl p-6 max-w-sm w-full shadow-2xl relative"
            >
              <button 
                type="button"
                onClick={handleCancel}
                className="absolute top-4 right-4 text-[#C4C4D4] hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
              
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center shrink-0">
                  <AlertTriangle className="text-red-400" size={24} />
                </div>
                <h3 id="confirm-dialog-title" className="text-lg font-bold text-white">Please Confirm</h3>
              </div>
              
              <p className="text-[#C4C4D4] text-sm mb-6 leading-relaxed">
                {message}
              </p>
              
              <div className="flex gap-3 justify-end">
                <button
                  ref={cancelButtonRef}
                  type="button"
                  onClick={handleCancel}
                  className="px-4 py-2 rounded-lg font-medium text-white/80 hover:text-white hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirm}
                  className="px-4 py-2 rounded-lg font-medium bg-red-500/90 hover:bg-red-500 text-white transition-colors shadow-lg shadow-red-500/20"
                >
                  Confirm
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </ConfirmContext.Provider>
  );
};
