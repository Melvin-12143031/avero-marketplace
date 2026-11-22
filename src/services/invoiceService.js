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
      author: "AVÉRO",
      subject: "Customer Order Invoice",
    },

    defaultStyle: {
      font: "Roboto",
      fontSize: 9,
      color: "#6B6258",
    },

    content: [
      // Invoice Header
      {
        columns: [
          {
            width: "*",
            stack: [
              {
                text: "AVÉRO",
                style: "brand",
              },
              {
                text: "Thoughtfully selected. Made for everyday living.",
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
                text: "CUSTOMER ORDER INVOICE",
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
            lineColor: "#E4DCCE",
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
          fillColor: (rowIndex) => (rowIndex === 0 ? "#EDE6D8" : "#FAF8F4"),
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
          hLineColor: () => "#E4DCCE",
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
              hLineColor: () => "#D8CFC1",
              vLineWidth: () => 0,
              paddingLeft: () => 8,
              paddingRight: () => 8,
              paddingTop: (rowIndex) => (rowIndex === 2 ? 12 : 10),
              paddingBottom: (rowIndex) => (rowIndex === 2 ? 12 : 10),
              fillColor: (rowIndex) => (rowIndex === 2 ? "#EDE6D8" : null),
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
            lineColor: "#E4DCCE",
          },
        ],
        margin: [0, 0, 0, 15],
      },

      {
        text: "Thank you for shopping with AVÉRO!",
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
          text: "AVÉRO  |  Electronically Generated Invoice",
          alignment: "left",
        },
        {
          text: `Page ${currentPage} of ${pageCount}`,
          alignment: "right",
        },
      ],
      margin: [40, 15, 40, 0],
      fontSize: 8,
      color: "#8A8176",
    }),

    // Document Styles
    styles: {
      brand: {
        fontSize: 21,
        bold: true,
        color: "#B3261E",
        characterSpacing: 1,
      },

      brandSubtitle: {
        fontSize: 8,
        color: "#6B6258",
        margin: [0, 4, 0, 0],
      },

      invoiceTitle: {
        fontSize: 25,
        bold: true,
        color: "#1C1C1C",
      },

      invoiceSubtitle: {
        fontSize: 7,
        bold: true,
        color: "#8A8176",
        margin: [0, 4, 0, 0],
      },

      sectionLabel: {
        fontSize: 7,
        bold: true,
        color: "#8A8176",
        characterSpacing: 0.5,
        margin: [0, 0, 0, 5],
      },

      orderValue: {
        fontSize: 9,
        bold: true,
        color: "#1C1C1C",
      },

      sectionTitle: {
        fontSize: 10,
        bold: true,
        color: "#B3261E",
        characterSpacing: 0.5,
      },

      detailBold: {
        fontSize: 9,
        bold: true,
        color: "#1C1C1C",
        margin: [0, 3, 0, 3],
      },

      detail: {
        fontSize: 9,
        color: "#6B6258",
        margin: [0, 3, 0, 3],
      },

      paymentHeader: {
        fontSize: 7,
        bold: true,
        color: "#6B6258",
      },

      paymentValue: {
        fontSize: 8,
        bold: true,
        color: "#1C1C1C",
      },

      tableHeader: {
        fontSize: 8,
        bold: true,
        color: "#FFFFFF",
        fillColor: "#B3261E",
        margin: [0, 3, 0, 3],
      },

      tableCell: {
        fontSize: 8,
        color: "#6B6258",
      },

      tableCellBold: {
        fontSize: 8,
        bold: true,
        color: "#1C1C1C",
      },

      summaryLabel: {
        fontSize: 9,
        color: "#6B6258",
      },

      summaryValue: {
        fontSize: 9,
        color: "#1C1C1C",
      },

      grandTotalLabel: {
        fontSize: 10,
        bold: true,
        color: "#1C1C1C",
      },

      grandTotalValue: {
        fontSize: 12,
        bold: true,
        color: "#B3261E",
      },

      thankYou: {
        fontSize: 11,
        bold: true,
        color: "#1C1C1C",
      },

      footerMessage: {
        fontSize: 8,
        color: "#8A8176",
      },
    },
  };

  // Open the generated invoice in a new browser tab
  pdfMake.createPdf(documentDefinition).open();
};
