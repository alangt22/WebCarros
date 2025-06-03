import { FiTrash, FiUpload } from "react-icons/fi";
import { Container } from "../../../components/container";
import { DashboardHeader } from "../../../components/panelHeader";
import { useForm } from "react-hook-form";
import { Input } from "../../../components/input";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { type ChangeEvent, useState, useContext } from "react";
import { AuthContext } from "../../../context/AuthContext";
import { v4 as uuidV4 } from "uuid";
import { storage, db } from "../../../services/firebaseConnection";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { addDoc, collection } from "firebase/firestore";
import toast from "react-hot-toast";
import { Loading } from "../../../components/loading";

const schema = z.object({
  name: z.string().nonempty("Nome obrigatório"),
  brand: z.enum(
    [
      "Nissan",
      "Mercedes",
      "Volkswagen",
      "Toyota",
      "Honda",
      "Bmw",
      "Mitsubishi",
    ],
    {
      errorMap: () => ({ message: "Marca obrigatória" }),
    }
  ),
  model: z.string().nonempty("Modelo obrigatório"),
  year: z.string().nonempty("Ano do carro obrigatório"),
  km: z.string().nonempty("Quilometragem obrigatória"),
  price: z.string().nonempty("Preço obrigatório"),
  city: z.enum([
    "Rio de Janeiro - RJ",
    "Sao Paulo - SP",
    "Curitiba - PR",
    "Belo Horizonte - MG",
    "Porto Alegre - RS",
    "Brasilia - DF",
    "Florianopolis - SC",
    "Salvador - BA", 
  ], {
    errorMap: () => ({ message: "Cidade obrigatória" }),
  }),
  description: z.string().nonempty("Descrição obrigatória"),
});

type FormData = z.infer<typeof schema>;

interface ImageProps {
  name: string;
  url: string;
  uid: string;
  previewUrl: string;
}

