import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import { formatPrice } from "./orderService";

pdfMake.addVirtualFileSystem(pdfFonts);

const getPaymentMethodLabel = (method) => {
  const methods = {
    cash_on_delivery: "Cash on Delivery",
    gcash: "GCash",
    card: "Credit / Debit Card",
  };

  return methods[method] || "Not specified";
};

const formatInvoiceDate = (date) => {
  if (!date) return "—";

  return new Date(date).toLocaleDateString("en-PH", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const getShippingAddress = (address = {}) => {
  return [address.address, address.city, address.province, address.postalCode]
    .filter(Boolean)
    .join(", ");
};

export const generateInvoice = (order) => {
  const payment = order.payment || null;
  const customer = order.customer || {};
  const shippingAddress = order.shippingAddress || {};

  const items = order.items || [];

  const subtotal = Number(order.subtotal || 0);
  const shippingFee = Number(order.shippingFee || 0);
  const total = Number(order.total || 0);

  const productRows = items.map((item) => {
    const quantity = Number(item.quantity || 0);
    const price = Number(item.price ?? item.unit_price ?? 0);
    const itemTotal = price * quantity;

    return [
      {
        text: item.name || item.product_name || "Product",
        style: "tableCell",
      },
      {
        text: String(quantity),
        style: "tableCell",
        alignment: "center",
      },
      {
        text: formatPrice(price),
        style: "tableCell",
        alignment: "right",
      },
      {
        text: formatPrice(itemTotal),
        style: "tableCellBold",
        alignment: "right",
      },
    ];
  });

  const documentDefinition = {
    pageSize: "A4",

    pageMargins: [40, 45, 40, 60],

    info: {
      title: `Invoice ${order.orderNumber || order.id}`,
      author: "Marketplace",
      subject: "Customer Order Invoice",
    },

    defaultStyle: {
      font: "Roboto",
      fontSize: 9,
      color: "#334155",
    },

    content: [
      // Invoice Header
      {
        columns: [
          {
            width: "*",
            stack: [
              {
                text: "MARKETPLACE",
                style: "brand",
              },
              {
                text: "Your trusted online shopping destination",
                style: "brandSubtitle",
              },
            ],
          },
          {
            width: "auto",
            stack: [
              {
                text: "INVOICE",
                style: "invoiceTitle",
                alignment: "right",
              },
              {
                text: "OFFICIAL ORDER RECEIPT",
                style: "invoiceSubtitle",
                alignment: "right",
              },
            ],
          },
        ],
      },

      {
        canvas: [
          {
            type: "line",
            x1: 0,
            y1: 0,
            x2: 515,
            y2: 0,
            lineWidth: 1,
            lineColor: "#E2E8F0",
          },
        ],
        margin: [0, 15, 0, 18],
      },

      // Order Details
      {
        columns: [
          {
            width: "*",
            stack: [
              {
                text: "ORDER NUMBER",
                style: "sectionLabel",
              },
              {
                text: order.orderNumber || order.id || "—",
                style: "orderValue",
              },
            ],
          },
          {
            width: "*",
            stack: [
              {
                text: "INVOICE DATE",
                style: "sectionLabel",
              },
              {
                text: formatInvoiceDate(order.createdAt),
                style: "orderValue",
              },
            ],
          },
          {
            width: "*",
            stack: [
              {
                text: "ORDER STATUS",
                style: "sectionLabel",
              },
              {
                text: order.status || "Pending",
                style: "orderValue",
              },
            ],
          },
        ],
        margin: [0, 0, 0, 22],
      },

      // Customer and Shipping Information
      {
        columns: [
          {
            width: "*",
            stack: [
              {
                text: "BILL TO",
                style: "sectionTitle",
              },
              {
                text: customer.fullName || "Customer",
                style: "detailBold",
              },
              {
                text: customer.email || "—",
                style: "detail",
              },
              {
                text: customer.phone || "—",
                style: "detail",
              },
            ],
          },
          {
            width: "*",
            stack: [
              {
                text: "SHIP TO",
                style: "sectionTitle",
              },
              {
                text: getShippingAddress(shippingAddress) || "—",
                style: "detail",
              },
            ],
          },
        ],
        columnGap: 35,
        margin: [0, 0, 0, 22],
      },

      // Payment Information
      {
        table: {
          widths: ["*", "*", "*"],
          body: [
            [
              {
                text: "PAYMENT METHOD",
                style: "paymentHeader",
              },
              {
                text: "PAYMENT STATUS",
                style: "paymentHeader",
              },
              {
                text: "PAYMENT REFERENCE",
                style: "paymentHeader",
              },
            ],
            [
              {
                text: getPaymentMethodLabel(payment?.paymentMethod),
                style: "paymentValue",
              },
              {
                text: payment?.status || "Not available",
                style: "paymentValue",
              },
              {
                text: payment?.paymentReference || "—",
                style: "paymentValue",
              },
            ],
          ],
        },
        layout: {
          hLineWidth: () => 0,
          vLineWidth: () => 0,
          paddingLeft: () => 10,
          paddingRight: () => 10,
          paddingTop: () => 8,
          paddingBottom: () => 8,
          fillColor: (rowIndex) => (rowIndex === 0 ? "#F1F5F9" : "#F8FAFC"),
        },
        margin: [0, 0, 0, 25],
      },

      // Products Section
      {
        text: "ORDER ITEMS",
        style: "sectionTitle",
        margin: [0, 0, 0, 10],
      },

      {
        table: {
          headerRows: 1,
          keepWithHeaderRows: 1,
          dontBreakRows: true,

          widths: ["*", 40, 90, 95],

          body: [
            [
              {
                text: "PRODUCT",
                style: "tableHeader",
              },
              {
                text: "QTY",
                style: "tableHeader",
                alignment: "center",
              },
              {
                text: "UNIT PRICE",
                style: "tableHeader",
                alignment: "right",
              },
              {
                text: "TOTAL",
                style: "tableHeader",
                alignment: "right",
              },
            ],

            ...productRows,
          ],
        },

        layout: {
          hLineWidth: (i) => (i === 1 ? 1 : 0.5),
          hLineColor: () => "#E2E8F0",
          vLineWidth: () => 0,
          paddingLeft: () => 8,
          paddingRight: () => 8,
          paddingTop: () => 10,
          paddingBottom: () => 10,
        },
      },

      // Financial Summary
      {
        columns: [
          {
            width: "*",
            text: "",
          },
          {
            width: 220,
            table: {
              widths: ["*", 95],
              body: [
                [
                  {
                    text: "Subtotal",
                    style: "summaryLabel",
                  },
                  {
                    text: formatPrice(subtotal),
                    style: "summaryValue",
                    alignment: "right",
                  },
                ],
                [
                  {
                    text: "Shipping Fee",
                    style: "summaryLabel",
                  },
                  {
                    text: formatPrice(shippingFee),
                    style: "summaryValue",
                    alignment: "right",
                  },
                ],
                [
                  {
                    text: "GRAND TOTAL",
                    style: "grandTotalLabel",
                  },
                  {
                    text: formatPrice(total),
                    style: "grandTotalValue",
                    alignment: "right",
                  },
                ],
              ],
            },
            layout: {
              hLineWidth: (i) => (i === 2 ? 1 : 0),
              hLineColor: () => "#CBD5E1",
              vLineWidth: () => 0,
              paddingLeft: () => 8,
              paddingRight: () => 8,
              paddingTop: () => 10,
              paddingBottom: () => 10,
              fillColor: (rowIndex) => (rowIndex === 2 ? "#EEF2FF" : null),
            },
          },
        ],
        margin: [0, 20, 0, 30],
      },

      // Thank You Message
      {
        canvas: [
          {
            type: "line",
            x1: 0,
            y1: 0,
            x2: 515,
            y2: 0,
            lineWidth: 1,
            lineColor: "#E2E8F0",
          },
        ],
        margin: [0, 0, 0, 15],
      },

      {
        text: "Thank you for shopping with Marketplace!",
        style: "thankYou",
        alignment: "center",
      },

      {
        text: "We appreciate your business.",
        style: "footerMessage",
        alignment: "center",
        margin: [0, 5, 0, 0],
      },
    ],

    // Page Footer
    footer: (currentPage, pageCount) => ({
      columns: [
        {
          text: "MARKETPLACE  |  Electronically Generated Invoice",
          alignment: "left",
        },
        {
          text: `Page ${currentPage} of ${pageCount}`,
          alignment: "right",
        },
      ],
      margin: [40, 15, 40, 0],
      fontSize: 8,
      color: "#94A3B8",
    }),

    // Document Styles
    styles: {
      brand: {
        fontSize: 21,
        bold: true,
        color: "#4F46E5",
        characterSpacing: 0.5,
      },

      brandSubtitle: {
        fontSize: 8,
        color: "#64748B",
        margin: [0, 4, 0, 0],
      },

      invoiceTitle: {
        fontSize: 25,
        bold: true,
        color: "#1E293B",
      },

      invoiceSubtitle: {
        fontSize: 7,
        bold: true,
        color: "#64748B",
        margin: [0, 4, 0, 0],
      },

      sectionLabel: {
        fontSize: 7,
        bold: true,
        color: "#94A3B8",
        characterSpacing: 0.5,
        margin: [0, 0, 0, 5],
      },

      orderValue: {
        fontSize: 9,
        bold: true,
        color: "#1E293B",
      },

      sectionTitle: {
        fontSize: 10,
        bold: true,
        color: "#4F46E5",
        characterSpacing: 0.5,
      },

      detailBold: {
        fontSize: 9,
        bold: true,
        color: "#1E293B",
        margin: [0, 3, 0, 3],
      },

      detail: {
        fontSize: 9,
        color: "#475569",
        margin: [0, 3, 0, 3],
      },

      paymentHeader: {
        fontSize: 7,
        bold: true,
        color: "#64748B",
      },

      paymentValue: {
        fontSize: 8,
        bold: true,
        color: "#1E293B",
      },

      tableHeader: {
        fontSize: 8,
        bold: true,
        color: "#FFFFFF",
        fillColor: "#4F46E5",
        margin: [0, 3, 0, 3],
      },

      tableCell: {
        fontSize: 8,
        color: "#475569",
      },

      tableCellBold: {
        fontSize: 8,
        bold: true,
        color: "#1E293B",
      },

      summaryLabel: {
        fontSize: 9,
        color: "#64748B",
      },

      summaryValue: {
        fontSize: 9,
        color: "#334155",
      },

      grandTotalLabel: {
        fontSize: 10,
        bold: true,
        color: "#312E81",
      },

      grandTotalValue: {
        fontSize: 12,
        bold: true,
        color: "#4F46E5",
      },

      thankYou: {
        fontSize: 11,
        bold: true,
        color: "#1E293B",
      },

      footerMessage: {
        fontSize: 8,
        color: "#94A3B8",
      },
    },
  };

  // Open the generated invoice in a new browser tab
  pdfMake.createPdf(documentDefinition).open();
};
