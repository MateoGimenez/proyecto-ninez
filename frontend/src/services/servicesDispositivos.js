const API_URL = import.meta.env.VITE_API_URL;

export const getDispositivos = async (token) => {
    try {
        const res = await fetch(`${API_URL}/admin/dispositivos`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });

        const data = await res.json();
        return data;
    } catch (error) {
        console.error("Error fetching dispositivos:", error);
        throw error;
    }
};

export const deleteDispositivos = async (id, token) => {
    try {
        const res = await fetch(`${API_URL}/admin/dispositivos/${id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });

        const data = await res.json();
        return data;
    } catch (error) {
        console.error("Error deleting dispositivo:", error);
        throw error;
    }
};

export const createDispositivos = async (userDispositivo, token) => {
    try {
        const res = await fetch(`${API_URL}/admin/dispositivos`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(userDispositivo), // antes decía userData, no existía
        });

        const data = await res.json();
        return data;
    } catch (error) {
        console.error("Error creating dispositivo:", error);
        throw error;
    }
};