
export const AdminPage = ({ children }) => {
  return (
    <div className="admin-page">
      <h1>Panel de Administración</h1>
      {children}
    </div>
  );  
}

export default AdminPage;