import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useEffect, type ChangeEvent, useContext } from "react";
import { Container } from "../../components/container";
import { DashboardHeader } from "../../components/panelHeader";
import { AuthContext } from "../../context/AuthContext";
import { db, storage } from "../../services/firebaseConnection";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  updateDoc,
  doc,
} from "firebase/firestore";
import toast from "react-hot-toast";
import { Loading } from "../../components/loading";
import { FiUpload } from "react-icons/fi";

const profileSchema = z.object({
  name: z.string().min(2, "Nome é obrigatório"),
  email: z.string().email("Email inválido"),
  phone: z
    .string()
    .min(10, "Telefone deve ter pelo menos 10 dígitos")
    .max(15, "Telefone muito longo")
    .refine((val) => /^\d+$/.test(val), {
      message: "O telefone deve conter apenas números",
    }),
  avatarUrl: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export function Profile() {
  const { user } = useContext(AuthContext);
  const [profileData, setProfileData] = useState<ProfileFormData | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [profileId, setProfileId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
  });

  useEffect(() => {
    if (!user?.uid) return;
    async function loadProfile() {
      const q = query(
        collection(db, "profiles"),
        where("uid", "==", user?.uid)
      );
      const snapshot = await getDocs(q);
      const docData = snapshot.docs[0];
      if (docData) {
        const data = docData.data();
        setProfileId(docData.id);
        setValue("name", data.name);
        setValue("email", data.email);
        setValue("phone", data.phone);
        setAvatarPreview(data.avatarUrl);

        setProfileData({
          name: data.name,
          email: data.email,
          phone: data.phone,
          avatarUrl: data.avatarUrl,
        });
      }
    }

    loadProfile();
  }, [user, setValue]);

  function handleFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      toast.error("Formato de imagem inválido");
      return;
    }

    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  }

  async function handleUpload(image: File): Promise<string> {
    const storageRef = ref(storage, `avatars/${user?.uid}/${image.name}`);
    const snapshot = await uploadBytes(storageRef, image);
    return await getDownloadURL(snapshot.ref);
  }

  async function onSubmit(data: ProfileFormData) {
    if (!user?.uid) return;

    try {
      setLoading(true);
      let imageUrl = avatarPreview;

      if (avatarFile) {
        imageUrl = await handleUpload(avatarFile);
      }

      const profileData = {
        uid: user.uid,
        name: data.name,
        email: data.email,
        phone: data.phone,
        avatarUrl: imageUrl,
        updated: new Date(),
      };

      if (profileId) {
        const profileDocRef = doc(db, "profiles", profileId);
        await updateDoc(profileDocRef, profileData);
        toast.success("Perfil atualizado com sucesso!");
      } else {
        await addDoc(collection(db, "profiles"), {
          ...profileData,
          created: new Date(),
        });
        toast.success("Perfil criado com sucesso!");
      }

      setEditMode(false);
    } catch (err) {
      console.error("Erro ao salvar perfil:", err);
      toast.error("Erro ao salvar perfil.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Container>
      <DashboardHeader />

      <div className="bg-white p-4 rounded-md max-w-xl mx-auto mt-6 mb-28">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold mb-4">
            {editMode ? "Editar Perfil" : "Meu Perfil"}
          </h1>
          {!editMode && (
            <button
              onClick={() => setEditMode(true)}
              className="bg-blue-300 hover:bg-blue-400 text-white px-4 py-1 rounded-md cursor-pointer"
            >
              Editar
            </button>
          )}
        </div>

        {editMode ? (
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-4"
          >
            <label className="font-medium">Foto de perfil:</label>
            <div className="flex gap-4">
              
              <button className="border-2 w-28 md:w-56  rounded-lg flex items-center justify-center cursor-pointer border-gray-600 h-20 relative group">
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
              {avatarPreview && (
                <img
                  src={avatarPreview}
                  alt="Preview"
                  className="w-24 h-24 rounded-full object-cover"
                />
              )}
            </div>

            <div>
              <label className="font-medium">Nome:</label>
              <input
                type="text"
                {...register("name")}
                className="w-full border rounded-md px-3 h-10"
              />
              {errors.name && (
                <p className="text-red-500 text-sm">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label className="font-medium">Email:</label>
              <input
                type="email"
                {...register("email")}
                className="w-full border rounded-md px-3 h-10"
              />
              {errors.email && (
                <p className="text-red-500 text-sm">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="font-medium">Telefone:</label>
              <input
                type="text"
                {...register("phone")}
                className="w-full border rounded-md px-3 h-10"
              />
              {errors.phone && (
                <p className="text-red-500 text-sm">{errors.phone.message}</p>
              )}
            </div>

            <div className="flex justify-between">
              <button
                type="button"
                onClick={() => setEditMode(false)}
                className="text-sm border border-gray-300 hover:bg-gray-500 cursor-pointer px-4 py-1 rounded"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="bg-blue-300 hover:bg-blue-400 cursor-pointer text-white px-6 py-2 rounded-md font-semibold"
                disabled={loading}
              >
                {loading ? "Salvando..." : "Salvar"}
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            {avatarPreview && (
              <img
                src={avatarPreview}
                alt="Avatar"
                className="w-24 h-24 rounded-full object-cover mx-auto"
              />
            )}
            <p>
              <strong>Nome:</strong> {profileData?.name || <i>Não informado</i>}
            </p>
            <p>
              <strong>Email:</strong>{" "}
              {profileData?.email || <i>Não informado</i>}
            </p>
            <p>
              <strong>Telefone:</strong>{" "}
              {profileData?.phone || <i>Não informado</i>}
            </p>
          </div>
        )}
      </div>
    </Container>
  );
}
