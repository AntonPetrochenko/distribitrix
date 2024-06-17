import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import React, { Fragment } from "react";
import FlaggedStrictMode from "@/util/components/FlaggedStrictMode";
import { AppBar, Box, Container, ThemeProvider, Toolbar, Typography } from "@mui/material";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v14-appRouter"
import theme from '@/theme'

const inter = Inter({ subsets: ["cyrillic-ext"] }); // моё лицо когда РїСЂРѕР±Р»РµРјС‹ СЃ РєРѕРґРёСЂРѕРІРєРѕР№

export const metadata: Metadata = {
  title: "🗿 DISTRIBITRIX 🗿",
  description: "* fot🅱nite cool *",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* MUI хочет в адаптив */}
        <meta name="viewport" content="initial-scale=1, width=device-width" />
      </head>
      <body className={inter.className}>
        <FlaggedStrictMode>
          <AppRouterCacheProvider>
            <ThemeProvider theme={theme}>
              <Box component="nav">
                <AppBar>
                  <Toolbar>
                    <Typography component="div">
                      <b>1С DISTRIBITRIX</b> {/* неправда, нету тут никакого b, вам кажется */}
                    </Typography>
                  </Toolbar>
                </AppBar>
              </Box>
              <Toolbar />
              <Container sx={{ height: '90vh' }} component="main">
                  {children}
              </Container>
            </ThemeProvider>
          </AppRouterCacheProvider>
        </FlaggedStrictMode>
      </body>
    </html>
  );
}
