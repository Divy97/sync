/* eslint-disable react/prop-types */
import { createContext, useState, useContext } from 'react';
const PermissionContext = createContext();

const PermissionProvider = ({ children }) => {
  const [permission, setPermission] = useState(false);

  const togglePermission = () => {
    setPermission((permission) => (!permission));
  };

  return (
    <PermissionContext.Provider value={{ permission, togglePermission }}>
      {children}
    </PermissionContext.Provider>
  );
};

const usePermission = () => {
  const context = useContext(PermissionContext);
  if (!context) {
    throw new Error('usePermission must be used within a PermissionProvider');
  }
  return context;
};

export { PermissionProvider, usePermission };
