
export interface ComplianceItem {
    id: string; // "9(2) - 1" or name
    name: string;
    value: number; // 0-1
    status: 'Completed' | 'Pending';
    raw?: string | number;
}

export interface Village {
    id: string; // Combined Code + Name or just Name
    name: string;
    district: string;
    headSurveyor: string; // Name of the head surveyor for this village
    governmentSurveyor: string; // Name of the government surveyor
    assistantDirector: string; // Name of the assistant director
    superintendent: string; // Name of the superintendent
    stage: string; // Current stage of the village
    publishedDate: string | null; // 9(2) Published Date (only if stage is 9(2) Published)
    daysPassedAfter92: number | null; // Number of days passed after 9(2) publication
    isCritical: boolean; // True if days >= 90 and stage is 9(2) Published

    // Section 9(2)
    sec92_items: ComplianceItem[];
    sec92_completed_count: number;
    sec92_total_count: number;
    sec92_percent: number; // Avg of items or (completed/total) - Spec says "Village 9(2) compliant ONLY if all 14 items completed". But District % is avg of village completion. 
    // Wait, "District 9(2) % = average of village completion". Does that mean avg of status (0/1) or avg of item %?
    // Usually it implies: Village Score = (Completed Items / Total Items). District Score = Avg of Village Scores.
    // OR Village Status = 1 if all done else 0. 
    // User says: "District 9(2) % = average of village completion".
    // I will calculate Village Completion % as (Sum of Item % / Total Items) ? No, Items are binary-ish.
    // Let's stick to: Item % is provided. 
    // Village 9(2) % = Average of Item Percentages? Or % of Items completed?
    // "Village is 9(2) compliant ONLY if all 14 items are completed" -> This is a status.
    // "District 9(2) % = average of village completion". "Village completion" likely means the Village's average % across items.

    // We will store Average % for the village across all items.
    sec92_status: 'Completed' | 'Pending'; // All items must be >= 90%

    // Section 13
    sec13_items: ComplianceItem[];
    sec13_completed_count: number;
    sec13_total_count: number;
    sec13_percent: number;
    sec13_status: 'Completed' | 'Pending';

    // Overall Compliance
    overall_percent: number; // Average of sec92_percent and sec13_percent
    overall_status: 'Completed' | 'Pending';
}

export interface District {
    name: string;
    villages: Village[];
    total_villages: number;
    avg_92_percent: number;
    avg_13_percent: number;
}
