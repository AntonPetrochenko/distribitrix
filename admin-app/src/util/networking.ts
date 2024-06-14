import { Axios } from "axios";
import { Product, SerializableData } from "@/classes/Product";

// Сюда для наглядности складываем всё, что нужно для общения с бакендом

export const globalAxios = new Axios({
    baseURL: process.env.GATEWAY_URL // в принципе ничего другого пока сюда не пихаем...
})

interface ProductLoadArgs {
    page: number,
    perPage: number
}

export interface ProductDataObject {
    id: number
    name: string
    data: SerializableData
    enabled: boolean
}

// Всякие мелкие процедурки общения с сетью
// Можно сделать большой класс всяких умностей

export async function fetchProductListingData(config: Partial<ProductLoadArgs>): Promise<Partial<ProductDataObject>[]> {
    const fullConfig: ProductLoadArgs = {
        page: config.page ?? 1,
        perPage: config.perPage ?? 100
    }
    
    const response = await globalAxios.get<string>('/products', {
        data: fullConfig
    })

    // Никаких 200 status: false в нашем дворе 
    if (response.status != 200) throw new Error('Не удалось загрузить листинг...');
    // never nesting...
    
    
    // ПОМНИМ!!! В данный момент времени мы ещё нарушаем контракт Product, у нас string на месте data!!!!
    // Поправим это на месте...
    const rawProduct = JSON.parse(response.data)
    rawProduct.data = JSON.parse(rawProduct.data)

    return rawProduct
}

// Не совсем хорошо возвращать банально Partial<>
// В идеале бы zod прокрутить и отдать обмылок, который можно гидрировать до полноценного объекта. Product.from() у нас занимается примерно этим, но json в объект мы превратим тут.
export async function fetchProductData(id: number): Promise<Partial<ProductDataObject>> {
    const response = await globalAxios.get('/products', {
        data: {id}
    })

    if (response.status != 200) throw new Error(`Не удалось загрузить товар #${id}`);

    // Всё ещё помним, что это всё ещё не совсем в том виде
    const rawProduct = JSON.parse(response.data)
    rawProduct.data = JSON.parse(rawProduct.data)

    return rawProduct    
}

// Помогатель чтобы слать один продукт
export async function postProduct(product: Product) {
    return postProducts([product]);
}

// Все отправки считаем как массовые. Рано или поздно это всегда требуется. Всегда.
export async function postProducts(products: Product[]) {
    const response = globalAxios.post('/products', {
        data: JSON.stringify(products)
    })
}