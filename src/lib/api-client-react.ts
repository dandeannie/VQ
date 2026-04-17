// Stub for the removed API client

export const useListLeads = () => ({ data: [], isLoading: false });
export const useCreateLead = () => ({ mutate: () => {}, isPending: false });
export const getListLeadsQueryKey = () => ["leads"];
export const ListLeadsBucket = { HOT: "HOT", WARM: "WARM", COLD: "COLD" };

export const useGetLead = () => ({ data: null, isLoading: false });
export const useRetryLead = () => ({ mutate: () => {}, isPending: false });
export const getGetLeadQueryKey = () => ["lead"];
export const useGetCall = () => ({ data: null, isLoading: false });

export const useGetAnalyticsOverview = () => ({ data: { totalLeads: 0, callsInitiated: 0, hotLeads: 0, conversionRate: 0 }, isLoading: false });
export const useGetAnalyticsFunnel = () => ({ data: [], isLoading: false });
export const useGetAnalyticsDaily = () => ({ data: [], isLoading: false });
export const useGetAnalyticsSources = () => ({ data: [], isLoading: false });

export const useGetConfig = () => ({ data: null, isLoading: false });
export const useUpdateConfig = () => ({ mutate: () => {}, isPending: false });
export const getGetConfigQueryKey = () => ["config"];
export const useCallWebhook = () => ({ mutate: () => {}, isPending: false });
