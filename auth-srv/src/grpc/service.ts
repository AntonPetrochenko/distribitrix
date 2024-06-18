import Mali, { Context } from 'mali'
import { Sequelize } from 'sequelize-typescript'
import { UserModel } from '../db/models/UserModel'
import { authorize, issueAuthentication, issueRefresher, verifyAuth, verifyRefresh } from '../jwt/jwt'

// Класс, представляющий наш сервис

class ProductService {

  async Auth (creds: Credentials): Promise<TokenPair> {
    const foundUser = await UserModel.findOne({
      where: {
        name: creds.login
      }
    })
    
    console.log({
      foundUser,
      verified: foundUser?.verifyPassword(creds.password)
    })
    
    if (foundUser && foundUser.verifyPassword(creds.password)) {
      return {
        auth: await issueAuthentication(creds.login),
        refresh: await issueRefresher(creds.login)
      }
    }

    throw new Error('Invalid credentials')
  }

  async Refresh(context: Context<any>): Promise<TokenPair> {
    // я немного устал
    const token = context.call.metadata.get('refresh-token')[0]?.toString()
    const status = await verifyRefresh(token)
    if (status) {
      const login = status.payload.sub ?? ''
      return {
        auth: await issueAuthentication(login),
        refresh: await issueRefresher(login)
      }
    } else {
      throw new Error("Unauthenticated")
    }
  };

  async Register (creds: Credentials): Promise<TokenPair> {

    const newUser = await UserModel.create({
      name: creds.login
    })

    newUser.setPassword(creds.password)

    newUser.save()

    return {
      auth: await issueAuthentication(creds.login),
      refresh: await issueRefresher(creds.login)
    }

  };

  async isAdmin (context: Context<any>): Promise<PermissionResponse> {
    return {
      isAdmin: await authorize(context.call.metadata.get('auth-token')[0]?.toString())
    } 
  } 

  async isAuthenticated (context: Context<any>): Promise<AuthenticationResponse> {
    return {
      isAuthenticated: !!( await verifyAuth( context.call.metadata.get('auth-token')[0]?.toString() ) )
    }
  }

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
    Refresh:    (ctx: Context<any>) => { ctx.res = serviceObject.Refresh(ctx)},
    Register: (ctx: Context<any>) => { ctx.res = serviceObject.Register(ctx.req) },
    isAdmin: (ctx: Context<any>) => { ctx.res = serviceObject.isAdmin(ctx) },
    isAuthenticated: (ctx: Context<any>) => { ctx.res = serviceObject.isAuthenticated(ctx) }
  })

  app.start(`0.0.0.0:${process.env.GRPC_AUTH_PORT}`)
}