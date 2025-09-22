import React, { useState, useEffect, useCallback } from 'react';
import {
  FileText,
  Search,
  Filter,
  Download,
  Eye,
  Calendar,
  User,
  Activity,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { fireToast } from '../../../hooks/fireToast';
import Pagination from '../../../components/Pagination';

interface AuditLogEntry {
  id: string;
  user: {
    user_id: string;
    email: string;
    first_name: string;
    last_name: string;
    user_type: string;
  } | null;
  action: string;
  resource_type: st