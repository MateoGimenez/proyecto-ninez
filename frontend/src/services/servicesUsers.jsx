const API_URL = import.meta.env.VITE_API_URL;

export const getUsers = async (token) => {
    try {
        const res = await fetch(`${API_URL}/admin/usuarios`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });

        const data = await res.json();
        return data;
    } catch (error) {
        console.error("Error fetching usuarios:", error);
        throw error;
    }
};

export const deleteUser = async (id, token) => {
    try {
        const res = await fetch(`${API_URL}/admin/usuarios/${id}`, {
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

export const createUser = async (userData, token) => {
    try {
        const res = await fetch(`${API_URL}/admin/usuarios`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(userData),
        });

        const data = await res.json();
        return data;
    } catch (error) {
        console.error("Error creating usuario:", error);
        throw error;
    }
};