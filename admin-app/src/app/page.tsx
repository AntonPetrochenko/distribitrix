'use client' // Нет смысла крутить это на севрере (совсем)
import { DataGrid, GridColDef, GridPaginationModel, useGridApiRef } from "@mui/x-data-grid"
import { useEffect, useState } from "react";
import { Product } from "@/classes/Product";
import axios from "axios";
import { ProductDataObject, fetchProductListingData } from "@/util/networking";
import { Box, Button, Grid, TextField } from "@mui/material";

const columnDefs: GridColDef[] = [
  {
    field: "id",
    headerName: "ID"
  },
  {
    field: "name",
    headerName: "Наименование",
  }
]

export default function Home() {
  // На корне будет лежать "рабочия область" нашего приложения. Если вдруг мы не имеем права тут сидеть, middleware швырнёт нас на /auth

  const apiRef = useGridApiRef()

  const [perPage, setPageSize] = useState(10)
  const [pageNumber, setPage] = useState(0)
  
  // Не будем привязывать наше именование перменных к названия, которое требует одна конкретная библиотека
  const [paginationModel, setPaginationModel] = useState({
    pageSize: pageNumber,
    page: perPage
  } as GridPaginationModel);
  
  const [productsToRender, setProductsToRender] = useState([] as Partial<ProductDataObject>[]);

  useEffect(() => {
    fetchProductListingData({
      pageNumber: pageNumber + 1, // Истребитель мне в ангар, MUIX DataGrid считает страницы с нуля, а моя арифметика с 1!!!
      perPage
    }).then((data) => {
      setProductsToRender(data)
    })
    // Обновляем рендер MUI DataGrid
    setPaginationModel({
      pageSize: perPage,
      page: pageNumber,
    })
  }, [perPage, pageNumber])

  
  return <div style={{height: '90%'}}>
    <Box sx={{display: 'flex', verticalAlign: 'center', gap: 1, margin: 1}} >
      <TextField placeholder="Поиск" InputLabelProps={{ shrink: true }}/>
      <Button variant="outlined" href="/product/new">Добавить</Button>
    </Box>
    <DataGrid 
      apiRef={apiRef} 
      columns={columnDefs} 
      rows={productsToRender}  
      paginationMode="server" 
      rowCount={9999999} // TODO: забыл сразу передать с сервиса нормальное значение для этого, это фиксим в последнюю очередь
      onRowClick={ (e) => { window.location.href = `/product/${e.id}` }} // TODO: представим, что тут сидит кайфует роутер
      onPaginationModelChange={(c) => {
        setPage(c.page)
        // setPageSize(c.pageSize)
      }}
      paginationModel={paginationModel}  
      rowHeight={30}
      autosizeOptions={{
        includeOutliers: true,
        includeHeaders: true,
        expand: true,
      }}
    />
  </div>
}
