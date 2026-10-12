import InventoryIcon from '@mui/icons-material/Inventory';
import PublishedWithChangesIcon from '@mui/icons-material/PublishedWithChanges';
import UnpublishedIcon from '@mui/icons-material/Unpublished';
import CategoryIcon from '@mui/icons-material/Category';
import PeopleIcon from '@mui/icons-material/People';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import TodayIcon from '@mui/icons-material/Today';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import PendingIcon from '@mui/icons-material/Pending';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import InfoIcon from '@mui/icons-material/Info';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import RateReviewIcon from '@mui/icons-material/RateReview';

// ── Stat card config ───────────────────────────────────────────────────────────
export const STAT_CARDS = [
  // Products
  {
    key: 'totalProducts',
    label: 'Total Products',
    icon: InventoryIcon,
    color: '#1565c0',
    bg: '#e3f2fd',
  },
  {
    key: 'totalPublishedProducts',
    label: 'Live Products',
    icon: PublishedWithChangesIcon,
    color: '#2e7d32',
    bg: '#e8f5e9',
  },
  {
    key: 'totalDraftProducts',
    label: 'Drafts Products',
    icon: UnpublishedIcon,
    color: '#ed6c02',
    bg: '#fff3e0',
  },
  {
    key: 'totalCategories',
    label: 'Categories',
    icon: CategoryIcon,
    color: '#7b1fa2',
    bg: '#f3e5f5',
  },

  // Customer Reviews & Ratings
  {
    key: 'pendingReviewsCount',
    label: 'New Reviews & Ratings',
    icon: RateReviewIcon,
    color: '#d97706',
    bg: '#fef3c7',
    hasInfo: true,
    tooltip: 'Customer reviews that are inactive and pending activation (Click to open)',
    to: '/admin/reviews?filter=pending',
  },

  // Users
  {
    key: 'totalRegisteredUsers',
    label: 'Total Registered Users',
    icon: PeopleIcon,
    color: '#0288d1',
    bg: '#e1f5fe',
  },
  {
    key: 'totalActiveRegisteredUsers',
    label: 'Active Registered Users',
    icon: PeopleIcon,
    color: '#00695c',
    bg: '#e0f2f1',
    // hasInfo: true,
    tooltip: 'Users who logged in during the last 30 days',
  },
  {
    key: 'totalGuestUsers',
    label: 'Total Guest Users',
    icon: PersonAddIcon,
    color: '#f57c00',
    bg: '#fff3e0',
  },

  // Orders
  {
    key: 'totalOrders',
    label: 'Total Orders',
    icon: ShoppingCartIcon,
    color: '#283593',
    bg: '#e8eaf6',
  },
  {
    key: 'pendingOrders',
    label: 'Pending Orders',
    icon: PendingIcon,
    color: '#ed6c02',
    bg: '#fff3e0',
  },
  {
    key: 'shippedOrders',
    label: 'Shipped Orders',
    icon: LocalShippingIcon,
    color: '#1976d2',
    bg: '#e3f2fd',
  },
  {
    key: 'deliveredOrders',
    label: 'Delivered Orders',
    icon: CheckCircleIcon,
    color: '#2e7d32',
    bg: '#e8f5e9',
  },
  {
    key: 'cancelledOrders',
    label: 'Cancelled Orders',
    icon: CancelIcon,
    color: '#c62828',
    bg: '#ffebee',
  },
  {
    key: 'totalRevenue',
    label: 'Total Revenue',
    icon: AttachMoneyIcon,
    color: '#2e7d32',
    bg: '#e8f5e9',
    isCurrency: true,
  },
];