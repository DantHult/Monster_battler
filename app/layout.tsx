import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
 title:"Lantern Marches",
 description:"An original turn-based monster battler. Meet a friend in a private contest with four randomly assigned companions.",
 icons:{icon:"/favicon.svg",shortcut:"/favicon.svg"}
};
export default function RootLayout({children}:Readonly<{children:React.ReactNode}>) {
 return <html lang="en"><body className="antialiased">{children}</body></html>;
}
