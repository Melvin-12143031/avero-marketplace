export const exportCustomersToCSV = (customers) => {
  const headers = [
    "Customer Name",
    "Email",
    "Registration Date",
    "Account Status",
    "Total Orders",
    "Total Spent (PHP)",
  ];

  const escapeCSVValue = (value) => {
    const stringValue = String(value ?? "");
    return `"${stringValue.replace(/"/g, '""')}"`;
  };

  const rows = customers.map((customer) => [
    customer.full_name,
    customer.email,
    new Date(customer.created_at).toLocaleDateString("en-PH"),
    customer.is_active ? "Active" : "Deactivated",
    customer.total_orders,
    Number(customer.total_spent).toFixed(2),
  ]);

  const csvContent = [
    headers.map(escapeCSVValue).join(","),
    ...rows.map((row) => row.map(escapeCSVValue).join(",")),
  ].join("\r\n");

  const blob = new Blob(["\uFEFF", csvContent], {
    type: "text/csv;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = `customers-${new Date().toISOString().slice(0, 10)}.csv`;

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
};
