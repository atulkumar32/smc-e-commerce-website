import { URL_DASHBOARD_STATS } from '../Config/UrlsConfig';

export const fetchDashboardStatsAction = async () => {
  const response = await fetch(URL_DASHBOARD_STATS, { method: 'GET' });
  const text = await response.text();
  const data = text ? JSON.parse(text) : {};

  if (!response.ok || data.status === false) {
    throw new Error(data.message || 'Failed to load dashboard stats');
  }

  return data.data; // { totalProductCount, totalPublishedProducts, totalCategories, ... }
};
