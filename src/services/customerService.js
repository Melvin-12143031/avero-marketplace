import { apiRequest } from "./api";

export const getAdminCustomers = async ({
  page = 1,
  limit = 10,
  search = "",
  status = "all",
  sort = "newest",
} = {}) => {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    search,
    status,
    sort,
  });

  return apiRequest(`/customers/admin/all?${params.toString()}`);
};

export const exportAdminCustomers = async ({
  search = "",
  status = "all",
  sort = "newest",
} = {}) => {
  const params = new URLSearchParams({
    export: "true",
    search,
    status,
    sort,
  });

  return apiRequest(`/customers/admin/all?${params.toString()}`);
};

export const getAdminCustomerById = async (customerId) => {
  return apiRequest(`/customers/admin/${customerId}`);
};

export const getAdminCustomerOrders = async (
  customerId,
  { page = 1, limit = 10 } = {},
) => {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });

  return apiRequest(
    `/customers/admin/${customerId}/orders?${params.toString()}`,
  );
};

export const getAdminCustomerActivity = async (
  customerId,
  { page = 1, limit = 10 } = {},
) => {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });

  return apiRequest(
    `/customers/admin/${customerId}/activity?${params.toString()}`,
  );
};

export const deactivateCustomer = async (customerId) => {
  return apiRequest(`/customers/admin/${customerId}/deactivate`, {
    method: "PATCH",
  });
};

export const reactivateCustomer = async (customerId) => {
  return apiRequest(`/customers/admin/${customerId}/reactivate`, {
    method: "PATCH",
  });
};
