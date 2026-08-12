const API_URL = import.meta.env.VITE_API_URL || "";

export const getNinos = async (token) => {
    try {
        const res = await fetch(`${API_URL}/admin/ninos`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });

        const data = await res.json();
        return data;
    } catch (error) {
        console.error("Error fetching niños:", error);
        throw error;
    }
};

export const createNinos = async (ninoData, token) => {
    try {
        const res = await fetch(`${API_URL}/admin/ninos`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(ninoData),
        });

        const data = await res.json();
        return data;
    } catch (error) {
        console.error("Error creating niño:", error);
        throw error;
    }
};

export const updateNinos = async (id, ninoData, token) => {
    try {
        const res = await fetch(`${API_URL}/admin/ninos/${id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(ninoData),
        });

        const data = await res.json();
        return data;
    } catch (error) {
        console.error("Error updating niño:", error);
        throw error;
    }
};

export const deleteNinos = async (id, token) => {
    try {
        const res = await fetch(`${API_URL}/admin/ninos/${id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });

        const data = await res.json();
        return data;
    } catch (error) {
        console.error("Error deleting niño:", error);
        throw error;
    }
};