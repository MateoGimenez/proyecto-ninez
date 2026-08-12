const API_URL = import.meta.env.VITE_API_URL;

export const getStats = async (token) => {
    try {
        const res = await fetch(`${API_URL}/dashboard/stats`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });

        const data = await res.json();
        return data;
    } catch (error) {
        console.error("Error fetching roles:", error);
        throw error;
    }
};