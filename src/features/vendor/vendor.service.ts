export const fetchVendors = async (): Promise<any[]> => {
  const res = await fetch('/api/vendors');
  if (!res.ok) throw new Error('Failed to fetch vendors');
  return res.json();
};

export const fetchVendorById = async (id: number): Promise<any> => {
  const res = await fetch(`/api/public/vendor/${id}`);
  if (!res.ok) throw new Error('Failed to fetch vendor');
  return res.json();
};

export const fetchVendorProducts = async (id: number): Promise<any[]> => {
  const res = await fetch(`/api/vendor/${id}/products`);
  if (!res.ok) throw new Error('Failed to fetch vendor products');
  return res.json();
};
