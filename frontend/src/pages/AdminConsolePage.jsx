import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ShieldCheck, 
  Users, 
  Smartphone, 
  KeyRound, 
  History, 
  Plus, 
  CheckCircle2, 
  XCircle, 
  Database, 
  Lock, 
  Cpu, 
  Layers, 
  Sparkles, 
  Server, 
  Activity, 
  ArrowUpRight, 
  TrendingUp, 
  AlertTriangle, 
  RefreshCw, 
  HardDrive,
  Edit2,
  Trash2,
  UserCheck,
  UserX,
  Power,
  Eye,
  Radio,
  SlidersHorizontal,
  Clock,
  Building2
} from 'lucide-react';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';

// Module 01 Components
import RegisterUserModal from '../modules/AuthAdmin/components/RegisterUserModal';
import RegisterDeviceModal from '../modules/AuthAdmin/components/RegisterDeviceModal';
import EditUserModal from '../modules/AuthAdmin/components/EditUserModal';
import RolesDataTable from '../modules/AuthAdmin/components/RolesDataTable';
import CreateRoleModal from '../modules/AuthAdmin/components/CreateRoleModal';
import CreatePermissionModal from '../modules/AuthAdmin/components/CreatePermissionModal';
import SystemSettingsDashboard from '../modules/AuthAdmin/components/SystemSettingsDashboard';
import ShiftManagementDashboard from '../modules/AuthAdmin/components/ShiftManagementDashboard';
import CreateShiftModal from '../modules/AuthAdmin/components/CreateShiftModal';
import EditShiftModal from '../modules/AuthAdmin/components/EditShiftModal';
import EnterpriseAuditTrailDashboard from '../modules/AuthAdmin/components/EnterpriseAuditTrailDashboard';
import GlobalExecutiveDashboard from '../modules/AuthAdmin/components/GlobalExecutiveDashboard';

// Module 02 Components (Master Data Setup)
import PlantStructureDashboard from '../modules/MasterData/components/PlantStructureDashboard';
import CreateCompanyModal from '../modules/MasterData/components/CreateCompanyModal';
import CreateUnitModal from '../modules/MasterData/components/CreateUnitModal';
import CreateFloorModal from '../modules/MasterData/components/CreateFloorModal';
import CreateLineModal from '../modules/MasterData/components/CreateLineModal';
import BuyerBrandDashboard from '../modules/MasterData/components/BuyerBrandDashboard';
import CreateBuyerModal from '../modules/MasterData/components/CreateBuyerModal';
import CreateBrandModal from '../modules/MasterData/components/CreateBrandModal';
import StyleCatalogDashboard from '../modules/MasterData/components/StyleCatalogDashboard';
import CreateStyleModal from '../modules/MasterData/components/CreateStyleModal';
import OperationBulletinModal from '../modules/MasterData/components/OperationBulletinModal';
import AttributeMatrixDashboard from '../modules/MasterData/components/AttributeMatrixDashboard';
import { 
  CreateColorModal, 
  CreateSizeModal, 
  CreateDefectModal 
} from '../modules/MasterData/components/CreateAttributeModals';

import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';
import { AdminLayout } from '../components/layout/AdminLayout';
import { DataTable } from '../components/common/DataTable';

const API_BASE = 'http://localhost:8000/api/v1';

