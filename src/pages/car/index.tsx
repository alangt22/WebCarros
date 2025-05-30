import { useEffect, useState } from "react";
import { Container } from "../../components/container";
import { FaWhatsapp } from "react-icons/fa";
import { useNavigate, useParams } from "react-router-dom";

import {
  getDoc,
  doc,
  getDocs,
  query,
  collection,
  where,
} from "firebase/firestore";
import { db } from "../../services/firebaseConnection";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Scrollbar } from "swiper";

import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import "swiper/css/scrollbar";

import { FiLoader } from "react-icons/fi";

interface CarProps {
  id: string;
  name: string;
  brand: string;
  year: string;
  model: string;
  description: string;
  owner: string;
  created: string;
  uid: string;
  whatsapp: string;
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

interface UserProps {
  uid: string;
  name: string | null;
  email: string | null;
  phone: string | null;
}

export function CarDetail() {
  const [car, setCar] = useState<CarProps>();
  const { id } = useParams();
  const [sliderPreview, setSliderPreview] = useState<number>(2);
  const [user, setUser] = useState<UserProps | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadCarAndUser() {
      if (!id) return;

      try {
        const carDocRef = doc(db, "cars", id);
        const carSnap = await getDoc(carDocRef);

        if (!carSnap.exists()) {
          navigate("/");
          return;
        }

        const carData = carSnap.data();
        const carInfo = {
          id: carSnap.id,
          name: carData?.name,
          brand: carData?.brand,
          year: carData?.year,
          model: carData?.model,
          description: carData?.description,
          owner: carData?.owner,
          uid: carData?.uid,
          whatsapp: carData?.whatsapp,
          price: Number(carData?.price),
          city: carData?.city,
          km: carData?.km,
          images: carData?.images,
          created: carData?.created,
        };

        setCar(carInfo);

        // 🔍 Buscar perfil do usuário baseado no uid do carro
        const profileQuery = query(
          collection(db, "profiles"),
          where("uid", "==", carData?.uid)
        );
        const profileSnap = await getDocs(profileQuery);

        if (!profileSnap.empty) {
          const profileDoc = profileSnap.docs[0];
          const profileData = profileDoc.data();
          setUser({
            uid: profileData.uid,
            name: profileData.name,
            email: profileData.email,
            phone: profileData.phone,
          });
        } else {
          console.log("Perfil do vendedor não encontrado");
        }
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      } finally {
        setLoading(false);
      }
    }

    loadCarAndUser();
  }, [id, navigate]);

  useEffect(() => {
    function handleResize() {
      if (window.innerWidth < 720) {
        setSliderPreview(1);
      } else {
        setSliderPreview(2);
      }
    }
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <>
      {loading ? (
        <div className="flex justify-center items-center h-72">
          <FiLoader className="animate-spin text-4xl" />
        </div>
      ) : (
        <Container>
          {car && (
            <Swiper
              modules={[Navigation, Pagination, Scrollbar]} // <== aqui!
              slidesPerView={sliderPreview}
              pagination={{ clickable: true }}
              navigation
              scrollbar={{ draggable: true }}
            >
              {car?.images.map((image) => (
                <SwiperSlide key={image.name}>
                  <img
                    src={image.url}
                    alt={image.name}
                    className="w-full h-96 object-cover"
                  />
                </SwiperSlide>
              ))}
            </Swiper>
          )}

          {car && (
            <main className="w-full bg-white rounded-lg p-6 my-4">
              <div className="flex flex-col sm:flex-row mb-4 items-center justify-between">
                <div className="flex gap-2">
                  <h1 className="font-bold text-3xl text-black">
                    {car?.brand}
                  </h1>
                  <h1 className="font-bold text-3xl text-red-600">
                    {car?.name}
                  </h1>
                </div>

                <h2 className="font-bold text-3xl text-black">
                  {car?.price.toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })}
                </h2>
              </div>
              <p>{car?.model}</p>
              <div className="flex w-full gap-6 my-4">
                <div className="flex flex-col gap-4">
                  <div>
                    <p>Cidade</p>
                    <strong>{car?.city}</strong>
                  </div>
                  <div>
                    <p>Ano</p>
                    <strong>{car?.year}</strong>
                  </div>
                </div>

                <div className="flex flex-col gap-4">
                  <div>
                    <p>KM</p>
                    <strong>{car?.km}</strong>
                  </div>
                </div>
              </div>

              <strong>Descrição</strong>
              <p className="mb-4">{car?.description}</p>

              {user && (
                <div className="bg-gray-100 p-4 rounded-lg mt-6">
                  <h3 className="text-xl font-bold mb-2">
                    Informações do Vendedor
                  </h3>
                  <p>
                    <strong>Nome:</strong> {user.name}
                  </p>
                  <p>
                    <strong>Email:</strong> {user.email}
                  </p>
                  {user.phone && (
                    <p>
                      <strong>Telefone:</strong> {user.phone}
                    </p>
                  )}
                </div>
              )}

              <a
                href={`https://api.whatsapp.com/send?phone=${user?.phone}&text=Ola vi esse ${car?.name}no site WebCarros e fiquei interessado!`}
                target="_blank"
                className=" cursor-pointer bg-green-500 w-full hover:scale-95 text-white flex items-center justify-center gap-2 my-6 h-11 text-xl rounded-lg font-medium"
              >
                Conversar com vendedor
                <FaWhatsapp size={26} color="#fff" />
              </a>
            </main>
          )}
        </Container>
      )}
    </>
  );
}