export function New() {
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: "onChange",
  });

  const [carImages, setCarImages] = useState<ImageProps[]>([]);

  async function handleFile(e: ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files[0]) {
      const image = e.target.files[0];
      if (
        image.type === "image/jpeg" ||
        image.type === "image/png" ||
        image.type === "image/webp"
      ) {
        await handleUpload(image);
      } else {
        alert("Formato inválido");
        return;
      }
    }
  }

  async function handleUpload(image: File) {
    if (!user?.uid) {
      return;
    }

    const currentUid = user?.uid;
    const imageUid = uuidV4();

    const uploadRef = ref(storage, `images/${currentUid}/${imageUid}`);

    uploadBytes(uploadRef, image).then((snapshot) => {
      setLoading(true);
      getDownloadURL(snapshot.ref).then((downloadUrl) => {
        const imageItem = {
          name: imageUid,
          url: downloadUrl,
          uid: currentUid,
          previewUrl: URL.createObjectURL(image),
        };
        setCarImages((images) => [...images, imageItem]);
        toast.success("Imagem carregada com sucesso");
        setLoading(false);
      });
    });
  }

  function onSubmit(data: FormData) {
    setLoading(true);
    if (carImages.length === 0) {
      toast.error("Envie pelo menos uma imagem");
      setLoading(false);
      return;
    }

    const carListImages = carImages.map((car) => {
      return {
        name: car.name,
        url: car.url,
        uid: car.uid,
      };
    });

    addDoc(collection(db, "cars"), {
      name: data.name.toUpperCase(),
      brand: data.brand.toUpperCase(),
      model: data.model,
      year: data.year,
      km: data.km,
      price: data.price,
      city: data.city,
      description: data.description,
      created: new Date(),
      owner: user?.name,
      uid: user?.uid,
      images: carListImages,
    })
      .then(() => {
        reset();
        setCarImages([]);
        toast.success("Carro cadastrado com sucesso");
        setLoading(false);
      })
      .catch((error) => {
        console.log("Erro ao cadastrar carro");
        console.log(error);
        setLoading(false);
      });
  }

  async function handleDeleteImage(item: ImageProps) {
    const imagePath = `images/${item.uid}/${item.name}`;
    const imageRef = ref(storage, imagePath);

    try {
      await deleteObject(imageRef);
      setCarImages(carImages.filter((car) => car.url !== item.url));
    } catch (error) {
      console.log("erro ao deletar");
    }
  }

  return (
    <Container>
      <DashboardHeader />
      <div className="w-full bg-white p-3 rounded-lg flex flex-col sm:grid sm:grid-cols-3 items-center gap-2">
        <button className="border-2 w-48 md:w-56  rounded-lg flex items-center justify-center cursor-pointer border-gray-600 h-32 relative group">
          <div className="transition-transform duration-300 group-hover:scale-125">
            {loading ? <Loading /> : <FiUpload size={30} color="#000" />}
          </div>
          <div>
            <input
              type="file"
              accept="image/*"
              className="opacity-0 cursor-pointer absolute inset-0"
              onChange={handleFile}
            />
          </div>
        </button>

        {carImages.map((item) => (
          <div
            key={item.name}
            className="w-full h-32 flex items-center justify-center relative"
          >
            <button>
              <FiTrash
                size={28}
                className="absolute top-2 right-2 cursor-pointer text-red-200 hover:text-red-600"
                onClick={() => handleDeleteImage(item)}
              />
            </button>
            <img
              src={item.previewUrl}
              className="rounded- w-full h-32 object-cover"
              alt="Foto do carro"
            />
          </div>
        ))}
      </div>

      <div className="w-full bg-white p-3 rounded-lg flex flex-col sm:flex-row items-center gap-2 mt-2 mb-10">
        <form className="w-full" onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-3">
            <p className="mb-2 font-medium">Nome do carro</p>
            <Input
              type="text"
              register={register}
              name="name"
              error={errors.name?.message}
              placeholder="Ex: Gol"
            />
          </div>
          <div className="mb-3">
            <p className="mb-2 font-medium">Marca do carro</p>
            <select
              {...register("brand")}
              className="border-2 w-full rounded-md h-10 px-2"
            >
              <option value="">Selecione a marca</option>
              <option value="Honda">Honda</option>
              <option value="Toyota">Toyota</option>
              <option value="Volkswagen">Volkswagen</option>
              <option value="Bmw">Bmw</option>
              <option value="Mitsubishi">Mitsubishi</option>
              <option value="Mercedes">Mercedes</option>
              <option value="Nissan">Nissan</option>
            </select>
            {errors.brand && (
              <p className="mb-1 text-red-500">{errors.brand.message}</p>
            )}
          </div>
          <div className="mb-3">
            <p className="mb-2 font-medium">Modelo do carro</p>
            <Input
              type="text"
              register={register}
              name="model"
              error={errors.model?.message}
              placeholder="Ex: 1.6 Flex"
            />
          </div>

          <div className="flex w-full mb-3 flex-row items-center gap-4">
            <div className="w-full">
              <p className="mb-2 font-medium">Ano do carro</p>
              <Input
                type="text"
                register={register}
                name="year"
                error={errors.year?.message}
                placeholder="Ex: 2022/2023"
              />
            </div>

            <div className="w-full">
              <p className="mb-2 font-medium">Km rodados</p>
              <Input
                type="text"
                register={register}
                name="km"
                error={errors.km?.message}
                placeholder="Ex: 20.000"
              />
            </div>
          </div>

          <div className="flex w-full mb-3 flex-row items-center gap-4">
            <div className="w-full">
          <div className="mb-3">
            <p className="mb-2 font-medium">Cidade</p>
            <select
              {...register("city")}
              className="border-2 w-full rounded-md h-10 px-2"
            >
              <option value="">Selecione a cidade</option>
              <option value="Rio de Janeiro - RJ">Rio de Janeiro - RJ</option>
              <option value="Sao Paulo - SP">Sao Paulo - SP</option>
              <option value="Curitiba - PR">Curitiba - PR</option>
              <option value="Belo Horizonte - MG">Belo Horizonte - MG</option>
              <option value="Porto Alegre - RS">Porto Alegre - RS</option>
              <option value="Brasilia - DF">Brasilia - DF</option>
              <option value="Florianopolis - SC">Florianopolis - SC</option>
            </select>
            {errors.city && (
              <p className="mb-1 text-red-500">{errors.city.message}</p>
            )}
          </div>
            </div>
          </div>

          <div className="mb-3">
            <p className="mb-2 font-medium">Preço</p>
            <Input
              type="text"
              register={register}
              name="price"
              error={errors.price?.message}
              placeholder="Ex: R$ 50.000"
            />
          </div>

          <div className="mb-3">
            <p className="mb-2 font-medium">Descrição</p>
            <textarea
              className="border-2 w-full rounded-md h-24 px-2"
              {...register("description")}
              name="description"
              id="description"
              placeholder="Digite uma breve descrição do carro"
            />
            {errors.description && (
              <p className="mb-1 text-red-500">{errors.description.message}</p>
            )}
          </div>

          <button
            type="submit"
            className="bg-blue-300 hover:bg-blue-500 cursor-pointer w-full rounded-md text-white h-10 font-medium flex items-center justify-center"
          >
            {loading ? <Loading /> : "Cadastrar carro"}
          </button>
        </form>
      </div>
    </Container>
  );
}