export default function AdminConsolePage() {
  const navigate = useNavigate();
  const { subRoute } = useParams();
  const { token, isAuthenticated } = useAuthStore();
  const { isDark } = useThemeStore();
  
  const activeTab = subRoute || 'dashboard';

  const handleTabChange = (tabId) => {
    navigate(`/admin/${tabId}`);
  };

  // Module 01 Modals State
  const [showNewUserModal, setShowNewUserModal] = useState(false);
  const [showNewDeviceModal, setShowNewDeviceModal] = useState(false);
  const [showCreateShiftModal, setShowCreateShiftModal] = useState(false);
  const [editingShift, setEditingShift] = useState(null);
  const [shiftFormErrors, setShiftFormErrors] = useState({});

  const [editingUser, setEditingUser] = useState(null);
  const [editFormErrors, setEditFormErrors] = useState({});
  const [savingRoleMatrix, setSavingRoleMatrix] = useState(false);

  // Module 02 Modals State
  const [showCreateCompanyModal, setShowCreateCompanyModal] = useState(false);
  const [showCreateUnitModal, setShowCreateUnitModal] = useState(false);
  const [editingUnit, setEditingUnit] = useState(null);
  const [unitFormErrors, setUnitFormErrors] = useState({});

  const [showCreateFloorModal, setShowCreateFloorModal] = useState(false);
  const [editingFloor, setEditingFloor] = useState(null);
  const [floorFormErrors, setFloorFormErrors] = useState({});

  const [showCreateLineModal, setShowCreateLineModal] = useState(false);
  const [editingLine, setEditingLine] = useState(null);
  const [lineFormErrors, setLineFormErrors] = useState({});

  const [showCreateBuyerModal, setShowCreateBuyerModal] = useState(false);
  const [editingBuyer, setEditingBuyer] = useState(null);
  const [buyerFormErrors, setBuyerFormErrors] = useState({});
  const [targetBuyerForBrand, setTargetBuyerForBrand] = useState(null);

  const [showCreateStyleModal, setShowCreateStyleModal] = useState(false);
  const [editingStyle, setEditingStyle] = useState(null);
  const [styleFormErrors, setStyleFormErrors] = useState({});
  const [viewingObStyle, setViewingObStyle] = useState(null);

  const [showCreateColorModal, setShowCreateColorModal] = useState(false);
  const [showCreateSizeModal, setShowCreateSizeModal] = useState(false);
  const [showCreateDefectModal, setShowCreateDefectModal] = useState(false);
  const [showCreateRoleModal, setShowCreateRoleModal] = useState(false);
  const [showCreatePermissionModal, setShowCreatePermissionModal] = useState(false);

  // Module 01 Lists
  const [usersList, setUsersList] = useState([]);
  const [devicesList, setDevicesList] = useState([]);
  const [rolesList, setRolesList] = useState([]);
  const [allPermissionsList, setAllPermissionsList] = useState([]);
  const [shiftsList, setShiftsList] = useState([]);
  const [auditList, setAuditList] = useState([]);
  const [settingsList, setSettingsList] = useState([]);
  const [settingsForm, setSettingsForm] = useState({});

  // Module 02 Lists
  const [companiesList, setCompaniesList] = useState([]);
  const [unitsList, setUnitsList] = useState([]);
  const [floorsList, setFloorsList] = useState([]);
  const [linesList, setLinesList] = useState([]);
  const [buyersList, setBuyersList] = useState([]);
  const [stylesList, setStylesList] = useState([]);
  const [colorsList, setColorsList] = useState([]);
  const [sizesList, setSizesList] = useState([]);
  const [defectsList, setDefectsList] = useState([]);

  const [fetchLoading, setFetchLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);

  // User form states
  const [newCompanyId, setNewCompanyId] = useState('');
  const [newUnitId, setNewUnitId] = useState('');
  const [newEmpId, setNewEmpId] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newUserName, setNewUserName] = useState('');
  const [newDesignation, setNewDesignation] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('Password123!');
  const [newUserConfirmPassword, setNewUserConfirmPassword] = useState('Password123!');
  const [newUserRole, setNewUserRole] = useState('Line Supervisor');
  const [newUserStatus, setNewUserStatus] = useState(true);
  const [userFormErrors, setUserFormErrors] = useState({});

  // Device form states
  const [newDevName, setNewDevName] = useState('');
  const [newDevCode, setNewDevCode] = useState('');
  const [newDevPin, setNewDevPin] = useState('123456');
  const [newDevLine, setNewDevLine] = useState('Line 01');
  const [deviceFormErrors, setDeviceFormErrors] = useState({});

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    } else {
      fetchAdminData();
    }
  }, [isAuthenticated, token]);

  const fetchAdminData = async () => {
    if (!token) return;
    setFetchLoading(true);
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const [
        uRes, dRes, rRes, aRes, sRes, shRes,
        companiesRes, unitsRes, floorsRes, linesRes,
        buyersRes, stylesRes,
        colorsRes, sizesRes, defectsRes
      ] = await Promise.allSettled([
        // Module 01
        axios.get(`${API_BASE}/admin/users`, config),
        axios.get(`${API_BASE}/admin/devices`, config),
        axios.get(`${API_BASE}/admin/roles`, config),
        axios.get(`${API_BASE}/admin/audit-logs`, config),
        axios.get(`${API_BASE}/admin/settings`, config),
        axios.get(`${API_BASE}/admin/shifts`, config),
        // Module 02
        axios.get(`${API_BASE}/master/companies`, config),
        axios.get(`${API_BASE}/master/units`, config),
        axios.get(`${API_BASE}/master/floors`, config),
        axios.get(`${API_BASE}/master/lines`, config),
        axios.get(`${API_BASE}/master/buyers`, config),
        axios.get(`${API_BASE}/master/styles`, config),
        axios.get(`${API_BASE}/master/colors`, config),
        axios.get(`${API_BASE}/master/sizes`, config),
        axios.get(`${API_BASE}/master/defects`, config),
      ]);

      // Set Module 01
      if (uRes.status === 'fulfilled') setUsersList(uRes.value.data?.data?.data || []);
      if (dRes.status === 'fulfilled') setDevicesList(dRes.value.data?.data || []);
      if (rRes.status === 'fulfilled') {
        setRolesList(rRes.value.data?.data?.roles || []);
        setAllPermissionsList(rRes.value.data?.data?.permissions || []);
      }
      if (aRes.status === 'fulfilled') setAuditList(aRes.value.data?.data?.data || aRes.value.data?.data || []);
      if (shRes.status === 'fulfilled') setShiftsList(shRes.value.data?.data || []);
      if (sRes.status === 'fulfilled') {
        const sData = sRes.value.data?.data || [];
        setSettingsList(sData);
        const initialMap = {};
        sData.forEach(s => { initialMap[s.key] = s.value; });
        setSettingsForm(initialMap);
      }

      // Set Module 02
      if (companiesRes.status === 'fulfilled') setCompaniesList(companiesRes.value.data?.data || []);
      if (unitsRes.status === 'fulfilled') setUnitsList(unitsRes.value.data?.data || []);
      if (floorsRes.status === 'fulfilled') setFloorsList(floorsRes.value.data?.data || []);
      if (linesRes.status === 'fulfilled') setLinesList(linesRes.value.data?.data || []);
      if (buyersRes.status === 'fulfilled') setBuyersList(buyersRes.value.data?.data || []);
      if (stylesRes.status === 'fulfilled') setStylesList(stylesRes.value.data?.data || []);
      if (colorsRes.status === 'fulfilled') setColorsList(colorsRes.value.data?.data || []);
      if (sizesRes.status === 'fulfilled') setSizesList(sizesRes.value.data?.data || []);
      if (defectsRes.status === 'fulfilled') setDefectsList(defectsRes.value.data?.data || []);

    } catch (e) {
      console.error('Error fetching admin data', e);
    } finally {
      setFetchLoading(false);
    }
  };

  // Module 01 Action Handlers
  const handleCreateUser = async (e) => {
    e.preventDefault();
    setUserFormErrors({});
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.post(`${API_BASE}/admin/users`, {
        company_id: newCompanyId || null,
        unit_id: newUnitId || null,
        emp_id: newEmpId,
        username: newUsername ? newUsername.toLowerCase().trim() : null,
        name: newUserName,
        designation: newDesignation || null,
        email: newUserEmail || null,
        password: newUserPassword,
        password_confirmation: newUserConfirmPassword,
        role: newUserRole,
        is_active: newUserStatus
      }, config);

      toast.success('New user account registered and scoped successfully.');
      setShowNewUserModal(false);
      setNewEmpId('');
      setNewUsername('');
      setNewUserName('');
      setNewDesignation('');
      setNewUserEmail('');
      fetchAdminData();
    } catch (err) {
      if (err.response?.status === 422) {
        setUserFormErrors(err.response.data.errors || {});
      } else {
        toast.error('Failed to create user account.');
      }
    }
  };

  const handleUpdateUser = async (formData) => {
    setEditFormErrors({});
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.put(`${API_BASE}/admin/users/${formData.id}`, formData, config);
      toast.success('User updated successfully.');
      setEditingUser(null);
      fetchAdminData();
    } catch (err) {
      if (err.response?.status === 422) {
        setEditFormErrors(err.response.data.errors || {});
      } else {
        toast.error('Failed to update user.');
      }
    }
  };

  const handleToggleUserStatus = async (user) => {
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.put(`${API_BASE}/admin/users/${user.id}`, { is_active: !user.is_active }, config);
      toast.success(`User status changed.`);
      fetchAdminData();
    } catch (err) {
      toast.error('Failed to update user status.');
    }
  };

  const handleDeleteUser = async (user) => {
    if (!window.confirm(`Are you sure you want to delete user ${user.name}?`)) return;
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.delete(`${API_BASE}/admin/users/${user.id}`, config);
      toast.success('User deleted successfully.');
      fetchAdminData();
    } catch (err) {
      toast.error('Failed to delete user.');
    }
  };

  const handleCreateDevice = async (e) => {
    e.preventDefault();
    setDeviceFormErrors({});
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.post(`${API_BASE}/admin/devices`, {
        device_name: newDevName,
        device_code: newDevCode,
        pin: newDevPin,
        line_name: newDevLine,
      }, config);

      toast.success('Tablet device registered.');
      setShowNewDeviceModal(false);
      setNewDevName('');
      setNewDevCode('');
      fetchAdminData();
    } catch (err) {
      if (err.response?.status === 422) {
        setDeviceFormErrors(err.response.data.errors || {});
      } else {
        toast.error('Failed to register tablet.');
      }
    }
  };

  const handleToggleDeviceStatus = async (device) => {
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.put(`${API_BASE}/admin/devices/${device.id}`, { is_active: !device.is_active }, config);
      toast.success('Tablet status updated.');
      fetchAdminData();
    } catch (err) {
      toast.error('Failed to update tablet status.');
    }
  };

  const handleDeleteDevice = async (device) => {
    if (!window.confirm(`Are you sure you want to delete device ${device.device_name}?`)) return;
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.delete(`${API_BASE}/admin/devices/${device.id}`, config);
      toast.success('Device deleted.');
      fetchAdminData();
    } catch (err) {
      toast.error('Failed to delete device.');
    }
  };

  const handleSaveRolePermissions = async ({ roleId, permissions }) => {
    setSavingRoleMatrix(true);
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.put(`${API_BASE}/admin/roles/${roleId}/permissions`, { permissions }, config);
      toast.success('Role permissions updated.');
      fetchAdminData();
    } catch (e) {
      toast.error('Failed to save permissions.');
    } finally {
      setSavingRoleMatrix(false);
    }
  };

  const handleCreateRole = async (data) => {
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.post(`${API_BASE}/admin/roles`, data, config);
      toast.success('Custom security role created.');
      setShowCreateRoleModal(false);
      fetchAdminData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create role.');
    }
  };

  const handleDeleteRole = async (role) => {
    if (!window.confirm(`Are you sure you want to delete role "${role.name}"?`)) return;
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.delete(`${API_BASE}/admin/roles/${role.id}`, config);
      toast.success('Security role deleted.');
      fetchAdminData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete role.');
    }
  };

  const handleCreatePermission = async (data) => {
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.post(`${API_BASE}/admin/permissions`, data, config);
      toast.success('New permission scope added.');
      setShowCreatePermissionModal(false);
      fetchAdminData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create permission.');
    }
  };

  const handleDeletePermission = async (perm) => {
    if (!window.confirm(`Are you sure you want to delete permission "${perm.name}"?`)) return;
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.delete(`${API_BASE}/admin/permissions/${perm.id}`, config);
      toast.success('Permission scope removed.');
      fetchAdminData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete permission.');
    }
  };

  const handleCreateShift = async (data) => {
    setShiftFormErrors({});
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.post(`${API_BASE}/admin/shifts`, data, config);
      toast.success('Shift schedule created.');
      setShowCreateShiftModal(false);
      fetchAdminData();
    } catch (err) {
      if (err.response?.status === 422) {
        setShiftFormErrors(err.response.data.errors || {});
      } else {
        toast.error('Failed to create shift.');
      }
    }
  };

  const handleUpdateShift = async (data) => {
    setShiftFormErrors({});
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.put(`${API_BASE}/admin/shifts/${data.id}`, data, config);
      toast.success('Shift schedule updated.');
      setEditingShift(null);
      fetchAdminData();
    } catch (err) {
      if (err.response?.status === 422) {
        setShiftFormErrors(err.response.data.errors || {});
      } else {
        toast.error('Failed to update shift.');
      }
    }
  };

  const handleToggleShiftStatus = async (shift) => {
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.put(`${API_BASE}/admin/shifts/${shift.id}`, { is_active: !shift.is_active }, config);
      toast.success('Shift status toggled.');
      fetchAdminData();
    } catch (err) {
      toast.error('Failed to toggle shift status.');
    }
  };

  const handleDeleteShift = async (shift) => {
    if (!window.confirm(`Delete shift schedule ${shift.shift_name}?`)) return;
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.delete(`${API_BASE}/admin/shifts/${shift.id}`, config);
      toast.success('Shift schedule deleted.');
      fetchAdminData();
    } catch (err) {
      toast.error('Failed to delete shift.');
    }
  };

  const handleSaveSettings = async () => {
    setSaveLoading(true);
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.post(`${API_BASE}/admin/settings`, { settings: settingsForm }, config);
      toast.success('System settings saved.');
      fetchAdminData();
    } catch (e) {
      toast.error('Failed to save settings.');
    } finally {
      setSaveLoading(false);
    }
  };

  // Module 02 Action Handlers (Master Data Setup)
  const handleSaveCompany = async (data) => {
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.post(`${API_BASE}/master/companies`, data, config);
      toast.success('Group of Companies registered.');
      setShowCreateCompanyModal(false);
      fetchAdminData();
    } catch (err) {
      toast.error('Failed to create Company profile.');
    }
  };

  const handleSaveUnit = async (data) => {
    setUnitFormErrors({});
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      if (data.id) {
        await axios.put(`${API_BASE}/master/units/${data.id}`, data, config);
        toast.success('Factory plant updated.');
      } else {
        await axios.post(`${API_BASE}/master/units`, data, config);
        toast.success('Factory plant registered.');
      }
      setShowCreateUnitModal(false);
      setEditingUnit(null);
      fetchAdminData();
    } catch (err) {
      if (err.response?.status === 422) setUnitFormErrors(err.response.data.errors || {});
      else toast.error('Failed to save factory.');
    }
  };

  const handleDeleteUnit = async (unit) => {
    if (!window.confirm(`Delete Unit ${unit.name}? This will remove all associated floors and lines.`)) return;
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.delete(`${API_BASE}/master/units/${unit.id}`, config);
      toast.success('Manufacturing unit deleted.');
      fetchAdminData();
    } catch (err) {
      toast.error('Failed to delete unit.');
    }
  };

  const handleSaveFloor = async (data) => {
    setFloorFormErrors({});
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      if (data.id) {
        await axios.put(`${API_BASE}/master/floors/${data.id}`, data, config);
        toast.success('Factory floor updated.');
      } else {
        await axios.post(`${API_BASE}/master/floors`, data, config);
        toast.success('Factory floor configured.');
      }
      setShowCreateFloorModal(false);
      setEditingFloor(null);
      fetchAdminData();
    } catch (err) {
      if (err.response?.status === 422) setFloorFormErrors(err.response.data.errors || {});
      else toast.error('Failed to save floor.');
    }
  };

  const handleDeleteFloor = async (floor) => {
    if (!window.confirm(`Delete Floor ${floor.name}?`)) return;
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.delete(`${API_BASE}/master/floors/${floor.id}`, config);
      toast.success('Floor removed.');
      fetchAdminData();
    } catch (err) {
      toast.error('Failed to delete floor.');
    }
  };

  const handleSaveLine = async (data) => {
    setLineFormErrors({});
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      if (data.id) {
        await axios.put(`${API_BASE}/master/lines/${data.id}`, data, config);
        toast.success('Production line updated.');
      } else {
        await axios.post(`${API_BASE}/master/lines`, data, config);
        toast.success('Production line registered.');
      }
      setShowCreateLineModal(false);
      setEditingLine(null);
      fetchAdminData();
    } catch (err) {
      if (err.response?.status === 422) setLineFormErrors(err.response.data.errors || {});
      else toast.error('Failed to save production line.');
    }
  };

  const handleDeleteLine = async (line) => {
    if (!window.confirm(`Delete Production Line ${line.name}?`)) return;
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.delete(`${API_BASE}/master/lines/${line.id}`, config);
      toast.success('Line removed.');
      fetchAdminData();
    } catch (err) {
      toast.error('Failed to delete line.');
    }
  };

  // Buyer & Brand Handlers
  const handleSaveBuyer = async (data) => {
    setBuyerFormErrors({});
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      if (data.id) {
        await axios.put(`${API_BASE}/master/buyers/${data.id}`, data, config);
        toast.success('Buyer profile updated.');
      } else {
        await axios.post(`${API_BASE}/master/buyers`, data, config);
        toast.success('Buyer registered successfully.');
      }
      setShowCreateBuyerModal(false);
      setEditingBuyer(null);
      fetchAdminData();
    } catch (err) {
      if (err.response?.status === 422) setBuyerFormErrors(err.response.data.errors || {});
      else toast.error('Failed to save buyer.');
    }
  };

  const handleDeleteBuyer = async (buyer) => {
    if (!window.confirm(`Delete Buyer ${buyer.name}?`)) return;
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.delete(`${API_BASE}/master/buyers/${buyer.id}`, config);
      toast.success('Buyer removed.');
      fetchAdminData();
    } catch (err) {
      toast.error('Failed to delete buyer.');
    }
  };

  const handleSaveBrand = async (data) => {
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.post(`${API_BASE}/master/brands`, data, config);
      toast.success('Brand label added.');
      setTargetBuyerForBrand(null);
      fetchAdminData();
    } catch (err) {
      toast.error('Failed to create brand.');
    }
  };

  // Style & OB Handlers
  const handleSaveStyle = async (data) => {
    setStyleFormErrors({});
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      if (data.id) {
        await axios.put(`${API_BASE}/master/styles/${data.id}`, data, config);
        toast.success('Garment style updated.');
      } else {
        await axios.post(`${API_BASE}/master/styles`, data, config);
        toast.success('Garment style and OB created.');
      }
      setShowCreateStyleModal(false);
      setEditingStyle(null);
      fetchAdminData();
    } catch (err) {
      if (err.response?.status === 422) setStyleFormErrors(err.response.data.errors || {});
      else toast.error('Failed to save style.');
    }
  };

  const handleDeleteStyle = async (style) => {
    if (!window.confirm(`Delete Style ${style.style_number}?`)) return;
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.delete(`${API_BASE}/master/styles/${style.id}`, config);
      toast.success('Garment style removed.');
      fetchAdminData();
    } catch (err) {
      toast.error('Failed to delete style.');
    }
  };

  const handleAddStyleOperation = async (styleId, opData) => {
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const res = await axios.post(`${API_BASE}/master/styles/${styleId}/operations`, opData, config);
      toast.success('Operation added to bulletin.');
      fetchAdminData();
      // Update active viewing modal
      setViewingObStyle(prev => {
        if (!prev) return null;
        return {
          ...prev,
          operations: [...(prev.operations || []), res.data.data]
        };
      });
    } catch (err) {
      toast.error('Failed to add operation.');
    }
  };

  // Attributes: Color, Size, Defect
  const handleSaveColor = async (data) => {
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.post(`${API_BASE}/master/colors`, data, config);
      toast.success('Colorway shade added.');
      setShowCreateColorModal(false);
      fetchAdminData();
    } catch (err) {
      toast.error('Failed to save color.');
    }
  };

  const handleDeleteColor = async (color) => {
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.delete(`${API_BASE}/master/colors/${color.id}`, config);
      toast.success('Color removed.');
      fetchAdminData();
    } catch (err) {
      toast.error('Failed to delete color.');
    }
  };

  const handleSaveSize = async (data) => {
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.post(`${API_BASE}/master/sizes`, data, config);
      toast.success('Size scale added.');
      setShowCreateSizeModal(false);
      fetchAdminData();
    } catch (err) {
      toast.error('Failed to save size.');
    }
  };

  const handleDeleteSize = async (size) => {
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.delete(`${API_BASE}/master/sizes/${size.id}`, config);
      toast.success('Size removed.');
      fetchAdminData();
    } catch (err) {
      toast.error('Failed to delete size.');
    }
  };

  const handleSaveDefect = async (data) => {
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.post(`${API_BASE}/master/defects`, data, config);
      toast.success('Quality defect code added.');
      setShowCreateDefectModal(false);
      fetchAdminData();
    } catch (err) {
      toast.error('Failed to save defect code.');
    }
  };

  const handleDeleteDefect = async (defect) => {
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.delete(`${API_BASE}/master/defects/${defect.id}`, config);
      toast.success('Defect code removed.');
      fetchAdminData();
    } catch (err) {
      toast.error('Failed to delete defect.');
    }
  };

  // User table columns
  const userColumns = [
    { 
      key: 'emp_id', 
      label: 'Employee ID & Username', 
      sortable: true, 
      render: (row) => (
        <div>
          <span className="font-mono font-bold text-blue-500">{row.emp_id}</span>
          {row.username && (
            <span className="text-[10px] text-slate-400 font-mono block">@{row.username}</span>
          )}
        </div>
      )
    },
    { 
      key: 'name', 
      label: 'Full Name & Designation', 
      sortable: true, 
      render: (row) => (
        <div>
          <div className="font-semibold text-xs">{row.name}</div>
          <div className="text-[10px] text-slate-400 font-mono">{row.designation || 'Staff / Operator'}</div>
        </div>
      )
    },
    {
      key: 'unit',
      label: 'Assigned Plant / Unit Scope',
      render: (row) => {
        if (row.unit) {
          return (
            <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
              {row.unit.name} ({row.unit.code})
            </span>
          );
        }
        return (
          <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            Global / All Units (HQ)
          </span>
        );
      }
    },
    {
      key: 'roles',
      label: 'Designated Role',
      render: (row) => {
        const rName = row.roles?.[0]?.name || 'Standard Operator';
        return (
          <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
            {rName}
          </span>
        );
      }
    },
    {
      key: 'is_active',
      label: 'Security Status',
      render: (row) => (
        <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
          row.is_active 
            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
            : 'bg-red-500/10 text-red-400 border-red-500/20'
        }`}>
          {row.is_active ? 'ACTIVE' : 'DEACTIVATED'}
        </span>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      align: 'right',
      render: (row) => {
        const isSuperAdmin = row.roles?.[0]?.name === 'Super Admin';
        return (
          <div className="flex items-center justify-end space-x-1">
            <button
              type="button"
              onClick={() => handleToggleUserStatus(row)}
              disabled={isSuperAdmin}
              title={row.is_active ? 'Deactivate Operator' : 'Activate Operator'}
              className={`p-1.5 rounded transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed ${
                row.is_active 
                  ? 'hover:bg-amber-500/10 text-slate-400 hover:text-amber-500' 
                  : 'hover:bg-emerald-500/10 text-slate-400 hover:text-emerald-500'
              }`}
            >
              <Power className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setEditingUser(row)}
              title="Edit Operator Role & Info"
              className="p-1.5 rounded hover:bg-blue-500/10 text-slate-400 hover:text-blue-500 transition-colors cursor-pointer"
            >
              <Edit2 className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => handleDeleteUser(row)}
              disabled={isSuperAdmin}
              title="Delete User Account"
              className="p-1.5 rounded hover:bg-red-500/10 text-slate-400 hover:text-red-500 transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        );
      }
    }
  ];

  const handleExportAuditCsv = async (filters = {}) => {
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      if (filters.module && filters.module !== 'ALL') params.append('module', filters.module);
      if (filters.event && filters.event !== 'ALL') params.append('event', filters.event);
      if (filters.search) params.append('search', filters.search);
      if (filters.from_date) params.append('from_date', filters.from_date);
      if (filters.to_date) params.append('to_date', filters.to_date);

      const res = await axios.get(`${API_BASE}/admin/audit-logs/export?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `rmg_audit_trail_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Audit trail exported successfully!');
    } catch (e) {
      toast.error('Failed to export audit trail.');
    }
  };

  const auditColumns = [
    { 
      key: 'action', 
      label: 'Event Code', 
      sortable: true,
      render: (row) => (
        <span className="font-mono font-bold text-blue-400 px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20 text-[10px]">
          {row.action}
        </span>
      )
    },
    { key: 'user_name', label: 'Operator / Principal', sortable: true, render: (row) => row.user_name || 'System Daemon' },
    { key: 'module', label: 'Module Scope', sortable: true, className: 'text-slate-400 font-mono text-[11px]' },
    { 
      key: 'created_at', 
      label: 'Timestamp (UTC)', 
      sortable: true, 
      align: 'right',
      render: (row) => (
        <span className="font-mono text-slate-400 text-[11px]">
          {new Date(row.created_at).toLocaleString()}
        </span>
      )
    },
  ];

  const getBreadcrumbs = () => {
    switch (activeTab) {
      case 'dashboard': return ['Enterprise Command Center', 'Executive Overview', 'Global Dashboard'];
      
      // Module 01
      case 'users': return ['Identity & Security', 'Users & Operators'];
      case 'devices': return ['Identity & Security', 'Floor Tablets'];
      case 'roles': return ['Identity & Security', 'Role Permissions & Gates'];
      case 'shifts': return ['Identity & Security', 'Unit & Floor Shifts'];
      case 'audit': return ['Identity & Security', 'Audit Trail'];
      case 'settings': return ['System Config', 'Global Settings'];
      
      // Module 02
      case 'master_plant': return ['Master Data Setup', 'Plant Structure (Units/Lines)'];
      case 'master_buyers': return ['Master Data Setup', 'Buyers & Brands'];
      case 'master_styles': return ['Master Data Setup', 'Styles & SMV Library'];
      case 'master_attributes': return ['Master Data Setup', 'Colors, Sizes & Defects'];

      default: return ['Master Data Setup', 'Catalog Overview'];
    }
  };

  const isMod1Active = ['users', 'devices', 'roles', 'shifts', 'audit', 'settings'].includes(activeTab);
  const isMod2Active = ['master_plant', 'master_buyers', 'master_styles', 'master_attributes'].includes(activeTab);

  return (
    <AdminLayout 
      activeTab={activeTab} 
      onTabChange={handleTabChange}
      breadcrumbs={getBreadcrumbs()}
    >
      <Toaster position="top-right" />

      {/* ========================================================= */}
      {/* GLOBAL EXECUTIVE DASHBOARD (DEFAULT ON LOGIN)              */}
      {/* ========================================================= */}
      {activeTab === 'dashboard' && (
        <GlobalExecutiveDashboard
          usersCount={usersList.length}
          devicesCount={devicesList.length}
          rolesCount={rolesList.length}
          shiftsCount={shiftsList.length}
          auditLogs={auditList}
          companies={companiesList}
          units={unitsList}
          floors={floorsList}
          lines={linesList}
          buyers={buyersList}
          styles={stylesList}
          onNavigateTab={handleTabChange}
          onOpenCreateUser={() => {
            setUserFormErrors({});
            setShowNewUserModal(true);
          }}
          onOpenCreateUnit={() => {
            setUnitFormErrors({});
            setShowCreateUnitModal(true);
          }}
          onOpenCreateLine={() => {
            setLineFormErrors({});
            setShowCreateLineModal(true);
          }}
        />
      )}

      {/* ========================================================= */}
      {/* MODULE 01: AUTH & ADMINISTRATION VIEW                      */}
      {/* ========================================================= */}
      {isMod1Active && (
        <div className="space-y-5">
          
          {/* Top KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className={`p-4 sm:p-5 rounded border transition-colors ${
              isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-2xs'
            }`}>
              <div className="flex items-center justify-between text-slate-400 text-sm mb-1 font-medium">
                <span>Active Operators</span>
                <Users className="h-4.5 w-4.5 text-blue-500" />
              </div>
              <div className="text-3xl font-black tracking-tight">{usersList.length}</div>
              <div className="text-xs text-emerald-500 font-semibold flex items-center space-x-1 mt-1.5">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>100% RBAC Secured</span>
              </div>
            </div>

            <div className={`p-4 sm:p-5 rounded border transition-colors ${
              isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-2xs'
            }`}>
              <div className="flex items-center justify-between text-slate-400 text-sm mb-1 font-medium">
                <span>Floor Tablets</span>
                <Smartphone className="h-4.5 w-4.5 text-blue-500" />
              </div>
              <div className="text-3xl font-black tracking-tight">{devicesList.length}</div>
              <div className="text-xs text-blue-500 font-semibold flex items-center space-x-1 mt-1.5">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>Line-Locked PIN Enabled</span>
              </div>
            </div>

            <div className={`p-4 sm:p-5 rounded border transition-colors ${
              isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-2xs'
            }`}>
              <div className="flex items-center justify-between text-slate-400 text-sm mb-1 font-medium">
                <span>Floor Shifts Configured</span>
                <Clock className="h-4.5 w-4.5 text-blue-500" />
              </div>
              <div className="text-3xl font-black tracking-tight">{shiftsList.length}</div>
              <div className="text-xs text-emerald-500 font-semibold flex items-center space-x-1 mt-1.5">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Staggered Timings Active</span>
              </div>
            </div>

            <div className={`p-4 sm:p-5 rounded border transition-colors ${
              isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-2xs'
            }`}>
              <div className="flex items-center justify-between text-slate-400 text-sm mb-1 font-medium">
                <span>Audit Trail Events</span>
                <History className="h-4.5 w-4.5 text-blue-500" />
              </div>
              <div className="text-3xl font-black tracking-tight">{auditList.length}</div>
              <div className="text-xs text-emerald-500 font-semibold flex items-center space-x-1 mt-1.5">
                <Activity className="h-3.5 w-3.5" />
                <span>Immutable Logs</span>
              </div>
            </div>
          </div>

          {/* Module 01 Sub-Views */}
          {activeTab === 'users' && (
            <div className={`p-6 rounded border transition-colors ${
              isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-2xs'
            }`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-4 border-b border-slate-700/20">
                <div>
                  <h3 className={`text-base font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    Factory Users & Operators Directory
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                    Authorized system users mapped to Spatie roles and permissions
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowNewUserModal(true)}
                  className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs sm:text-sm font-semibold flex items-center space-x-2 shadow-2xs cursor-pointer transition-colors shrink-0"
                >
                  <Plus className="h-4 w-4" />
                  <span>Register New User</span>
                </button>
              </div>

              <DataTable
                columns={userColumns}
                data={usersList}
                loading={fetchLoading}
                searchPlaceholder="Search users by name or email..."
                exportFileName="rmg-users-directory"
              />
            </div>
          )}

          {activeTab === 'devices' && (
            <div className={`p-5 rounded border transition-colors ${
              isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-2xs'
            }`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-700/20">
                <div>
                  <h3 className={`text-sm font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    Floor Tablets & Hardware Scanners
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Dedicated hardware terminals locked to factory sewing lines and inspection stations
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowNewDeviceModal(true)}
                  className="px-3 py-1.5 rounded bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-semibold flex items-center space-x-1.5 shadow-2xs cursor-pointer transition-colors shrink-0"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Register Floor Tablet</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {devicesList.map((d) => (
                  <div key={d.id} className={`p-4 rounded border ${
                    isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
                  }`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-mono font-bold text-blue-500">{d.device_code}</span>
                      <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                        {d.is_active ? 'ONLINE' : 'OFFLINE'}
                      </span>
                    </div>
                    <div className="font-bold text-sm">{d.device_name}</div>
                    <div className="text-xs text-slate-400 mt-1">
                      Assigned Station: <strong className={isDark ? 'text-slate-200' : 'text-slate-700'}>{d.line_name || 'Line 01'}</strong>
                    </div>
                    <div className="mt-3 pt-2.5 border-t border-slate-700/30 flex items-center justify-between">
                      <div className="flex items-center space-x-2 text-[10px] text-slate-400 font-mono">
                        <span>Auth: PIN</span>
                        <span>•</span>
                        <span>{d.device_type}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <button
                          type="button"
                          onClick={() => handleToggleDeviceStatus(d)}
                          title={d.is_active ? 'Set Tablet Offline' : 'Set Tablet Online'}
                          className={`p-1 rounded transition-colors cursor-pointer ${
                            d.is_active 
                              ? 'hover:bg-amber-500/10 text-slate-400 hover:text-amber-500' 
                              : 'hover:bg-emerald-500/10 text-slate-400 hover:text-emerald-500'
                          }`}
                        >
                          <Power className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteDevice(d)}
                          title="Delete Floor Tablet"
                          className="p-1 rounded hover:bg-red-500/10 text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'roles' && (
            <RolesDataTable
              roles={rolesList}
              allPermissions={allPermissionsList}
              usersList={usersList}
              isDark={isDark}
              onSaveRolePermissions={handleSaveRolePermissions}
              onOpenCreateRole={() => setShowCreateRoleModal(true)}
              onOpenCreatePermission={() => setShowCreatePermissionModal(true)}
              onDeleteRole={handleDeleteRole}
              onDeletePermission={handleDeletePermission}
              saving={savingRoleMatrix}
            />
          )}

          {activeTab === 'shifts' && (
            <ShiftManagementDashboard
              shifts={shiftsList}
              loading={fetchLoading}
              onOpenCreateModal={() => {
                setShiftFormErrors({});
                setShowCreateShiftModal(true);
              }}
              onOpenEditModal={(shift) => {
                setShiftFormErrors({});
                setEditingShift(shift);
              }}
              onToggleStatus={handleToggleShiftStatus}
              onDeleteShift={handleDeleteShift}
            />
          )}

          {activeTab === 'audit' && (
            <EnterpriseAuditTrailDashboard
              auditLogs={auditList}
              loading={fetchLoading}
              onRefresh={fetchAdminData}
              onExportCsv={handleExportAuditCsv}
              isDark={isDark}
            />
          )}

          {activeTab === 'settings' && (
            <SystemSettingsDashboard
              settings={settingsList}
              settingsForm={settingsForm}
              setSettingsForm={setSettingsForm}
              onSave={handleSaveSettings}
              saving={saveLoading}
            />
          )}

        </div>
      )}

      {/* ========================================================= */}
      {/* MODULE 02: MASTER DATA SETUP VIEW                          */}
      {/* ========================================================= */}
      {isMod2Active && (
        <div className="space-y-5">
          
          {activeTab === 'master_plant' && (
            <PlantStructureDashboard
              companies={companiesList}
              units={unitsList}
              floors={floorsList}
              lines={linesList}
              loading={fetchLoading}
              onOpenCreateCompany={() => setShowCreateCompanyModal(true)}
              onOpenCreateUnit={() => {
                setEditingUnit(null);
                setUnitFormErrors({});
                setShowCreateUnitModal(true);
              }}
              onOpenCreateFloor={() => {
                setEditingFloor(null);
                setFloorFormErrors({});
                setShowCreateFloorModal(true);
              }}
              onOpenCreateLine={() => {
                setEditingLine(null);
                setLineFormErrors({});
                setShowCreateLineModal(true);
              }}
              onEditUnit={(u) => {
                setEditingUnit(u);
                setUnitFormErrors({});
                setShowCreateUnitModal(true);
              }}
              onEditFloor={(f) => {
                setEditingFloor(f);
                setFloorFormErrors({});
                setShowCreateFloorModal(true);
              }}
              onEditLine={(l) => {
                setEditingLine(l);
                setLineFormErrors({});
                setShowCreateLineModal(true);
              }}
              onDeleteUnit={handleDeleteUnit}
              onDeleteFloor={handleDeleteFloor}
              onDeleteLine={handleDeleteLine}
            />
          )}

          {activeTab === 'master_buyers' && (
            <BuyerBrandDashboard
              buyers={buyersList}
              loading={fetchLoading}
              onOpenCreateBuyer={() => {
                setEditingBuyer(null);
                setBuyerFormErrors({});
                setShowCreateBuyerModal(true);
              }}
              onOpenCreateBrand={(b) => setTargetBuyerForBrand(b)}
              onEditBuyer={(b) => {
                setEditingBuyer(b);
                setBuyerFormErrors({});
                setShowCreateBuyerModal(true);
              }}
              onDeleteBuyer={handleDeleteBuyer}
            />
          )}

          {activeTab === 'master_styles' && (
            <StyleCatalogDashboard
              styles={stylesList}
              buyers={buyersList}
              loading={fetchLoading}
              onOpenCreateStyle={() => {
                setEditingStyle(null);
                setStyleFormErrors({});
                setShowCreateStyleModal(true);
              }}
              onOpenOperationBulletin={(s) => setViewingObStyle(s)}
              onEditStyle={(s) => {
                setEditingStyle(s);
                setStyleFormErrors({});
                setShowCreateStyleModal(true);
              }}
              onDeleteStyle={handleDeleteStyle}
            />
          )}

          {activeTab === 'master_attributes' && (
            <AttributeMatrixDashboard
              colors={colorsList}
              sizes={sizesList}
              defects={defectsList}
              loading={fetchLoading}
              onOpenCreateColor={() => setShowCreateColorModal(true)}
              onOpenCreateSize={() => setShowCreateSizeModal(true)}
              onOpenCreateDefect={() => setShowCreateDefectModal(true)}
              onDeleteColor={handleDeleteColor}
              onDeleteSize={handleDeleteSize}
              onDeleteDefect={handleDeleteDefect}
            />
          )}

        </div>
      )}

      {/* Placeholder / Hub for future modules (PO, Planning, Cutting etc) */}
      {!isMod1Active && !isMod2Active && (
        <div className={`p-12 text-center rounded border ${
          isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-2xs'
        }`}>
          <Database className="h-12 w-12 text-blue-500 mx-auto mb-3 opacity-80" />
          <h2 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
            {activeTab.toUpperCase().replace('_', ' ')}
          </h2>
          <p className="text-xs text-slate-400 max-w-md mx-auto mt-1 mb-4">
            This module is scheduled for implementation in Sprint 3. Ready to proceed with Order Management & PO Costing.
          </p>
          <button
            type="button"
            onClick={() => handleTabChange('master_plant')}
            className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold cursor-pointer transition-colors"
          >
            Back to Factory Plant Structure
          </button>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODALS SECTION                                            */}
      {/* ========================================================= */}
      
      {/* Module 01 Modals */}
      <RegisterUserModal
        show={showNewUserModal}
        onClose={() => setShowNewUserModal(false)}
        onSubmit={handleCreateUser}
        isDark={isDark}
        rolesList={rolesList}
        companiesList={companiesList}
        unitsList={unitsList}
        companyId={newCompanyId}
        setCompanyId={setNewCompanyId}
        unitId={newUnitId}
        setUnitId={setNewUnitId}
        empId={newEmpId}
        setEmpId={setNewEmpId}
        username={newUsername}
        setUsername={setNewUsername}
        userName={newUserName}
        setUserName={setNewUserName}
        designation={newDesignation}
        setDesignation={setNewDesignation}
        userEmail={newUserEmail}
        setUserEmail={setNewUserEmail}
        userPassword={newUserPassword}
        setUserPassword={setNewUserPassword}
        userConfirmPassword={newUserConfirmPassword}
        setUserConfirmPassword={setNewUserConfirmPassword}
        userRole={newUserRole}
        setUserRole={setNewUserRole}
        userStatus={newUserStatus}
        setUserStatus={setNewUserStatus}
        errors={userFormErrors}
      />

      <RegisterDeviceModal
        show={showNewDeviceModal}
        onClose={() => setShowNewDeviceModal(false)}
        onSubmit={handleCreateDevice}
        isDark={isDark}
        devName={newDevName}
        setDevName={setNewDevName}
        devCode={newDevCode}
        setDevCode={setNewDevCode}
        devPin={newDevPin}
        setDevPin={setNewDevPin}
        devLine={newDevLine}
        setDevLine={setNewDevLine}
        errors={deviceFormErrors}
      />

      <EditUserModal
        show={Boolean(editingUser)}
        onClose={() => {
          setEditingUser(null);
          setEditFormErrors({});
        }}
        onSubmit={handleUpdateUser}
        user={editingUser}
        isDark={isDark}
        rolesList={rolesList}
        companiesList={companiesList}
        unitsList={unitsList}
        errors={editFormErrors}
      />

      <CreateRoleModal
        show={showCreateRoleModal}
        onClose={() => setShowCreateRoleModal(false)}
        onSubmit={handleCreateRole}
        allPermissions={allPermissionsList}
        isDark={isDark}
      />

      <CreatePermissionModal
        show={showCreatePermissionModal}
        onClose={() => setShowCreatePermissionModal(false)}
        onSubmit={handleCreatePermission}
        isDark={isDark}
      />

      <CreateShiftModal
        show={showCreateShiftModal}
        onClose={() => {
          setShowCreateShiftModal(false);
          setShiftFormErrors({});
        }}
        onSubmit={handleCreateShift}
        units={unitsList}
        floors={floorsList}
        isDark={isDark}
        errors={shiftFormErrors}
      />

      <EditShiftModal
        show={Boolean(editingShift)}
        onClose={() => {
          setEditingShift(null);
          setShiftFormErrors({});
        }}
        onSubmit={handleUpdateShift}
        shift={editingShift}
        units={unitsList}
        floors={floorsList}
        isDark={isDark}
        errors={shiftFormErrors}
      />

      {/* Module 02 Modals */}
      <CreateCompanyModal
        show={showCreateCompanyModal}
        onClose={() => setShowCreateCompanyModal(false)}
        onSubmit={handleSaveCompany}
        isDark={isDark}
      />

      <CreateUnitModal
        show={showCreateUnitModal}
        onClose={() => {
          setShowCreateUnitModal(false);
          setEditingUnit(null);
          setUnitFormErrors({});
        }}
        onSubmit={handleSaveUnit}
        companies={companiesList}
        unit={editingUnit}
        isDark={isDark}
        errors={unitFormErrors}
      />

      <CreateFloorModal
        show={showCreateFloorModal}
        onClose={() => {
          setShowCreateFloorModal(false);
          setEditingFloor(null);
          setFloorFormErrors({});
        }}
        onSubmit={handleSaveFloor}
        units={unitsList}
        floor={editingFloor}
        isDark={isDark}
        errors={floorFormErrors}
      />

      <CreateLineModal
        show={showCreateLineModal}
        onClose={() => {
          setShowCreateLineModal(false);
          setEditingLine(null);
          setLineFormErrors({});
        }}
        onSubmit={handleSaveLine}
        units={unitsList}
        floors={floorsList}
        line={editingLine}
        isDark={isDark}
        errors={lineFormErrors}
      />

      <CreateBuyerModal
        show={showCreateBuyerModal}
        onClose={() => {
          setShowCreateBuyerModal(false);
          setEditingBuyer(null);
          setBuyerFormErrors({});
        }}
        onSubmit={handleSaveBuyer}
        buyer={editingBuyer}
        isDark={isDark}
        errors={buyerFormErrors}
      />

      <CreateBrandModal
        show={Boolean(targetBuyerForBrand)}
        onClose={() => setTargetBuyerForBrand(null)}
        onSubmit={handleSaveBrand}
        buyer={targetBuyerForBrand}
        isDark={isDark}
      />

      <CreateStyleModal
        show={showCreateStyleModal}
        onClose={() => {
          setShowCreateStyleModal(false);
          setEditingStyle(null);
          setStyleFormErrors({});
        }}
        onSubmit={handleSaveStyle}
        buyers={buyersList}
        style={editingStyle}
        isDark={isDark}
        errors={styleFormErrors}
      />

      <OperationBulletinModal
        show={Boolean(viewingObStyle)}
        onClose={() => setViewingObStyle(null)}
        style={viewingObStyle}
        onAddOperation={handleAddStyleOperation}
        isDark={isDark}
      />

      <CreateColorModal
        show={showCreateColorModal}
        onClose={() => setShowCreateColorModal(false)}
        onSubmit={handleSaveColor}
        isDark={isDark}
      />

      <CreateSizeModal
        show={showCreateSizeModal}
        onClose={() => setShowCreateSizeModal(false)}
        onSubmit={handleSaveSize}
        isDark={isDark}
      />

      <CreateDefectModal
        show={showCreateDefectModal}
        onClose={() => setShowCreateDefectModal(false)}
        onSubmit={handleSaveDefect}
        isDark={isDark}
      />

    </AdminLayout>
  );
}
