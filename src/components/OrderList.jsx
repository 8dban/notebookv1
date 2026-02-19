import React, { useEffect, useState } from 'react';
import { Search, Filter, RefreshCw, MessageCircle, Pencil, Trash2, Check, X, ArrowUpDown, ArrowUp, ArrowDown, Plus } from 'lucide-react';
import { OrderService } from '../services/orderService';
import OrderForm from './OrderForm';
import './OrderList.css';

function getOrderTypeLabel(type) {
    const types = {
        medicine: 'دواء',
        supplement: 'مكمل',
        cosmetic: 'تجميل',
        device: 'جهاز',
        other: 'أخرى'
    };
    return types[type] || type;
}

function getRecurrenceLabel(interval) {
    return interval === 'weekly' ? 'أسبوعي' : 'شهري';
}

function formatCustomerId(id) {
    if (!id) return '';
    const str = String(id);
    // If it's a 10-digit number starting with 1, it's likely a truncated Egyptian mobile number
    if (str.length === 10 && str.startsWith('1')) {
        return '0' + str;
    }
    return str;
}

function getWhatsAppUrl(order) {
    const phone = `+2${formatCustomerId(order.customerId)}`;
    const name = order.customerName;
    const product = order.productName;
    const message = `أهلاً ${name} \u{1F44B}\nنحب نبلغ حضرتك إن منتج ${product} بقى متوفر دلوقتي في صيدلية د. محمد ناصر \u{1F48A}`;
    return `https://api.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(message)}`;
}

