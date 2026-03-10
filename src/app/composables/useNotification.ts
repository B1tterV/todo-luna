import { toast } from 'vue3-toastify'
import 'vue3-toastify/dist/index.css';

export const useNotification = () => {
  const error = (data: { message?: string; caption?: string }) => {
    toast.error(data.message)
  }

  const success = (data: { message?: string; caption?: string }) => {
    toast.success(data.message)
  }

  const warning = (data: { message?: string; caption?: string }) => {
    toast.warning(data.message)
  }

  const information = (data: { message?: string; caption?: string }) => {
    toast.info(data.message)
  }

  return { error, success, warning, information }
}