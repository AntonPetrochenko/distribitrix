import Mali, { Context } from 'mali'
import { Sequelize } from 'sequelize-typescript'
import { Op } from 'sequelize'
import { UserModel } from '../db/models/UserModel'
import { issueAccess, issueRenewer, verifyRenew } from '../jwt/jwt'

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
        auth: {value: await issueAccess(creds.login)},
        renew: {value: await issueRenewer(creds.login)}
      }
    }

    throw new Error('Unauth?')
  }

  async Renew(claim: Claim): Promise<Token> {
    try {
      const status = await verifyRenew(claim.token, claim.login)
      // тут может быть ваша проверка на все дела...

      return {
        value: await issueAccess(claim.login)
      }
      
    } catch (e) {
      return {
        value: 'none, sir' // у меня уже кукуха плывёт на этот момент, пусть будет так
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
      auth:  {value: await issueAccess(creds.login)},
      renew: {value: await issueRenewer(creds.login)}
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