
const STORAGE_KEY = 'customer_orders_db';

// Initial mock data
const INITIAL_DATA = [
    {
        id: '1',
        timestamp: new Date().toISOString(),
        customerName: 'أحمد محمد',
        customerId: '01012345678',
        gender: 'male',
        ageGroup: '18-30',
        productName: 'فيتامين سي 1000مجم',
        orderType: 'supplement',
        location: 'الرياض',
        isRecurring: false,
        recurrenceInterval: '',
        isFulfilled: false,
        isContacted: false,
        isDelivered: false
    }
];

export const OrderService = {
    getAllOrders: async () => {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (!stored) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_DATA));
            return INITIAL_DATA;
        }
        return JSON.parse(stored);
    },

    addOrder: async (order) => {
        const orders = await OrderService.getAllOrders();
        const newOrder = {
            ...order,
            id: Date.now().toString(),
            timestamp: new Date().toISOString(),
            isFulfilled: false,
            isContacted: false,
            isDelivered: false
        };
        const updatedOrders = [newOrder, ...orders];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedOrders));
        return newOrder;
    },

    updateOrder: async (orderId, updates) => {
        const orders = await OrderService.getAllOrders();
        const updatedOrders = orders.map(order =>
            order.id === orderId ? { ...order, ...updates } : order
        );
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedOrders));
        return true;
    },

    deleteOrder: async (orderId) => {
        const orders = await OrderService.getAllOrders();
        const updatedOrders = orders.filter(order => order.id !== orderId);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedOrders));
        return true;
    }
};
