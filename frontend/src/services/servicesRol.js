const API_URL = import.meta.env.VITE_API_URL;

export const getRoles = async (token) => {
    try {
        const res = await fetch(`${API_URL}/admin/roles`, {
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

export const deleteRol = async (id, token) => {
    try {
        const res = await fetch(`${API_URL}/admin/roles/${id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });

        const data = await res.json();
        return data;
    } catch (error) {
        console.error("Error deleting usuario:", error);
        throw error;
    }
};