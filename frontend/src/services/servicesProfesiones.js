const API_URL = import.meta.env.VITE_API_URL;

export const getProfesiones = async (token) => {
    try {
        const res = await fetch(`${API_URL}/admin/profesiones`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });

        const data = await res.json();
        return data;
    } catch (error) {
        console.error("Error fetching profesiones:", error);
        throw error;
    }
};

export const deleteProfesion = async (id, token) => {
    try {
        const res = await fetch(`${API_URL}/admin/profesiones/${id}`, {
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