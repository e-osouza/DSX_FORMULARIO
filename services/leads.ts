import { db } from "@/lib/firebase";
import {
  addDoc,
  collection,
  doc,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";

export const createLead = async (data: {
  nome: string;
  email: string;
  whatsapp: string;
}) => {
  const ref = await addDoc(collection(db, "leads"), {
    ...data,
    createdAt: serverTimestamp(),
    completed: false,
  });

  return { id: ref.id };
};

export const completeLead = async (
  leadId: string,
  data: {
    perfil?: string;
    empresa?: string;
    faturamento?: string;
  }
) => {
  const ref = doc(db, "leads", leadId);

  await updateDoc(ref, {
    ...data,
    completed: true,
    completedAt: serverTimestamp(),
  });
};