"use client"

import { Product } from "@/classes/Product"
import { postProduct } from "@/util/networking"
import { Button, Checkbox, FormControlLabel, FormGroup, Grid, InputLabel, Paper, TextField } from "@mui/material"
import { useEffect, useState } from "react"


export default function ProductPage( {params}: { params: {id: string}}) {
    
    // Быстрокостыль: используем виртуальный товар, чтобы отображать состояние загрузки
    // Здесь могли быть ваши скелетоны...
    
    const testProduct = new Product(-1, "Загрузка...", {a: 1}, true)
    const [renderedProduct, setRenderedProduct] = useState(testProduct.toData())
    
    useEffect(() => {
        setRenderedProduct(new Product(parseInt(params.id), "Название товара", {a: 1}, true))
    })


    function saveProduct() {
        console.log(renderedProduct)
        Product.from(renderedProduct).save().then( () => {alert('Сохранено!')}).catch( (e) => {alert(`Не удалось сохранить! ${e.message}`)})
    }

    return <Paper>
        <Grid container direction="column" padding={2} spacing={1}> 
            <Grid item>
                <h1>Товар {renderedProduct.name} ({renderedProduct.id})<Button>Обновить</Button></h1>
            </Grid>
            <Grid item>
                <TextField InputLabelProps={{ shrink: true }} value={renderedProduct.name} onChange={ (d) => setRenderedProduct({...renderedProduct, name: d.target.value})} label="Наименование"></TextField>
            </Grid>
            <Grid item>
                <TextField InputLabelProps={{ shrink: true }} value={JSON.stringify(renderedProduct.data)} onChange={ (d) => setRenderedProduct({...renderedProduct, data: JSON.parse(d.target.value)}) } label="Данные"></TextField>
            </Grid>
            <Grid item direction="row">
                <FormControlLabel control={<Checkbox value={renderedProduct.enabled}></Checkbox>} onChange={ (evt, checked) => {setRenderedProduct( {...renderedProduct, enabled: checked}) }} label="Активен" />
            </Grid>
            <Grid item>
                <Button onClick={saveProduct}>Сохранить</Button>
            </Grid>
        </Grid>
    </Paper>
}