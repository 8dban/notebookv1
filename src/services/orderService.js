const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbx25mhRUYiq-20z_MglwglRwl09fJEdj552ciNNbsKx6aDGysMHmbt93rg2dtWaP5Uf/exec';

export const OrderService = {
    getAllOrders: async () => {
        try {
            const response = await fetch(GOOGLE_SCRIPT_URL);
            if (!response.ok) throw new Error('Network response was not ok');
            const data = await response.json();
            // Ensure we return an array
            return Array.isArray(data) ? data : [];
        } catch (error) {
            console.error('Error fetching orders:', error);
            return [];
        }
    },

    addOrder: async (order) => {
        const newOrder = {
            ...order,
            id: Date.now().toString(), // Generate ID here or let sheet do it? Better here for immediate UI update if needed.
            timestamp: new Date().toISOString(),
            isFulfilled: false,
            isContacted: false,
            isDelivered: false
        };

        try {
            // Google Apps Script often requires text/plain to avoid preflight OPTIONS issues
            await fetch(GOOGLE_SCRIPT_URL, {
                method: 'POST',
                mode: 'cors',
                body: JSON.stringify({ action: 'create', data: newOrder })
            });
            return newOrder;
        } catch (error) {
            console.error('Error adding order:', error);
            throw error;
        }
    },

    updateOrder: async (orderId, updates) => {
        try {
            // We need to pass the ID to identify which row to update
            await fetch(GOOGLE_SCRIPT_URL, {
                method: 'POST',
                mode: 'cors',
                body: JSON.stringify({
                    action: 'update',
                    data: { id: orderId, ...updates }
                })
            });
            return true;
        } catch (error) {
            console.error('Error updating order:', error);
            throw error;
        }
    },

    deleteOrder: async (orderId) => {
        try {
            await fetch(GOOGLE_SCRIPT_URL, {
                method: 'POST',
                mode: 'cors',
                body: JSON.stringify({
                    action: 'delete',
                    data: { id: orderId }
                })
            });
            return true;
        } catch (error) {
            console.error('Error deleting order:', error);
            throw error;
        }
    }
};
