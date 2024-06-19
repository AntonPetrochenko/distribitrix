import Mali, { Context } from 'mali'
import { Sequelize } from 'sequelize-typescript'
import { Op } from 'sequelize'
import { ProductModel } from '../db/models/ProductModel'
import { createClient } from 'redis'
import { makeSearchHash } from '../util/helpers'

// Класс, представляющий наш сервис
// Он написан прямо поверх service из products.proto

class SearchService {

  async Search (req: SearchRequest): Promise<ProductSet> {

    const queryHash = makeSearchHash(req)

    const cached = await this.redis.get(queryHash)

    if (cached) {
      console.log('CACHED SEARCH!')
      return JSON.parse(cached)
    }
    const queryOpts = {
      where: {
        name: {
          [Op.like]: `%${req.term}%`
        }
      }
    }

    // Чаще всего я работаю с чейнящимися билдерами,
    // поэтому такая ситуёвина сбивает меня с толку
    
    if (!req.includeDisabled) {
      (queryOpts.where as any).enabled = true
    }
    const res = await ProductModel.findAll(queryOpts)

    const outVal = {
      products: res
    }

    this.redis.set(queryHash, JSON.stringify(outVal), {
      EX: 60
    })

    return outVal
  };

  constructor(
    private db: Sequelize,
    private redis: ReturnType<typeof createClient>
  ) {};

}


export function init(db: Sequelize, redis: ReturnType<typeof createClient>) {
  const app = new Mali('./src/grpc/proto/search.proto')

  const serviceObject = new SearchService(db, redis);
  
  // Делаем Context<any> для всего, ибо на Mali нет толковых доков под тупоскрипт ну совсем...
  app.use({
    Get: async (ctx: Context<any>) => { ctx.res = await serviceObject.Search(ctx.req) },
  })

  app.start(`0.0.0.0:${process.env.GRPC_SEARCH_PORT}`)
}