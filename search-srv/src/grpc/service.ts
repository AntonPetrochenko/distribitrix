import Mali, { Context } from 'mali'
import { Sequelize } from 'sequelize-typescript'
import { Op } from 'sequelize'
import { ProductModel } from '../db/models/ProductModel'

// Класс, представляющий наш сервис
// Он написан прямо поверх service из products.proto

class ProductService {

  async Search (req: SearchRequest): Promise<ProductSet> {
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

    return {
      products: res
    }
  };

  constructor(
    private db: Sequelize
  ) {};

}


export function init(db: Sequelize) {
  const app = new Mali('./src/grpc/proto/search.proto')

  const serviceObject = new ProductService(db);
  
  // Делаем Context<any> для всего, ибо на Mali нет толковых доков под тупоскрипт ну совсем...
  app.use({
    Search: async (ctx: Context<any>) => { ctx.res = await serviceObject.Search(ctx.req) },
  })

  app.start(`0.0.0.0:${process.env.GRPC_SEARCH_PORT}`)
}