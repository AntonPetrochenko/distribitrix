import { Response, Router } from "express";
import { AuthClient } from "../grpc/AuthClient";
import { z } from "zod";
import schema from "../zod/schema";
import { validateAndDenyBadRequest } from "../util/validateAndDenyBadRequest";
import { handleServiceFailure } from "../util/handleServiceFailure";
export const AuthRouter = Router()

// Тут сразу видно большую ошибку, которую у меня уже нет времени исправить на этом этапе:
// Должны быть два роутера - User и Auth
// Жить они должны на путях /auth и /user, а у меня получился /auth/... и /auth/user/...
// Даже назвать его UserRouter было бы правильнее и сыграть чуть по-другому

// Для однообразия токенов. Можно вынести в отдельный файл, для наглядности оставляю здесь
// Все эти параметры стоит вынести в отдельный конфиг
// Этоже можно вкрутить monkey патчем в Response
function setTokenCookie(res: Response, name: string, token: string) {
    res.cookie(`token-${name}`, token, {
        maxAge: 1000*60*24, // в идеале разный для разных токенов
        httpOnly: true,
        domain: process.env.SESSION_DOMAIN,
        sameSite: 'strict'
    })
}

// для наглядности кладём это рядом. в нормальной ситуации будет ещё один класс,
// который отвечает за сервис аутентификации и авторизации на уровне гейтвея
const authClient = new AuthClient() 

AuthRouter.post('/user', (req, res) => {
    // Каждый запрос может сначала сломаться с нашей стороны, затем что-то пойти не так в контуре микросервисов

    // Валидируем у нас, затем шлём в контур и надеемся на лучшее
    // Микросервисы тоже могут нам сказать, что мы сделали так или не так, и сломались ли они сами
    // Пока мы не будем различать, что произошло по вине клиента, что по вине гейтвея, что по вине сервиса 
    // Но, без специального кода для обработки ошибок, мы уже можем различить валидацию от логики

    // Простите за мой ~~французский~~ паскально-процедуральный
    const credentials = validateAndDenyBadRequest(req, res, schema.AuthSchema)

    if (credentials) {
        authClient.register(credentials.login, credentials.password, (err, data) => {
            if (err) {
                handleServiceFailure(err, res)
            } else {
                setTokenCookie(res, 'refresh', data?.refresh ?? '')
                setTokenCookie(res, 'auth', data?.auth ?? '')
                res.status(204).send()
            };
        })
    }

})


AuthRouter.put('/user', (req, res) => {
    const user = validateAndDenyBadRequest(req, res, schema.UserSchema)

    if (user) {
        authClient.modify(req.cookies['Auth-Token'], user.login, user.password, user.admin, (err) => {
            if (err) {
                handleServiceFailure(err, res)
            } else {
                res.status(201).send()
            }
        })
    }

})

AuthRouter.post('/login', (req, res) => {
    const credentials = validateAndDenyBadRequest(req, res, schema.AuthSchema)

    if (credentials) {
        authClient.auth(credentials.login, credentials.password, (err, data) => {
            if (err) {
                handleServiceFailure(err, res)
            } else if (data) {
                setTokenCookie(res, 'refresh', data.refresh)
                setTokenCookie(res, 'auth', data.auth)
            }
        })
    }
})
