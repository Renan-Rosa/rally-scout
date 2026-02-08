"use client";

import Link from "next/link";
import {
  ChartNoAxesColumnIncreasing,
  HelpCircleIcon,
  History,
  Mail,
  Monitor,
  SettingsIcon,
  Shield,
  User2,
  Volleyball,
} from "lucide-react";
import {
  Menubar,
  MenubarContent,
  MenubarGroup,
  MenubarItem,
  MenubarMenu,
  MenubarTrigger,
} from "@/components/ui/menubar";

export function Menu() {
  return (
    <Menubar className='w-auto'>
      <MenubarMenu>
        <MenubarTrigger>Geral</MenubarTrigger>
        <MenubarContent>
          <MenubarItem asChild>
            <Link href='/teams'>
              <Shield />
              Times
            </Link>
          </MenubarItem>
          <MenubarItem asChild>
            <Link href='/players'>
              <User2 />
              Atletas
            </Link>
          </MenubarItem>
          <MenubarItem asChild>
            <Link href='/matches'>
              <Volleyball />
              Partidas
            </Link>
          </MenubarItem>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu>
        <MenubarTrigger>Scout</MenubarTrigger>
        <MenubarContent>
          <MenubarGroup>
            <MenubarItem asChild>
              <Link href='/scout/new'>
                <Monitor />
                Novo Scout
              </Link>
            </MenubarItem>
            <MenubarItem asChild>
              <Link href='/scout'>
                <History />
                Histórico de Scouts
              </Link>
            </MenubarItem>
            <MenubarItem asChild>
              <Link href='/stats'>
                <ChartNoAxesColumnIncreasing />
                Estatísticas
              </Link>
            </MenubarItem>
          </MenubarGroup>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu>
        <MenubarTrigger>Sistema</MenubarTrigger>
        <MenubarContent>
          <MenubarGroup>
            <MenubarItem asChild>
              <Link href='/settings'>
                <SettingsIcon />
                Configurações
              </Link>
            </MenubarItem>
            <MenubarItem asChild>
              <Link href='/contact'>
                <Mail />
                Contato
              </Link>
            </MenubarItem>
            <MenubarItem asChild>
              <Link href='/help'>
                <HelpCircleIcon />
                Ajuda
              </Link>
            </MenubarItem>
          </MenubarGroup>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  );
}
