import { toast } from 'react-toastify';

export function showSuccess(message) {
  if (message) toast.success(message);
}

export function showError(message) {
  if (message) toast.error(message);
}

/** Show toast from API body: { status: true/false, message: "..." } */
export function notifyFromApiResponse(result, fallbackSuccess = 'Success') {
  const isSuccess =
    result?.success === true ||
    result?.status === true ||
    result?.status === 'true';

  const isFailure =
    result?.success === false ||
    result?.status === false ||
    result?.status === 'false';

  const message = result?.message;

  if (isFailure) {
    showError(message || 'Request failed');
    return false;
  }

  if (isSuccess) {
    showSuccess(message || fallbackSuccess);
    return true;
  }

  if (message) {
    showSuccess(message);
    return true;
  }

  return true;
}

export function notifyError(error, fallback = 'Something went wrong') {
  showError(error?.message || fallback);
}
