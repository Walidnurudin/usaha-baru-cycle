const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

export async function fetchProducts(category?: string, search?: string) {
  const params = new URLSearchParams();
  if (category && category !== 'all') params.append('category', category);
  if (search) params.append('search', search);

  const res = await fetch(`${API_BASE_URL}/products?${params.toString()}`, {
    cache: 'no-store',
  });
  if (!res.ok) throw new Error('Gagal memuat produk katalog');
  return res.json();
}

export async function fetchCategories() {
  const res = await fetch(`${API_BASE_URL}/products/categories`, {
    cache: 'no-store',
  });
  if (!res.ok) throw new Error('Gagal memuat kategori');
  return res.json();
}

export async function logVisit() {
  try {
    const res = await fetch(`${API_BASE_URL}/analytics/visit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    return res.json();
  } catch (err) {
    console.error('Visitor logging failed:', err);
  }
}

export async function submitOrder(orderData: {
  customerName: string;
  customerWa: string;
  productName: string;
  totalAmount: number;
  notes?: string;
}) {
  const res = await fetch(`${API_BASE_URL}/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(orderData),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || 'Gagal mengirim pesanan/inquiry');
  }
  return res.json();
}

export async function loginAdmin(credentials: { email: string; password: string }) {
  const res = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Login gagal');
  }
  return data;
}

export async function getDashboardStats(token: string) {
  const res = await fetch(`${API_BASE_URL}/analytics/stats`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: 'no-store',
  });
  if (!res.ok) throw new Error('Gagal memuat statistik dashboard');
  return res.json();
}

export async function fetchAdminOrders(token: string, query?: { status?: string; startDate?: string; endDate?: string; search?: string }) {
  const params = new URLSearchParams();
  if (query?.status) params.append('status', query.status);
  if (query?.startDate) params.append('startDate', query.startDate);
  if (query?.endDate) params.append('endDate', query.endDate);
  if (query?.search) params.append('search', query.search);

  const res = await fetch(`${API_BASE_URL}/orders?${params.toString()}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
  if (!res.ok) throw new Error('Gagal memuat data pesanan');
  return res.json();
}

export async function updateOrderStatus(token: string, id: string, status: string) {
  const res = await fetch(`${API_BASE_URL}/orders/${id}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error('Gagal memperbarui status');
  return res.json();
}

export async function createProduct(token: string, product: any) {
  const res = await fetch(`${API_BASE_URL}/products`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(product),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || 'Gagal menambahkan produk');
  }
  return res.json();
}

export async function updateProduct(token: string, id: string, product: any) {
  const res = await fetch(`${API_BASE_URL}/products/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(product),
  });
  if (!res.ok) throw new Error('Gagal memperbarui produk');
  return res.json();
}

export async function deleteProduct(token: string, id: string) {
  const res = await fetch(`${API_BASE_URL}/products/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Gagal menghapus produk');
  return res.json();
}

export async function uploadImage(token: string, file: File) {
  const formData = new FormData();
  formData.append('image', file);

  const res = await fetch(`${API_BASE_URL}/upload`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Gagal mengunggah gambar');
  return data.data.url;
}

export async function downloadSalesReportPdf(token: string, startDate?: string, endDate?: string) {
  const params = new URLSearchParams();
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);

  const res = await fetch(`${API_BASE_URL}/orders/report?${params.toString()}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) throw new Error('Gagal mengunduh laporan penjualan PDF');

  const blob = await res.blob();
  const downloadUrl = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = downloadUrl;
  a.download = `Laporan_Penjualan_UsahaBaruCycle_${startDate || 'Awal'}_sd_${endDate || 'Sekarang'}.pdf`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(downloadUrl);
}
