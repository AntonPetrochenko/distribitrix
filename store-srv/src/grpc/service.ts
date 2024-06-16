import Mali, { Context } from 'mali'
import { Sequelize } from 'sequelize-typescript'
import { ProductModel } from '../db/models/ProductModel'

// Класс, представляющий наш сервис
// Он написан прямо поверх service из products.proto

class ProductService {

    constructor(
      private db: Sequelize
    ) {};


    async CreateProducts (data: ProductCreationSet): Promise<Status> {
      try {

        // TypeScript moment? Это работает корректно. Я ломал голову с разными вариантами, что ему нужно дать на ошибку типов,
        // которая будет, если убрать этот @ts-ignore, ноооооооо так и не нашёл вариант. Двигаемся дальше, к этому вернёмся.
        /// @ts-ignore
        const res = await ProductModel.bulkCreate(data.products)

        return {
          message: 'Ok!',
          ok: true
        }
      } catch (e: any) {
        return {
          ok: false,
          message: e.message ?? 'Unknown error'
        }
      }


    }; // C+C+C+C+C+C+C+C....

    async GetProduct (product: ProductRequest): Promise<ProductData | null> {
      const found = await ProductModel.findOne({
        where: {
          id: product.id
        }
      })

      if (found) {
        return {
          id: found.id,
          name: found.name,
          data: found.data,
          enabled: found.enabled       
        }
      }

      return null;
    }; // R

    async GetListing (req: ListingRequest): Promise<ProductSet> {
      const res = await ProductModel.findAll({
        limit: req.perPage,
        offset: (req.pageNumber-1)*req.perPage
      })

      return {
        products: res
      }
    }; // R+R+R+R+R+R+R+R....

    async UpdateProduct (product: ProductData): Promise<Status> {

      // Немношк прозрачности. Об нас будут кидать целыми продуктами с id внутри, а нам нужно обновить всем кроме id запись по id
      
      // Ниже: Такую запись нельзя использовать на большом проекте, т.к. мы ОБЯЗАТЕЛЬНО забудем её отредактировать. 
      // Можете задавать вопросы, как правильно делать, тут я сделаю неправильно для экономии времени
      
      const productPartial: ProductCreationData = {
        data: product.data,
        enabled: product.enabled,
        name: product.name
      }

      try {
        const [count] = await ProductModel.update(productPartial, {where: {
          id: product.id
        }})

        if (count > 0) {
          return {
            message: 'Ok!',
            ok: true
          }
        } else {
          return {
            message: 'Нечего редактировать',
            ok: false
          }
        }
      } catch(e: any) {
        return {
          ok: false,
          message: e.message ?? 'Неизвестность ошибкость'
        }
      }

    }; // U

    async DeleteProduct (req: ProductRequest): Promise<Status> {
      try {
        const count = await ProductModel.destroy({
          where: {
            id: req.id
          }
        })

        if (count > 0) {
          return {
            ok: true,
            message: 'Удалено'
          }
        } else {
          return {
            ok: false,
            message: 'Нечего удалять'
          }
        }
      } catch(e: any) {
        return {
          ok: false,
          message: e.message ?? 'Неизвестность ошибкость'
        }
      }
    }; // D


}


export function init(db: Sequelize) {
  const app = new Mali('./src/grpc/proto/products.proto')

  const serviceObject = new ProductService(db);
  
  // Делаем Context<any> для всего, ибо на Mali нет толковых доков под тупоскрипт ну совсем...
  // UPD: Mali принимает any, any? в setStatus, обработку ошибок держим в уме
  // TODO: Удалить Mali к чертям из этого проекта и переписать с нормальным grpc сервером из под @grpc/grpc-js
  app.use({
    CreateProducts: async (ctx: Context<any>) => { ctx.res = await serviceObject.CreateProducts(ctx.req) },
    GetProduct:     async (ctx: Context<any>) => { ctx.res = await serviceObject.GetProduct(ctx.req)     },
    GetListing:     async (ctx: Context<any>) => { ctx.res = await serviceObject.GetListing(ctx.req)     },
    UpdateProduct:  async (ctx: Context<any>) => { ctx.res = await serviceObject.UpdateProduct(ctx.req)  },
    DeleteProduct:  async (ctx: Context<any>) => { ctx.res = await serviceObject.DeleteProduct(ctx.req)  }
  })

  app.start(`0.0.0.0:${process.env.GRPC_PRODUCTS_PORT}`)
}