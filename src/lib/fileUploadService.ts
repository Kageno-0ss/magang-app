// src/lib/fileUploadService.ts
import { db } from "./firebase";
import { collection, addDoc, getDocs } from "firebase/firestore";

// tambah data
export const addFileUpload = async (file: {
  nama: string;
  size?: string;
  url: string;
  uploader: string;
  status?: string;
  catatan?: string;
  commentLink?: string;
  skpd?: string;
}) => {
  const docRef = await addDoc(collection(db, "fileUploads"), {
    ...file,
    status: file.status || "Menunggu",
    createdAt: new Date(),
  });
  return docRef.id;
};

// ambil semua data
export const getAllFileUploads = async () => {
  const snapshot = await getDocs(collection(db, "fileUploads"));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};
