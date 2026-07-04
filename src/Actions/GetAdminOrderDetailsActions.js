import { URL_ADMIN_GET_ORDER_DETAILS } from '../Config/UrlsConfig';

export const GetAllOrderDetailsAction = async ({
  page = 1,
  limit = 50,
  status,
  startdate,
  enddate,
  search,
} = {}) => {
  try {
    const queryParams = new URLSearchParams();

    queryParams.set('page', page);
    queryParams.set('limit', limit);

    if (status) queryParams.set('status', status);
    if (startdate) queryParams.set('startdate', startdate);
    if (enddate) queryParams.set('enddate', enddate);
    if (search) queryParams.set('search', search);

    const response = await fetch(
      `${URL_ADMIN_GET_ORDER_DETAILS}?${queryParams.toString()}`
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch orders (${response.status})`);
    }

    const data = await response.json();

    if (!data) {
      throw new Error('Invalid response received from server.');
    }

    return data;
  } catch (error) {
    console.error('GetAllOrderDetailsAction:', error);
    throw error;
  }
};