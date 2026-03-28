export const formatCurrency = (amount) => `Rs ${Number(amount || 0)}`;

export const formatDateTime = (value) => new Date(value).toLocaleString();
