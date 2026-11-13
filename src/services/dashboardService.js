import { apiRequest } from "./api";

const getDashboardStatistics = async () => {
  const response = await apiRequest("/dashboard/statistics");

  return response.data.statistics;
};

export { getDashboardStatistics };
