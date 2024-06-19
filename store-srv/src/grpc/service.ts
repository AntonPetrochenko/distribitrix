import Mali, { Context } from 'mali'
import { Sequelize } from 'sequelize-typescript'
import { ProductModel } from '../db/models/ProductModel'
import { createClient } from 'redis'
import { makeListingHash } from '../util/helpers'

// Класс, представляющий наш сервис
// Он написан прямо поверх service из products.proto

class ProductService {

    constructor(
      private db: Sequelize,
      private redis: ReturnType<typeof createClient>
    ) {};


    async CreateProducts (data: ProductCreationSet): Promise<Status> {
      try {
        console.log('Before bulk create!')
        const res = await ProductModel.bulkCreate(data.products.map(p => { return {
          name: p.name,
          data: p.data,
          enabled: !!p.enabled
        }}))

        console.log('Bulk created!')
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
      // дёрнем с кеша

      const cached = await this.redis.get('product_' + product.id)

      if (cached) {
        const parsed = JSON.parse(cached) as ProductData
        if ( !parsed.enabled && !product.allowDisabled ) return null;

        console.log('CACHED READ!')

        return parsed
      }

      // TODO: тут получается очень странная цепочка, где в итоге, по сути, за авторизацию действия отвечает СУБД??
      // если не админ, поставить флаг allowDisalbed, от которого в запрос добавится where, и СУБД не вернёт искомое
      const queryOpts = {
        where: {
          id: product.id
        }
      }
      if (!product.allowDisabled) {
        (queryOpts.where as any).enabled = true
      }

      const found = await ProductModel.findOne(queryOpts)

      if (found) {
        const sane = {
          id: found.id,
          name: found.name,
          data: found.data,
          enabled: found.enabled       
        }

        this.redis.set('product_' + found.id, JSON.stringify(found), {
          EX: 60*60*24
        })

        return sane
      }

      return null;
    }; // R

    async GetListing (req: ListingRequest): Promise<ProductSet> {

      // Мой подход, который ускорял большие листинги товаров на сайтах в 15-20 раз
      // Я сериализую параметры запроса и хеширую их, хеш использую как ключ в кеше который содержит весь-весь ответ.
      // За функцию сериализации здесь будет JSON.stringify, может быть любая более оптимальная
      // В редисе тоже будем хранить json сериализованые данные
      
      const requestHash = makeListingHash(req)

      const cachedData = await this.redis.get(requestHash)
      if (cachedData) {
        console.log('CACHED LISTING!')
        return JSON.parse(cachedData)
      }
      
      /// КЕШ
      ////////////////////////////
      /// РЕАЛБНО
      
      const queryOpts = {
        limit: req.perPage,
        offset: (req.pageNumber-1)*req.perPage
      }
      if (!req.includeDisabled) {
        (queryOpts as any).where = {
          enabled: true
        }
      }

      const res = await ProductModel.findAll(queryOpts)
      const outData = {
        products: res
      }

      this.redis.set(requestHash, JSON.stringify(outData), {
        EX: 10 // тыканье туда сюда. ещё не нашёл, как можно инвалидировать это раньше времени в redis
      })
      

      return outData
    }; // R+R+R+R+R+R+R+R....

    async UpdateProduct (product: ProductData): Promise<Status> {

      // Немношк прозрачности. Об нас будут кидать целыми продуктами с id внутри, а нам нужно обновить всем кроме id запись по id
      
      // Ниже: Такую запись нельзя использовать на большом проекте, т.к. мы ОБЯЗАТЕЛЬНО забудем её отредактировать. 
      // Можете задавать вопросы, как правильно делать, тут я сделаю неправильно для экономии времени
      
      const productPartial: ProductCreationData = {
        data: product.data,
        name: product.name,
        enabled: !!product.enabled // тут я бы хотел спросить вас, в чём я ошибся. Boolean, передаваемый по grpc, у меня просто исчезает, когда он false
      }
      try {
        const [count] = await ProductModel.update(productPartial, {where: {
          id: product.id
        }})

        if (count > 0) {
          // инвалидируем кеш
          this.redis.del('product_' + product.id)
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


export async function init(db: Sequelize, cache: ReturnType<typeof createClient>) {
  const app = new Mali('./src/grpc/proto/products.proto')

  const serviceObject = new ProductService(db, cache);
  
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