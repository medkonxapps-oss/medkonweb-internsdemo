import { ReactNode } from "react";
import { HeaderBiogra } from "./HeaderBiogra";
import { FooterBiogra } from "./FooterBiogra";
import { CustomCursor } from "@/components/modern/CustomCursor";

interface LayoutProps {
  children: ReactNode;
}

export function LayoutBiogra({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-background relative">
      <CustomCursor />
      <HeaderBiogra />
      <main>{children}</main>
      <FooterBiogra />
    </div>
  );
}
