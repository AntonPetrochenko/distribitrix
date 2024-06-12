import Image from "next/image";
import styles from "./page.module.css";
import { redirect } from "next/dist/server/api-utils";
import { Paper } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid"

export default function Home() {
  // На корне будет лежать "рабочия область" нашего приложения. Если вдруг мы не имеем права тут сидеть, middleware швырнёт нас на /auth

  return <DataGrid columns={[]} />
}
