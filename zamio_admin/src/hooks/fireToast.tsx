import toast from 'react-hot-toast';

type ToastType = 'success' | 'error' | 'warning' | 'info';

export const fireToast = (message: string, type: ToastType = 'info') => {
  switch (type) {
    case 'success':
      toast.success(message, {
        duration: 4000,
        position: 'top-right',
        style: {
          background: '#10B981',
          color: '#fff',
        },
      });
      break;
    case 'error':
      toast.error(message, {
        duration: 5000,
        position: 'top-right',
        style: {
          background: '#EF4444',
          color: '#fff',
        },
      });
      break;
    case 'warning':
      toast(message, {
        duration: 4000,
        position: 'top-right',
        icon: '⚠️',
        style: {
          background: '#F59E0B',
          color: '#fff',
        },
      });
      break;
    case 'info':
    default:
      toast(message, {
        duration: 3000,
        position: 'top-right',
        icon: 'ℹ️',
        style: {
          background: '#3B82F6',
          color: '#fff',
        },
      });
      break;
  }
};

export default fireToast;
  