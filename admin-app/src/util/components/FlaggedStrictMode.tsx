import { StrictMode } from "react";

// Удобный полифилл, врубающий StrictMode во время разработки. Я бы это вообще превратил в этап сборки.
export default function FlaggedStrictMode( {children}: React.PropsWithChildren<{}> ) {
    if (process.env.NODE_ENV !== "production") {
        return <StrictMode>
                {children}
            </StrictMode>
    } else {
        return <>
            {children}
        </>
    }
}