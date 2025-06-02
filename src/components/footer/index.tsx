import { FaEnvelope, FaInstagram, FaWhatsapp, FaYoutube } from "react-icons/fa";
import brands from "../../brands.json";

export function Footer() {
  return (
    <footer className="bg-slate-200 py-4 flex flex-col justify-center items-center">
      <p className="mt-4 font-bold text-3xl">Marcas</p>
      <div className="grid grid-cols-3 px-4 py-4 mx-auto md:flex gap-4 mt-4">
        {brands.map((brand) => (
          <div key={brand.id} className="flex bg-amber-50 justify-center items-center px-2 py-2 rounded-2xl">
            <img
            src={brand.image}
            alt={brand.name}
            className="w-full h-8"
          />
          </div>
        ))}
      </div>

      <div className="border-t mt-4 w-[80%] mx-auto"></div>


      <div className="flex flex-col gap-5 py-5 justify-center px-3 md:flex-row md:justify-between w-[40%]">
        <div className="flex flex-col justify-center items-center">
          <span className="text-3xl font-bold mb-3.5">
            ALN
            <span className="bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
              Motors
            </span>
          </span>

          <button className="bg-gradient-to-r from-blue-400 to-blue-600 text-white w-[200px] py-2 rounded-md opacity-50 hover:opacity-100 cursor-pointer">
            Contato Whatsapp
          </button>
        </div>

        <div className="flex flex-col gap-2">
          <p className="font-bold text-2xl">Contatos</p>
          <span className="flex gap-2 w-[200px]">
            <FaWhatsapp size={24} color="#000" />
            (11) 99999-9999
          </span>
          <span className="flex gap-2">
            <FaEnvelope size={24} color="#000" />
            alan@gmail.com
          </span>
        </div>

      <div className="flex flex-col gap-2">
          <p className="font-bold text-2xl w-[200px]">Redes Sociais</p>
        <div className="flex gap-2">
          <FaInstagram size={24} color="#000" className="hover:scale-110 cursor-pointer" />
          <FaWhatsapp size={24} color="#000" className="hover:scale-110 cursor-pointer" />
          <FaYoutube size={24} color="#000" className="hover:scale-110 cursor-pointer" />
        </div>
        </div>
      </div>

      <p className="mt-4 font-medium">
        <span>&copy;</span> Desenvolvido por Alan Nunes
      </p>
    </footer>
  );
}
