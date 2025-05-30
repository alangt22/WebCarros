import { Container } from "../../components/container";
import { useState, useEffect } from "react";
import { collection, getDocs, orderBy, query} from "firebase/firestore";
import { db } from "../../services/firebaseConnection";
import { Link } from "react-router-dom";
import { FiLoader } from "react-icons/fi";

interface CarProps {
  id: string;
  name: string;
  year: string;
  brand: string;
  uid: string;
  price: string | number;
  city: string;
  km: string;
  images: CarImageProps[];
}

interface CarImageProps {
  name: string;
  url: string;
  uid: string;
}

export function Home() {
  const [cars, setCars] = useState<CarProps[]>([]);
  const [loadImages, setLoadImages] = useState<string[]>([]);
  const [search, setSearch] = useState("");
   const [selectedBrand, setSelectedBrand] = useState("");
  const [allBrands, setAllBrands] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadCars();
  }, []);

  function loadCars() {
    setLoading(true);
    const carsRef = collection(db, "cars");
    const queryRef = query(carsRef, orderBy("created", "desc"));

    getDocs(queryRef).then((snapshot) => {
      let listCars = [] as CarProps[];
      const brandSet = new Set<string>();
      snapshot.forEach((doc) => {
        listCars.push({
          id: doc.id,
          name: doc.data().name,
          brand: doc.data().brand,
          year: doc.data().year,
          uid: doc.data().uid,
          price: Number(doc.data().price),
          city: doc.data().city,
          km: doc.data().km,
          images: doc.data().images,
        });
        
      if (doc.data().brand) {
        brandSet.add(doc.data().brand);
      }
      });

      setCars(listCars);
      setAllBrands(Array.from(brandSet));
      setLoading(false);
    });
  }

  function handleImageLoad(id: string) {
    setLoadImages((prevImageLoaded) => [...prevImageLoaded, id]);
  }

async function handleSearch() {
  if (search === "" && selectedBrand === "") {
    loadCars();
    return;
  }

  setCars([]);
  setLoadImages([]);
  setLoading(true);

  const carsRef = collection(db, "cars");
  const queryRef = query(carsRef, orderBy("created", "desc"));

  const querySnapshot = await getDocs(queryRef);

  const searchTerm = search.toLowerCase();
  const listCars = [] as CarProps[];

  querySnapshot.forEach((doc) => {
    const data = doc.data();

    const name = data.name?.toLowerCase() || "";
    const brand = data.brand?.toLowerCase() || "";


        const matchesSearch = name.includes(searchTerm) || brand.includes(searchTerm);
      const matchesBrand = selectedBrand ? brand === selectedBrand.toLowerCase() : true;


    if (matchesSearch && matchesBrand) {
      listCars.push({
        id: doc.id,
        name: data.name,
        brand: data.brand,
        year: data.year,
        uid: data.uid,
        price: data.price,
        city: data.city,
        km: data.km,
        images: data.images,
      });
    }
  });

  setCars(listCars);
  setLoading(false);
}


  return (
    <Container>
      <section className="bg-white p-4 rounded-lg w-full max-w-3xl mx-auto flex justify-center items-center gap-2">
        <select
          value={selectedBrand}
          onChange={(e) => setSelectedBrand(e.target.value)}
          className="border-2 rounded-lg h-9 flex-1 mr-2"
        >
          <option value="">Todas as marcas</option>
          {allBrands.map((brand) => (
            <option key={brand} value={brand}>
              {brand}
            </option>
          ))}
        </select>
        <input
          className="w-full border-2 rounded-lg h-9 px-3 outline-none"
          placeholder="Digite o nome do carro"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button
          onClick={handleSearch}
          className="bg-blue-300 hover:bg-blue-400 cursor-pointer h-9 px-8 rounded-lg text-white font-medium text-lg"
        >
          Buscar
        </button>
      </section>

      <h1 className="font-semibold text-center mt-6 text-2xl mb-4">
        Carros novos e usados em todo Brasil
      </h1>

      {loading ? (
        <div className="flex justify-center items-center h-32">
          <FiLoader className="animate-spin text-4xl" />
        </div>
      ) : (
        <main className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 mb-10">
          {cars.map((car) => (
            <Link key={car.id} to={`/car/${car.id}`}>
              <section className="w-full bg-white rounded-lg">
                <div
                  className="w-full h-72 ounded-lg bg-slate-200"
                  style={{
                    display: loadImages.includes(car.id) ? "none" : "block",
                  }}
                ></div>
                <img
                  className="w-full rounded-lg mb-2 max-h-56 hover:scale-105 transition-all"
                  src={car.images[0].url}
                  alt={car.name}
                  onLoad={() => handleImageLoad(car.id)}
                  style={{
                    display: loadImages.includes(car.id) ? "block" : "none",
                  }}
                />

                <div className="flex gap-2 ml-2">
                  <h1 className="font-bold text-2xl text-black">
                    {car?.brand}
                  </h1>
                  <h1 className="font-bold text-2xl text-black">
                    {car?.name}
                  </h1>
                </div>

                <div className="flex flex-col px-2">
                  <span className="text-zinc-700 mb-6">
                    Ano {car.year} | {car.km} km
                  </span>
                  <strong className="text-black font-medium text-xl">
                    {car.price.toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
                  </strong>
                </div>

                <div className="w-full h-px bg-slate-200 my-2"></div>

                <div className="px-2 pb-2">
                  <span className="text-zinc-700">{car.city}</span>
                </div>
              </section>
            </Link>
          ))}
        </main>
      )}
    </Container>
  );
}
