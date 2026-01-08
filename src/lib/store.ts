

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { District } from './types';

interface DashboardState {
    districts: District[];
    setDistricts: (districts: District[]) => void;

    selectedDistrict: string | null; // District Name or 'All'
    setSelectedDistrict: (name: string | null) => void;

    // Filters
    complianceType: '9(2)' | '13';
    setComplianceType: (type: '9(2)' | '13') => void;

    statusFilter: 'All' | 'Completed' | 'Pending';
    setStatusFilter: (status: 'All' | 'Completed' | 'Pending') => void;

    stageFilter: string | null; // Filter by stage
    setStageFilter: (stage: string | null) => void;

    searchQuery: string;
    setSearchQuery: (query: string) => void;

    currentSheetUrl: string | null;
    setCurrentSheetUrl: (url: string | null) => void;
}

import { STORAGE_KEYS } from './constants';

export const useStore = create<DashboardState>()(
    persist(
        (set) => ({
            districts: [],
            setDistricts: (districts) => set({ districts, selectedDistrict: null }),

            selectedDistrict: null,
            setSelectedDistrict: (name) => set({ selectedDistrict: name }),

            complianceType: '9(2)',
            setComplianceType: (type) => set({ complianceType: type }),

            statusFilter: 'All',
            setStatusFilter: (status) => set({ statusFilter: status }),

            stageFilter: null,
            setStageFilter: (stage) => set({ stageFilter: stage }),

            searchQuery: '',
            setSearchQuery: (query) => set({ searchQuery: query }),

            currentSheetUrl: null,
            setCurrentSheetUrl: (url) => set({ currentSheetUrl: url })
        }),
        {
            name: STORAGE_KEYS.DASHBOARD_STATE,
            partialize: (state: DashboardState) => ({ currentSheetUrl: state.currentSheetUrl }),
        }
    )
);
