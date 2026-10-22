import { useEffect, useState, useMemo } from 'react';
import { auditService } from '../../services/audit.service';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Skeleton, { TableRowSkeleton } from '../../components/common/Skeleton';
import EmptyState from '../../components/common/EmptyState';
import {
  ClipboardList,
  BarChart3,
  ShieldCheck,
  Search,
  Filter,
  RefreshCw,
  Lock,
  Calendar,
  User,
  ShieldAlert
} from 'lucide-react';

const SIDEBAR_LINKS = [
  { to: '/admin/dashboard', label: 'Dashboard Overview', icon: BarChart3 },
  { to: '/admin/doctors', label: 'Doctor Verification', icon: ShieldCheck },
  { to: '/admin/audit', label: 'Security Audit Logs', icon: ClipboardList },
];

function formatDate(dt) {
  return dt
    ? new Date(dt).toLocaleString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })
    : '—';
}

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');

  const fetchLogs = () => {
    setLoading(true);
    auditService
      .getLogs({ limit: 100 })
      .then(({ data }) => setLogs(data.data || []))
      .catch(() => setLogs([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const matchSearch =
        !searchQuery ||
        log.action?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.resourceType?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.ipAddress?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.actorRole?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchRole =
        roleFilter === 'ALL' ||
        (log.actorRole || log.actor_role)?.toUpperCase() === roleFilter;

      return matchSearch && matchRole;
    });
  }, [logs, searchQuery, roleFilter]);

  return (
    <DashboardLayout sidebarLinks={SIDEBAR_LINKS}>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                DISHA & HIPAA Audit Logs
              </h1>
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                Immutable Trail
              </span>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              Cryptographically timestamped compliance ledger tracking every protected clinical and administrative mutation.
            </p>
          </div>

          <Button
            variant="secondary"
            size="sm"
            onClick={fetchLogs}
            className="gap-2 text-xs font-semibold self-start sm:self-auto"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Refresh Trail</span>
          </Button>
        </div>

        {/* Filter bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-card">
          <div className="relative flex items-center flex-1 max-w-md">
            <Search className="absolute left-3.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search action, resource, or IP address…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9.5 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
            />
          </div>

          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs">
            <Filter className="h-3.5 w-3.5 text-slate-400" />
            <span className="text-slate-500 font-medium">Actor Role:</span>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="bg-transparent text-slate-800 font-semibold focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Roles</option>
              <option value="ADMIN">ADMIN</option>
              <option value="DOCTOR">DOCTOR</option>
              <option value="PATIENT">PATIENT</option>
              <option value="SYSTEM">SYSTEM</option>
            </select>
          </div>
        </div>

        {/* Table Card */}
        {loading ? (
          <Card className="p-6">
            <Skeleton className="h-8 w-48 mb-4" />
            <div className="space-y-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          </Card>
        ) : filteredLogs.length === 0 ? (
          <EmptyState
            icon={ClipboardList}
            title="No Audit Records Found"
            description={
              searchQuery || roleFilter !== 'ALL'
                ? 'No compliance events match your current filter query.'
                : 'Security audit events will be recorded automatically as API endpoints are accessed.'
            }
          />
        ) : (
          <Card className="overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h2 className="text-sm font-bold text-slate-900">
                Audited System Operations ({filteredLogs.length})
              </h2>
              <span className="text-xs text-slate-400 font-medium">Auto-recorded with correlation trace</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-4">Action Event</th>
                    <th className="py-3 px-4">Resource Target</th>
                    <th className="py-3 px-4">Actor Role</th>
                    <th className="py-3 px-4">Execution Status</th>
                    <th className="py-3 px-4">IP / Origin</th>
                    <th className="py-3 px-4 text-right">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {filteredLogs.map((log) => {
                    const role = log.actorRole || log.actor_role || 'SYSTEM';
                    const isSuccess = log.status === 'SUCCESS';

                    return (
                      <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4 font-mono font-semibold text-slate-800">
                          {log.action}
                        </td>
                        <td className="py-3 px-4 text-slate-600">
                          <span className="inline-block px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium text-[11px]">
                            {log.resourceType || log.resource_type || 'SYSTEM'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <Badge
                            variant={
                              role === 'ADMIN'
                                ? 'indigo'
                                : role === 'DOCTOR'
                                ? 'teal'
                                : role === 'PATIENT'
                                ? 'emerald'
                                : 'gray'
                            }
                          >
                            {role}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant={isSuccess ? 'emerald' : 'rose'} withDot>
                            {log.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                          {log.ipAddress || log.ip_address || '127.0.0.1'}
                        </td>
                        <td className="py-3 px-4 text-right text-slate-400 font-mono text-[11px]">
                          {formatDate(log.createdAt || log.created_at)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
