import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "./util/auth";

export async function middleware(request: NextRequest) {

    // Пукнул мозгом. Мне нужно было проверять это на клиенте, а я забыл, что тут middleware только на сервере

    // Изначальный файл:

    // Сверху вниз, императивненько, трогаем всё, что нам в теории нужно потрогать...
    // Чем больше шансов попасть туда, тем раньше мы ставим какой-то обработчик
    // Здесь могло быть ваше разбие на файлы

    // Проверкам на маршруты позволяем вкладываться, остальное стараемся писать в стиле коротких предусловий


    // Глобальные штуки сюда. Тут звучат фразы типо "Не такой-то маршрут"
    // Мы подставляем проверку на _next, чтоб не сломать загрузку ассетов

    // if (!request.nextUrl.pathname.includes('_next')) {
    //     if (!request.nextUrl.pathname.startsWith('/auth')) {
    //         // Проверяем, а можно ли нам пробовать сюдой...
    //         // Тут считаем, что все залогиненные люди имеют право
    
    //         console.log('Trying auth...')
    //         if (! (await verifyAuth())) return NextResponse.redirect(new URL('/auth', request.url))
    //     }
    // }
}