import Nav from "../components/Nav";
import type { ReactNode } from "react";
export const metadata = { title: "CorrigeAI", description: "Correção inteligente de provas" };
export default function RootLayout({ children }: { children: ReactNode }) { return <><Nav/><main style={{minHeight:"100vh",background:"#f6f8fc"}}>{children}</main></>; }
