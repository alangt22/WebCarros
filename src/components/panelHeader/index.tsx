import { Link } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../../services/firebaseConnection";

export function DashboardHeader () {

    async function handleLogout() {
        await signOut(auth);
    }

    return (
        <div className="w-full items-center flex h-10 bg-blue-400 rounded-lg text-white font-medium gap-4 px-4 mb-4">
            <Link to="/dashboard" className=" text-sm hover:border-b-2 hover:scale-110">
                Meus carros
            </Link>
            <Link to="/dashboard/new" className="text-sm hover:border-b-2 hover:scale-110">
                Cadastrar carro
            </Link>
            <Link to="/dashboard/profile" className="text-sm hover:border-b-2 hover:scale-110">
                Dados pessoais
            </Link>

            <button className="ml-auto hover:scale-110 hover:text-red-500 cursor-pointer" onClick={handleLogout}>
                Sair da conta
            </button>
        </div>
    )
}