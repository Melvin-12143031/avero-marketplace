import {
  getAllCustomers,
  getCustomerById,
  getCustomerOrders,
  getCustomerActivity,
  deactivateCustomer,
  reactivateCustomer,
} from "../services/customerService.js";

const getAllCustomersController = async (req, res) => {
  try {
    const isExport = req.query.export === "true";

    const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);

    const limit = isExport
      ? null
      : Math.min(100, Math.max(1, Number.parseInt(req.query.limit, 10) || 10));

    const search = (req.query.search || "").trim();
    const status = req.query.status || "all";
    const sort = req.query.sort || "newest";

    const allowedStatuses = ["all", "active", "deactivated"];

    const allowedSortOptions = [
      "newest",
      "oldest",
      "name_asc",
      "name_desc",
      "spent_desc",
      "orders_desc",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid customer status filter.",
      });
    }

    if (!allowedSortOptions.includes(sort)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid customer sort option.",
      });
    }

    const { customers, totalCustomers } = await getAllCustomers({
      page,
      limit,
      search,
      status,
      sort,
    });

    return res.status(200).json({
      status: "success",
      results: customers.length,
      pagination: {
        totalCustomers,
        currentPage: page,
        totalPages: isExport ? 1 : Math.ceil(totalCustomers / limit),
        limit,
      },
      data: {
        customers,
      },
    });
  } catch (error) {
    console.error("Get all customers error:", error);

    return res.status(500).json({
      status: "error",
      message: "Failed to retrieve customers.",
    });
  }
};

const getCustomerByIdController = async (req, res) => {
  try {
    const customer = await getCustomerById(req.params.id);

    if (!customer) {
      return res.status(404).json({
        status: "error",
        message: "Customer not found.",
      });
    }

    return res.status(200).json({
      status: "success",
      data: {
        customer,
      },
    });
  } catch (error) {
    console.error("Get customer details error:", error);

    return res.status(500).json({
      status: "error",
      message: "Failed to retrieve customer details.",
    });
  }
};

const getCustomerOrdersController = async (req, res) => {
  try {
    const customerId = req.params.id;

    const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
    const limit = Math.max(1, Number.parseInt(req.query.limit, 10) || 10);

    const customer = await getCustomerById(customerId);

    if (!customer) {
      return res.status(404).json({
        status: "error",
        message: "Customer not found.",
      });
    }

    const { orders, totalOrders } = await getCustomerOrders(customerId, {
      page,
      limit,
    });

    return res.status(200).json({
      status: "success",
      results: orders.length,
      pagination: {
        totalOrders,
        currentPage: page,
        totalPages: Math.ceil(totalOrders / limit),
        limit,
      },
      data: {
        orders,
      },
    });
  } catch (error) {
    console.error("Get customer orders error:", error);

    return res.status(500).json({
      status: "error",
      message: "Failed to retrieve customer orders.",
    });
  }
};

const getCustomerActivityController = async (req, res) => {
  try {
    const customerId = req.params.id;

    const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
    const limit = Math.min(
      100,
      Math.max(1, Number.parseInt(req.query.limit, 10) || 10),
    );

    const customer = await getCustomerById(customerId);

    if (!customer) {
      return res.status(404).json({
        status: "error",
        message: "Customer not found.",
      });
    }

    const { activities, totalActivities } = await getCustomerActivity(
      customerId,
      {
        page,
        limit,
      },
    );

    return res.status(200).json({
      status: "success",
      results: activities.length,
      pagination: {
        totalActivities,
        currentPage: page,
        totalPages: Math.ceil(totalActivities / limit),
        limit,
      },
      data: {
        activities,
      },
    });
  } catch (error) {
    console.error("Get customer activity error:", error);

    return res.status(500).json({
      status: "error",
      message: "Failed to retrieve customer activity.",
    });
  }
};

const deactivateCustomerController = async (req, res) => {
  try {
    const customer = await deactivateCustomer(req.params.id, req.user.id);

    if (!customer) {
      return res.status(404).json({
        status: "error",
        message: "Customer not found.",
      });
    }

    return res.status(200).json({
      status: "success",
      message: "Customer account deactivated successfully.",
      data: {
        customer,
      },
    });
  } catch (error) {
    console.error("Deactivate customer error:", error);

    return res.status(500).json({
      status: "error",
      message: "Failed to deactivate customer account.",
    });
  }
};

const reactivateCustomerController = async (req, res) => {
  try {
    const customer = await reactivateCustomer(req.params.id, req.user.id);

    if (!customer) {
      return res.status(404).json({
        status: "error",
        message: "Customer not found.",
      });
    }

    return res.status(200).json({
      status: "success",
      message: "Customer account reactivated successfully.",
      data: {
        customer,
      },
    });
  } catch (error) {
    console.error("Reactivate customer error:", error);

    return res.status(500).json({
      status: "error",
      message: "Failed to reactivate customer account.",
    });
  }
};

export {
  getAllCustomersController,
  getCustomerByIdController,
  getCustomerOrdersController,
  getCustomerActivityController,
  deactivateCustomerController,
  reactivateCustomerController,
};
