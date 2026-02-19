import React, { useState } from 'react';
import { Save, Loader2, CheckCircle2, ChevronDown, ChevronUp, PlusCircle } from 'lucide-react';
import { OrderService } from '../services/orderService';
import './OrderForm.css';

const DEFAULT_FORM = {
    productName: '',
    customerName: '',
    customerId: '',
    orderType: '',
    notes: '',
    isRecurring: false,
    recurrenceInterval: 'monthly', // default
};

export default function OrderForm({ onSuccess }) {
    const [formData, setFormData] = useState(DEFAULT_FORM);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');
    const [isExpanded, setIsExpanded] = useState(false);

    const toggleForm = () => setIsExpanded(!isExpanded);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        // Strict validation for Phone Number (customerId)
        if (name === 'customerId') {
            // Allow only numbers
            if (value && !/^\d*$/.test(value)) return;
            // Max length 11
            if (value.length > 11) return;
        }

        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Final validation before submit
        if (formData.customerId.length !== 11) {
            alert('رقم الموبايل يجب أن يتكون من 11 رقم');
            return;
        }

        setIsSubmitting(true);

        try {
            await OrderService.addOrder({
                ...formData,
                timestamp: new Date().toISOString(),
            });

            setSuccessMsg('تم');
            setFormData({ ...DEFAULT_FORM });

            if (onSuccess) onSuccess();

            setTimeout(() => setSuccessMsg(''), 2000);
            setIsExpanded(false); // Collapse on success
        } catch (error) {
            console.error(error);
            alert('خطأ');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className={`card form-card fade-in ${isExpanded ? 'expanded' : ''}`}>
            {/* Form Header / Toggle */}
            <div className="form-header-toggle" onClick={toggleForm}>
                <div className="flex items-center gap-2">
                    <PlusCircle className="text-primary" size={20} />
                    <h3 className="text-lg font-semibold text-slate-700">إضافة طلب جديد</h3>
                </div>
                {isExpanded ? <ChevronUp className="text-muted" /> : <ChevronDown className="text-muted" />}
            </div>

            {successMsg && (
                <div className="alert success mt-4">
                    <CheckCircle2 size={16} />
                    {successMsg}
                </div>
            )}

            <form onSubmit={handleSubmit} className="mt-4">
                <div className="form-grid">
                    {/* Customer Name */}
                    <div className="form-group field-customer-name">
                        <label className="form-label">اسم العميل</label>
                        <input
                            type="text"
                            name="customerName"
                            required
                            className="form-input"
                            placeholder="الاسم"
                            value={formData.customerName}
                            onChange={handleChange}
                        />
                    </div>

                    {/* Customer ID */}
                    <div className="form-group">
                        <label className="form-label">رقم الموبايل</label>
                        <input
                            type="text"
                            name="customerId"
                            required
                            className="form-input"
                            placeholder="01xxxxxxxxx"
                            value={formData.customerId}
                            onChange={handleChange}
                        />
                    </div>

                    {/* Product Name */}
                    <div className="form-group field-product">
                        <label className="form-label">المنتج</label>
                        <input
                            type="text"
                            name="productName"
                            required
                            className="form-input"
                            placeholder="دواء/منتج"
                            value={formData.productName}
                            onChange={handleChange}
                        />
                    </div>

                    {/* Order Type */}
                    <div className="form-group">
                        <label className="form-label">النوع</label>
                        <select name="orderType" required className="form-select" value={formData.orderType} onChange={handleChange}>
                            <option value="">نوع...</option>
                            <option value="medicine">دواء</option>
                            <option value="supplement">مكمل</option>
                            <option value="cosmetic">تجميل</option>
                            <option value="device">جهاز</option>
                            <option value="other">أخرى</option>
                        </select>
                    </div>

                    {/* Additional Details */}
                    <div className="form-group field-notes">
                        <label className="form-label">تفاصيل إضافية (اختياري)</label>
                        <textarea
                            name="notes"
                            className="form-input"
                            placeholder="أي ملاحظات أو تفاصيل إضافية..."
                            value={formData.notes}
                            onChange={handleChange}
                            rows="1"
                            style={{ minHeight: '42px', resize: 'vertical' }}
                        />
                    </div>

                    {/* Submit Button - Now in its own cell */}
                    <div className="form-group action-area">
                        <button type="submit" className="btn-submit-compact" disabled={isSubmitting}>
                            {isSubmitting ? <Loader2 className="spin" size={16} /> : <Save size={16} />}
                            <span>حفظ</span>
                        </button>
                    </div>
                </div>

                {/* Secondary Row for Specific Options */}
                <div style={{ marginTop: '0.75rem', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '1.5rem' }}>

                    {/* Recurring Toggle & Options */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <label className="checkbox-container">
                            <input
                                type="checkbox"
                                name="isRecurring"
                                checked={formData.isRecurring}
                                onChange={handleChange}
                            />
                            <span style={{ fontSize: '0.8rem', fontWeight: '600' }}>طلب دوري؟</span>
                        </label>

                        {formData.isRecurring && (
                            <div className="radio-group fade-in">
                                <label className={`radio-option ${formData.recurrenceInterval === 'weekly' ? 'selected' : ''}`}>
                                    <input
                                        type="radio"
                                        name="recurrenceInterval"
                                        value="weekly"
                                        checked={formData.recurrenceInterval === 'weekly'}
                                        onChange={handleChange}
                                        style={{ display: 'none' }}
                                    />
                                    <span>أسبوعي</span>
                                </label>
                                <label className={`radio-option ${formData.recurrenceInterval === 'monthly' ? 'selected' : ''}`}>
                                    <input
                                        type="radio"
                                        name="recurrenceInterval"
                                        value="monthly"
                                        checked={formData.recurrenceInterval === 'monthly'}
                                        onChange={handleChange}
                                        style={{ display: 'none' }}
                                    />
                                    <span>شهري</span>
                                </label>
                            </div>
                        )}
                    </div>
                </div>
            </form>
        </div>
    );
}
