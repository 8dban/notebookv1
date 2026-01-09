import React, { useState } from 'react';
import { Save, Loader2, CheckCircle2 } from 'lucide-react';
import { OrderService } from '../services/orderService';
import './OrderForm.css';

const DEFAULT_FORM = {
    productName: '',
    customerName: '',
    customerId: '',
    gender: '',
    ageGroup: '',
    location: 'ابورديس',
    orderType: '',
    isRecurring: false,
    recurrenceInterval: 'monthly', // default
};

export default function OrderForm({ onSuccess }) {
    const [formData, setFormData] = useState(DEFAULT_FORM);
    const [locationType, setLocationType] = useState('ابورديس'); // Default from list
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');

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

    const handleLocationTypeChange = (e) => {
        const val = e.target.value;
        setLocationType(val);
        if (val !== 'other') {
            setFormData(prev => ({ ...prev, location: val }));
        } else {
            setFormData(prev => ({ ...prev, location: '' }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Final validation before submit
        if (formData.customerId.length !== 11) {
            alert('رقم الموبايل يجب أن يتكون من 11 رقم');
            return;
        }

        if (locationType === 'other' && !formData.location.trim()) {
            alert('يرجى إدخال العنوان');
            return;
        }

        setIsSubmitting(true);

        try {
            await OrderService.addOrder({
                ...formData,
                timestamp: new Date().toISOString(),
            });

            setSuccessMsg('تم');
            setFormData({ ...DEFAULT_FORM, location: locationType !== 'other' ? locationType : '' });

            if (onSuccess) onSuccess();

            setTimeout(() => setSuccessMsg(''), 2000);
        } catch (error) {
            console.error(error);
            alert('خطأ');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="card form-card fade-in">
            {successMsg && (
                <div className="alert success">
                    <CheckCircle2 size={16} />
                    {successMsg}
                </div>
            )}

            <form onSubmit={handleSubmit}>
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

                    {/* Gender */}
                    <div className="form-group">
                        <label className="form-label">الجنس</label>
                        <select name="gender" required className="form-select" value={formData.gender} onChange={handleChange}>
                            <option value="">اخر...</option>
                            <option value="male">ذكر</option>
                            <option value="female">أنثى</option>
                        </select>
                    </div>

                    {/* Age Group */}
                    <div className="form-group">
                        <label className="form-label">السن</label>
                        <select name="ageGroup" required className="form-select" value={formData.ageGroup} onChange={handleChange}>
                            <option value="">اختر...</option>
                            <option value="under18">&lt; 18</option>
                            <option value="18-30">18-30</option>
                            <option value="31-50">31-50</option>
                            <option value="over50">&gt; 50</option>
                        </select>
                    </div>

                    {/* Location Dropdown */}
                    <div className="form-group">
                        <label className="form-label">العنوان</label>
                        <select
                            className="form-select"
                            value={locationType}
                            onChange={handleLocationTypeChange}
                        >
                            <option value="ابورديس">ابورديس</option>
                            <option value="ابوزنيمة">ابوزنيمة</option>
                            <option value="الكيلو ٩">الكيلو ٩</option>
                            <option value="الطور">الطور</option>
                            <option value="other">اخرى...</option>
                        </select>
                    </div>

                    {/* Submit Button - Now always 8th item in 4-column grid */}
                    <div className="form-group action-area">
                        <button type="submit" className="btn-submit-compact" disabled={isSubmitting}>
                            {isSubmitting ? <Loader2 className="spin" size={16} /> : <Save size={16} />}
                            <span>حفظ</span>
                        </button>
                    </div>
                </div>

                {/* Secondary Row for Specific Options */}
                <div style={{ marginTop: '0.75rem', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '1.5rem' }}>
                    {/* Conditional Manual Location Input */}
                    {locationType === 'other' && (
                        <div className="form-group fade-in" style={{ flex: '1', minWidth: '200px' }}>
                            <label className="form-label">تفاصيل العنوان</label>
                            <input
                                type="text"
                                name="location"
                                required
                                className="form-input"
                                placeholder="ادخل العنوان..."
                                value={formData.location}
                                onChange={handleChange}
                            />
                        </div>
                    )}

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
