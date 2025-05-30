import { Container } from "../../components/container";
import { DashboardHeader } from "../../components/panelHeader";
import { FiLoader, FiTrash2 } from "react-icons/fi";
import { useState, useEffect } from "react";
import {
  collection,
  getDocs,
  where,
  query,
  doc,
  deleteDoc,
} from "firebase/firestore";
import { db, storage } from "../../services/firebaseConnection";
import { useContext } from "react";
import { ref, deleteObject } from "firebase/storage";
import { AuthContext } from "../../context/AuthContext";

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

export function Dashboard() {
  const [cars, setCars] = useState<CarProps[]>([]);
  const { user } = useContext(AuthContext);
  const [loadImages, setLoadImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user?.uid) {
      return;
    }

    loadCars();
  }, [user]);
  function loadCars() {
    setLoading(true);
    const carsRef = collection(db, "cars");
    const queryRef = query(carsRef, where("uid", "==", user?.uid));

    getDocs(queryRef).then((snapshot) => {
      let listCars = [] as CarProps[];
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
      });

      setCars(listCars);
      setLoading(false);
    });
  }

  function handleImageLoad(id: string) {
    setLoadImages((prevImageLoaded) => [...prevImageLoaded, id]);
  }

  async function handleDelete(car: CarProps) {
    const itemCar = car;

    const docRef = doc(db, "cars", itemCar.id);
    await deleteDoc(docRef);

    itemCar.images.map(async (image) => {
      const imagePath = `images/${image.uid}/${image.name}`;
      const imageRef = ref(storage, imagePath);

      try {
        await deleteObject(imageRef);
        setCars(cars.filter((car) => car.id !== itemCar.id));
      } catch (error) {
        console.log("erro ao deletar imagem");
      }
    });
  }

  return (
    <Container>
      <DashboardHeader />
      {loading ? (
        <div className="flex justify-center items-center h-32">
          <FiLoader className="animate-spin text-4xl" />
        </div>
      ) : (
        <>
        {cars.length === 0 ? (
          <p className="text-center h-screen flex justify-center items-center">Nenhum carro cadastrado</p>
        ) : (
        <main className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {cars.map((car) => (
            <section
              key={car.id}
              className="w-full bg-white rounded-lg relative mb-10"
            >
              <button
                onClick={() => handleDelete(car)}
                className="absolute cursor-pointer bg-white w-14 h-14 rounded-full flex items-center justify-center right-2 top-2 drop-shadow"
              >
                <FiTrash2
                  size={26}
                  color="#000"
                  className="cusror-pointer hover:scale-125"
                />
              </button>
              <div
                className="w-full h-72 ounded-lg bg-slate-200"
                style={{
                  display: loadImages.includes(car.id) ? "none" : "block",
                }}
              ></div>
              <img
                className="w-full rounded-lg mb-2 max-h-70"
                src={car.images[0].url}
                alt="Imagem de um carro"
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
                <span className="text-zinc-700">
                  Ano {car.year} | {car.km} km
                </span>
                <strong className="text-black font-bold mt-4">
                  {car.price.toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })}
                </strong>
              </div>

              <div className="w-full h-px bg-slate-200 my-2"></div>
              <div className="px-2 pb-2">
                <span className="text-black">{car.city}</span>
              </div>
            </section>
          ))}
        </main>
        )}
        </>
      )}
    </Container>
  );
}
