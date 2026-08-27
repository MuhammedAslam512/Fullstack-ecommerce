import { Navigate,Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function AdminRoute() {
    const {isAuthenticate, isAdmin, loading} = useAuth()

    if(loading) {
        return(
            <div style={{textAlign : 'center', padding: '50px', fontSize: '18px'}}>
                Verifying Admin privilages...
            </div>
        )
    }

    return isAuthenticate && isAdmin ? <Outlet/> : <Navigate to = "/" replace />
}

