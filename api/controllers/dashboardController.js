import { getDashboardStatistics } from "../services/dashboardService.js";

const getDashboardStatisticsController = async (req, res, next) => {
  try {
    const statistics = await getDashboardStatistics();

    res.status(200).json({
      status: "success",
      data: {
        statistics,
      },
    });
  } catch (error) {
    next(error);
  }
};

export { getDashboardStatisticsController };
