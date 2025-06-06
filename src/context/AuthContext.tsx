import { type ReactNode, createContext, useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../services/firebaseConnection";


type AuthContextData = {
    signed: boolean;
    loadingAuth: boolean;
    handleInfoUser: ({name, email, uid}: UserProps) => void;
    user: UserProps | null;
};

interface AuthProviderProps{
    children: ReactNode;
}

interface UserProps{
    uid: string;
    name: string | null;
    email: string | null;
    phone: string | null;
}

export const AuthContext = createContext({} as AuthContextData);

function AuthProvider({ children }: AuthProviderProps) {
    const [user, setUser] = useState<UserProps | null>(null);
    const [loadingAuth, setLoadingAuth] = useState(true);

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, (user) => {
          if(user){
            setUser({
              uid: user.uid,
              name: user?.displayName,
              email: user?.email,
              phone: user?.phoneNumber
            })
            setLoadingAuth(false)
          } else{
            setUser(null)
            setLoadingAuth(false)
          } 
        })

        return () => {
            unsub();
        }
    }, [])

    function handleInfoUser({name, email, phone, uid}: UserProps) {
      setUser({
        name,
        email,
        uid,
        phone
      })
    }

    return (
     <AuthContext.Provider 
        value={{
          signed: !!user, 
          loadingAuth, 
          handleInfoUser, 
          user
        }}>
        {children}
     </AuthContext.Provider>   
    )
}

export default AuthProvider;