export default function OrderList({ activeTab }) {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [editingId, setEditingId] = useState(null);
    const [editFormData, setEditFormData] = useState({});
    const [sortConfig, setSortConfig] = useState({ key: 'timestamp', direction: 'desc' });


    useEffect(() => {
        loadOrders();
    }, [activeTab]);

    const loadOrders = async () => {
        setLoading(true);
        try {
            const data = await OrderService.getAllOrders();
            setOrders(data);
        } catch (error) {
            console.error('Failed to load orders', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleFulfillment = async (orderId, currentStatus) => {
        try {
            await OrderService.updateOrder(orderId, { isFulfilled: !currentStatus });
            setOrders(prev => prev.map(o => o.id === orderId ? { ...o, isFulfilled: !currentStatus } : o));
        } catch (error) {
            alert('فشل تحديث الحالة');
        }
    };

    const toggleContacted = async (orderId, currentStatus) => {
        try {
            await OrderService.updateOrder(orderId, { isContacted: !currentStatus });
            setOrders(prev => prev.map(o => o.id === orderId ? { ...o, isContacted: !currentStatus } : o));
        } catch (error) {
            alert('فشل تحديث حالة التواصل');
        }
    };

    const toggleDelivered = async (orderId, currentStatus) => {
        try {
            await OrderService.updateOrder(orderId, { isDelivered: !currentStatus });
            setOrders(prev => prev.map(o => o.id === orderId ? { ...o, isDelivered: !currentStatus } : o));
        } catch (error) {
            alert('فشل تحديث حالة التسليم');
        }
    };

    const [deleteConfirmId, setDeleteConfirmId] = useState(null);

    // ... existing loadOrders ...

    const handleDeleteClick = (orderId) => {
        setDeleteConfirmId(orderId);
    };

    const confirmDelete = async () => {
        if (!deleteConfirmId) return;
        try {
            await OrderService.deleteOrder(deleteConfirmId);
            setOrders(prev => prev.filter(o => o.id !== deleteConfirmId));
            setDeleteConfirmId(null);
        } catch (error) {
            alert('فشل حذف الطلب');
        }
    };

    const cancelDelete = () => {
        setDeleteConfirmId(null);
    };

    // ... existing startEdit, cancelEdit ...

    const startEdit = (order) => {
        setEditingId(order.id);
        setEditFormData({ ...order });
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditFormData({});
    };

    const handleEditChange = (e) => {
        const { name, value } = e.target;
        setEditFormData(prev => ({ ...prev, [name]: value }));
    };

    const saveEdit = async () => {
        try {
            await OrderService.updateOrder(editingId, editFormData);
            setOrders(prev => prev.map(o => o.id === editingId ? { ...o, ...editFormData } : o));
            setEditingId(null);
        } catch (error) {
            alert('فشل حفظ التعديلات');
        }
    };

    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const getSortIcon = (key) => {
        if (sortConfig.key !== key) return <ArrowUpDown size={14} className="text-muted opacity-50" />;
        return sortConfig.direction === 'asc' ? <ArrowUp size={14} className="text-primary" /> : <ArrowDown size={14} className="text-primary" />;
    };

    const filteredOrders = orders.filter(order => {
        if (!order) return false;

        const safeSearchTerm = (searchTerm || '').toLowerCase();
        const customerName = String(order.customerName || '').toLowerCase();
        const productName = String(order.productName || '').toLowerCase();
        const notes = String(order.notes || '').toLowerCase();
        const customerId = formatCustomerId(order.customerId);

        const matchesSearch =
            customerName.includes(safeSearchTerm) ||
            productName.includes(safeSearchTerm) ||
            notes.includes(safeSearchTerm) ||
            customerId.includes(searchTerm);
        const matchesType = filterType === 'all' || order.orderType === filterType;
        return matchesSearch && matchesType;
    }).sort((a, b) => {
        if (!sortConfig.key) return 0;

        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];

        // Handle string comparison (case-insensitive)
        if (typeof aValue === 'string' || typeof bValue === 'string') {
            aValue = String(aValue || '').toLowerCase();
            bValue = String(bValue || '').toLowerCase();
        }

        if (aValue < bValue) {
            return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
            return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
    });

    const renderCell = (name, type = 'text', options = null) => {
        if (type === 'select' && options) {
            return (
                <select
                    name={name}
                    value={editFormData[name] || ''}
                    onChange={handleEditChange}
                    className="form-input-sm"
                >
                    {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
            );
        }

        if (name === 'notes') {
            return (
                <textarea
                    name={name}
                    value={editFormData[name] || ''}
                    onChange={handleEditChange}
                    className="form-input-sm"
                    rows="2"
                    style={{ minWidth: '150px' }}
                />
            );
        }

        return (
            <input
                type={type}
                name={name}
                value={editFormData[name] || ''}
                onChange={handleEditChange}
                className="form-input-sm"
            />
        );
    };

    return (
        <div className="order-list-container space-y-6">
            {/* New Order Toggle & Form */}


            <div className="filters-bar card">
                <div className="search-box">
                    <Search className="text-muted" size={20} />
                    <input
                        type="text"
                        placeholder="بحث باسم العميل، المنتج، أو رقم الهاتف..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="filter-group">
                    <Filter className="text-muted" size={20} />
                    <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                        className="filter-select"
                    >
                        <option value="all">كل الأنواع</option>
                        <option value="medicine">أدوية</option>
                        <option value="supplement">مكملات</option>
                        <option value="cosmetic">تجميل</option>
                        <option value="device">أجهزة</option>
                    </select>
                </div>
                <button className="btn-icon" onClick={loadOrders} title="تحديث">
                    <RefreshCw size={20} />
                </button>
            </div>

            <div className="mb-8">
                <OrderForm onSuccess={loadOrders} />
            </div>

            <div className="table-responsive">
                <table className="order-table">
                    <thead>
                        <tr>
                            <th onClick={() => handleSort('isFulfilled')} className="cursor-pointer hover:bg-slate-100 transition-colors">
                                <div className="flex items-center justify-center gap-1">
                                    تم التوفير {getSortIcon('isFulfilled')}
                                </div>
                            </th>
                            <th>تواصل</th>
                            <th onClick={() => handleSort('isContacted')} className="cursor-pointer hover:bg-slate-100 transition-colors">
                                <div className="flex items-center justify-center gap-1">
                                    تم التواصل {getSortIcon('isContacted')}
                                </div>
                            </th>
                            <th onClick={() => handleSort('isDelivered')} className="cursor-pointer hover:bg-slate-100 transition-colors">
                                <div className="flex items-center justify-center gap-1">
                                    تم التسليم {getSortIcon('isDelivered')}
                                </div>
                            </th>
                            <th onClick={() => handleSort('timestamp')} className="cursor-pointer hover:bg-slate-100 transition-colors">
                                <div className="flex items-center justify-center gap-1">
                                    التاريخ {getSortIcon('timestamp')}
                                </div>
                            </th>
                            <th onClick={() => handleSort('customerName')} className="cursor-pointer hover:bg-slate-100 transition-colors">
                                <div className="flex items-center justify-center gap-1">
                                    اسم العميل {getSortIcon('customerName')}
                                </div>
                            </th>
                            <th onClick={() => handleSort('customerId')} className="cursor-pointer hover:bg-slate-100 transition-colors">
                                <div className="flex items-center justify-center gap-1">
                                    رقم الموبايل {getSortIcon('customerId')}
                                </div>
                            </th>
                            <th onClick={() => handleSort('productName')} className="cursor-pointer hover:bg-slate-100 transition-colors">
                                <div className="flex items-center justify-center gap-1">
                                    المنتج {getSortIcon('productName')}
                                </div>
                            </th>
                            <th onClick={() => handleSort('orderType')} className="cursor-pointer hover:bg-slate-100 transition-colors">
                                <div className="flex items-center justify-center gap-1">
                                    النوع {getSortIcon('orderType')}
                                </div>
                            </th>
                            <th onClick={() => handleSort('notes')} className="cursor-pointer hover:bg-slate-100 transition-colors">
                                <div className="flex items-center justify-center gap-1">
                                    التفاصيل {getSortIcon('notes')}
                                </div>
                            </th>
                            <th onClick={() => handleSort('isRecurring')} className="cursor-pointer hover:bg-slate-100 transition-colors">
                                <div className="flex items-center justify-center gap-1">
                                    الحالة {getSortIcon('isRecurring')}
                                </div>
                            </th>
                            <th>تعديل</th>
                            <th>حذف</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan="15" className="text-center p-8">
                                    <div className="loading-state">
                                        <RefreshCw className="spin" size={24} />
                                        <span>جاري تحميل البيانات...</span>
                                    </div>
                                </td>
                            </tr>
                        ) : filteredOrders.length === 0 ? (
                            <tr>
                                <td colSpan="15" className="text-center p-8 text-muted">
                                    لا توجد طلبات مسجلة
                                </td>
                            </tr>
                        ) : (
                            filteredOrders.map(order => {
                                const isEditing = editingId === order.id;
                                return (
                                    <tr key={order.id} className={order.isFulfilled ? 'row-fulfilled' : ''}>
                                        <td className="text-center">
                                            <input
                                                type="checkbox"
                                                className="checkbox-lg"
                                                checked={!!order.isFulfilled}
                                                onChange={() => toggleFulfillment(order.id, order.isFulfilled)}
                                                disabled={isEditing}
                                            />
                                        </td>
                                        <td>
                                            <a
                                                href={getWhatsAppUrl(order)}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className={`btn-icon text-success ${isEditing ? 'disabled' : ''}`}
                                                title="إرسال رسالة توفر المنتج"
                                            >
                                                <MessageCircle size={20} />
                                            </a>
                                        </td>
                                        <td className="text-center">
                                            <input
                                                type="checkbox"
                                                className="checkbox-lg"
                                                checked={!!order.isContacted}
                                                onChange={() => toggleContacted(order.id, order.isContacted)}
                                                disabled={isEditing}
                                            />
                                        </td>
                                        <td className="text-center">
                                            <input
                                                type="checkbox"
                                                className="checkbox-lg"
                                                checked={!!order.isDelivered}
                                                onChange={() => toggleDelivered(order.id, order.isDelivered)}
                                                disabled={isEditing}
                                            />
                                        </td>
                                        <td>{new Date(order.timestamp).toLocaleDateString('ar-EG')}</td>
                                        <td className="font-medium">
                                            {isEditing ? renderCell('customerName') : order.customerName}
                                        </td>
                                        <td>
                                            {isEditing ? renderCell('customerId') : formatCustomerId(order.customerId)}
                                        </td>
                                        <td>
                                            {isEditing ? renderCell('productName') : order.productName}
                                        </td>
                                        <td>
                                            {isEditing ? renderCell('orderType', 'select', [
                                                { value: 'medicine', label: 'دواء' },
                                                { value: 'supplement', label: 'مكمل' },
                                                { value: 'cosmetic', label: 'تجميل' },
                                                { value: 'device', label: 'جهاز' },
                                                { value: 'other', label: 'أخرى' }
                                            ]) : <span className={`tag tag-${order.orderType}`}>{getOrderTypeLabel(order.orderType)}</span>}
                                        </td>
                                        <td className="text-sm">
                                            {isEditing ? renderCell('notes') : order.notes}
                                        </td>
                                        <td>
                                            {order.isRecurring ? (
                                                <span className="tag tag-recurring">دوري ({getRecurrenceLabel(order.recurrenceInterval)})</span>
                                            ) : (
                                                <span className="tag tag-once">مرة واحدة</span>
                                            )}
                                        </td>
                                        <td className="text-center">
                                            {isEditing ? (
                                                <button onClick={saveEdit} className="btn-icon text-success" title="حفظ">
                                                    <Check size={18} />
                                                </button>
                                            ) : (
                                                <button onClick={() => startEdit(order)} className="btn-icon text-primary" title="تعديل">
                                                    <Pencil size={18} />
                                                </button>
                                            )}
                                        </td>
                                        <td className="text-center">
                                            {isEditing ? (
                                                <button onClick={cancelEdit} className="btn-icon text-danger" title="إلغاء">
                                                    <X size={18} />
                                                </button>
                                            ) : (
                                                <button onClick={() => handleDeleteClick(order.id)} className="btn-icon text-danger" title="حذف">
                                                    <Trash2 size={18} />
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {/* Delete Confirmation Modal */}
            {deleteConfirmId && (
                <div className="modal-overlay">
                    <div className="modal-content card">
                        <div className="modal-header">
                            <h3 className="text-danger flex items-center gap-2">
                                <Trash2 size={20} />
                                تأكيد الحذف
                            </h3>
                        </div>
                        <div className="modal-body">
                            <p>هل أنت متأكد من رغبتك في حذف هذا الطلب نهائياً؟</p>
                            <p className="text-sm text-muted mt-2">لا يمكن التراجع عن هذا الإجراء.</p>
                        </div>
                        <div className="modal-footer flex gap-3 justify-end mt-4">
                            <button onClick={cancelDelete} className="btn btn-secondary">إلغاء</button>
                            <button onClick={confirmDelete} className="btn btn-danger">حذف نهائي</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
