// Я люблю Active Record со всей силы
// Давайте забацаем что-то близкое к этому со стороны фронта

import { Axios } from "axios";
import { ProductDataObject, fetchProductData, globalAxios, postProduct, postProducts } from "../util/networking";

interface DistribitrixDataAccessObject {
    save: () => void; // Leaky abstraction...? Можно подумац...
    refresh: () => void;   
}
// Если мы совсем отбитые, мы можем автоматизировать эти процессы. 
// К примеру, save и refresh за нас может вызывать что-то другое, или оно может вызываться само, когда мы по какому-то принципу поняли,
// что все взаимодействия с объектом кончились. Но имхо проще решить проблему останова, чем понять, когда кто-то ТОЧНО больше не будет трогать твой объект,
// Так что этот подход тоже имеет свои минусы

// а тут мы трогаемся кукухой и дистилируем "што такое json", 
// это совсем не нужно на практике, более того индексные типы по какой-то гигамозг причине не проверяются на момент присвоения значений???????
type StringifySafeValue = string | number | boolean | {toString: () => string} | undefined // undefined, чтобы мне TS кричал про object is possibly undefined во время чтения
export interface SerializableData { 
    [x: string]:  StringifySafeValue | (StringifySafeValue | SerializableData)[] | SerializableData // либо какой-то литерал, либо массив таковых, либо такой же объект...
}
// Можно также воткнуть zod для проверок на рантайме, когда "сформируются требования" о начинке этого JSON, но пока мы просто храним произвольные штуки

export class Product {
    constructor(
        public id: number,
        public name: string,
        public data: SerializableData, // !!!
        public enabled: boolean
    ) {}

    async save() {
        return postProduct(this)
    }

    async refresh() {
        const refreshedData = await fetchProductData(this.id)
        if (Product.validate(refreshedData)) {
            this.name    = refreshedData.name
            this.data    = refreshedData.data
            this.enabled = refreshedData.enabled
        }
    }

    static async get(id: number) {
        const fetchedData = await fetchProductData(id)
        if (this.validate(fetchedData)) {
            return Product.from(fetchedData)
        }
    }

    static from(data: ProductDataObject) {
        return new Product(data.id, data.name, data.data, data.enabled)
    }

    static validate(o: Partial<ProductDataObject>): o is ProductDataObject {
        if (typeof o.id   != "number") return false
        if (typeof o.name != "number") return false
        if (typeof o.data != "object") return false
        if (typeof o.id   != "number") return false

        return true
    }

    toData(): ProductDataObject {
        return {...this}
    }
}