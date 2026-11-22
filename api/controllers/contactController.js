import {
  createContactInquiry,
  getAdminContactInquiries,
  getAdminContactInquiryById,
  updateContactInquiryStatus,
} from "../services/contactService.js";
import { contactInquirySchema } from "../validators/contactValidator.js";

const createContactInquiryController = async (req, res) => {
  try {
    const validation = contactInquirySchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        status: "error",
        message: "Please check your inquiry information.",
        errors: validation.error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        })),
      });
    }

    const inquiry = await createContactInquiry(validation.data);

    return res.status(201).json({
      status: "success",
      message: "Your inquiry has been submitted successfully.",
      data: {
        inquiry,
      },
    });
  } catch (error) {
    console.error("Create contact inquiry error:", error);

    return res.status(500).json({
      status: "error",
      message: "Failed to submit your inquiry. Please try again later.",
    });
  }
};

const getAdminContactInquiriesController = async (req, res) => {
  try {
    const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);

    const limit = Math.min(
      100,
      Math.max(1, Number.parseInt(req.query.limit, 10) || 10),
    );

    const search =
      typeof req.query.search === "string" ? req.query.search.trim() : "";

    const status =
      typeof req.query.status === "string" ? req.query.status.trim() : "";

    const inquiry_type =
      typeof req.query.inquiry_type === "string"
        ? req.query.inquiry_type.trim()
        : "";

    const allowedStatuses = ["pending", "in_progress", "resolved", "closed"];

    if (status && !allowedStatuses.includes(status)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid inquiry status.",
      });
    }

    const result = await getAdminContactInquiries({
      page,
      limit,
      search,
      status,
      inquiry_type,
    });

    return res.status(200).json({
      status: "success",
      data: result,
    });
  } catch (error) {
    console.error("Get admin contact inquiries error:", error);

    return res.status(500).json({
      status: "error",
      message: "Failed to retrieve contact inquiries.",
    });
  }
};

const getAdminContactInquiryByIdController = async (req, res) => {
  try {
    const { id } = req.params;

    const inquiry = await getAdminContactInquiryById(id);

    if (!inquiry) {
      return res.status(404).json({
        status: "error",
        message: "Contact inquiry not found.",
      });
    }

    return res.status(200).json({
      status: "success",
      data: {
        inquiry,
      },
    });
  } catch (error) {
    console.error("Get admin contact inquiry details error:", error);

    return res.status(500).json({
      status: "error",
      message: "Failed to retrieve contact inquiry details.",
    });
  }
};

const updateContactInquiryStatusController = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowedStatuses = ["pending", "in_progress", "resolved", "closed"];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid inquiry status.",
      });
    }

    const inquiry = await updateContactInquiryStatus(id, status);

    if (!inquiry) {
      return res.status(404).json({
        status: "error",
        message: "Contact inquiry not found.",
      });
    }

    return res.status(200).json({
      status: "success",
      message: "Contact inquiry status updated successfully.",
      data: {
        inquiry,
      },
    });
  } catch (error) {
    console.error("Update contact inquiry status error:", error);

    return res.status(500).json({
      status: "error",
      message: "Failed to update contact inquiry status.",
    });
  }
};

export {
  createContactInquiryController,
  getAdminContactInquiriesController,
  getAdminContactInquiryByIdController,
  updateContactInquiryStatusController,
};
