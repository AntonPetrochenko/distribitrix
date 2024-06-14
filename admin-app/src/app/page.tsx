'use client' // Нет смысла крутить это на севрере (совсем)
import { DataGrid, GridColDef, useGridApiRef } from "@mui/x-data-grid"
import { useState } from "react";
import { Product } from "@/classes/Product";

const columnDefs: GridColDef[] = [
  {
    field: "id",
    headerName: "ID"
  },
  {
    field: "name",
    headerName: "Наименование"
  }
]

function makeRandomProducts(n: number) {
  const randomProducts: Product[] = []

  for (let i = 0; i < n; i++) {
    randomProducts.push(new Product(i, `Продукт ${i}`, {num: i}, true ))
  }
  
  return randomProducts
}

export default function Home() {
  // На корне будет лежать "рабочия область" нашего приложения. Если вдруг мы не имеем права тут сидеть, middleware швырнёт нас на /auth

  const apiRef = useGridApiRef()

  const [pageSize, setPageSize] = useState(10)

  const productsToRender = makeRandomProducts(25)

  const [paginationModel, setPaginationModel] = useState({
    pageSize: 25,
    page: 0,
  });
  
  return <DataGrid 
    apiRef={apiRef} 
    columns={columnDefs} 
    rows={productsToRender}  
    paginationMode="server" 
    rowCount={productsToRender.length} 
    autoPageSize={true} 
    paginationModel={paginationModel}  
  />
}
