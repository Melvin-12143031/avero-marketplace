import { apiRequest } from "./api.js";

const submitContactInquiry = async (inquiryData) => {
  const response = await apiRequest("/contact", {
    method: "POST",
    body: JSON.stringify(inquiryData),
  });

  return response.data.inquiry;
};

const getAdminContactInquiries = async (params = {}) => {
  const queryParams = new URLSearchParams(params).toString();

  const response = await apiRequest(`/contact/admin/all?${queryParams}`);

  return response.data;
};

const getAdminContactInquiryById = async (id) => {
  const response = await apiRequest(`/contact/admin/${id}`);

  return response.data.inquiry;
};

const updateContactInquiryStatus = async (id, status) => {
  const response = await apiRequest(`/contact/admin/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });

  return response.data.inquiry;
};

export {
  submitContactInquiry,
  getAdminContactInquiryById,
  updateContactInquiryStatus,
  getAdminContactInquiries,
};
