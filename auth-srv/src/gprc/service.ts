import Mali, { Context } from 'mali'
import { Sequelize } from 'sequelize-typescript'
import { Op } from 'sequelize'
import { UserModel } from '../db/models/UserModel'

// Класс, представляющий наш сервис

class ProductService {

  async Auth (creds: Credentials): Promise<TokenPair> {
    const foundUser = await UserModel.findOne({
      where: {
        name: creds.login
      }
    })

    if (foundUser && foundUser.verifyPassword(creds.password)) {
      return {
        auth: {value: 'token here'},
        renew: {value: 'token here'}
      }
    }

    throw new Error('Unauth?')
  }

  async Renew(tokenContainer: Token): Promise<Token> {
    return {value: 'token here'}
  };

  async Register (creds: Credentials): Promise<TokenPair> {
    return {
      auth: {value: 'token here'},
      renew: {value: 'token here'}
    }
  };

  constructor(
    private db: Sequelize
  ) {};

}


export function init(db: Sequelize) {
  const app = new Mali('./src/proto/auth.proto')

  const serviceObject = new ProductService(db);
  
  // Делаем Context<any> для всего, ибо на Mali нет толковых доков под тупоскрипт ну совсем...
  app.use({
    Auth:     (ctx: Context<any>) => { ctx.res = serviceObject.Auth(ctx.req)     },
    Renew:    (ctx: Context<any>) => { ctx.res = serviceObject.Renew(ctx.req)    },
    Register: (ctx: Context<any>) => { ctx.res = serviceObject.Register(ctx.req) }
  })

  app.start(`0.0.0.0:${process.env.GRPC_AUTH_PORT}`)
}