"use client";
import { authenticate, register } from "@/util/networking";
import { Box, Button, Grid, Paper, TextField } from "@mui/material";
import { useState } from "react";


export default function AuthPage() {

    const [login, setLogin] = useState('')
    const [password, setPassword] = useState('')

    return <Box
        display="flex"
        alignItems="center"
        justifyContent="center"
        gap={4}
        p={2}
    >
        <Paper sx={{p: 2}}>
            <Grid container direction={"column"} spacing={1}> {/* TODO: Валидация */}
                <Grid item>
                    <TextField value={login} onChange={(e) => setLogin(e.target.value)} label="Логин"></TextField>
                </Grid>
                <Grid item>
                    <TextField value={password} onChange={(e) => setPassword(e.target.value)} label="Пароль"></TextField>
                </Grid>
                <Grid item>
                    <Button onClick={() => {authenticate({login, password})}}>Войти</Button>
                    <Button onClick={() => {register({login, password})}}>Регистрация</Button>
                </Grid>
            </Grid>
        </Paper>
    </Box>
}