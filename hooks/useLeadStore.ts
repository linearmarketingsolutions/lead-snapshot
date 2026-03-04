"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { v4 as uuidv4 } from "uuid";
import type { Lead, LeadInput, RepSession } from "@/types";
import { stripImages } from "@/lib/utils";

type LeadStore = {
  // Session
  session: RepSession | null;
  setSession: (session: RepSession) => void;
  clearSession: () => void;

  // Leads
  leads: Lead[];
  addLead: (input: LeadInput) => Lead;
  updateLead: (id: string, updates: Partial<Omit<Lead, "id">>) => void;
  removeLead: (id: string) => void;
  clearLeads: () => void;

  // Computed
  getLeadsByShow: (showName: string) => Lead[];
  searchLeads: (query: string) => Lead[];
};

export const useLeadStore = create<LeadStore>()(
  persist(
    (set, get) => ({
      session: null,

      setSession: (session) => set({ session }),

      clearSession: () => set({ session: null }),

      leads: [],

      addLead: (input) => {
        const lead: Lead = {
          ...input,
          id: uuidv4(),
          capturedAt: new Date().toISOString(),
          // Strip images from persisted store — keep only for in-session review
          cardImageFront: input.cardImageFront,
          cardImageBack: input.cardImageBack,
        };
        set((state) => ({
          leads: [lead, ...state.leads],
        }));
        return lead;
      },

      updateLead: (id, updates) => {
        set((state) => ({
          leads: state.leads.map((l) =>
            l.id === id ? { ...l, ...updates } : l
          ),
        }));
      },

      removeLead: (id) => {
        set((state) => ({
          leads: state.leads.filter((l) => l.id !== id),
        }));
      },

      clearLeads: () => set({ leads: [] }),

      getLeadsByShow: (showName) => {
        return get().leads.filter((l) => l.showName === showName);
      },

      searchLeads: (query) => {
        if (!query.trim()) return get().leads;
        const q = query.toLowerCase();
        return get().leads.filter(
          (l) =>
            l.name.toLowerCase().includes(q) ||
            l.company.toLowerCase().includes(q) ||
            l.email.toLowerCase().includes(q) ||
            l.title.toLowerCase().includes(q)
        );
      },
    }),
    {
      name: "leadsnap-store",
      storage: createJSONStorage(() => localStorage),
      // Only persist session + stripped leads (no base64 images in localStorage)
      partialize: (state) => ({
        session: state.session,
        leads: state.leads.map((l) => stripImages(l)),
      }),
    }
  )
);
