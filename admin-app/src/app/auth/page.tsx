import { Box, Button, Grid, Paper, TextField } from "@mui/material";

export default function AuthPage() {
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
                    <TextField label="Логин"></TextField>
                </Grid>
                <Grid item>
                    <TextField label="Пароль"></TextField>
                </Grid>
                <Grid item>
                    <Button>Гойда</Button>
                    <Button>Регистрасионе</Button>
                </Grid>
            </Grid>
        </Paper>
    </Box>
}