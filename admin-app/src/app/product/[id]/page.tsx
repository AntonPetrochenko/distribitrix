"use client"

import { Product } from "@/classes/Product"
import { postProduct } from "@/util/networking"
import { Button, Checkbox, FormControlLabel, FormGroup, Grid, InputLabel, Paper, TextField } from "@mui/material"
import { useEffect, useState } from "react"

const nullProduct = new Product(null, "", "", true)

export default function ProductPage( {params}: { params: {id: string}}) {
    
    // Быстрокостыль: используем виртуальный товар, чтобы отображать состояние загрузки
    // Здесь могли быть ваши скелетоны...

    const isNew = params.id == 'new';
    
    const [loading, setLoading] = useState(true)

    const [renderedProduct, setRenderedProduct] = useState(nullProduct.toData())
    const [initialProduct, setInitialProduct] = useState(nullProduct.toData())
    
    if (!isNew) {
        useEffect(() => {
            Product.get(parseInt(params.id)).then( (product) => {
                if (product && typeof product.id == "number"  ) {
                    setRenderedProduct(product.toData())
                    setInitialProduct(product.toData())
                } else {
                    alert('Не удалось загрузить продукт!')
                }
            })
        }, [])
    } else {

    }


    function saveProduct() {
        Product.from(renderedProduct).save().then( () => {alert('Сохранено!'); window.location.href="/"} ).catch( (e) => {alert(`Не удалось сохранить! ${e.message}`)})
    }

    return <Paper>
        <Grid container direction="column" padding={2} spacing={1}> 
            <Grid item>
                <h1>
                    {isNew?
                    <>
                        Новый товар
                    </>
                        :
                    <>
                        Товар {initialProduct.name} 
                        ({initialProduct.id})
                    </>}
                </h1>
                {!isNew && <>
                    <Button>Обновить</Button>
                    <Button>Сбросить</Button>    
                </>}
            </Grid>
            <Grid item>
                <TextField InputLabelProps={{ shrink: true }} value={renderedProduct.name} onChange={ (evt) => { setRenderedProduct({...renderedProduct, name: evt.target.value}) } } label="Наименование"></TextField>
            </Grid>
            <Grid item>
                <TextField InputLabelProps={{ shrink: true }} value={renderedProduct.data} onChange={ (evt) => { setRenderedProduct({...renderedProduct, data: evt.target.value}) } } label="Данные"></TextField>
            </Grid>
            <Grid item direction="row">
                <FormControlLabel control={<Checkbox checked={renderedProduct.enabled} onChange={ (evt, checked) => {setRenderedProduct( {...renderedProduct, enabled: checked}) }}></Checkbox>} label="Активен" />
            </Grid>
            <Grid item>
                <Button onClick={saveProduct}>  {isNew? "Создать" : "Сохранить"}</Button>
            </Grid>
        </Grid>
    </Paper>
}