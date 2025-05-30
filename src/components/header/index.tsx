import { Link } from "react-router-dom";
import { FiUser } from "react-icons/fi";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../services/firebaseConnection";

export function Header() {
  const { signed, loadingAuth, user } = useContext(AuthContext);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

    useEffect(() => {
    async function loadUserProfile() {
      if (user?.uid) {
        const profileRef = collection(db, "profiles");
        const q = query(profileRef, where("uid", "==", user.uid));
        const querySnapshot = await getDocs(q);
        const profile = querySnapshot.docs[0]?.data();

        if (profile?.avatarUrl) {
          setAvatarUrl(profile.avatarUrl);
        }
      }
    }

    loadUserProfile();
  }, [user]);

  return (
    <div className="w-full flex items-center justify-center h-16 bg-white drop-shadow mb-4">
      <header className="flex w-full max-w-7xl items-center justify-between px-4 mx-auto">
        <Link to="/">
          <div className=" max-w-sm w-full hover:scale-105">
            <span className="text-3xl font-bold">
              ALN
              <span className="bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
                Motors
              </span>
            </span>
          </div>
        </Link>

        {!loadingAuth && signed && (
          <Link to="/dashboard">
            <div className="border-2 rounded-full p-1 border-gray-900 hover:rotate-18">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="Foto de perfil"
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <FiUser size={24} color="#000" />
              )}
            </div>
          </Link>
        )}

        {!loadingAuth && !signed && (
          <div className="flex gap-2">
            <Link to="/login">
              <div className="border-2 rounded-full p-1 border-blue-400 text-blue-400 hover:bg-blue-400 hover:text-white">
                Login
              </div>
            </Link>
            <Link to="/register">
              <div className="border-2 rounded-full p-1 border-blue-400 text-blue-400 hover:bg-blue-400 hover:text-white">
                Cadastre-se
              </div>
            </Link>
          </div>
        )}
      </header>
    </div>
  );
}
