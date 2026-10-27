/**
 * Under ['summary'] on purpose: every mutation that invalidates the summary (entries, daily budget,
 * profile) refreshes the widgets too.
 */
export const WIDGET_SUMMARY_KEY = ['summary', 'widget'] as const;
