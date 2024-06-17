// Я люблю Active Record со всей силы
// Давайте забацаем что-то близкое к этому со стороны фронта

import { Axios } from "axios";
import { ProductDataObject, fetchProductData, globalAxios, postProduct, postProducts, putProduct } from "../util/networking";

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

// Можно также воткнуть zod для проверок на рантайме, когда "сформируются требования" о начинке этого JSON, но пока мы просто храним произвольные штуки

export type EditableProduct = Omit<Product, "id">;

export class Product {
    constructor(
        public id: number | null, // undefined ещё не содержится в базе
        public name: string,
        public data: string,
        public enabled: boolean
    ) {}

    async save() {
        if (this.id) {
            return putProduct(this)
        } else {
            return postProduct(this)
        }
    }

    async refresh() {
        if (this.id) {
            const refreshedData = await fetchProductData(this.id)
            if (Product.validate(refreshedData)) {
                this.name    = refreshedData.name
                this.data    = refreshedData.data
                this.enabled = refreshedData.enabled
            }
        }
    }

    static async get(id: number): Promise<Required<Product> | undefined> {
        const fetchedData = await fetchProductData(id)
        if (this.validate(fetchedData)) {
            return Product.from(fetchedData)
        } else {
            console.error('Response did not pass internal validation!')
        }
    }

    static from(data: ProductDataObject) {
        return new Product(data.id, data.name, data.data, data.enabled)
    }

    static validate(o: Partial<ProductDataObject>): o is ProductDataObject {
        if (typeof o.id      != "number")  return false
        if (typeof o.name    != "string")  return false
        if (typeof o.data    != "string")  return false
        if (typeof o.enabled != "boolean") return false

        return true
    }

    toData(): ProductDataObject {
        return {id: this.id, name: this.name, data: this.data, enabled: this.enabled}
    }
}