import Mali, { Context } from 'mali'
import { Sequelize } from 'sequelize-typescript'
import { Op } from 'sequelize'
import { UserModel } from '../db/models/UserModel'
import { issueAccess, issueRefresher, verifyRefresh } from '../jwt/jwt'

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
        auth: await issueAccess(creds.login),
        refresh: await issueRefresher(creds.login)
      }
    }

    throw new Error('Unauth?')
  }

  async Refresh(claim: Claim): Promise<TokenPair> {
    try {
      const status = await verifyRefresh(claim.token, claim.login)
      // тут может быть ваша проверка на все дела...

      return {
        auth: await issueAccess(claim.login),
        refresh: await issueRefresher(claim.login)
      }
      
    } catch (e) {
      return {
        auth: '', //todo: понять, как сигналить о неудаче
        refresh: ''
      }
    }
  };

  async Register (creds: Credentials): Promise<TokenPair> {

    const newUser = await UserModel.create({
      name: creds.login
    })

    newUser.setPassword(creds.password)

    newUser.save()

    return {
      auth: await issueAccess(creds.login),
      refresh: await issueRefresher(creds.login)
    }

  };

  constructor(
    private db: Sequelize
  ) {};

}


export function init(db: Sequelize) {
  const app = new Mali('./src/grpc/proto/auth.proto')

  const serviceObject = new ProductService(db);
  
  // Делаем Context<any> для всего, ибо на Mali нет толковых доков под тупоскрипт ну совсем...
  app.use({
    Auth:     (ctx: Context<any>) => { ctx.res = serviceObject.Auth(ctx.req)     },
    Refresh:    (ctx: Context<any>) => { ctx.res = serviceObject.Refresh(ctx.req)    },
    Register: (ctx: Context<any>) => { ctx.res = serviceObject.Register(ctx.req) }
  })

  app.start(`0.0.0.0:${process.env.GRPC_AUTH_PORT}`)
}