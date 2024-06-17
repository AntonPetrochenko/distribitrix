import { Axios } from "axios";
import { Product } from "@/classes/Product";

// Сюда для наглядности складываем всё, что нужно для общения с бакендом

export const globalAxios = new Axios({
    baseURL: process.env.NEXT_PUBLIC_GATEWAY_URL, // в принципе ничего другого пока сюда не пихаем...
    headers: {
        "Accept": "application/json",
        "Content-type": "application/json"
    },
    withCredentials: true
})

interface ProductLoadArgs {
    pageNumber: number,
    perPage: number
}

export interface ProductDataObject {
    id: number | null
    name: string
    data: string
    enabled: boolean
}

// Всякие мелкие процедурки общения с сетью
// Можно сделать большой класс всяких умностей

export async function fetchProductListingData(config: Partial<ProductLoadArgs>): Promise<Partial<ProductDataObject>[]> {
    const fullConfig: ProductLoadArgs = {
        pageNumber: config.pageNumber ?? 1,
        perPage: config.perPage ?? 100
    }
    
    const response = await globalAxios.get<string>('/products/listing', {
        params: fullConfig
    })

    // Никаких 200 status: false в нашем дворе 
    if (response.status != 200) throw new Error('Не удалось загрузить листинг...');
    // never nesting...
    
    
    // Не будем трогать JSON, я не успею сделать редактор произвольного JSON тут...
    const rawProducts = JSON.parse(response.data).products ?? [] // В случае ошибок нам это не дадут!

    return rawProducts
}

// Не совсем хорошо возвращать банально Partial<>
// В идеале бы zod прокрутить и отдать обмылок, который можно гидрировать до полноценного объекта. Product.from() у нас занимается примерно этим, но json в объект мы превратим тут.
export async function fetchProductData(id: number): Promise<Partial<ProductDataObject>> {
    const response = await globalAxios.get(`/products/${id}`)

    if (response.status != 200) {
        console.log(response)
        throw new Error(`Не удалось загрузить товар #${id}`);
    } 

    // TODO: Забили на парсинг JSON, может когда-нибудь в будущем
    const rawProduct = JSON.parse(response.data)

    return rawProduct    
}

// Помогатель чтобы слать один продукт
export async function postProduct(product: Product) {
    // Уже после того, как написать это, я добавил отдельные пути со стороны гейта и сервиса
    return postProducts([product]);
}

export async function putProduct(product: Product) {
    // поздно понял, что такой путь неправильный, но у меня уже нет сил это поправить в настоящий REST
    const response = globalAxios.put('/products/', JSON.stringify(product)) 
}

// Все отправки считаем как массовые. Рано или поздно это всегда требуется. Всегда.
export async function postProducts(products: Product[]) {
    const response = globalAxios.post('/products', JSON.stringify(products))
}

/////////////////////////////////////////////////////////////////////////

export async function refreshAuth() {
    globalAxios.post('/', {
        data: JSON.stringify({login: localStorage.getItem('login')})
    })
}

export async function register(opts: {login: string, password: string}) {
    // опять же неправильный REST, что со мной такое
    globalAxios.post('/auth/register', JSON.stringify(opts))
    .then( (res) => {
        if (res.status < 400) { // TODO: тут быстрая проверка на все возможные неудачи, уточнить
            window.location.href = '/' // TODO: всё ещё нет обращения к роутеру
        }
    })
}

export async function authenticate(opts: {login: string, password: string}) {
    globalAxios.post('/auth/login', JSON.stringify(opts))
    .then( (res) => {
        if (res.status < 400) { 
            window.location.href = '/'
        }
    })
}

/////////////////////////////////

export async function search(searchQuery: string) {
    const response = await globalAxios.get('/search', {
        params: {
            query: searchQuery
        }
    })

    const rawProducts = JSON.parse(response.data).products ?? []

    return rawProducts
}