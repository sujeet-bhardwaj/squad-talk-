import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import { Dashboard } from "./pages/Dashboard";
import { Profile } from "./components/Profile";
import { createContext,useState} from "react";
export const AuthContext = createContext();
function App() {
  const [user, setUser] = useState(()=>{
   const storeUser=localStorage.getItem("user")
   return storeUser?localStorage.getItem("user"):null
  });

  return (
     <AuthContext.Provider value={{ user, setUser }}>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />  
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile/:id" element={<Profile />} />
      </Routes>
    </BrowserRouter>
      </AuthContext.Provider>
  );
}

export default App;
